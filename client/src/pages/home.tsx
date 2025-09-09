import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RulesModal } from "@/components/game/rules-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, LogIn, HelpCircle, Smile } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      const response = await apiRequest("POST", "/api/rooms", {
        hostId: "temp-host-id", // This would normally be generated from auth
      });
      
      const { room } = await response.json();
      
      // Join the room as a player
      const joinResponse = await apiRequest("POST", `/api/rooms/${room.code}/join`, {
        name: playerName.trim()
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
    if (!playerName.trim()) {
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
        name: playerName.trim()
      });
      
      const { player } = await response.json();
      
      // Store player info in localStorage
      localStorage.setItem("currentPlayer", JSON.stringify(player));
      localStorage.setItem("playerName", playerName.trim());
      
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
    <div className="min-h-screen bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-4">
            <Smile className="inline mr-3 h-16 w-16" />
            Meme Masters
          </h1>
          <p className="text-xl text-white/90">The funniest multiplayer card game ever!</p>
        </div>

        <Card className="shadow-2xl">
          <CardContent className="p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Join the Fun</h2>
              <p className="text-muted-foreground">Create a room or join your friends</p>
            </div>

            {/* Create Room */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="playerName" className="block text-sm font-medium text-foreground mb-2">
                  Your Name
                </Label>
                <Input
                  id="playerName"
                  type="text"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full"
                  data-testid="player-name-input"
                />
              </div>
              
              <Button
                onClick={handleCreateRoom}
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground py-3 hover:bg-primary/90 transform hover:scale-105"
                data-testid="create-room-button"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Room
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">or</span>
              </div>
            </div>

            {/* Join Room */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="roomCode" className="block text-sm font-medium text-foreground mb-2">
                  Room Code
                </Label>
                <Input
                  id="roomCode"
                  type="text"
                  placeholder="Enter room code"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full font-mono"
                  data-testid="room-code-input"
                />
              </div>
              
              <Button
                onClick={handleJoinRoom}
                disabled={isLoading}
                className="w-full bg-accent text-accent-foreground py-3 hover:bg-accent/90"
                data-testid="join-room-button"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Join Room
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Game Rules Preview */}
        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => setShowRules(true)}
            className="text-white/80 hover:text-white hover:bg-white/10"
            data-testid="show-rules-button"
          >
            <HelpCircle className="mr-2 h-4 w-4" />
            How to Play
          </Button>
        </div>
      </div>

      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
