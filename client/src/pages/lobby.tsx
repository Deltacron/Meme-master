import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSocket } from "@/hooks/use-socket";
import { useGameState } from "@/hooks/use-game-state";
import { useToast } from "@/hooks/use-toast";
import { type Player } from "@shared/schema";
import { Copy, Play, Trophy, Info, Users, Crown, Star, Sparkles, Zap, Shield, Gamepad2, Rocket, Target } from "lucide-react";

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
      <div className="min-h-screen relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="animate-spin w-16 h-16 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4 shadow-2xl"></div>
              <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-purple-300 animate-pulse" />
            </div>
            <p className="text-2xl font-bold text-white mb-2">🎮 Loading Epic Lobby...</p>
            <p className="text-purple-200">Preparing your meme battle arena!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Epic Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Floating Gaming Elements */}
       
        <div className="absolute bottom-20 right-40 animate-bounce delay-4000">
          <Sparkles className="w-8 h-8 text-pink-400 animate-pulse" />
        </div>
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Epic Header */}
          <div className="text-center mb-12">
            <div className="relative mb-8">
              <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-2xl mb-4">
                🏰 Battle Arena
              </h1>
              <div className="absolute -top-4 -right-8 animate-bounce">
                <Crown className="w-12 h-12 text-yellow-400 drop-shadow-lg" />
              </div>
              <div className="absolute -bottom-2 -left-8 animate-bounce">
                <Shield className="w-10 h-10 text-blue-400 drop-shadow-lg" />
              </div>
            </div>
            
            {/* Epic Room Code Card */}
            <div className="relative inline-block w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 animate-pulse" />
              <div className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-3xl p-6 shadow-2xl w-full">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-3">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <span className="text-lg font-bold text-gray-600 block">🎯 Room Code</span>
                    <span className="text-3xl font-mono font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent" data-testid="room-code">
                      {params.code}
                    </span>
                  </div>
                  <Button
                    onClick={copyRoomCode}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-4 rounded-2xl shadow-lg transform hover:scale-110 transition-all duration-200"
                    data-testid="copy-room-code"
                  >
                    <Copy className="h-6 w-6" />
                  </Button>
                </div>
                <p className="text-gray-500 text-sm mt-2 font-medium">Share this code with your friends!</p>
              </div>
            </div>
          </div>

          {/* Epic Warriors Section */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                ⚔️ Battle Warriors
              </h2>
              <p className="text-white/80 text-lg font-medium">Meme masters ready for combat!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {gameState.players.map((player, index) => {
                const isCurrentPlayer = player.id === currentPlayer.id;
                const isHost = player.id === gameState.room.hostId;
                const colors = [
                  "from-purple-500 to-pink-500",
                  "from-blue-500 to-cyan-500", 
                  "from-green-500 to-emerald-500",
                  "from-yellow-500 to-orange-500",
                  "from-red-500 to-rose-500",
                  "from-indigo-500 to-purple-500",
                  "from-teal-500 to-blue-500",
                  "from-orange-500 to-red-500"
                ];
                const playerColor = colors[index % colors.length];
                
                return (
                  <div key={player.id} className="relative">
                    <div className={`absolute inset-0 bg-gradient-to-r ${playerColor} rounded-3xl blur-xl opacity-30`} />
                    <div className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-3xl p-6 shadow-2xl">
                      {/* Player Header */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`relative w-16 h-16 bg-gradient-to-r ${playerColor} rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg`}>
                          <span data-testid={`player-initials-${player.id}`}>
                            {player.name.charAt(0).toUpperCase()}
                          </span>
                          {isHost && (
                            <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                              <Crown className="w-4 h-4 text-yellow-900" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-lg flex items-center" data-testid={`player-name-${player.id}`}>
                            {player.name}
                            {isCurrentPlayer && " 🎮"}
                            {isHost && " 👑"}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${player.isOnline ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} data-testid={`player-status-${player.id}`} />
                            <span className={`text-sm font-medium ${player.isOnline ? "text-green-600" : "text-gray-500"}`}>
                              {player.isOnline ? "⚡ Ready to Battle!" : "💤 Offline"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Player Stats */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                            <span className="text-gray-600 font-medium">Trophies</span>
                          </div>
                          <span className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent" data-testid={`player-trophies-${player.id}`}>
                            {player.trophies}
                          </span>
                        </div>
                      </div>
                      
                      {/* Special Effects */}
                      {isCurrentPlayer && (
                        <div className="absolute -top-1 -right-1">
                          <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-bounce">
                            YOU
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Epic Game Status */}
          <div className="mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-xl opacity-30 animate-pulse" />
              <div className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-3xl p-8 shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center mb-4">
                      🚀 Battle Status
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl px-4 py-2">
                        <span className="text-lg font-bold text-blue-700">
                          <span data-testid="player-count">{gameState.players.length}</span> Warriors Ready
                        </span>
                      </div>
                      <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl px-4 py-2">
                        <span className="text-sm font-medium text-amber-700">
                          Minimum: 3 Players
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-full lg:w-auto">
                    {isHost ? (
                      <Button
                        onClick={handleStartGame}
                        disabled={!canStart}
                        className={`w-full lg:w-auto px-6 lg:px-8 py-3 lg:py-4 text-lg lg:text-xl font-bold rounded-2xl shadow-2xl transform transition-all duration-300 ${
                          canStart 
                            ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:scale-110 hover:shadow-green-500/50" 
                            : "bg-gray-400 text-gray-600 cursor-not-allowed"
                        }`}
                        data-testid="start-game-button"
                      >
                        <Play className="mr-3 h-5 w-5 lg:h-6 lg:w-6" />
                        {canStart ? "🎮 Launch Battle!" : "Need More Warriors"}
                      </Button>
                    ) : (
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl px-6 py-4 w-full lg:w-auto text-center lg:text-left">
                        <span className="text-purple-700 font-medium">⏳ Waiting for host to launch...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Epic Battle Rules */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-xl opacity-20" />
            <div className="relative bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center justify-center">
                <Info className="mr-3 h-8 w-8 text-indigo-500 animate-pulse" />
                ⚔️ Battle Rules
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                    <span className="font-bold text-blue-800">📸 Judge shows a photo card</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                    <span className="font-bold text-purple-800">✍️ Players submit funny captions</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                    <span className="font-bold text-green-800">🎯 Judge picks the funniest</span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4 border-2 border-yellow-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">🏆</div>
                    <span className="font-bold text-yellow-800">👑 First to 5 trophies wins!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
