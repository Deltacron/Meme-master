import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { type Player, type GameState } from "@shared/schema";
import { Clock, User, Trophy, Camera, FileText, Crown, ChevronLeft, ChevronRight, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import judgeIconMain from "../../assests/icons/judge-icon.svg";

interface ActivityEvent {
  id: string;
  type: 'judge_selecting' | 'photo_selected' | 'caption_submitted' | 'winner_selected' | 'round_started' | 'player_joined';
  message: string;
  playerName?: string;
  timestamp: Date;
  icon: React.ReactNode;
  color: string;
}

interface ActivityFeedProps {
  gameState: GameState;
  currentPlayerId: string;
  isVisible: boolean;
  onToggle: () => void;
}

export function ActivityFeed({ gameState, currentPlayerId, isVisible, onToggle }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [lastGameState, setLastGameState] = useState<GameState | null>(null);

  const judgePlayer = gameState.players.find(p => p.id === gameState.room.currentJudgeId);
  const selectedPhotoCard = gameState.room.selectedPhotoCard 
    ? JSON.parse(gameState.room.selectedPhotoCard as string) 
    : null;
  const submittedCards = JSON.parse(gameState.room.submittedCards as string);
  const allPlayersSubmitted = gameState.players.filter(p => p.id !== gameState.room.currentJudgeId).length === submittedCards.length;

  // Generate activity events based on game state changes
  useEffect(() => {
    if (!lastGameState) {
      // Initialize with current state
      const initialActivities: ActivityEvent[] = [];
      
      // Round started
      initialActivities.push({
        id: `round-${gameState.room.currentRound}`,
        type: 'round_started',
        message: `Round ${gameState.room.currentRound} started`,
        timestamp: new Date(),
        icon: <Crown className="w-4 h-4" />,
        color: "text-purple-600"
      });

      // Judge selection phase
      if (judgePlayer && !selectedPhotoCard) {
        initialActivities.push({
          id: `judge-selecting-${gameState.room.currentRound}`,
          type: 'judge_selecting',
          message: `${judgePlayer.name} is selecting a photo card...`,
          playerName: judgePlayer.name,
          timestamp: new Date(),
          icon: <img src={judgeIconMain} alt="Judge" className="w-4 h-4" />,
          color: "text-amber-600"
        });
      }

      setActivities(initialActivities);
      setLastGameState(gameState);
      return;
    }

    const newActivities: ActivityEvent[] = [];

    // Check for photo card selection
    if (!lastGameState.room.selectedPhotoCard && gameState.room.selectedPhotoCard) {
      newActivities.push({
        id: `photo-selected-${gameState.room.currentRound}-${Date.now()}`,
        type: 'photo_selected',
        message: `${judgePlayer?.name} selected a photo card`,
        playerName: judgePlayer?.name,
        timestamp: new Date(),
        icon: <Camera className="w-4 h-4" />,
        color: "text-blue-600"
      });
    }

    // Check for new caption submissions
    const lastSubmittedCount = JSON.parse(lastGameState.room.submittedCards as string).length;
    const currentSubmittedCount = submittedCards.length;
    
    if (currentSubmittedCount > lastSubmittedCount) {
      const newSubmissions = currentSubmittedCount - lastSubmittedCount;
      for (let i = 0; i < newSubmissions; i++) {
        newActivities.push({
          id: `caption-submitted-${gameState.room.currentRound}-${Date.now()}-${i}`,
          type: 'caption_submitted',
          message: `A player submitted their caption`,
          timestamp: new Date(),
          icon: <FileText className="w-4 h-4" />,
          color: "text-green-600"
        });
      }
    }

    // Check for round completion (winner selected)
    if (lastGameState.room.currentRound < gameState.room.currentRound) {
      // New round started
      newActivities.push({
        id: `round-${gameState.room.currentRound}`,
        type: 'round_started',
        message: `Round ${gameState.room.currentRound} started`,
        timestamp: new Date(),
        icon: <Crown className="w-4 h-4" />,
        color: "text-purple-600"
      });

      // Judge selection for new round
      if (judgePlayer) {
        newActivities.push({
          id: `judge-selecting-${gameState.room.currentRound}`,
          type: 'judge_selecting',
          message: `${judgePlayer.name} is selecting a photo card...`,
          playerName: judgePlayer.name,
          timestamp: new Date(),
          icon: <img src={judgeIconMain} alt="Judge" className="w-4 h-4" />,
          color: "text-amber-600"
        });
      }
    }

    if (newActivities.length > 0) {
      setActivities(prev => [...newActivities, ...prev].slice(0, 20)); // Keep only last 20 activities
    }

    setLastGameState(gameState);
  }, [gameState, lastGameState, judgePlayer, selectedPhotoCard, submittedCards]);

  // Current phase detection
  const getCurrentPhase = () => {
    if (!selectedPhotoCard) {
      return {
        phase: "Photo Selection",
        message: `${judgePlayer?.name} is choosing the perfect photo card`,
        icon: <img src={judgeIconMain} alt="Judge" className="w-4 h-4" />,
        color: "text-amber-600"
      };
    } else if (!allPlayersSubmitted) {
      const remainingPlayers = gameState.players.filter(p => p.id !== gameState.room.currentJudgeId).length - submittedCards.length;
      return {
        phase: "Caption Submission",
        message: `Waiting for ${remainingPlayers} more caption${remainingPlayers !== 1 ? 's' : ''}`,
        icon: <FileText className="w-4 h-4" />,
        color: "text-blue-600"
      };
    } else {
      return {
        phase: "Winner Selection",
        message: `${judgePlayer?.name} is choosing the winner`,
        icon: <Trophy className="w-4 h-4" />,
        color: "text-green-600"
      };
    }
  };

  const currentPhase = getCurrentPhase();

  return (
    <>
            {/* Aesthetic Desktop Sidebar - Lobby Style */}
      <div className={cn(
        "hidden lg:block fixed left-4 top-[120px] h-[calc(100vh-140px)] w-96 z-50 transition-transform duration-300 rounded-3xl ",
        isVisible ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Epic Animated Background - Same as Main */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl" />
          
          {/* Floating Gaming Elements */}
         
        </div>

        <div className="relative z-10 p-6 h-full flex flex-col">
          {/* Epic Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <h2 className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
                  🎮 Live Activity
                </h2>
                <div className="absolute -top-2 -right-6 animate-spin-slow">
                  <Crown className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="p-2 text-white hover:bg-white/20 rounded-xl"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Round Badge */}
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-md opacity-30 animate-pulse" />
              <div className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-2xl px-4 py-2 shadow-xl">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">R{gameState.room.currentRound}</span>
                  </div>
                  <span className="font-bold text-gray-700">Round {gameState.room.currentRound}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Phase Card - Lobby Style */}
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-3xl blur-xl opacity-30" />
            <div className="relative bg-white/90 backdrop-blur-sm border-2 border-white/30 rounded-3xl p-4 shadow-2xl">
              <div className="flex items-center space-x-3">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg", 
                  !selectedPhotoCard ? "bg-gradient-to-r from-amber-500 to-orange-500" : 
                  !allPlayersSubmitted ? "bg-gradient-to-r from-blue-500 to-cyan-500" : 
                  "bg-gradient-to-r from-green-500 to-emerald-500"
                )}>
                  {currentPhase.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{currentPhase.phase}</h3>
                  <p className="text-sm text-gray-600">{currentPhase.message}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Photo Card or Activity Feed */}
          <div className="flex-1 overflow-hidden">
            {selectedPhotoCard ? (
              <>
                <h3 className="font-bold text-white mb-4 text-lg">🖼️ Selected Photo</h3>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-md opacity-30 animate-pulse" />
                  <div className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-3xl p-4 shadow-2xl">
                    <div className="relative overflow-hidden rounded-2xl mb-4">
                      <img 
                        src={selectedPhotoCard.imageUrl} 
                        alt={selectedPhotoCard.description}
                        className="w-full h-48 object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-2xl" />
                    </div>
                    <div className="text-center">
                      <p className="text-gray-900 font-bold text-lg mb-2">
                        {selectedPhotoCard.description}
                      </p>
                      <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <Camera className="w-4 h-4" />
                        <span className="text-sm font-medium">Write your funniest caption!</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
               ""
              </>
            )}
          </div>
        </div>
      </div>

      {/* Aesthetic Toggle Button */}
      <div className={cn(
        "hidden lg:block fixed top-[calc(50%+60px)] -translate-y-1/2 z-50 transition-all duration-300",
        isVisible ? "left-[400px]" : "left-4"
      )}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 to-pink-500/50 rounded-2xl blur-md opacity-40 animate-pulse" />
          <Button
            onClick={onToggle}
            className="relative bg-purple-800/90 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-3 shadow-2xl transform hover:scale-110 transition-all duration-300 text-white hover:text-purple-200 hover:bg-purple-700/90"
          >
            {isVisible ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile - Simple Activity Status */}
      <div className="lg:hidden">
        <Card className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-lg">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={cn("p-1.5 rounded-full bg-white shadow-sm", currentPhase.color)}>
                  {currentPhase.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-xs">{currentPhase.phase}</h3>
                  <p className="text-xs text-gray-600">{currentPhase.message}</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Recent Activity: {activities.length} events
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
} 