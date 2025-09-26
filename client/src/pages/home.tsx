import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RulesModal } from "@/components/game/rules-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, LogIn, HelpCircle, Smile, Sparkles, Trophy, Users, Zap, Crown, Star, Gamepad2 } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [playerName, setPlayerName] = useState("");
  const [joinPlayerName, setJoinPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<"waking" | "ready" | "unknown">("waking");
  const { toast } = useToast();

  // Wake up the backend server when the home page loads
  useEffect(() => {
    const wakeUpServer = async () => {
      setServerStatus("waking");
      
      try {
        // Make a simple health check API call to wake up the server
        await apiRequest("GET", "/health");
        console.log("✅ Backend server wake-up successful");
        setServerStatus("ready");
      } catch (error) {
        console.log("⏳ Backend server is starting up...");
        
        // Try a backup wake-up call to root endpoint after a short delay
        setTimeout(async () => {
          try {
            await apiRequest("GET", "/");
            console.log("✅ Backend server wake-up successful (backup)");
            setServerStatus("ready");
          } catch (backupError) {
            console.log("⏳ Backend server still starting up...");
            setServerStatus("unknown");
          }
        }, 2000);
      }
    };

    wakeUpServer();
  }, []);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      toast({
        variant: "destructive",
        title: "Name required",
        description: "Please enter your name to create a room."
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create room with temporary host ID, then join and update
      const response = await apiRequest("POST", "/api/rooms", {
        hostId: "temp-host-id", // Will be updated when first player joins
      });

      const { room } = await response.json();

      // Join the room as a player
      const joinResponse = await apiRequest("POST", `/api/rooms/${room.code}/join`, {
        name: playerName.trim(),
        isHost: true // Mark this player as the host
      });

      const { player } = await joinResponse.json();

      // Store player info in localStorage
      localStorage.setItem("currentPlayer", JSON.stringify(player));
      localStorage.setItem("playerName", playerName.trim());

      setLocation(`/lobby/${room.code}`);
    } catch (error) {
      toast({
        variant: "destructive", 
        title: "Failed to create room",
        description: "Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinPlayerName.trim()) {
      toast({
        variant: "destructive",
        title: "Name required", 
        description: "Please enter your name to join a room."
      });
      return;
    }

    if (!roomCode.trim()) {
      toast({
        variant: "destructive",
        title: "Room code required",
        description: "Please enter a room code to join."
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", `/api/rooms/${roomCode.trim().toUpperCase()}/join`, {
        name: joinPlayerName.trim()
      });

      const { player } = await response.json();

      // Store player info in localStorage
      localStorage.setItem("currentPlayer", JSON.stringify(player));
      localStorage.setItem("playerName", joinPlayerName.trim());

      setLocation(`/lobby/${roomCode.trim().toUpperCase()}`);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to join room", 
        description: "Room not found or game in progress."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Floating Elements */}
       
        <div className="absolute bottom-40 right-40 animate-bounce delay-4000">
          <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Epic Header */}
          <div className="text-center mb-12">
            <div className="relative mb-6">
              <h1 className="text-7xl md:text-8xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-2xl animate-pulse">
                🎭 Meme Masters
              </h1>
              <div className="absolute top-4 -right-4 animate-bounce">
                <Crown className="w-16 h-16 text-yellow-400 drop-shadow-lg" />
              </div>
              <div className="absolute -bottom-2 -left-4 animate-bounce">
                <Gamepad2 className="w-12 h-12 text-blue-400 drop-shadow-lg" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl text-white font-bold mb-4 animate-fade-in">
              🚀 The Ultimate Multiplayer Meme Battle! 🚀
            </p>
            <p className="text-lg text-blue-200 font-medium">
              Create hilarious captions • Battle friends • Become the Meme Master!
            </p>
          </div>

          {/* Server Status Indicator
          {serverStatus === "waking" && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-2 backdrop-blur-sm">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                <span className="text-amber-200 text-sm font-medium">Server starting up...</span>
              </div>
            </div>
          )}

          {serverStatus === "ready" && (
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2 backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-green-200 text-sm font-medium">Server ready!</span>
              </div>
            </div>
          )} */}

         

          {/* Main Game Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 animate-pulse" />
            <Card className="relative shadow-2xl bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-3xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500" />
              
              <CardContent className="p-8 space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                    🎮 Ready to Play?
                  </h2>
                  <p className="text-gray-600 text-lg font-medium">Join the meme revolution!</p>
                </div>

                {/* Player Name Input */}
                <div className="space-y-4">
                  <div className="relative">
                    <Label htmlFor="playerName" className="block text-lg font-bold text-gray-700 mb-3">
                      🎭 Your Meme Name
                    </Label>
                    <div className="relative">
                      <Input
                        id="playerName"
                        type="text"
                        placeholder="Enter your epic name..."
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full text-lg p-4 border-2 border-purple-300 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 bg-gradient-to-r from-white to-purple-50 font-semibold placeholder:text-gray-400"
                        data-testid="player-name-input"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Create Room Button */}
                  <Button
                    onClick={handleCreateRoom}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-xl py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-0 hover:shadow-purple-500/50"
                    data-testid="create-room-button"
                  >
                    <Plus className="mr-3 h-6 w-6 animate-bounce" />
                    🚀 Create Epic Room
                  </Button>
                </div>

                {/* Stylish Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-gradient-to-r from-purple-300 via-blue-300 to-pink-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-6 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600 font-bold rounded-full border-2 border-purple-300">
                      ⚡ OR ⚡
                    </span>
                  </div>
                </div>

                {/* Join Room Section */}
                <div className="space-y-4">
                  <div className="relative">
                    <Label htmlFor="joinPlayerName" className="block text-lg font-bold text-gray-700 mb-3">
                      🎭 Your Name 
                    </Label>
                    <div className="relative">
                      <Input
                        id="joinPlayerName"
                        type="text"
                        placeholder="Enter your name..."
                        value={joinPlayerName}
                        onChange={(e) => setJoinPlayerName(e.target.value)}
                        className="w-full text-lg p-4 border-2 border-green-300 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-200 bg-gradient-to-r from-white to-green-50 font-semibold placeholder:text-gray-400"
                        data-testid="join-player-name-input"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <Sparkles className="w-5 h-5 text-green-400 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <Label htmlFor="roomCode" className="block text-lg font-bold text-gray-700 mb-3">
                      🎯 Room Code
                    </Label>
                    <div className="relative">
                      <Input
                        id="roomCode"
                        type="text"
                        placeholder="Enter room code..."
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        className="w-full text-lg p-4 border-2 border-blue-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 bg-gradient-to-r from-white to-blue-50 font-mono font-bold placeholder:text-gray-400 tracking-wider"
                        data-testid="room-code-input"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <Zap className="w-5 h-5 text-blue-400 animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleJoinRoom}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 text-white font-bold text-xl py-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-0 hover:shadow-blue-500/50"
                    data-testid="join-room-button"
                  >
                    <LogIn className="mr-3 h-6 w-6 animate-bounce" />
                    🎯 Join the Battle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
            {/* Game Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 mt-8">
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl p-4 text-center border border-purple-400/30 hover:scale-105 transform transition-all duration-300">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2 animate-bounce" />
              <p className="text-white font-semibold">3-8 Players</p>
              <p className="text-purple-200 text-sm">Epic Multiplayer Fun</p>
            </div>
            <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-sm rounded-2xl p-4 text-center border border-blue-400/30 hover:scale-105 transform transition-all duration-300">
              <Zap className="w-8 h-8 text-blue-400 mx-auto mb-2 animate-pulse" />
              <p className="text-white font-semibold">Fast Rounds</p>
              <p className="text-blue-200 text-sm">Quick & Hilarious</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-2xl p-4 text-center border border-yellow-400/30 hover:scale-105 transform transition-all duration-300">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2 animate-bounce" />
              <p className="text-white font-semibold">Win Trophies</p>
              <p className="text-yellow-200 text-sm">Compete & Conquer</p>
            </div>
          </div>
          {/* How to Play Button */}
          <div className="mt-6 sm:mt-8 text-center px-4">
            <Button
              variant="ghost"
              onClick={() => setShowRules(true)}
              className="text-white/90 hover:text-white hover:bg-white/20 text-sm sm:text-lg font-semibold py-3 sm:py-4 px-4 sm:px-8 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-white/30 hover:border-white/50 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              data-testid="show-rules-button"
            >
              <HelpCircle className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
              <span className="truncate">📖 How to Become a Meme Master</span>
            </Button>
          </div>

          {/* Fun Stats */}
          <div className="mt-8 text-center text-white/80">
            <p className="text-sm font-medium">
              🎉 Join thousands of players creating epic memes! 🎉
            </p>
          </div>
        </div>
      </div>

      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
