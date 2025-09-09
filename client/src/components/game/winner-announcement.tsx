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
    const timer2 = setTimeout(() => setStage(2), 3500);
    const timer3 = setTimeout(() => onComplete(), 4000);

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
          <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg mb-6 animate-pulse">
            <Crown className="w-6 h-6" />
            <span>Round Winner!</span>
            <Crown className="w-6 h-6" />
          </div>

          {/* Winner name */}
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            {winner.name}
          </h2>

          {/* Trophy count */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <span className="text-3xl font-bold text-gray-700 dark:text-gray-200">
              {winner.trophies}
            </span>
            <span className="text-xl text-gray-600 dark:text-gray-400">
              {winner.trophies === 1 ? 'Trophy' : 'Trophies'}
            </span>
          </div>

          {/* Winning caption */}
          <div className="bg-white/80 dark:bg-gray-800/80 rounded-2xl p-6 shadow-inner">
            <p className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-200 italic leading-relaxed">
              "{winningCaption}"
            </p>
          </div>

          {/* Celebration text */}
          <div className="mt-6 text-lg text-gray-600 dark:text-gray-400 animate-bounce">
            🎉 Congratulations! 🎉
          </div>
        </div>
      </div>
    </div>
  );
}