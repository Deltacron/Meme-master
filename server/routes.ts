import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage.js";
import { insertRoomSchema, insertPlayerSchema, type GameState, type CaptionCard, type PhotoCard } from "@shared/schema";
import { randomBytes } from "crypto";
import { testSupabaseConnection, getImagesFromBucket } from "./lib/supabase.js";

interface SocketWithData extends WebSocket {
  playerId?: string;
  roomId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  console.log('🔌 WebSocket server created on path: /ws');

  // Generate room code
  function generateRoomCode(): string {
    return randomBytes(3).toString('hex').toUpperCase();
  }

  // Shuffle array utility
  function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Deal cards to players
  async function dealCards(roomId: string) {
    const players = await storage.getPlayersByRoom(roomId);
    const deck = await storage.getGameDeck(roomId);
    if (!deck) return;

    const captionCards: CaptionCard[] = JSON.parse(deck.captionDeck as string);
    const cardsPerPlayer = players.length === 3 ? 7 : 4;

    // Shuffle the deck before dealing to ensure random distribution
    const shuffledCards = shuffleArray(captionCards);

    let cardIndex = 0;
    for (const player of players) {
      const hand = shuffledCards.slice(cardIndex, cardIndex + cardsPerPlayer);
      await storage.updatePlayer(player.id, { 
        hand: JSON.stringify(hand),
        hasSubmittedCard: false,
        hasExchangedCard: false
      });
      cardIndex += cardsPerPlayer;
    }

    // Update deck with remaining cards
    const remainingCards = shuffledCards.slice(cardIndex);
    await storage.updateGameDeck(roomId, {
      captionDeck: JSON.stringify(remainingCards)
    });
  }

  // Broadcast to room with error handling
  function broadcastToRoom(roomId: string, message: any) {
    let sentCount = 0;
    let failedCount = 0;
    
    wss.clients.forEach((client) => {
      const socket = client as SocketWithData;
      if (socket.readyState === WebSocket.OPEN && socket.roomId === roomId) {
        try {
          socket.send(JSON.stringify(message));
          sentCount++;
        } catch (error) {
          console.error('Failed to send message to client:', error);
          failedCount++;
        }
      }
    });
    
    console.log(`📡 Broadcast to room ${roomId}: sent to ${sentCount} clients, failed ${failedCount}`);
  }

  // Get game state
  async function getGameState(roomId: string): Promise<GameState | null> {
    const room = await storage.getRoom(roomId);
    if (!room) return null;

    const players = await storage.getPlayersByRoom(roomId);
    const deck = await storage.getGameDeck(roomId);
    if (!deck) return null;

    return { room, players, deck };
  }

  // Health check endpoint
  app.get("/", (req, res) => {
    res.json({ 
      status: "ok", 
      message: "Meme Master Backend is running!",
      timestamp: new Date().toISOString()
    });
  });

  app.get("/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  app.post("/api/rooms", async (req, res) => {
    try {
      const { hostId } = insertRoomSchema.parse(req.body);
      let code: string;
      let existingRoom;

      // Generate unique room code
      do {
        code = generateRoomCode();
        existingRoom = await storage.getRoomByCode(code);
      } while (existingRoom);

      const room = await storage.createRoom({ code, hostId });
      await storage.createGameDeck(room.id);

      res.json({ room });
    } catch (error) {
      console.error('Room creation error:', error);
      res.status(400).json({ error: "Failed to create room" });
    }
  });

  app.get("/api/rooms/:code", async (req, res) => {
    try {
      const { code } = req.params;
      const room = await storage.getRoomByCode(code);

      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      const gameState = await getGameState(room.id);
      res.json(gameState);
    } catch (error) {
      res.status(500).json({ error: "Failed to get room" });
    }
  });

  app.get("/api/cards/photo", async (req, res) => {
    try {
      const photoCards = await storage.getCardsByType("photo");
      res.json(photoCards);
    } catch (error) {
      res.status(500).json({ error: "Failed to get photo cards" });
    }
  });

  // Debug endpoint to test Supabase connection
  app.get("/api/debug/supabase", async (req, res) => {
    try {
      console.log('🔍 Testing Supabase connection...');
      const isConnected = await testSupabaseConnection();
      
      let images: Array<{name: string, publicUrl: string}> = [];
      let imageCount = 0;
      
      if (isConnected) {
        try {
          images = await getImagesFromBucket('photocards');
          imageCount = images.length;
        } catch (error) {
          console.error('Error fetching images:', error);
        }
      }
      
      res.json({
        connected: isConnected,
        imageCount,
        message: isConnected 
          ? `✅ Supabase connected successfully. Found ${imageCount} images in bucket.`
          : '❌ Supabase not connected. Check your environment variables.',
        images: images.slice(0, 5).map(img => ({ name: img.name, url: img.publicUrl })) // First 5 for preview
      });
    } catch (error) {
      console.error('Supabase debug error:', error);
      res.status(500).json({ 
        connected: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: '❌ Error testing Supabase connection'
      });
    }
  });

  app.post("/api/rooms/:code/join", async (req, res) => {
    try {
      const { code } = req.params;
      const { name, isHost } = req.body;

      console.log(`👤 Player joining room ${code}:`, { name, isHost });

      const room = await storage.getRoomByCode(code);
      if (!room) {
        return res.status(404).json({ error: "Room not found" });
      }

      console.log(`🏠 Current room hostId: ${room.hostId}`);

      if (room.status !== "waiting") {
        return res.status(400).json({ error: "Game already in progress" });
      }

      const player = await storage.createPlayer({
        roomId: room.id,
        name
      });

      console.log(`✅ Player created: ${player.id} (${player.name})`);

      // If this is the host (room creator), update the room's hostId
      if (isHost && room.hostId === "temp-host-id") {
        console.log(`🔄 Updating room ${room.code} host from ${room.hostId} to ${player.id}`);
        await storage.updateRoom(room.id, {
          hostId: player.id
        });
        console.log(`🏠 Successfully updated room ${room.code} host to player ${player.id} (${player.name})`);
      } else {
        console.log(`❌ Not updating host: isHost=${isHost}, currentHostId=${room.hostId}`);
      }

      const gameState = await getGameState(room.id);
      broadcastToRoom(room.id, {
        type: "player_joined",
        gameState
      });

      res.json({ player, gameState });
    } catch (error) {
      console.error('Join room error:', error);
      res.status(400).json({ error: "Failed to join room" });
    }
  });

  // WebSocket handling
  wss.on('connection', (ws: SocketWithData) => {
    console.log('🔌 New WebSocket connection established');

    // Connection cleanup on close
    ws.on('close', async (code, reason) => {
      console.log(`🔌 WebSocket connection closed: ${code} ${reason}`);
      
      // If player was in a room, mark them as offline and notify others
      if (ws.playerId && ws.roomId) {
        console.log(`👋 Player ${ws.playerId} disconnected from room ${ws.roomId}`);
        
        try {
          await storage.updatePlayer(ws.playerId, { isOnline: false });
          
          const updatedGameState = await getGameState(ws.roomId);
          if (updatedGameState) {
            broadcastToRoom(ws.roomId, {
              type: 'player_disconnected',
              playerId: ws.playerId,
              gameState: updatedGameState
            });
          }
        } catch (error) {
          console.error('Error handling player disconnect:', error);
        }
      }
    });

    ws.on('error', (error) => {
      console.error('🔌 WebSocket error:', error);
    });

    // Track last processed message to prevent duplicates
    let lastMessageId = '';

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        const messageId = `${message.type}-${message.cardId || message.winnerId || Date.now()}`;
        
        // Prevent duplicate message processing
        if (messageId === lastMessageId) {
          console.log('🔄 Duplicate message ignored:', messageId);
          return;
        }
        lastMessageId = messageId;
        
        console.log('📨 WebSocket message received:', message.type, message);

        switch (message.type) {
          case 'join_room':
            console.log('WebSocket join_room received:', message);
            ws.playerId = message.playerId;
            ws.roomId = message.roomId;

            // Mark player as online when they connect
            if (ws.playerId) {
              await storage.updatePlayer(ws.playerId, { isOnline: true });
            }

            const gameState = await getGameState(message.roomId);
            console.log('Game state found:', !!gameState, 'for room:', message.roomId);

            if (gameState) {
              console.log('Sending game state to WebSocket client');
              ws.send(JSON.stringify({
                type: 'game_state',
                gameState
              }));
            } else {
              console.log('No game state found, sending error');
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Room not found or game state unavailable'
              }));
            }
            break;

          case 'start_game':
            if (!ws.roomId) break;

            const room = await storage.getRoom(ws.roomId);
            const players = await storage.getPlayersByRoom(ws.roomId);

            if (!room || players.length < 3) break;

            // Assign random number cards for judge selection but keep them hidden
            const numberCards = shuffleArray(Array.from({length: players.length}, (_, i) => i + 1));

            // Store the hidden number cards in a separate field and reset revealed status
            for (let i = 0; i < players.length; i++) {
              await storage.updatePlayer(players[i].id, {
                numberCard: null, // Keep hidden until revealed
                hiddenNumberCard: numberCards[i] // Store the actual number
              });
            }

            await storage.updateRoom(ws.roomId, {
              status: "selecting_judge"
            });

            const updatedGameState = await getGameState(ws.roomId);
            broadcastToRoom(ws.roomId, {
              type: 'judge_selection_started',
              gameState: updatedGameState
            });
            break;

          case 'reveal_number_card':
            if (!ws.playerId || !ws.roomId) break;

            const revealingPlayer = await storage.getPlayer(ws.playerId);
            if (!revealingPlayer || !revealingPlayer.hiddenNumberCard) break;

            // Reveal the hidden number card
            await storage.updatePlayer(ws.playerId, {
              numberCard: revealingPlayer.hiddenNumberCard
            });

            const updatedState = await getGameState(ws.roomId);
            broadcastToRoom(ws.roomId, {
              type: 'number_card_revealed',
              playerId: ws.playerId,
              gameState: updatedState
            });
            break;

          case 'start_round':
            if (!ws.roomId) break;

            const roomForRound = await storage.getRoom(ws.roomId);
            const playersForRound = await storage.getPlayersByRoom(ws.roomId);

            if (!roomForRound) break;

            // Find judge (lowest number card)
            const lowestNumber = Math.min(...playersForRound.map(p => p.numberCard || 999));
            const judge = playersForRound.find(p => p.numberCard === lowestNumber);

            if (!judge) break;

            await storage.updateRoom(ws.roomId, {
              status: "playing",
              currentJudgeId: judge.id,
              currentRound: 1
            });

            await dealCards(ws.roomId);

            const roundGameState = await getGameState(ws.roomId);
            broadcastToRoom(ws.roomId, {
              type: 'round_started',
              gameState: roundGameState
            });
            break;

          case 'select_photo_card':
            console.log('🎯 Photo card selection received:', message);
            if (!ws.roomId) {
              console.log('❌ No roomId in WebSocket connection');
              break;
            }

            const { cardId } = message;
            console.log('🃏 Looking for card ID:', cardId);
            const card = await storage.getCard(cardId);

            if (!card) {
              console.log('❌ Card not found:', cardId);
              break;
            }

            console.log('✅ Card found, updating room with selected photo card');
            await storage.updateRoom(ws.roomId, {
              selectedPhotoCard: JSON.stringify({
                id: card.id,
                imageUrl: card.imageUrl,
                description: card.description
              })
            });

            const photoSelectedState = await getGameState(ws.roomId);
            console.log('📤 Broadcasting photo card selected to room:', ws.roomId);
            broadcastToRoom(ws.roomId, {
              type: 'photo_card_selected',
              gameState: photoSelectedState
            });
            break;

          case 'submit_caption_card':
            if (!ws.playerId || !ws.roomId) break;

            const { cardId: submittedCardId } = message;
            const player = await storage.getPlayer(ws.playerId);
            const submittingRoom = await storage.getRoom(ws.roomId);
            const playerDeck = await storage.getGameDeck(ws.roomId);

            if (!player || !submittingRoom || !playerDeck) break;

            const hand: CaptionCard[] = JSON.parse(player.hand as string);
            const submittedCard = hand.find(c => c.id === submittedCardId);

            if (!submittedCard) break;

            // Remove submitted card from hand (don't replace - players lose cards each round)
            const updatedHand = hand.filter(c => c.id !== submittedCardId);

            await storage.updatePlayer(ws.playerId, {
              hasSubmittedCard: true,
              hand: JSON.stringify(updatedHand)
            });

            const currentSubmissions = JSON.parse(submittingRoom.submittedCards as string);
            currentSubmissions.push({
              playerId: ws.playerId,
              cardId: submittedCardId,
              text: submittedCard.text
            });

            await storage.updateRoom(ws.roomId, {
              submittedCards: JSON.stringify(currentSubmissions)
            });

            const submissionState = await getGameState(ws.roomId);
            broadcastToRoom(ws.roomId, {
              type: 'card_submitted',
              gameState: submissionState
            });
            break;

          case 'exchange_card':
            if (!ws.playerId || !ws.roomId) break;

            const { cardId: exchangeCardId } = message;
            const exchangingPlayer = await storage.getPlayer(ws.playerId);
            const deck = await storage.getGameDeck(ws.roomId);

            if (!exchangingPlayer || !deck || exchangingPlayer.hasExchangedCard) break;

            const playerHand: CaptionCard[] = JSON.parse(exchangingPlayer.hand as string);
            const deckCards: CaptionCard[] = JSON.parse(deck.captionDeck as string);

            if (deckCards.length === 0) break;

            // Remove card from hand and add to discard
            const cardIndex = playerHand.findIndex(c => c.id === exchangeCardId);
            if (cardIndex === -1) break;

            const discardedCard = playerHand.splice(cardIndex, 1)[0];

            // Take random card from deck for better randomness
            const randomIndex = Math.floor(Math.random() * deckCards.length);
            const newCard = deckCards.splice(randomIndex, 1)[0];
            if (!newCard) break;

            playerHand.push(newCard);

            await storage.updatePlayer(ws.playerId, {
              hand: JSON.stringify(playerHand),
              hasExchangedCard: true
            });

            await storage.updateGameDeck(ws.roomId, {
              captionDeck: JSON.stringify(deckCards)
            });

            const exchangeState = await getGameState(ws.roomId);
            ws.send(JSON.stringify({
              type: 'card_exchanged',
              gameState: exchangeState
            }));
            break;

          case 'select_winner':
            if (!ws.roomId) break;

            const { winnerId } = message;
            const winningPlayer = await storage.getPlayer(winnerId);
            const winningRoom = await storage.getRoom(ws.roomId);
            const allPlayers = await storage.getPlayersByRoom(ws.roomId);

            if (!winningPlayer || !winningRoom) break;

            // Award trophy
            await storage.updatePlayer(winnerId, {
              trophies: winningPlayer.trophies + 1
            });

            // Check if current judge still has players with caption cards
            const nonJudgePlayers = allPlayers.filter(p => p.id !== winningRoom.currentJudgeId);
            const playersWithCards = nonJudgePlayers.filter(p => {
              const hand = JSON.parse(p.hand as string);
              return hand.length > 0;
            });

            // Reset round state for next photo selection
            await storage.updateRoom(ws.roomId, {
              selectedPhotoCard: null,
              submittedCards: "[]"
            });

            // Reset player submission status
            for (const player of nonJudgePlayers) {
              await storage.updatePlayer(player.id, {
                hasSubmittedCard: false,
                hasExchangedCard: false
              });
            }

            if (playersWithCards.length > 0) {
              // Same judge continues - just clear the round for next photo selection
              await storage.updateRoom(ws.roomId, {
                currentRound: winningRoom.currentRound + 1
              });

              const continueState = await getGameState(ws.roomId);
              broadcastToRoom(ws.roomId, {
                type: 'round_continues',
                winner: winningPlayer,
                gameState: continueState
              });
            } else {
              // All caption cards exhausted - rotate judge
              const currentJudgeIndex = allPlayers.findIndex(p => p.id === winningRoom.currentJudgeId);
              const nextJudgeIndex = (currentJudgeIndex + 1) % allPlayers.length;
              const nextJudge = allPlayers[nextJudgeIndex];

              // Always rotate to next judge and deal new cards
              // Game continues indefinitely until players manually end it
              await storage.updateRoom(ws.roomId, {
                currentJudgeId: nextJudge.id,
                currentRound: 1 // Reset round counter for new judge
              });

              await dealCards(ws.roomId);

              const nextJudgeState = await getGameState(ws.roomId);
              broadcastToRoom(ws.roomId, {
                type: 'judge_rotated',
                winner: winningPlayer,
                newJudge: nextJudge,
                gameState: nextJudgeState
              });
            }
            break;

          case 'restart_game':
            if (!ws.roomId) break;

            console.log('🔄 Restarting game for room:', ws.roomId);
            
            // Reset room to waiting state
            await storage.updateRoom(ws.roomId, {
              status: "waiting",
              currentJudgeId: null,
              currentRound: 0,
              selectedPhotoCard: null,
              submittedCards: "[]"
            });

            // Reset all players
            const roomPlayers = await storage.getPlayersByRoom(ws.roomId);
            for (const player of roomPlayers) {
              await storage.updatePlayer(player.id, {
                hand: "[]",
                trophies: 0,
                numberCard: null,
                hiddenNumberCard: null,
                hasSubmittedCard: false,
                hasExchangedCard: false
              });
            }

            // Recreate game deck with fresh cards
            await storage.deleteGameDeck(ws.roomId);
            await storage.createGameDeck(ws.roomId);

            const restartedGameState = await getGameState(ws.roomId);
            broadcastToRoom(ws.roomId, {
              type: 'game_restarted',
              gameState: restartedGameState
            });
            break;
        }
      } catch (error) {
        console.error('WebSocket error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });

    ws.on('close', async () => {
      if (ws.playerId && ws.roomId) {
        await storage.updatePlayer(ws.playerId, { isOnline: false });

        const gameState = await getGameState(ws.roomId);
        broadcastToRoom(ws.roomId, {
          type: 'player_disconnected',
          playerId: ws.playerId,
          gameState
        });
      }
    });
  });

  return httpServer;
}
