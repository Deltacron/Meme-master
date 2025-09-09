import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSocket } from "@/hooks/use-socket";
import { useGameState } from "@/hooks/use-game-state";
import { useToast } from "@/hooks/use-toast";
import { type Player } from "@shared/schema";
import { Copy, Play, Trophy, Info, Users } from "lucide-react";

interface LobbyProps {
  params: { code: string };
}

export default function Lobby({ params }: LobbyProps) {
  const [, setLocation] = useLocation();
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const { gameState, setCurrentPlayer: setGameStatePlayer, joinRoom, startGame } = useGameState();
  const { toast } = useToast();

  useEffect(() => {
    // Get current player from localStorage
    const storedPlayer = localStorage.getItem("currentPlayer");
    if (storedPlayer) {
      const player = JSON.parse(storedPlayer);
      setCurrentPlayer(player);
      setGameStatePlayer(player);
      joinRoom(player.id, player.roomId);
    } else {
      // Redirect to home if no player info
      setLocation("/");
    }
  }, []);

  useEffect(() => {
    if (gameState?.room.status === "selecting_judge") {
      setLocation(`/game/${params.code}`);
    }
  }, [gameState?.room.status, params.code, setLocation]);

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(params.code);
      toast({
        title: "Room code copied!",
        description: "Share this code with your friends."
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please copy the room code manually."
      });
    }
  };

  const handleStartGame = () => {
    if (!gameState || gameState.players.length < 3) {
      toast({
        variant: "destructive",
        title: "Not enough players",
        description: "At least 3 players are required to start the game."
      });
      return;
    }
    startGame();
  };

  const isHost = currentPlayer && gameState?.room.hostId === currentPlayer.id;
  const canStart = gameState && gameState.players.length >= 3;

  if (!gameState || !currentPlayer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-foreground">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Game Lobby</h1>
          <Card className="inline-block p-4 bg-muted">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">Room Code:</span>
              <span className="text-xl font-mono font-semibold text-foreground" data-testid="room-code">
                {params.code}
              </span>
              <Button
                onClick={copyRoomCode}
                variant="ghost"
                size="sm"
                className="text-accent hover:text-accent/80"
                data-testid="copy-room-code"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Players Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {gameState.players.map((player) => (
            <Card key={player.id} className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-lg">
                    <span data-testid={`player-initials-${player.id}`}>
                      {player.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground" data-testid={`player-name-${player.id}`}>
                      {player.name}
                      {player.id === currentPlayer.id && " (You)"}
                      {player.id === gameState.room.hostId && " (Host)"}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {player.isOnline ? "Ready" : "Offline"}
                      </span>
                      <div 
                        className={`w-2 h-2 rounded-full ${player.isOnline ? "bg-green-500" : "bg-gray-400"}`}
                        data-testid={`player-status-${player.id}`}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-secondary">
                      <Trophy className="h-4 w-4 mr-1" />
                      <span className="font-semibold" data-testid={`player-trophies-${player.id}`}>
                        {player.trophies}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Game Status */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Game Status
                </h3>
                <p className="text-muted-foreground">
                  <span data-testid="player-count">{gameState.players.length}</span> players joined • 
                  <span className="ml-1">3 minimum required</span>
                </p>
              </div>
              <div className="text-right">
                {isHost ? (
                  <Button
                    onClick={handleStartGame}
                    disabled={!canStart}
                    className="bg-primary text-primary-foreground px-6 py-3 hover:bg-primary/90 disabled:opacity-50"
                    data-testid="start-game-button"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Game
                  </Button>
                ) : (
                  <span className="text-muted-foreground">Waiting for host to start...</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Rules Reminder */}
        <Card className="bg-muted">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
              <Info className="mr-2 h-5 w-5" />
              Quick Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>• Judge shows a photo card</div>
              <div>• Players submit funny captions</div>
              <div>• Judge picks the funniest</div>
              <div>• First to 5 trophies wins!</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
