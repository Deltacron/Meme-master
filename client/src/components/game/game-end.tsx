import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Player } from "@shared/schema";
import { Trophy, Plus, RotateCw } from "lucide-react";

interface GameEndProps {
  winner: Player;
  players: Player[];
  totalRounds: number;
  gameTime: string;
  onPlayAgain: () => void;
  onNewRoom: () => void;
}

export function GameEnd({
  winner,
  players,
  totalRounds,
  gameTime,
  onPlayAgain,
  onNewRoom
}: GameEndProps) {
  const sortedPlayers = [...players].sort((a, b) => b.trophies - a.trophies);

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-primary to-accent flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Confetti Animation */}
        <div className="mb-8">
          <div className="text-8xl mb-4">🎉</div>
          <h1 className="text-6xl font-bold text-white mb-4" data-testid="winner-name">
            {winner.name} Wins!
          </h1>
          <p className="text-2xl text-white/90">The Meme Master Champion!</p>
        </div>

        {/* Winner Stats */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl font-bold text-primary">
                <span data-testid="winner-initials">
                  {winner.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-6 text-white">
              <div>
                <div className="text-3xl font-bold flex items-center justify-center">
                  <Trophy className="trophy-icon mr-2 h-8 w-8" />
                  <span data-testid="winner-trophies">{winner.trophies}</span>
                </div>
                <div className="text-sm opacity-80">Trophies</div>
              </div>
              <div>
                <div className="text-3xl font-bold" data-testid="total-rounds">{totalRounds}</div>
                <div className="text-sm opacity-80">Rounds Played</div>
              </div>
              <div>
                <div className="text-3xl font-bold" data-testid="game-time">{gameTime}</div>
                <div className="text-sm opacity-80">Game Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Final Scoreboard */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Final Scores</h3>
            <div className="space-y-3">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between bg-white/10 rounded-lg p-3"
                  data-testid={`final-score-${player.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-bold text-lg">#{index + 1}</span>
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                      <span>{player.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-white font-medium">{player.name}</span>
                  </div>
                  <div className="flex items-center text-white">
                    <Trophy className="trophy-icon mr-2 h-5 w-5" />
                    <span className="font-bold text-lg">{player.trophies}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onPlayAgain}
            className="bg-white text-primary px-8 py-4 text-lg hover:bg-white/90"
            data-testid="play-again-button"
          >
            <RotateCw className="mr-2 h-5 w-5" />
            Play Again
          </Button>
          <Button
            onClick={onNewRoom}
            variant="outline"
            className="bg-primary/20 text-white border-2 border-white/30 px-8 py-4 text-lg hover:bg-white/10"
            data-testid="new-room-button"
          >
            <Plus className="mr-2 h-5 w-5" />
            New Room
          </Button>
        </div>
      </div>
    </div>
  );
}
