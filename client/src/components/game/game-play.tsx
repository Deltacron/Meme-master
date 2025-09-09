import { useState, useEffect } from "react";
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
  const [availablePhotoCards, setAvailablePhotoCards] = useState<PhotoCard[]>([]);

  const currentPlayer = gameState.players.find(p => p.id === currentPlayerId);
  const isJudge = gameState.room.currentJudgeId === currentPlayerId;
  const judgePlayer = gameState.players.find(p => p.id === gameState.room.currentJudgeId);
  
  const playerHand: CaptionCard[] = currentPlayer ? JSON.parse(currentPlayer.hand as string) : [];
  const selectedPhotoCard: PhotoCard | null = gameState.room.selectedPhotoCard 
    ? JSON.parse(gameState.room.selectedPhotoCard as string) 
    : null;
  const submittedCards = JSON.parse(gameState.room.submittedCards as string);
  
  // Fetch available photo cards for judge
  useEffect(() => {
    if (isJudge && !selectedPhotoCard) {
      fetchPhotoCards();
    }
  }, [isJudge, selectedPhotoCard]);

  const fetchPhotoCards = async () => {
    try {
      const response = await fetch('/api/cards/photo');
      if (response.ok) {
        const cards = await response.json();
        // Get 6 random photo cards for selection
        const shuffled = cards.sort(() => 0.5 - Math.random());
        const selectedCards = shuffled.slice(0, 6).map((card: any) => ({
          id: card.id,
          imageUrl: card.imageUrl,
          description: card.description
        }));
        setAvailablePhotoCards(selectedCards);
      }
    } catch (error) {
      console.error('Failed to fetch photo cards:', error);
    }
  };

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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl">
                    {availablePhotoCards.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => onSelectPhotoCard(card.id)}
                        className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                        data-testid={`photo-card-option-${card.id}`}
                      >
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 shadow-2xl border border-slate-700 hover:border-blue-400 transition-all duration-300">
                          <div className="relative overflow-hidden rounded-xl mb-3">
                            <img 
                              src={card.imageUrl} 
                              alt={card.description}
                              className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <p className="text-sm text-slate-300 font-medium text-center leading-tight">{card.description}</p>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Photo Card (visible to all players) */}
              {selectedPhotoCard && (
                <div data-testid="selected-photo-card" className="relative">
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-2xl border border-slate-700 max-w-lg mx-auto">
                    <div className="relative overflow-hidden rounded-xl mb-4">
                      <img 
                        src={selectedPhotoCard.imageUrl} 
                        alt={selectedPhotoCard.description}
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                    <p className="text-white font-medium text-center text-lg leading-relaxed">
                      {selectedPhotoCard.description}
                    </p>
                    <div className="mt-3 text-center">
                      <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Photo Card</span>
                    </div>
                  </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        "relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2",
                        currentPlayer?.hasSubmittedCard && "opacity-50 cursor-not-allowed"
                      )}
                      data-testid={`caption-card-${card.id}`}
                    >
                      <div className={cn(
                        "bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-2xl border-2 transition-all duration-300 min-h-[160px] flex flex-col justify-between",
                        selectedCardId === card.id ? "border-green-400 bg-gradient-to-br from-green-900/20 to-slate-800" : "border-slate-700 hover:border-blue-400",
                        exchangeCardId === card.id && "border-orange-400 bg-gradient-to-br from-orange-900/20 to-slate-800"
                      )}>
                        <div className="flex-1 flex items-center justify-center">
                          <p className="text-white font-medium text-center leading-relaxed">{card.text}</p>
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Caption Card</div>
                          <div className="flex items-center space-x-2">
                            {selectedCardId === card.id && (
                              <div className="flex items-center space-x-1 text-green-400">
                                <Check className="h-4 w-4" data-testid="card-selected-icon" />
                                <span className="text-xs font-medium">Selected</span>
                              </div>
                            )}
                            {exchangeCardId === card.id && (
                              <div className="flex items-center space-x-1 text-orange-400">
                                <RotateCcw className="h-4 w-4" data-testid="card-exchange-icon" />
                                <span className="text-xs font-medium">Exchange</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
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
                
                <div className="space-y-4">
                  {submittedCards.map((card: any, index: number) => (
                    <div
                      key={index}
                      onClick={() => onSelectWinner(card.playerId)}
                      className="relative group cursor-pointer transform transition-all duration-300 hover:scale-102"
                      data-testid={`submitted-card-${index}`}
                    >
                      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 shadow-xl border border-slate-700 hover:border-yellow-400 transition-all duration-300">
                        <p className="text-white font-medium leading-relaxed mb-3">{card.text}</p>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-slate-400 font-mono uppercase tracking-wider">Anonymous Submission</div>
                          <div className="text-xs text-yellow-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Click to select winner
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
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
