import { type User, type InsertUser, type Room, type InsertRoom, type Player, type InsertPlayer, type Card, type InsertCard, type GameDeck, type CaptionCard, type PhotoCard } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Room methods
  getRoom(id: string): Promise<Room | undefined>;
  getRoomByCode(code: string): Promise<Room | undefined>;
  createRoom(room: InsertRoom & { code: string }): Promise<Room>;
  updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined>;
  deleteRoom(id: string): Promise<boolean>;

  // Player methods
  getPlayer(id: string): Promise<Player | undefined>;
  getPlayersByRoom(roomId: string): Promise<Player[]>;
  createPlayer(player: InsertPlayer & { roomId: string }): Promise<Player>;
  updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined>;
  deletePlayer(id: string): Promise<boolean>;
  deletePlayersByRoom(roomId: string): Promise<boolean>;

  // Card methods
  getCard(id: string): Promise<Card | undefined>;
  getAllCards(): Promise<Card[]>;
  getCardsByType(type: "caption" | "photo"): Promise<Card[]>;
  createCard(card: InsertCard): Promise<Card>;

  // Game deck methods
  getGameDeck(roomId: string): Promise<GameDeck | undefined>;
  createGameDeck(roomId: string): Promise<GameDeck>;
  updateGameDeck(roomId: string, updates: Partial<GameDeck>): Promise<GameDeck | undefined>;
  deleteGameDeck(roomId: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private rooms: Map<string, Room> = new Map();
  private players: Map<string, Player> = new Map();
  private cards: Map<string, Card> = new Map();
  private gameDecks: Map<string, GameDeck> = new Map();

  constructor() {
    this.initializeCards();
  }

  private initializeCards() {
    // Initialize caption cards
    const captionCards = [
      "When you realize it's Monday morning",
      "That face when you find out it's a three-day weekend",
      "Me trying to adult",
      "When someone says pineapple belongs on pizza",
      "Trying to remember where I put my keys",
      "When the WiFi goes down",
      "Me pretending to understand math",
      "When you see your ex in public",
      "Trying to look busy at work",
      "When you accidentally open the front camera",
      "Me avoiding responsibilities",
      "When someone spoils your favorite show",
      "Trying to wake up for work",
      "When you realize you've been talking to yourself",
      "Me when someone says 'we need to talk'",
      "When you find money in your old jeans",
      "Trying to act normal in front of your crush",
      "When the food you ordered looks nothing like the picture",
      "Me when I have to make small talk",
      "When you're the third wheel",
      "Trying to parallel park",
      "When you realize you sent a text to the wrong person",
      "Me pretending to listen to a boring story",
      "When you walk into a spider web",
      "Trying to remember what I came into this room for",
      "When someone asks what my five-year plan is",
      "Me when I see the price of gas",
      "When you're hungry but too lazy to cook",
      "Trying to look smart in a meeting",
      "When you realize you've been singing the wrong lyrics"
    ];

    // Initialize photo cards
    const photoCards = [
      {
        imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Cool cat with sunglasses"
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Surprised looking dog"
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Confused looking dog"
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Grumpy cat face"
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Happy golden retriever"
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Serious looking cat"
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Sleepy cat"
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Excited dog with tongue out"
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Wise looking owl"
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Thoughtful monkey"
      }
    ];

    captionCards.forEach(text => {
      const id = randomUUID();
      this.cards.set(id, {
        id,
        type: "caption",
        content: text,
        imageUrl: null,
        description: null
      });
    });

    photoCards.forEach(photo => {
      const id = randomUUID();
      this.cards.set(id, {
        id,
        type: "photo",
        content: photo.description,
        imageUrl: photo.imageUrl,
        description: photo.description
      });
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Room methods
  async getRoom(id: string): Promise<Room | undefined> {
    return this.rooms.get(id);
  }

  async getRoomByCode(code: string): Promise<Room | undefined> {
    return Array.from(this.rooms.values()).find(room => room.code === code);
  }

  async createRoom(insertRoom: InsertRoom & { code: string }): Promise<Room> {
    const id = randomUUID();
    const room: Room = {
      ...insertRoom,
      id,
      status: "waiting",
      currentJudgeId: null,
      currentRound: 0,
      selectedPhotoCard: null,
      submittedCards: "[]",
      createdAt: new Date()
    };
    this.rooms.set(id, room);
    return room;
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room | undefined> {
    const room = this.rooms.get(id);
    if (!room) return undefined;
    
    const updatedRoom = { ...room, ...updates };
    this.rooms.set(id, updatedRoom);
    return updatedRoom;
  }

  async deleteRoom(id: string): Promise<boolean> {
    return this.rooms.delete(id);
  }

  // Player methods
  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayersByRoom(roomId: string): Promise<Player[]> {
    return Array.from(this.players.values()).filter(player => player.roomId === roomId);
  }

  async createPlayer(insertPlayer: InsertPlayer & { roomId: string }): Promise<Player> {
    const id = randomUUID();
    const player: Player = {
      ...insertPlayer,
      id,
      isOnline: true,
      hand: "[]",
      trophies: 0,
      numberCard: null,
      hasSubmittedCard: false,
      hasExchangedCard: false,
      joinedAt: new Date()
    };
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updatedPlayer = { ...player, ...updates };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async deletePlayer(id: string): Promise<boolean> {
    return this.players.delete(id);
  }

  async deletePlayersByRoom(roomId: string): Promise<boolean> {
    const players = await this.getPlayersByRoom(roomId);
    players.forEach(player => this.players.delete(player.id));
    return true;
  }

  // Card methods
  async getCard(id: string): Promise<Card | undefined> {
    return this.cards.get(id);
  }

  async getAllCards(): Promise<Card[]> {
    return Array.from(this.cards.values());
  }

  async getCardsByType(type: "caption" | "photo"): Promise<Card[]> {
    return Array.from(this.cards.values()).filter(card => card.type === type);
  }

  async createCard(insertCard: InsertCard): Promise<Card> {
    const id = randomUUID();
    const card: Card = { 
      ...insertCard, 
      id,
      description: insertCard.description || null,
      imageUrl: insertCard.imageUrl || null
    };
    this.cards.set(id, card);
    return card;
  }

  // Game deck methods
  async getGameDeck(roomId: string): Promise<GameDeck | undefined> {
    return this.gameDecks.get(roomId);
  }

  async createGameDeck(roomId: string): Promise<GameDeck> {
    const allCaptionCards = await this.getCardsByType("caption");
    const allPhotoCards = await this.getCardsByType("photo");
    
    const shuffledCaptions = [...allCaptionCards].sort(() => Math.random() - 0.5);
    const shuffledPhotos = [...allPhotoCards].sort(() => Math.random() - 0.5);

    const deck: GameDeck = {
      id: randomUUID(),
      roomId,
      captionDeck: JSON.stringify(shuffledCaptions),
      photoDeck: JSON.stringify(shuffledPhotos),
      discardPile: "[]"
    };
    
    this.gameDecks.set(roomId, deck);
    return deck;
  }

  async updateGameDeck(roomId: string, updates: Partial<GameDeck>): Promise<GameDeck | undefined> {
    const deck = this.gameDecks.get(roomId);
    if (!deck) return undefined;
    
    const updatedDeck = { ...deck, ...updates };
    this.gameDecks.set(roomId, updatedDeck);
    return updatedDeck;
  }

  async deleteGameDeck(roomId: string): Promise<boolean> {
    return this.gameDecks.delete(roomId);
  }
}

export const storage = new MemStorage();
