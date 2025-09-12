import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Player, type GameState, type CaptionCard, type PhotoCard } from "@shared/schema";
import { Trophy, Gavel, NotebookPen, RotateCcw, Check, Medal } from "lucide-react";
import { WinnerAnnouncement } from "./winner-announcement";
import { cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/config";

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
  const [showWinner, setShowWinner] = useState<{winner: Player, caption: string} | null>(null);

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

  // Listen for round winner announcements
  useEffect(() => {
    const handleRoundWinnerSelected = (event: any) => {
      const data = event.detail;
      if (data.winner) {
        // Find the winning caption from submitted cards
        const winningCaption = submittedCards.find((card: any) => 
          card.playerId === data.winner.id
        )?.text || "Amazing meme!";
        
        setShowWinner({
          winner: data.winner,
          caption: winningCaption
        });
      }
    };

    // Add event listener to window for custom events
    window.addEventListener('round_winner_selected', handleRoundWinnerSelected);

    return () => {
      window.removeEventListener('round_winner_selected', handleRoundWinnerSelected);
    };
  }, [submittedCards]);

  const fetchPhotoCards = async () => {
    try {
      const response = await fetch(getApiUrl('/api/cards/photo'));
      if (response.ok) {
        const cards = await response.json();
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
      {showWinner && (
        <WinnerAnnouncement
          winner={showWinner.winner}
          winningCaption={showWinner.caption}
          onComplete={() => setShowWinner(null)}
        />
      )}
      
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
                <h1 className="text-2xl font-bold text-white">
                  Round <span data-testid="current-round">{gameState.room.currentRound}</span>
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-blue-100 font-medium">Judge:</span>
                <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    <span data-testid="judge-initials">
                      {judgePlayer?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-semibold text-white" data-testid="judge-name">
                    {judgePlayer?.name}
                  </span>
                  <Gavel className="w-5 h-5 text-amber-300" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {gameState.players.map((player, index) => (
                <div key={player.id} className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 transition-all hover:bg-white/30">
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full",
                      index === 0 ? "bg-amber-400" : index === 1 ? "bg-gray-300" : "bg-orange-400"
                    )} />
                    <span className="text-sm text-white font-medium" data-testid={`player-name-${player.id}`}>
                      {player.name}
                    </span>
                  </div>
                  <div className="flex items-center text-amber-300 bg-black/20 rounded-full px-3 py-1">
                    <Trophy className="h-4 w-4 mr-1" />
                    <span className="font-bold text-sm" data-testid={`player-trophies-${player.id}`}>
                      {player.trophies}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center mb-12">
            <div className="inline-block bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Photo Card</h2>
                <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
              </div>
              
              {isJudge && !selectedPhotoCard && (
                <div data-testid="photo-selection">
                  <p className="text-slate-600 dark:text-slate-300 mb-6 text-lg">Choose a photo card for this round:</p>
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

              {!isJudge && !selectedPhotoCard && (
                <div className="relative" data-testid="waiting-for-judge">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-8 shadow-2xl border-2 border-amber-200 dark:border-amber-700 max-w-2xl mx-auto">
                    {/* Animated Judge Icon */}
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                          <Gavel className="w-10 h-10 text-white animate-bounce" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-ping">
                          <div className="w-4 h-4 bg-white rounded-full" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Waiting Message */}
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-300 mb-3">
                        🎭 Judge is Selecting...
                      </h3>
                      <p className="text-lg text-amber-600 dark:text-amber-400 font-medium mb-4">
                        <span className="font-bold">{judgePlayer?.name}</span> is choosing the perfect photo card for this round
                      </p>
                      <div className="flex items-center justify-center space-x-2 text-amber-500 dark:text-amber-400">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-200" />
                        <span className="text-sm font-medium ml-2">Please wait...</span>
                      </div>
                    </div>
                    
                    {/* Game Phase Indicator */}
                    <div className="mt-6 bg-white/50 dark:bg-slate-800/50 rounded-xl p-4">
                      <div className="flex items-center justify-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">1</span>
                          </div>
                          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Photo Selection</span>
                        </div>
                        <div className="w-8 h-0.5 bg-amber-300" />
                        <div className="flex items-center space-x-2 opacity-50">
                          <div className="w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">2</span>
                          </div>
                          <span className="text-sm font-medium text-slate-500">Caption Submission</span>
                        </div>
                        <div className="w-8 h-0.5 bg-slate-300" />
                        <div className="flex items-center space-x-2 opacity-50">
                          <div className="w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">3</span>
                          </div>
                          <span className="text-sm font-medium text-slate-500">Winner Selection</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
            </div>
          </div>

          {/* Enhanced Round Status */}
          <div className="mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-200 dark:border-slate-700 max-w-4xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">R{gameState.room.currentRound}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Round {gameState.room.currentRound}</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {!selectedPhotoCard ? (
                        <>🎭 <span className="font-medium">{judgePlayer?.name}</span> is selecting a photo card...</>
                      ) : !allPlayersSubmitted ? (
                        <>📝 Players are submitting their funniest captions...</>
                      ) : (
                        <>⚖️ <span className="font-medium">{judgePlayer?.name}</span> is choosing the winner...</>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Current Phase</div>
                  <div className="flex items-center space-x-2">
                    {!selectedPhotoCard ? (
                      <><Gavel className="w-4 h-4 text-amber-500" /><span className="font-medium text-amber-600 dark:text-amber-400">Photo Selection</span></>
                    ) : !allPlayersSubmitted ? (
                      <><NotebookPen className="w-4 h-4 text-blue-500" /><span className="font-medium text-blue-600 dark:text-blue-400">Caption Submission</span></>
                    ) : (
                      <><Trophy className="w-4 h-4 text-green-500" /><span className="font-medium text-green-600 dark:text-green-400">Winner Selection</span></>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: !selectedPhotoCard ? '33%' : !allPlayersSubmitted ? '66%' : '100%' 
                  }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {!isJudge && selectedPhotoCard && (
              <div className="lg:col-span-2">
                <Card className="p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-foreground">Your Caption Cards</h3>
                    <div className="text-sm text-muted-foreground">
                      <span data-testid="hand-count">{playerHand.length}</span> cards
                    </div>
                  </div>

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
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {playerHand.map((card) => (
                      <div
                        key={card.id}
                        onClick={() => {
                          if (!currentPlayer?.hasSubmittedCard) {
                            if (currentPlayer && !currentPlayer.hasExchangedCard) {
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
                          
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </div>
                      </div>
                    ))}
                  </div>

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

            <div className="space-y-6">
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
      </div>
    </>
  );
}