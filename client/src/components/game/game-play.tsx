import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Player, type GameState, type CaptionCard, type PhotoCard } from "@shared/schema";
import { Trophy, NotebookPen, RotateCcw, Check, Medal, Crown, Star, Sparkles, Gamepad2 } from "lucide-react";
import { ActivityFeed } from "./activity-feed";

import { cn } from "@/lib/utils";
import { getApiUrl } from "@/lib/config";
import judgeIconMain from "../../assests/icons/judge-icon.svg";
// Simple Judge Gavel Icon Component
const JudgeIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
  >
    <rect x="2" y="8" width="8" height="4" rx="1" fill="currentColor"/>
    <rect x="8" y="10" width="10" height="2" rx="1" fill="currentColor"/>
    <rect x="18" y="14" width="4" height="4" rx="1" fill="currentColor"/>
    <line x1="17" y1="17" x2="19" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

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
  const [showActivityFeed, setShowActivityFeed] = useState(true);


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

  // Winner announcements are now handled by toast notifications in useGameState hook

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
       <ActivityFeed
        gameState={gameState}
        currentPlayerId={currentPlayerId}
        isVisible={showActivityFeed}
        onToggle={() => setShowActivityFeed(!showActivityFeed)}
      />

      <div className="bg-gradient-to-r from-purple-800/95 via-blue-800/95 to-indigo-800/95 backdrop-blur-sm shadow-lg sticky top-0 z-40 border-b border-white/20">
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
                  {/* <JudgeIcon className="w-5 h-5 text-amber-300" /> */}
                  <img src={judgeIconMain} alt="Judge Icon" className="w-5 h-5 text-amber-300" />
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

      <div className={cn(
        "min-h-screen relative overflow-hidden transition-all duration-300",
        showActivityFeed ? "lg:ml-[0px]" : ""
      )}>
          {/* Aesthetic Activity Sidebar - Lobby Style */}
   
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Floating Gaming Elements */}
          
          <div className="absolute top-20 left-1/3 animate-bounce delay-1500">
            <Gamepad2 className="w-7 h-7 text-green-400 animate-pulse" />
          </div>
          <div className="absolute bottom-32 right-1/4 animate-bounce delay-3500">
            <Medal className="w-9 h-9 text-orange-400 animate-spin-slow" />
          </div>
        </div>

        <div className={`relative z-10 container mx-auto px-4 py-8 max-w-7xl ${showActivityFeed ? "lg:ml-[450px]" : ""}`}>
          <div className="text-center mb-12">
            <div className="inline-block bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30">
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
                          {/* <JudgeIcon className="w-10 h-10 text-white animate-bounce" /> */}
                          <img src={judgeIconMain} alt="Judge Icon" className="w-10 h-10 text-white animate-bounce" />
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
                    <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-white/20">
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

          {/* Enhanced Round Status with Progress Bar */}
          <div className="mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30 max-w-4xl mx-auto">
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
                     <>
                     <img src={judgeIconMain} alt="Judge Icon" className="w-4 h-4 text-amber-500" />
                     <span className="font-medium text-amber-600 dark:text-amber-400">Photo Selection</span></>
                    ) : !allPlayersSubmitted ? (
                      <><NotebookPen className="w-4 h-4 text-blue-500" /><span className="font-medium text-blue-600 dark:text-blue-400">Caption Submission</span></>
                    ) : (
                      <><Trophy className="w-4 h-4 text-green-500" /><span className="font-medium text-green-600 dark:text-green-400">Winner Selection</span></>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Enhanced Progress Bar */}
              <div className="mt-6 relative">
                <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                    style={{ 
                      width: !selectedPhotoCard ? '33%' : !allPlayersSubmitted ? '66%' : '100%' 
                    }}
                  >
                    {/* Animated shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                  </div>
                </div>
                
                {/* Step indicators */}
                <div className="absolute -top-1 left-0 w-full flex justify-between">
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 bg-white transition-all duration-300 shadow-lg",
                    !selectedPhotoCard ? "border-blue-500 bg-blue-500" : "border-green-500 bg-green-500"
                  )}>
                    {selectedPhotoCard && <Check className="w-3 h-3 text-white m-0.5" />}
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 bg-white transition-all duration-300 shadow-lg",
                    selectedPhotoCard && !allPlayersSubmitted ? "border-blue-500 bg-blue-500" : 
                    allPlayersSubmitted ? "border-green-500 bg-green-500" : "border-slate-300"
                  )}>
                    {allPlayersSubmitted && <Check className="w-3 h-3 text-white m-0.5" />}
                  </div>
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 bg-white transition-all duration-300 shadow-lg",
                    allPlayersSubmitted ? "border-blue-500 bg-blue-500" : "border-slate-300"
                  )}>
                    {allPlayersSubmitted && <Trophy className="w-3 h-3 text-white m-0.5" />}
                  </div>
                </div>
              </div>
              
              {/* Progress Labels */}
              <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mt-6">
                <span className={cn(
                  "font-medium transition-colors duration-300",
                  !selectedPhotoCard ? "text-blue-600 dark:text-blue-400" : 
                  selectedPhotoCard ? "text-green-600 dark:text-green-400" : ""
                )}>
                  Photo Selection
                </span>
                <span className={cn(
                  "font-medium transition-colors duration-300",
                  selectedPhotoCard && !allPlayersSubmitted ? "text-blue-600 dark:text-blue-400" : 
                  allPlayersSubmitted ? "text-green-600 dark:text-green-400" : ""
                )}>
                  Caption Submission
                </span>
                <span className={cn(
                  "font-medium transition-colors duration-300",
                  allPlayersSubmitted ? "text-blue-600 dark:text-blue-400" : ""
                )}>
                  Winner Selection
                </span>
              </div>
            </div>
          </div>



          <div className="flex justify-center">
            {!isJudge && selectedPhotoCard && (
              <div className="w-full max-w-4xl">
                {/* Beautiful Caption Cards Section - Lobby Style */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 animate-pulse" />
                  <div className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-3xl p-8 shadow-2xl">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="relative">
                        <h3 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          🎭 Your Caption Arsenal
                        </h3>
                        <div className="absolute -top-2 -right-8 animate-bounce">
                          <NotebookPen className="w-6 h-6 text-purple-400" />
                        </div>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur-md opacity-30" />
                        <div className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-2xl px-4 py-2 shadow-lg">
                          <div className="flex items-center space-x-2">
                            <Trophy className="w-5 h-5 text-blue-600" />
                            <span className="font-bold text-gray-700" data-testid="hand-count">{playerHand.length} Cards</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Exchange Section */}
                    {/* {currentPlayer && !currentPlayer.hasExchangedCard && (
                      <div className="mb-8 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur-md opacity-20" />
                        <div className="relative bg-white/90 backdrop-blur-sm border-2 border-white/50 rounded-2xl p-4 shadow-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                                <RotateCcw className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h4 className="font-bold text-gray-900">🔄 Card Exchange</h4>
                                <p className="text-sm text-gray-600 font-medium">
                                  Trade one card for a new one (once per round)
                                </p>
                              </div>
                            </div>
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur-sm opacity-30" />
                              <Button
                                onClick={handleExchangeCard}
                                disabled={!exchangeCardId}
                                className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-xl px-6 py-3 shadow-lg transform hover:scale-105 transition-all duration-300 text-orange-600 hover:text-orange-700 font-bold disabled:opacity-50"
                                data-testid="exchange-card-button"
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Exchange
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )} */}

                    {/* Caption Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      {playerHand.map((card, index) => {
                        const colors = [
                          "from-purple-500 to-pink-500",
                          "from-blue-500 to-cyan-500", 
                          "from-green-500 to-emerald-500",
                          "from-yellow-500 to-orange-500",
                          "from-red-500 to-rose-500",
                          "from-indigo-500 to-purple-500"
                        ];
                        const cardColor = colors[index % colors.length];
                        
                        return (
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
                              `absolute inset-0 bg-gradient-to-r ${cardColor} rounded-3xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300`,
                              selectedCardId === card.id && "opacity-60 animate-pulse",
                              exchangeCardId === card.id && "opacity-60 animate-pulse"
                            )} />
                            <div className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-3xl p-4 shadow-2xl min-h-[140px] flex flex-col justify-between">
                              
                              {/* Card Content */}
                              <div className="flex-1 flex items-center justify-center">
                                <p className="text-gray-900 font-bold text-center leading-relaxed text-sm">{card.text}</p>
                              </div>
                              
                              {/* Card Footer */}
                              <div className="mt-4 flex items-center justify-between">
                                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Caption Card</div>
                                <div className="flex items-center space-x-2">
                                  {selectedCardId === card.id && (
                                    <div className="flex items-center space-x-1 text-green-600">
                                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <Check className="h-3 w-3 text-white" data-testid="card-selected-icon" />
                                      </div>
                                      <span className="text-xs font-bold">Selected</span>
                                    </div>
                                  )}
                                  {exchangeCardId === card.id && (
                                    <div className="flex items-center space-x-1 text-orange-600">
                                      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                        <RotateCcw className="h-3 w-3 text-white" data-testid="card-exchange-icon" />
                                      </div>
                                      <span className="text-xs font-bold">Exchange</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Submit Button */}
                    {!currentPlayer?.hasSubmittedCard && (
                      <div className="text-center">
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur-md opacity-30 animate-pulse" />
                          <Button
                            onClick={handleSubmitCard}
                            disabled={!selectedCardId}
                            className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-2xl px-8 py-4 shadow-2xl transform hover:scale-110 transition-all duration-300 text-green-600 hover:text-green-700 font-bold text-xl disabled:opacity-50"
                            data-testid="submit-caption-button"
                          >
                            <NotebookPen className="mr-3 h-6 w-6" />
                            🚀 Submit Caption
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {isJudge && allPlayersSubmitted && (
              <div className="w-full max-w-4xl mx-auto mt-8">
                {/* Beautiful Judge Decision Section - Lobby Style */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-30 animate-pulse" />
                  <div className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-3xl p-8 shadow-2xl">
                    
                    {/* Header */}
                    <div className="text-center mb-8">
                      <div className="relative">
                        <h3 className="text-3xl font-black bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                          ⚖️ Judge's Decision
                        </h3>
                        <div className="absolute -top-2 -right-8 animate-bounce">
                          <img src={judgeIconMain} alt="Judge Icon" className="w-8 h-8" />
                        </div>
                      </div>
                      <p className="text-gray-600 font-medium mt-2">Choose the funniest caption!</p>
                    </div>
                    
                    {/* Submitted Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {submittedCards.map((card: any, index: number) => {
                        const colors = [
                          "from-purple-500 to-pink-500",
                          "from-blue-500 to-cyan-500", 
                          "from-green-500 to-emerald-500",
                          "from-yellow-500 to-orange-500",
                          "from-red-500 to-rose-500",
                          "from-indigo-500 to-purple-500"
                        ];
                        const cardColor = colors[index % colors.length];
                        
                        return (
                          <div
                            key={index}
                            onClick={() => onSelectWinner(card.playerId)}
                            className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                            data-testid={`submitted-card-${index}`}
                          >
                            <div className={`absolute inset-0 bg-gradient-to-r ${cardColor} rounded-3xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300`} />
                            <div className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-3xl p-4 shadow-2xl min-h-[140px] flex flex-col justify-between">
                              
                              {/* Card Content */}
                              <div className="flex-1 flex items-center justify-center">
                                <p className="text-gray-900 font-bold text-center leading-relaxed text-sm">{card.text}</p>
                              </div>
                              
                              {/* Card Footer */}
                              <div className="mt-4 flex items-center justify-between">
                                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Anonymous Submission</div>
                                <div className="text-xs text-yellow-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  Click to select winner 🏆
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}