import { Button } from "@/components/ui/button";
import { type Player } from "@shared/schema";
import { Eye, Crown } from "lucide-react";
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Who Goes First?</h1>
        <p className="text-xl text-muted-foreground">
          Everyone gets a number card. Lowest number becomes the first Judge!
        </p>
      </div>

      {/* Number Cards Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {players.map((player) => (
          <div key={player.id} className="text-center">
            <h3 className="font-semibold text-foreground mb-4" data-testid={`player-name-${player.id}`}>
              {player.name}
            </h3>
            
            {/* Card Flip Animation */}
            <div className={cn(
              "card-flip mx-auto w-32 h-48",
              player.numberCard !== null && "flipped"
            )}>
              <div className="card-flip-inner relative w-full h-full">
                {/* Card Back */}
                <div className="card-flip-front absolute inset-0 game-card rounded-xl flex items-center justify-center">
                  <div className="text-4xl text-white/50">?</div>
                </div>
                {/* Card Front */}
                <div className="card-flip-back absolute inset-0 bg-card rounded-xl border-2 border-border flex items-center justify-center">
                  <span className="text-6xl font-bold text-foreground" data-testid={`number-card-${player.id}`}>
                    {player.numberCard}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reveal Button */}
      {!allRevealed && !hasRevealed && (
        <div className="text-center mb-8">
          <Button
            onClick={onRevealCard}
            className="bg-primary text-primary-foreground px-8 py-4 text-xl hover:bg-primary/90 pulse-animation"
            data-testid="reveal-card-button"
          >
            <Eye className="mr-3 h-5 w-5" />
            Reveal My Card
          </Button>
        </div>
      )}

      {/* Judge Announcement */}
      {allRevealed && judgePlayer && (
        <div className="bg-secondary rounded-2xl p-8 text-center" data-testid="judge-announcement">
          <h2 className="text-3xl font-bold text-secondary-foreground mb-4">
            <Crown className="inline mr-3 h-8 w-8" />
            {judgePlayer.name} is the First Judge!
          </h2>
          <p className="text-xl text-secondary-foreground/80 mb-6">
            Lowest number: <span className="font-bold">{judgePlayer.numberCard}</span>
          </p>
          <Button
            onClick={onStartRound}
            className="bg-primary text-primary-foreground px-8 py-4 text-xl hover:bg-primary/90"
            data-testid="start-round-button"
          >
            Start Round 1
          </Button>
        </div>
      )}
    </div>
  );
}
