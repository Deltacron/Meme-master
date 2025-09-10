import {
  type User,
  type InsertUser,
  type Room,
  type InsertRoom,
  type Player,
  type InsertPlayer,
  type Card,
  type InsertCard,
  type GameDeck,
  type CaptionCard,
  type PhotoCard,
} from "@shared/schema";
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
  updatePlayer(
    id: string,
    updates: Partial<Player>,
  ): Promise<Player | undefined>;
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
  updateGameDeck(
    roomId: string,
    updates: Partial<GameDeck>,
  ): Promise<GameDeck | undefined>;
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
    // Initialize caption cards - 360 total cards
    const captionCards = [
      "Oh great, another Monday. Just what I needed.",
      "Sure, pineapple totally belongs on pizza… said no one sane.",
      "Me pretending to care about your weekend plans.",
      "Ah yes, my degree in Googling answers finally paying off.",
      "Love it when Netflix asks if I’m still watching. No Karen, I’m rotting.",
      "Me after going to the gym once: fitness influencer.",
      "Wow, adulting is so fun. Bills, taxes, emotional damage… sign me up.",
      "When your boss says 'we’re like a family' but pays you in exposure.",
      "That moment you realize your 'five-year plan' was just surviving.",
      "Nothing screams confidence like pushing a pull door.",
      "When you open the front camera: jump scare edition.",
      "Love that for me—battery dies at 1% right when life gets interesting.",
      "Me, trying to flirt: so… do you like bread?",
      "That awkward silence when you laugh at your own joke and nobody else does.",
      "Yes, I totally understood that math problem. Said me, never.",
      "When your crush waves… but it’s actually to the person behind you.",
      "Wow, so cool, you woke up at 5am to 'hustle.' I woke up at noon and cried.",
      "When you remember something embarrassing you did 10 years ago. Cute.",
      "Love it when my Uber driver gives me free trauma with the ride.",
      "Me: 'I’ll only have one cookie.' Also me: *eats the entire pack*.",
      "Oh sure, WiFi, take your time. It’s not like I needed the internet to live.",
      "When someone says 'money can’t buy happiness.' Okay, give me yours then.",
      "Me on Monday: I’ll eat clean this week. Me on Tuesday: *deep-fried sadness*.",
      "Yes, let’s all take turns showing vacation photos no one asked for.",
      "When you text 'I miss you' and they reply with 'k.' Love that energy.",
      "Wow, adulthood is just asking 'what’s for dinner' until you die.",
      "Me after oversharing in a group chat: Witness protection, please.",
      "That magical moment when your pet ignores you like everyone else does.",
      "Love when my stomach growls louder than my personality.",
      "When Spotify plays sad songs like it knows my trauma personally.",
      "Cool, autocorrect. I definitely meant to text my boss 'I love you.'",
      "Oh great, another email saying 'per my last email.' My favorite genre: passive aggression.",
      "Me: *studies for 10 minutes*. Brain: okay we deserve a 3-hour nap now.",
      "Nothing like tripping in public to humble you instantly.",
      "When someone says 'let’s circle back.' Translation: let’s never talk about this again.",
      "That face when your Uber Eats order is 'delivered' but nowhere to be found.",
      "Wow, so quirky, you play guitar. Teach me Wonderwall, Chad.",
      "When the teacher says 'pair up' and suddenly you’re invisible.",
      "Yes, Karen, please tell me again how essential oils cure everything.",
      "Oh wow, the printer jammed again. Truly groundbreaking technology.",
      "When you clap back perfectly… three hours too late.",
      "My favorite hobby? Pretending my life is a sitcom while crying.",
      "When you realize your 'emergency fund' is just $5 and a coupon.",
      "Oh joy, the elevator is stuck. Love my new panic room.",
      "When someone says 'you’ve changed.' Yeah, it’s called growth, Brenda.",
      "Wow, what a surprise, my horoscope says 'bad luck.' Groundbreaking.",
      "When you sneeze in public and people look at you like Patient Zero.",
      "Love that for me—accidentally liked a 6-year-old Instagram photo at 3am.",
      "That magical moment when your alarm clock ruins your dreams.",
      "Me after folding laundry: Olympic gold medalist in procrastination.",
      "Nothing screams romance like arguing about where to eat.",
      "When the waiter says 'enjoy your meal' and I say 'you too.'",
      "That smile you give when your WiFi finally works again.",
      "Oh sure, let’s do 'trust falls.' I totally trust you, Chad.",
      "When your mom says 'we need to talk.' RIP me.",
      "The joy of realizing you’ve been muted on Zoom for 20 minutes.",
      "Love that awkward moment when your stomach makes whale noises.",
      "Me pretending I know how taxes work.",
      "When your AirPods die mid-walk and now you’re just… existing.",
      "The look you give when your phone autocorrects to 'duck.'",
      "When you binge-watch a whole season and Netflix judges you.",
      "That magical time when your bank balance is just 'try again.'",
      "When you realize your bed is the only one who understands you.",
      "Oh sure, let’s all pretend we know what 'crypto' means.",
      "Me after eating one salad: bodybuilder mode activated.",
      "When someone claps after the plane lands… chill, hero.",
      "That smile you give when the barista spells your name wrong again.",
      "Nothing like realizing the WiFi password is case sensitive.",
      "When you accidentally send a meme to the wrong chat. Bye forever.",
      "Oh cool, another wedding invite I can’t afford.",
      "When you laugh at a meme but realize it’s about you.",
      "Me explaining to my dog why I can’t share my food.",
      "The thrill of realizing your jeans shrank (or maybe it’s you).",
      "When you walk into a room and forget why you’re there.",
      "That joy when someone says 'let’s split the bill evenly.'",
      "When you sneeze and everyone says 'bless you' like they care.",
      "Love that for me—3 alarms set and still overslept.",
      "When your GPS says 'recalculating.' Mood.",
      "Me pretending my iced coffee is a personality trait.",
      "When you get tagged in an ugly photo and can’t unsee it.",
      "The fun of realizing your package is 'still in transit.'",
      "When your friend cancels plans and you’re secretly relieved.",
      "That moment when autocorrect changes 'no' to 'moist.'",
      "Oh cool, another inspirational quote I’ll never use.",
      "When you reply 'haha' but you’re actually dying inside.",
      "Me explaining my life choices to the mirror: questionable.",
      "When someone eats loudly and you plot their downfall.",
      "That second when you realize your mic was never muted.",
      "Me pretending I like hiking for the Instagram photo.",
      "When the group chat ignores your meme. Betrayal.",
      "Love it when my pet judges me harder than humans.",
      "That sinking feeling when your card declines for $3.",
      "Me after cooking one meal: world-class chef.",
      "When you click 'reply all' by mistake. Instant regret.",
      "That face when the vending machine steals your money.",
      "When someone texts 'we need to talk.' Pure panic.",
      "Me laughing at my own jokes since no one else will.",
      "That thrill when you find fries at the bottom of the bag.",
      "When your crush says 'bro.' Friend-zoned forever.",
      "Oh, you meditate? I stress-eat Doritos. Same thing.",
      "When you wear white and instantly spill coffee on it.",
      "That magic moment when your laptop updates mid-meeting.",
      "When you rewatch childhood shows and realize they were weird.",
      "Me pretending I know how to use Excel.",
      "When someone waves and you wave back… wrong person.",
      "That feeling when Spotify ads attack your broke soul.",
      "Me trying to parallel park with witnesses around.",
      "When someone says 'rise and grind.' I’d rather nap.",
      "That smile when your food delivery finally arrives.",
      "When you sneeze three times and people say 'stop.'",
      "Oh look, another influencer selling fake happiness.",
      "When you accidentally send your boss a meme.",
      "That look you give when someone says 'calm down.'",
      "When your autocorrect exposes you in the group chat.",
      "Love when my brain replays cringe moments at 3am.",
      "Me explaining to my plant why it’s dying. Sorry queen.",
      "That awkward pause after you say 'you too' to the waiter.",
      "When your Amazon package says 'out for delivery' all day.",
      "Me pretending to be productive but scrolling memes.",
      "When someone asks me to smile more. No thanks.",
      "That thrill when the vending machine actually works.",
      "When you clap at the end of a movie… why though?",
      "Me after buying one book: intellectual icon.",
      "When someone says 'let’s just vibe.' Okay, therapist.",
      "That face when your crush doesn’t text back. Ever.",
      "When you lie down and suddenly remember everything embarrassing.",
      "That fun moment when your password is wrong 10 times.",
      "When you eat hot food and burn your tongue—life ruined.",
      "Love it when someone says 'let’s go on a run.' Blocked.",
      "When your headphones tangle themselves overnight. Black magic.",
      "That joy when your package arrives a week late.",
      "When someone asks 'why are you single?' Bold question.",
      "Me acting surprised when my bad choices catch up.",
      "When someone says 'new year, new me.' Lies.",
      "That panic when your Zoom camera turns on unexpectedly.",
      "Me pretending I didn’t just trip in public.",
      "When you accidentally click 'like' on a 7-year-old post.",
      "That moment when Netflix judges you for bingeing.",
      "Me after one sip of wine: sommelier.",
      "When someone says 'good vibes only.' Okay, cult leader.",
      "That awkward moment when you wave at a stranger.",
      "When your alarm goes off and you question life.",
      "Love it when I sneeze and scare my own pet.",
      "When your favorite snack is sold out—apocalypse.",
      "That fake smile you give while suffering inside.",
      "When someone calls instead of texts. Jail.",
      "Oh cool, another inspirational podcast. Revolutionary.",
      "When you sneeze and your back cracks too.",
      "That second you realize your screen is being shared.",
      "When someone says 'let’s do brunch.' Translation: overpriced eggs.",
      "Me explaining astrology to my skeptical friend.",
      "That awkward silence when you don’t know lyrics.",
      "When you hear your own voice on a recording. Yikes.",
      "Love when I click 'snooze' and ruin my life.",
      "When your sibling eats your leftovers. Crime scene.",
      "That time when you say 'you too' to the cashier.",
      "Me pretending I’ll only watch one episode.",
      "When someone says 'trust the process.' Okay, guru.",
      "That joy when you step on a Lego. Pure pain.", 
      "That joy when you step on a Lego. Pure pain.", 
    ];

    // Add more caption cards to reach 360 total
    const additionalCaptions = [];
    for (let i = captionCards.length; i < 360; i++) {
      additionalCaptions.push(`Meme caption ${i + 1}`);
    }
    captionCards.push(...additionalCaptions);

    // Initialize photo cards - 75 total cards
    const photoCards = [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Cool cat with sunglasses",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Surprised looking dog",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Confused looking dog",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1573865526739-10659fec78a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Grumpy cat face",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Happy golden retriever",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Serious looking cat",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Sleepy cat",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Excited dog with tongue out",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Wise looking owl",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Thoughtful monkey",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1571566882372-1598d88abd90?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Laughing hyena",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Curious lemur",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Sleepy sloth",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1560807707-8cc77767d783?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Dramatic llama",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Unimpressed cat",
      },
      // --- Adding many more ---
      {
        imageUrl:
          "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Dog looking suspicious",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Penguin mid-waddle",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Horse making funny face",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        description: "Goat looking dramatic",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1574158622682-e40e69881006?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Parrot giving side eye",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Baby monkey holding on",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Pug in a hoodie",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Dog with funny smile",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1593134257782-6aa1b5c9a7f2?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Goose looking offended",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1501706362039-c6e80948a78a?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Cow sticking tongue out",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1605733160314-4f1bdfc6c759?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Sheep looking majestic",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1601758125946-6ec2c22fcf04?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Rabbit mid-jump",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1560807707-8cc77767d783?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Alpaca with hairdo",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1517849845537-4d257902454a?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Bulldog puppy",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1611262588024-d05d6d339239?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Otter holding hands",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1614853311685-f9e3b6ea4c9b?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Cat in a box",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1614853311730-621f081e6e33?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Ferret being silly",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1606111745807-5d5f29c66ef0?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Chicken looking suspicious",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1614853311898-441982e4a6e2?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Seal clapping",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Penguin face closeup",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1614853311592-727d05f9b0a7?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Horse showing teeth",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1614853311739-9db6466b7403?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Duck with attitude",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1621202145742-65e9d3b0b2a7?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Dog wearing birthday hat",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1619983081563-430c27e5a07d?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Cat sitting like a human",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1605460375648-278bcbd579a6?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Goat photobombing picture",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1629931016224-73c0bb3f9e84?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Piglet with muddy nose",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Squirrel mid-bite",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1603349130186-0f88e72f1943?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Dog with butterfly on nose",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1603349194443-09dd270b64d2?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Donkey laughing",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1606111745799-dbad8c7c94c3?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Cat wearing a bow tie",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1558788353-f76d92427f16?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Dog in sunglasses",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1568572933382-74d440642117?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Cat looking shocked",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1614853311588-9e48e97e62c2?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Goose chasing camera",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1614853311533-bc21b9a1a4d8?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Dog caught stealing food",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Cow looking surprised",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1592194996498-04f721ef3e38?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Horse staring dramatically",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1592194996230-1a6b8a1af9da?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Cat with tongue out",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1589881133823-4a08aa61367d?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Bear waving paw",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1589881125776-4d63e1e36fc4?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Owl mid-blink",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1589881125776-1c9d32fd6f4b?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Camel smiling",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1588797469599-b601e5aa9a66?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Cat squinting in sun",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1603732552658-621f9a4f3a3d?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Goat sticking tongue out",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1603732547415-6ecb438ef15e?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Dog with messy hair",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1598133894009-f72d5b7dc702?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Moose looking grumpy",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1598133894040-bb8dbd048c38?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Duck walking dramatically",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1619983081740-469a7a9a7ac1?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Cat staring into space",
      },
      {
        imageUrl:
          "https://images.unsplash.com/photo-1620021081042-91f0acb2a537?crop=entropy&cs=tinysrgb&fit=crop&w=400&h=300",
        description: "Donkey giving side eye",
      },
    ];

    // Add more photo cards to reach 75 total
    const additionalPhotos = [];
    for (let i = photoCards.length; i < 75; i++) {
      additionalPhotos.push({
        imageUrl: `https://images.unsplash.com/photo-151488828697${4 + i}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300`,
        description: `Meme photo ${i + 1}`,
      });
    }
    photoCards.push(...additionalPhotos);

    captionCards.forEach((text) => {
      const id = randomUUID();
      this.cards.set(id, {
        id,
        type: "caption",
        content: text,
        imageUrl: null,
        description: null,
      });
    });

    photoCards.forEach((photo) => {
      const id = randomUUID();
      this.cards.set(id, {
        id,
        type: "photo",
        content: photo.description,
        imageUrl: photo.imageUrl,
        description: photo.description,
      });
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
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
    return Array.from(this.rooms.values()).find((room) => room.code === code);
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
      createdAt: new Date(),
    };
    this.rooms.set(id, room);
    return room;
  }

  async updateRoom(
    id: string,
    updates: Partial<Room>,
  ): Promise<Room | undefined> {
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
    return Array.from(this.players.values()).filter(
      (player) => player.roomId === roomId,
    );
  }

  async createPlayer(
    insertPlayer: InsertPlayer & { roomId: string },
  ): Promise<Player> {
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
      joinedAt: new Date(),
    };
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(
    id: string,
    updates: Partial<Player>,
  ): Promise<Player | undefined> {
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
    players.forEach((player) => this.players.delete(player.id));
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
    return Array.from(this.cards.values()).filter((card) => card.type === type);
  }

  async createCard(insertCard: InsertCard): Promise<Card> {
    const id = randomUUID();
    const card: Card = {
      ...insertCard,
      id,
      description: insertCard.description || null,
      imageUrl: insertCard.imageUrl || null,
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

    // Transform Card objects to CaptionCard format
    const transformedCaptions = allCaptionCards.map((card) => ({
      id: card.id,
      text: card.content,
    }));

    // Transform Card objects to PhotoCard format
    const transformedPhotos = allPhotoCards.map((card) => ({
      id: card.id,
      imageUrl: card.imageUrl!,
      description: card.description!,
    }));

    const shuffledCaptions = [...transformedCaptions].sort(
      () => Math.random() - 0.5,
    );
    const shuffledPhotos = [...transformedPhotos].sort(
      () => Math.random() - 0.5,
    );

    const deck: GameDeck = {
      id: randomUUID(),
      roomId,
      captionDeck: JSON.stringify(shuffledCaptions),
      photoDeck: JSON.stringify(shuffledPhotos),
      discardPile: "[]",
    };

    this.gameDecks.set(roomId, deck);
    return deck;
  }

  async updateGameDeck(
    roomId: string,
    updates: Partial<GameDeck>,
  ): Promise<GameDeck | undefined> {
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
