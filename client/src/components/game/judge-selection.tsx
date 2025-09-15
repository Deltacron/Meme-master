import { Button } from "@/components/ui/button";
import { type Player } from "@shared/schema";
import { Eye, Crown, Sparkles, Users, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface JudgeSelectionProps {
  players: Player[];
  currentPlayerId: string;
  onRevealCard: () => void;
  onStartRound: () => void;
  allRevealed: boolean;
  judgePlayer: Player | null;
}

export function JudgeSelection({ 
  players, 
  currentPlayerId, 
  onRevealCard, 
  onStartRound, 
  allRevealed, 
  judgePlayer 
}: JudgeSelectionProps) {
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const hasRevealed = currentPlayer?.numberCard !== null;
  const revealedCount = players.filter(p => p.numberCard !== null).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      {/* Enhanced Header with Progress */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-2xl">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Crown className="w-10 h-10 text-amber-300 " />
              <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">Judge Selection</h1>
              <Crown className="w-10 h-10 text-amber-300 " />
            </div>
            <p className="text-lg md:text-xl text-blue-100 font-medium max-w-2xl mx-auto leading-relaxed mb-6">
              Click your mystery card to reveal your number. Lowest number becomes the Judge!
            </p>
            
            {/* Progress Indicator */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <Users className="w-5 h-5 text-amber-300" />
                <span className="text-lg font-semibold">
                  {revealedCount} / {players.length} Cards Revealed
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 h-3 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(revealedCount / players.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">

        {/* Enhanced Cards Grid */}
        <div className="flex flex-wrap justify-center gap-6 mb-8" style={{ alignItems: 'flex-end' }}>
          {players.map((player, index) => {
            const isCurrentPlayer = player.id === currentPlayerId;
            const hasPlayerRevealed = player.numberCard !== null;
            const colorClasses = [
              "from-amber-400 to-orange-500",
              "from-blue-400 to-indigo-500", 
              "from-green-400 to-emerald-500",
              "from-purple-400 to-pink-500",
              "from-red-400 to-rose-500",
              "from-cyan-400 to-teal-500"
            ];
            const playerColor = colorClasses[index % colorClasses.length];

                                      return (
               <div key={player.id} className="text-center w-48 flex-shrink-0">
                 {/* Enhanced Player Header - Fixed Height */}
                 <div className={cn(
                   "bg-white dark:bg-slate-800 rounded-2xl p-4 mb-4 shadow-xl border-2 transition-all duration-300 h-24 flex flex-col justify-center",
                   hasPlayerRevealed 
                     ? "border-green-400 bg-green-50 dark:bg-green-900/20" 
                     : isCurrentPlayer 
                       ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 animate-pulse" 
                       : "border-slate-200 dark:border-slate-700"
                 )}>
                   <div className="flex items-center justify-center space-x-2 mb-1">
                     <div className={cn("w-4 h-4 rounded-full bg-gradient-to-r", playerColor)} />
                     <h3 className={cn(
                       "text-sm font-bold transition-colors text-center leading-tight",
                       isCurrentPlayer ? "text-blue-600 dark:text-blue-400" : "text-slate-800 dark:text-white"
                     )} data-testid={`player-name-${player.id}`}>
                       {player.name}
                       {isCurrentPlayer && " (You)"}
                     </h3>
                     <div className={cn("w-4 h-4 rounded-full bg-gradient-to-r", playerColor)} />
                   </div>
                   
                   {/* Status Indicator */}
                   <div className="flex items-center justify-center space-x-2">
                     <div className={cn(
                       "w-2 h-2 rounded-full transition-all duration-300",
                       hasPlayerRevealed ? "bg-green-500 animate-pulse" : "bg-gray-400"
                     )} />
                     <span className={cn(
                       "text-xs font-medium transition-colors",
                       hasPlayerRevealed ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400"
                     )}>
                       {hasPlayerRevealed ? "Revealed!" : isCurrentPlayer && !hasRevealed ? "Click to reveal" : "Waiting..."}
                     </span>
                   </div>
                 </div>
                 
                 {/* Interactive Card */}
                 <div 
                   className={cn(
                     "card-flip mx-auto w-36 h-48 drop-shadow-2xl cursor-pointer transition-transform duration-200",
                     hasPlayerRevealed && "flipped",
                     isCurrentPlayer && !hasRevealed && "hover:scale-105 animate-pulse",
                     !isCurrentPlayer && "cursor-default"
                   )}
                   onClick={isCurrentPlayer && !hasRevealed ? onRevealCard : undefined}
                   style={isCurrentPlayer && !hasRevealed ? {
                     animation: 'bounce 2s infinite'
                   } : undefined}
                 >
                  <div className="card-flip-inner relative w-full h-full">
                    {/* Card Back */}
                    <div className={cn(
                      "card-flip-front absolute inset-0 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300",
                      isCurrentPlayer && !hasRevealed 
                        ? "bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 border-2 border-blue-400 hover:shadow-blue-500/50" 
                        : "bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 border border-slate-600"
                    )}>
                      <div className="text-center">
                        <div className={cn(
                          "text-4xl mb-1 transition-all duration-300",
                          isCurrentPlayer && !hasRevealed ? "text-white animate-pulse" : "text-slate-400"
                        )}>
                          {isCurrentPlayer && !hasRevealed ? "🎯" : "?"}
                        </div>
                        <div className={cn(
                          "text-xs font-mono uppercase tracking-wider",
                          isCurrentPlayer && !hasRevealed ? "text-blue-100" : "text-slate-400"
                        )}>
                          {isCurrentPlayer && !hasRevealed ? "Click Me!" : "Mystery"}
                        </div>
                      </div>
                    </div>
                    
                                         {/* Card Front */}
                     <div className="card-flip-back absolute inset-0 bg-gradient-to-br from-white to-slate-100 dark:from-slate-100 dark:to-white rounded-2xl border-2 border-green-500 shadow-2xl flex items-center justify-center">
                       <div className="text-center">
                         <span className="text-7xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent drop-shadow-lg" data-testid={`number-card-${player.id}`}>
                           {player.numberCard}
                         </span>
                         <div className="text-xs text-slate-600 font-mono uppercase tracking-wider mt-2">Revealed</div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             );
           })}
        </div>

        {/* Waiting Status */}
        {!allRevealed && (
          <div className="text-center mb-8">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-2xl mx-auto">
              {hasRevealed ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
                    Waiting for other players to reveal their cards...
                  </p>
                  <Timer className="w-5 h-5 text-slate-500 animate-spin" />
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <Eye className="w-6 h-6 text-blue-500 animate-pulse" />
                  <p className="text-lg text-blue-600 dark:text-blue-400 font-medium">
                    Click your mystery card above to reveal your number!
                  </p>
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enhanced Judge Announcement */}
        {allRevealed && judgePlayer && (
          <div className="relative animate-fadeIn max-w-4xl mx-auto" data-testid="judge-announcement">
            {/* Celebration Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-amber-900/30 rounded-3xl animate-pulse" />
            
            {/* Main Announcement Card */}
            <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl p-6 md:p-8 lg:p-12 text-center shadow-2xl border-2 border-amber-300 dark:border-amber-600">
              {/* Floating Crown Animation */}
              <div className="relative mb-6">
                <Crown className="w-16 h-16 md:w-20 md:h-20 text-amber-500 mx-auto  drop-shadow-lg" />
                <div className="absolute -top-2 -left-2 w-4 h-4 md:w-6 md:h-6 bg-yellow-400 rounded-full animate-ping" />
                <div className="absolute -top-2 -right-2 w-3 h-3 md:w-4 md:h-4 bg-amber-400 rounded-full animate-ping delay-300" />
                <Sparkles className="absolute -bottom-1 -left-3 w-5 h-5 text-yellow-500  delay-500" />
                <Sparkles className="absolute -bottom-1 -right-3 w-5 h-5 text-yellow-500  delay-700" />
              </div>
              
              {/* Winner Announcement */}
              <div className="mb-6">
                <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent mb-3 drop-shadow-sm">
                  🎊 {judgePlayer.name} 🎊
                </h2>
                <div className="text-xl md:text-3xl font-bold text-slate-700 dark:text-slate-200 mb-4">
                  is the First Judge!
                </div>
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-2xl font-bold text-base md:text-lg shadow-lg">
                  <Crown className="w-5 h-5" />
                  <span>Lowest Number:</span>
                  <span className="text-xl md:text-2xl font-black">{judgePlayer.numberCard}</span>
                </div>
              </div>
              
              {/* Celebration Elements */}
              <div className="flex items-center justify-center space-x-2 md:space-x-4 mb-6 text-2xl md:text-4xl">
                <span className="">🎉</span>
                <span className=" ">👑</span>
                <span className=" delay-200">⭐</span>
                <span className=" delay-300">🎊</span>
                <span className=" delay-400">🏆</span>
              </div>
              
              {/* Game Info */}
              <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl p-4 mb-6 max-w-2xl mx-auto">
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-300 font-medium">
                  🎯 The Judge will select a photo card, and everyone else submits their funniest caption!
                </p>
              </div>
              
              {/* Start Button */}
              <Button
                onClick={onStartRound}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 md:px-12 py-4 md:py-6 text-lg md:text-2xl font-bold rounded-2xl shadow-2xl transform transition-all duration-200 hover:scale-105 hover:shadow-3xl"
                data-testid="start-round-button"
              >
                <Crown className="mr-2 md:mr-4 h-6 w-6 md:h-8 md:w-8" />
                Start Round 1
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
