import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, Play, Lightbulb, Trophy } from "lucide-react";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="rules-modal">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-foreground">
            How to Play Meme Masters
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Setup */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <Settings className="text-primary mr-3 h-5 w-5" />
              Setup
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• 3+ players needed to start</li>
              <li>• Everyone gets a number card</li>
              <li>• Lowest number becomes first Judge</li>
              <li>• Players get 4 cards (3 players) or 7 cards (4+ players)</li>
            </ul>
          </div>

          {/* Gameplay */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <Play className="text-accent mr-3 h-5 w-5" />
              Gameplay
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Judge picks a photo card</li>
              <li>• Players submit funny caption cards</li>
              <li>• Judge chooses the funniest caption</li>
              <li>• Winner gets the photo as a trophy</li>
            </ul>
          </div>

          {/* Strategy */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <Lightbulb className="text-secondary mr-3 h-5 w-5" />
              Strategy Tips
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Exchange 1 card per round for better options</li>
              <li>• Know your judge's sense of humor</li>
              <li>• Sometimes absurd beats clever</li>
              <li>• Judge role rotates clockwise</li>
            </ul>
          </div>

          {/* Winning */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center">
              <Trophy className="text-secondary mr-3 h-5 w-5" />
              Winning
            </h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• First to 5 trophies wins!</li>
              <li>• Hands refill after each round</li>
              <li>• Game can go for many rounds</li>
              <li>• May the funniest player win!</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button 
            onClick={onClose} 
            className="bg-primary text-primary-foreground px-8 py-3 hover:bg-primary/90"
            data-testid="rules-got-it-button"
          >
            Got It!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
