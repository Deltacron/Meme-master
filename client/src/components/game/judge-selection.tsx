import { Button } from "@/components/ui/button";
import { type Player } from "@shared/schema";
import { Eye, Crown, Sparkles } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900">
      {/* Material Design Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 shadow-2xl">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center text-white">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
              <h1 className="text-5xl font-bold drop-shadow-lg">Who Goes First?</h1>
              <Sparkles className="w-8 h-8 text-amber-300 animate-pulse" />
            </div>
            <p className="text-2xl text-blue-100 font-medium max-w-2xl mx-auto leading-relaxed">
              Everyone gets a number card. Lowest number becomes the first Judge!
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">

        {/* Material Design Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {players.map((player, index) => (
            <div key={player.id} className="text-center">
              {/* Player Header */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-6 shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    index === 0 ? "bg-gradient-to-r from-amber-400 to-orange-500" :
                    index === 1 ? "bg-gradient-to-r from-blue-400 to-indigo-500" :
                    index === 2 ? "bg-gradient-to-r from-green-400 to-emerald-500" :
                    "bg-gradient-to-r from-purple-400 to-pink-500"
                  )} />
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white" data-testid={`player-name-${player.id}`}>
                    {player.name}
                  </h3>
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    index === 0 ? "bg-gradient-to-r from-amber-400 to-orange-500" :
                    index === 1 ? "bg-gradient-to-r from-blue-400 to-indigo-500" :
                    index === 2 ? "bg-gradient-to-r from-green-400 to-emerald-500" :
                    "bg-gradient-to-r from-purple-400 to-pink-500"
                  )} />
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {hasRevealed && player.id === currentPlayerId ? "Card Revealed!" : "Waiting..."}
                </div>
              </div>
              
              {/* Enhanced Card Flip Animation */}
              <div className={cn(
                "card-flip mx-auto w-40 h-56 drop-shadow-2xl",
                player.numberCard !== null && "flipped"
              )}>
                <div className="card-flip-inner relative w-full h-full">
                  {/* Card Back - Material Design */}
                  <div className="card-flip-front absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-2xl border border-slate-600 shadow-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl text-slate-400 mb-2">?</div>
                      <div className="text-sm text-slate-400 font-mono uppercase tracking-wider">Mystery Card</div>
                    </div>
                  </div>
                  {/* Card Front - Material Design */}
                  <div className="card-flip-back absolute inset-0 bg-gradient-to-br from-white to-slate-100 dark:from-slate-100 dark:to-white rounded-2xl border-2 border-blue-500 shadow-2xl flex items-center justify-center">
                    <div className="text-center">
                      <span className="text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent drop-shadow-lg" data-testid={`number-card-${player.id}`}>
                        {player.numberCard}
                      </span>
                      <div className="text-sm text-slate-600 font-mono uppercase tracking-wider mt-2">Number Card</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Material Design Reveal Button */}
        {!allRevealed && !hasRevealed && (
          <div className="text-center mb-12">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md mx-auto">
              <div className="mb-6">
                <Eye className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-bounce" />
                <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
                  Ready to reveal your number?
                </p>
              </div>
              <Button
                onClick={onRevealCard}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-12 py-4 text-xl font-bold rounded-2xl shadow-xl transform transition-all duration-200 hover:scale-105 hover:shadow-2xl"
                data-testid="reveal-card-button"
              >
                <Eye className="mr-3 h-6 w-6" />
                Reveal My Card
              </Button>
            </div>
          </div>
        )}

        {/* Material Design Judge Announcement */}
        {allRevealed && judgePlayer && (
          <div className="relative" data-testid="judge-announcement">
            {/* Celebration Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-amber-900/30 rounded-3xl animate-pulse" />
            
            {/* Main Announcement Card */}
            <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-12 text-center shadow-2xl border border-amber-200 dark:border-amber-700">
              {/* Floating Crown Animation */}
              <div className="relative mb-8">
                <Crown className="w-20 h-20 text-amber-500 mx-auto animate-bounce drop-shadow-lg" />
                <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping" />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 rounded-full animate-ping delay-300" />
              </div>
              
              {/* Winner Announcement */}
              <div className="mb-8">
                <h2 className="text-5xl font-bold bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 bg-clip-text text-transparent mb-4 drop-shadow-sm">
                  {judgePlayer.name}
                </h2>
                <div className="text-3xl font-bold text-slate-700 dark:text-slate-200 mb-2">
                  is the First Judge!
                </div>
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-2xl font-bold text-lg shadow-lg">
                  <span>Lowest Number:</span>
                  <span className="text-2xl">{judgePlayer.numberCard}</span>
                </div>
              </div>
              
              {/* Celebration Elements */}
              <div className="flex items-center justify-center space-x-4 mb-8 text-4xl">
                <span className="animate-bounce">🎉</span>
                <span className="animate-bounce delay-100">👑</span>
                <span className="animate-bounce delay-200">🎉</span>
              </div>
              
              {/* Start Button */}
              <Button
                onClick={onStartRound}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-12 py-6 text-2xl font-bold rounded-2xl shadow-2xl transform transition-all duration-200 hover:scale-105 hover:shadow-3xl"
                data-testid="start-round-button"
              >
                <Crown className="mr-4 h-8 w-8" />
                Start Round 1
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
