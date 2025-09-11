import { useEffect, useState } from "react";
import { type Player } from "@shared/schema";
import { Trophy, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface WinnerAnnouncementProps {
  winner: Player;
  winningCaption: string;
  onComplete: () => void;
}

export function WinnerAnnouncement({ winner, winningCaption, onComplete }: WinnerAnnouncementProps) {
  const [stage, setStage] = useState(0); // 0: fade in, 1: display, 2: fade out

  useEffect(() => {
    const timer1 = setTimeout(() => setStage(1), 500);
    const timer2 = setTimeout(() => setStage(2), 4500);
    const timer3 = setTimeout(() => onComplete(), 5000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-500",
        stage === 0 && "opacity-0 scale-95",
        stage === 1 && "opacity-100 scale-100",
        stage === 2 && "opacity-0 scale-105"
      )}
    >
      <div className="relative max-w-2xl mx-4 text-center">
        {/* Floating sparkles */}
        <div className="absolute -top-10 -left-10 animate-bounce">
          <Sparkles className="w-8 h-8 text-yellow-400" />
        </div>
        <div className="absolute -top-5 -right-8 animate-bounce delay-300">
          <Sparkles className="w-6 h-6 text-blue-400" />
        </div>
        <div className="absolute -bottom-8 left-5 animate-bounce delay-700">
          <Sparkles className="w-7 h-7 text-green-400" />
        </div>
        
        {/* Main announcement card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-3xl p-8 shadow-2xl border border-amber-200 dark:border-amber-700">
          {/* Winner badge */}
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full font-bold text-xl shadow-lg mb-6 animate-pulse">
            <Crown className="w-8 h-8" />
            <span>🏆 ROUND WINNER! 🏆</span>
            <Crown className="w-8 h-8" />
          </div>

          {/* Winner name */}
          <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 bg-clip-text text-transparent mb-6 animate-bounce">
            {winner.name}
          </h2>

                     {/* Trophy count with celebration */}
           <div className="flex items-center justify-center space-x-3 mb-6 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-2xl p-4">
             <div className="flex items-center space-x-2">
               <Trophy className="w-10 h-10 text-yellow-500 animate-bounce" />
               <span className="text-4xl font-bold text-gray-700 dark:text-gray-200">
                 {winner.trophies + 1}
               </span>
               <span className="text-xl text-gray-600 dark:text-gray-400">
                 {(winner.trophies + 1) === 1 ? 'Trophy' : 'Trophies'}
               </span>
             </div>
             {(winner.trophies + 1) >= 3 && (
               <div className="text-2xl animate-bounce delay-300">🔥</div>
             )}
           </div>

          {/* Winning caption */}
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-lg border-2 border-yellow-300 dark:border-yellow-600">
            <div className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold mb-2">WINNING CAPTION:</div>
            <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 italic leading-relaxed">
              "{winningCaption}"
            </p>
          </div>

          {/* Celebration text with countdown */}
          <div className="mt-6 text-xl text-gray-600 dark:text-gray-400 animate-bounce">
            🎉 Next round starting soon... 🎉
          </div>
        </div>
      </div>
    </div>
  );
}