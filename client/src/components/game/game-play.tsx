import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Player, type GameState, type CaptionCard, type PhotoCard } from "@shared/schema";
import { Trophy, Gavel, NotebookPen, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface GamePlayProps {
  gameState: GameState;
  currentPlayerId: string;
  onSelectPhotoCard: (cardId: string) => void;
  onSubmitCaptionCard: (cardId: string) => void;
  onExchangeCard: (cardId: string) => void;
  onSelectWinner: (winnerId: string) => void;
}

export function GamePlay({
  gameState,
  currentPlayerId,
  onSelectPhotoCard,
  onSubmitCaptionCard,
  onExchangeCard,
  onSelectWinner
}: GamePlayProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [exchangeCardId, setExchangeCardId] = useState<string | null>(null);

  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const isJudge = gameState.room.currentJudgeId === currentPlayerId;
  const judgePlayer = gameState.players.find(p => p.id === gameState.room.currentJudgeId);
  
  const playerHand: CaptionCard[] = currentPlayer ? JSON.parse(currentPlayer.hand as string) : [];
  const selectedPhotoCard: PhotoCard | null = gameState.room.selectedPhotoCard 
    ? JSON.parse(gameState.room.selectedPhotoCard as string) 
    : null;
  const submittedCards = JSON.parse(gameState.room.submittedCards as string);
  
  // Sample photo cards for judge selection
  const samplePhotoCards: PhotoCard[] = [
    {
      id: "1",
      imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      description: "Cool cat with sunglasses"
    },
    {
      id: "2", 
      imageUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      description: "Surprised looking dog"
    },
    {
      id: "3",
      imageUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300", 
      description: "Confused looking dog"
    }
  ];

  const handleCardSelection = (cardId: string) => {
    setSelectedCardId(selectedCardId === cardId ? null : cardId);
  };

  const handleExchangeSelection = (cardId: string) => {
    setExchangeCardId(exchangeCardId === cardId ? null : cardId);
  };

  const handleSubmitCard = () => {
    if (selectedCardId) {
      onSubmitCaptionCard(selectedCardId);
      setSelectedCardId(null);
    }
  };

  const handleExchangeCard = () => {
    if (exchangeCardId && currentPlayer && !currentPlayer.hasExchangedCard) {
      onExchangeCard(exchangeCardId);
      setExchangeCardId(null);
    }
  };

  const allPlayersSubmitted = gameState.players
    .filter(p => p.id !== gameState.room.currentJudgeId)
    .every(p => p.hasSubmittedCard);

  return (
    <>
      {/* Top Navigation */}
      <div className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-foreground">
                Round <span data-testid="current-round">{gameState.room.currentRound}</span>
              </h1>
              <div className="flex items-center space-x-4">
                <span className="text-muted-foreground">Judge:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    <span data-testid="judge-initials">
                      {judgePlayer?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-semibold text-foreground" data-testid="judge-name">
                    {judgePlayer?.name}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Scoreboard */}
            <div className="flex items-center space-x-4">
              {gameState.players.map((player) => (
                <div key={player.id} className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground" data-testid={`player-name-${player.id}`}>
                    {player.name}
                  </span>
                  <div className="flex items-center text-secondary">
                    <Trophy className="trophy-icon h-4 w-4 mr-1" />
                    <span className="font-semibold" data-testid={`player-trophies-${player.id}`}>
                      {player.trophies}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Photo Card Display */}
        <div className="text-center mb-8">
          <Card className="inline-block p-8 shadow-lg">
            <CardContent className="p-0">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Photo Card</h2>
              
              {/* Judge selects photo (only visible to judge) */}
              {isJudge && !selectedPhotoCard && (
                <div data-testid="photo-selection">
                  <p className="text-muted-foreground mb-4">Choose a photo card for this round:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl">
                    {samplePhotoCards.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => onSelectPhotoCard(card.id)}
                        className="game-card rounded-xl p-4 cursor-pointer hover:scale-105 transition-all"
                        data-testid={`photo-card-option-${card.id}`}
                      >
                        <img 
                          src={card.imageUrl} 
                          alt={card.description}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                        <p className="text-xs text-white/80">{card.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Photo Card (visible to all players) */}
              {selectedPhotoCard && (
                <div data-testid="selected-photo-card">
                  <img 
                    src={selectedPhotoCard.imageUrl} 
                    alt={selectedPhotoCard.description}
                    className="rounded-xl shadow-lg max-w-md mx-auto"
                  />
                  <p className="text-lg text-muted-foreground mt-4">
                    {selectedPhotoCard.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Game Phase Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Player Hand */}
          {!isJudge && selectedPhotoCard && (
            <div className="lg:col-span-2">
              <Card className="p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-foreground">Your Caption Cards</h3>
                  <div className="text-sm text-muted-foreground">
                    <span data-testid="hand-count">{playerHand.length}</span> cards
                  </div>
                </div>

                {/* Card Exchange Option */}
                {currentPlayer && !currentPlayer.hasExchangedCard && (
                  <div className="mb-6 bg-muted rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">Card Exchange</h4>
                        <p className="text-sm text-muted-foreground">
                          Trade one card for a new one (once per round)
                        </p>
                      </div>
                      <Button
                        onClick={handleExchangeCard}
                        disabled={!exchangeCardId}
                        className="bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
                        data-testid="exchange-card-button"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Exchange
                      </Button>
                    </div>
                    {exchangeCardId && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Click a card below to exchange it
                      </p>
                    )}
                  </div>
                )}

                {/* Caption Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {playerHand.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => {
                        if (!currentPlayer?.hasSubmittedCard) {
                          if (currentPlayer && !currentPlayer.hasExchangedCard) {
                            // Allow selection for exchange or submission
                            if (exchangeCardId) {
                              handleExchangeSelection(card.id);
                            } else {
                              handleCardSelection(card.id);
                            }
                          } else {
                            handleCardSelection(card.id);
                          }
                        }
                      }}
                      className={cn(
                        "game-card rounded-xl p-4 cursor-pointer transition-all hover:scale-105",
                        selectedCardId === card.id && "selected",
                        exchangeCardId === card.id && "border-accent",
                        currentPlayer?.hasSubmittedCard && "opacity-50 cursor-not-allowed"
                      )}
                      data-testid={`caption-card-${card.id}`}
                    >
                      <p className="text-white font-medium">{card.text}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs text-white/60">Caption Card</span>
                        {selectedCardId === card.id && (
                          <Check className="h-4 w-4 text-green-400" data-testid="card-selected-icon" />
                        )}
                        {exchangeCardId === card.id && (
                          <RotateCcw className="h-4 w-4 text-accent" data-testid="card-exchange-icon" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                {!currentPlayer?.hasSubmittedCard && (
                  <div className="mt-6 text-center">
                    <Button
                      onClick={handleSubmitCard}
                      disabled={!selectedCardId}
                      className="bg-primary text-primary-foreground px-8 py-3 hover:bg-primary/90 disabled:opacity-50"
                      data-testid="submit-caption-button"
                    >
                      <NotebookPen className="mr-2 h-4 w-4" />
                      Submit Caption
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Game Status & Judge Review */}
          <div className="space-y-6">
            {/* Round Status */}
            <Card className="p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-4">Round Status</h3>
              <div className="space-y-3">
                {gameState.players
                  .filter(p => p.id !== gameState.room.currentJudgeId)
                  .map((player) => (
                    <div key={player.id} className="flex items-center justify-between">
                      <span className="text-sm text-foreground" data-testid={`player-status-${player.id}`}>
                        {player.name}
                      </span>
                      <div data-testid={`submission-status-${player.id}`}>
                        {player.hasSubmittedCard ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-muted rounded-full" />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            {/* Judge Review Phase */}
            {isJudge && allPlayersSubmitted && (
              <Card className="p-6 shadow-lg" data-testid="judge-review">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  <Gavel className="inline mr-2 h-5 w-5" />
                  Judge's Decision
                </h3>
                
                <div className="space-y-3">
                  {submittedCards.map((card: any, index: number) => (
                    <div
                      key={index}
                      onClick={() => onSelectWinner(card.playerId)}
                      className="bg-muted rounded-lg p-4 cursor-pointer hover:bg-accent/10 transition-all"
                      data-testid={`submitted-card-${index}`}
                    >
                      <p className="text-foreground font-medium">{card.text}</p>
                      <div className="mt-2 text-xs text-muted-foreground">Anonymous submission</div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
