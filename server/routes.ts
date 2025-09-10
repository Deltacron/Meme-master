import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertRoomSchema, insertPlayerSchema, type GameState, type CaptionCard, type PhotoCard } from "@shared/schema";
import { randomBytes } from "crypto";

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
    const cardsPerPlayer = players.length === 3 ? 4 : 7;

    let cardIndex = 0;
    for (const player of players) {
      const hand = captionCards.slice(cardIndex, cardIndex + cardsPerPlayer);
      await storage.updatePlayer(player.id, { 
        hand: JSON.stringify(hand),
        hasSubmittedCard: false,
        hasExchangedCard: false
      });
      cardIndex += cardsPerPlayer;
    }

    // Update deck with remaining cards
    const remainingCards = captionCards.slice(cardIndex);
    await storage.updateGameDeck(roomId, {
      captionDeck: JSON.stringify(remainingCards)
    });
  }

  // Broadcast to room
  function broadcastToRoom(roomId: string, message: any) {
    wss.clients.forEach((client) => {
      const socket = client as SocketWithData;
      if (socket.readyState === WebSocket.OPEN && socket.roomId === roomId) {
        socket.send(JSON.stringify(message));
      }
    });
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

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('📨 WebSocket message received:', message.type, message);

        switch (message.type) {
          case 'join_room':
            console.log('WebSocket join_room received:', message);
            ws.playerId = message.playerId;
            ws.roomId = message.roomId;

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

            // Assign random number cards for judge selection
            const numberCards = shuffleArray(Array.from({length: players.length}, (_, i) => i + 1));

            for (let i = 0; i < players.length; i++) {
              await storage.updatePlayer(players[i].id, {
                numberCard: numberCards[i]
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

            // Remove submitted card from hand and replace with new card from deck
            const updatedHand = hand.filter(c => c.id !== submittedCardId);
            const availableCards: CaptionCard[] = JSON.parse(playerDeck.captionDeck as string);
            
            if (availableCards.length > 0) {
              const newCard = availableCards.shift();
              if (newCard) {
                updatedHand.push(newCard);
                await storage.updateGameDeck(ws.roomId, {
                  captionDeck: JSON.stringify(availableCards)
                });
              }
            }

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

            // Take new card from deck
            const newCard = deckCards.shift();
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

            if (!winningPlayer || !winningRoom) break;

            // Award trophy
            await storage.updatePlayer(winnerId, {
              trophies: winningPlayer.trophies + 1
            });

            // Check win condition
            if (winningPlayer.trophies + 1 >= 5) {
              await storage.updateRoom(ws.roomId, {
                status: "finished"
              });

              const finalState = await getGameState(ws.roomId);
              broadcastToRoom(ws.roomId, {
                type: 'game_finished',
                winner: winningPlayer,
                gameState: finalState
              });
            } else {
              // Prepare next round
              const allPlayers = await storage.getPlayersByRoom(ws.roomId);
              const currentJudgeIndex = allPlayers.findIndex(p => p.id === winningRoom.currentJudgeId);
              const nextJudgeIndex = (currentJudgeIndex + 1) % allPlayers.length;
              const nextJudge = allPlayers[nextJudgeIndex];

              await storage.updateRoom(ws.roomId, {
                currentJudgeId: nextJudge.id,
                currentRound: winningRoom.currentRound + 1,
                selectedPhotoCard: null,
                submittedCards: "[]"
              });

              await dealCards(ws.roomId);

              const nextRoundState = await getGameState(ws.roomId);
              broadcastToRoom(ws.roomId, {
                type: 'round_winner_selected',
                winner: winningPlayer,
                gameState: nextRoundState
              });
            }
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
