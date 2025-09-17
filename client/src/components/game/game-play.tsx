import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Player, type GameState, type CaptionCard, type PhotoCard } from "@shared/schema";
import { Trophy, NotebookPen, RotateCcw, Check, Medal, Crown, Star, Sparkles, Gamepad2, Camera } from "lucide-react";
// import { ActivityFeed } from "./activity-feed";

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
  const [showActivityFeed, setShowActivityFeed] = useState(false);


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
       {/* <ActivityFeed
        gameState={gameState}
        currentPlayerId={currentPlayerId}
        isVisible={showActivityFeed}
        onToggle={() => setShowActivityFeed(!showActivityFeed)}
      /> */}

      <div className="bg-gradient-to-r from-purple-800/95 via-blue-800/95 to-indigo-800/95 backdrop-blur-sm shadow-lg sticky top-0 z-40 border-b border-white/20">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Left Section - Round and Judge */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full lg:w-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-3 sm:px-4 py-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white text-center">
                  Round <span data-testid="current-round">{gameState.room.currentRound}</span>
                </h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-blue-100 font-medium text-sm sm:text-base">Judge:</span>
                <div className="flex items-center gap-2 sm:gap-3 bg-white/20 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-lg">
                    <span data-testid="judge-initials">
                      {judgePlayer?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-semibold text-white text-sm sm:text-base" data-testid="judge-name">
                    {judgePlayer?.name}
                  </span>
                  <img src={judgeIconMain} alt="Judge Icon" className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                </div>
              </div>
            </div>
            
            {/* Right Section - Player Scores */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 lg:gap-6 w-full lg:w-auto">
              {gameState.players.map((player, index) => (
                <div key={player.id} className="flex items-center gap-2 sm:gap-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl px-2 sm:px-4 py-2 sm:py-3 transition-all hover:bg-white/30">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className={cn(
                      "w-2 h-2 sm:w-3 sm:h-3 rounded-full",
                      index === 0 ? "bg-amber-400" : index === 1 ? "bg-gray-300" : "bg-orange-400"
                    )} />
                    <span className="text-xs sm:text-sm text-white font-medium" data-testid={`player-name-${player.id}`}>
                      {player.name}
                    </span>
                  </div>
                  <div className="flex items-center text-amber-300 bg-black/20 rounded-full px-2 sm:px-3 py-1">
                    <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="font-bold text-xs sm:text-sm" data-testid={`player-trophies-${player.id}`}>
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

        <div className={`relative z-10 container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl ${showActivityFeed ? "lg:ml-[350px]" : ""}`}>

           {/* Enhanced Round Status with Progress Bar */}
           <div className="mb-4 sm:mb-8 animate-in fade-in-0 slide-in-from-top-4 duration-600">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-xl border border-white/30 max-w-4xl mx-auto transform transition-all duration-300 hover:scale-[1.01]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm sm:text-lg">R{gameState.room.currentRound}</span>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white">Round {gameState.room.currentRound}</h3>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                      {!selectedPhotoCard ? (
                        <>🎭 <span className="font-medium">{judgePlayer?.name}</span> is selecting...</>
                      ) : !allPlayersSubmitted ? (
                        <>📝 Players are submitting captions...</>
                      ) : (
                        <>⚖️ <span className="font-medium">{judgePlayer?.name}</span> is choosing winner...</>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="text-center sm:text-right">
                  <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-1">Current Phase</div>
                  <div className="flex items-center justify-center sm:justify-end gap-1 sm:gap-2">
                    {!selectedPhotoCard ? (
                     <>
                     <img src={judgeIconMain} alt="Judge Icon" className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                     <span className="font-medium text-amber-600 dark:text-amber-400 text-xs sm:text-sm">Photo Selection</span></>
                    ) : !allPlayersSubmitted ? (
                      <><NotebookPen className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" /><span className="font-medium text-blue-600 dark:text-blue-400 text-xs sm:text-sm">Caption Submission</span></>
                    ) : (
                      <><Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" /><span className="font-medium text-green-600 dark:text-green-400 text-xs sm:text-sm">Winner Selection</span></>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Enhanced Progress Bar */}
              <div className="mt-4 sm:mt-6 relative">
                <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-2 sm:h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 sm:h-3 rounded-full transition-all duration-500 relative overflow-hidden"
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
                    "w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 bg-white transition-all duration-300 shadow-lg",
                    !selectedPhotoCard ? "border-blue-500 bg-blue-500" : "border-green-500 bg-green-500"
                  )}>
                    {selectedPhotoCard && <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white m-0.5" />}
                  </div>
                  <div className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 bg-white transition-all duration-300 shadow-lg",
                    selectedPhotoCard && !allPlayersSubmitted ? "border-blue-500 bg-blue-500" : 
                    allPlayersSubmitted ? "border-green-500 bg-green-500" : "border-slate-300"
                  )}>
                    {allPlayersSubmitted && <Check className="w-2 h-2 sm:w-3 sm:h-3 text-white m-0.5" />}
                  </div>
                  <div className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 bg-white transition-all duration-300 shadow-lg",
                    allPlayersSubmitted ? "border-blue-500 bg-blue-500" : "border-slate-300"
                  )}>
                    {allPlayersSubmitted && <Trophy className="w-2 h-2 sm:w-3 sm:h-3 text-white m-0.5" />}
                  </div>
                </div>
              </div>
              
              {/* Progress Labels */}
              <div className="flex justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-4 sm:mt-6">
                <span className={cn(
                  "font-medium transition-colors duration-300 text-center",
                  !selectedPhotoCard ? "text-blue-600 dark:text-blue-400" : 
                  selectedPhotoCard ? "text-green-600 dark:text-green-400" : ""
                )}>
                  Photo Selection
                </span>
                <span className={cn(
                  "font-medium transition-colors duration-300 text-center",
                  selectedPhotoCard && !allPlayersSubmitted ? "text-blue-600 dark:text-blue-400" : 
                  allPlayersSubmitted ? "text-green-600 dark:text-green-400" : ""
                )}>
                  Caption Submission
                </span>
                <span className={cn(
                  "font-medium transition-colors duration-300 text-center",
                  allPlayersSubmitted ? "text-blue-600 dark:text-blue-400" : ""
                )}>
                  Winner Selection
                </span>
              </div>
            </div>
          </div>

          {/* Photo Selection for Judge Only */}
          {isJudge && !selectedPhotoCard && (
            <div className="text-center mb-6 sm:mb-12 animate-in fade-in-0 slide-in-from-top-4 duration-700">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border border-white/30 mx-2 sm:mx-auto max-w-4xl transform transition-all duration-500 hover:scale-[1.02]">
                <div className="flex items-center justify-center gap-2 mb-4 sm:mb-6">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Photo Card</h2>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
                </div>
                
                <div data-testid="photo-selection">
                  <p className="text-slate-600 dark:text-slate-300 mb-4 sm:mb-6 text-sm sm:text-lg">Choose a photo card for this round:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-4xl mx-auto">
                    {availablePhotoCards.map((card, index) => (
                      <div
                        key={card.id}
                        onClick={() => onSelectPhotoCard(card.id)}
                        className="relative group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-in fade-in-0 slide-in-from-bottom-4"
                        style={{ animationDelay: `${index * 150}ms` }}
                        data-testid={`photo-card-option-${card.id}`}
                      >
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-2xl border border-slate-700 hover:border-blue-400 transition-all duration-300">
                          <div className="relative overflow-hidden rounded-lg sm:rounded-xl mb-2 sm:mb-0">
                            <img 
                              src={card.imageUrl} 
                              alt={card.description}
                              className="w-full h-32 sm:h-40 object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Waiting for Judge - Players Only */}
          {!isJudge && !selectedPhotoCard && (
            <div className="text-center mb-6 sm:mb-12 animate-in fade-in-0 slide-in-from-bottom-6 duration-700">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl border border-white/30 mx-2 sm:mx-auto max-w-2xl transform transition-all duration-500 hover:scale-[1.02]">
                <div className="relative" data-testid="waiting-for-judge">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-2xl border-2 border-amber-200 dark:border-amber-700">
                    {/* Animated Judge Icon */}
                    <div className="flex justify-center mb-4 sm:mb-6">
                      <div className="relative">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                          <img src={judgeIconMain} alt="Judge Icon" className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-bounce" />
                        </div>
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center animate-ping">
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Waiting Message */}
                    <div className="text-center">
                      <h3 className="text-xl sm:text-2xl font-bold text-amber-700 dark:text-amber-300 mb-2 sm:mb-3">
                        🎭 Judge is Selecting...
                      </h3>
                      <p className="text-sm sm:text-lg text-amber-600 dark:text-amber-400 font-medium mb-3 sm:mb-4">
                        <span className="font-bold">{judgePlayer?.name}</span> is choosing the perfect photo card
                      </p>
                      <div className="flex items-center justify-center gap-2 text-amber-500 dark:text-amber-400">
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-200" />
                        <span className="text-xs sm:text-sm font-medium ml-2">Please wait...</span>
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
              </div>
            </div>
          )}

         


          <div className="flex justify-center">
            {/* Show side-by-side layout for players when photo is selected, or for judge when all captions are submitted */}
            {((!isJudge && selectedPhotoCard) || (isJudge && allPlayersSubmitted && selectedPhotoCard)) && (
              <div className="w-full max-w-7xl mx-2 sm:mx-4 animate-in fade-in-0 slide-in-from-left-8 duration-700">
                {/* Side-by-Side Layout: Photo Left, Captions Right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  
                  {/* Left Side - Selected Photo Card */}
                  <div className="relative">
                    <div className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl h-fit lg:sticky lg:top-8">
                      
                      {/* Photo Header */}
                      <div className="text-center mb-4 sm:mb-6">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            🖼️ Photo Card
                          </h3>
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
                        </div>
                      </div>

                      {/* Photo Display */}
                      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl mb-4">
                        <img 
                          src={selectedPhotoCard?.imageUrl || ''} 
                          alt={selectedPhotoCard?.description || ''}
                          className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </div>
                      
                      {/* Photo Description */}
                      <div className="text-center">
                        {/* <p className="text-gray-900 font-bold text-sm sm:text-base lg:text-lg leading-relaxed mb-3">
                          {selectedPhotoCard?.description || ''}
                        </p> */}
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <Camera className="w-4 h-4" />
                          <span className="text-xs sm:text-sm font-medium">{isJudge ? "Choose the funniest caption!" : "Write your funniest caption!"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Caption Cards or Judge Decision */}
                  <div className="relative">
                    {!isJudge ? (
                      <>
                        <div className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl">
                      
                      {/* Caption Header */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                        <div className="relative text-center sm:text-left">
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            🎭 Your Caption Arsenal
                          </h3>
                          <div className="hidden sm:block absolute -top-2 -right-8 animate-bounce">
                            <NotebookPen className="w-5 h-5 text-purple-400" />
                          </div>
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl blur-md opacity-30" />
                          <div className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 shadow-lg">
                            <div className="flex items-center gap-2">
                              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                              <span className="font-bold text-gray-700 text-sm sm:text-base" data-testid="hand-count">{playerHand.length} Cards</span>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
                              "relative group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-in fade-in-0 slide-in-from-bottom-4",
                              currentPlayer?.hasSubmittedCard && "opacity-50 cursor-not-allowed"
                            )}
                            style={{ animationDelay: `${index * 100}ms` }}
                            data-testid={`caption-card-${card.id}`}
                          >
                            <div className={cn(
                              `absolute inset-0 bg-gradient-to-r ${cardColor} rounded-2xl sm:rounded-3xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300`,
                              selectedCardId === card.id && "opacity-60 animate-pulse",
                              exchangeCardId === card.id && "opacity-60 animate-pulse"
                            )} />
                            <div className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl min-h-[120px] sm:min-h-[140px] flex flex-col justify-between">
                              
                              {/* Card Content */}
                              <div className="flex-1 flex items-center justify-center">
                                <p className="text-gray-900 font-bold text-center leading-relaxed text-xs sm:text-sm">{card.text}</p>
                              </div>
                              
                              {/* Card Footer */}
                              <div className="mt-3 sm:mt-4 flex items-center justify-between">
                                <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Caption Card</div>
                                <div className="flex items-center gap-2">
                                  {selectedCardId === card.id && (
                                    <div className="flex items-center gap-1 text-green-600">
                                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
                                        <Check className="h-2 w-2 sm:h-3 sm:w-3 text-white" data-testid="card-selected-icon" />
                                      </div>
                                      <span className="text-xs font-bold hidden sm:inline">Selected</span>
                                    </div>
                                  )}
                                  {exchangeCardId === card.id && (
                                    <div className="flex items-center gap-1 text-orange-600">
                                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                        <RotateCcw className="h-2 w-2 sm:h-3 sm:w-3 text-white" data-testid="card-exchange-icon" />
                                      </div>
                                      <span className="text-xs font-bold hidden sm:inline">Exchange</span>
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
                      <div className="text-center animate-in fade-in-0 slide-in-from-bottom-4 duration-600 delay-300">
                        <div className="relative inline-block">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl blur-md opacity-30 animate-pulse" />
                          <Button
                            onClick={handleSubmitCard}
                            disabled={!selectedCardId}
                            className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-xl sm:rounded-2xl px-6 sm:px-8 py-3 sm:py-4 shadow-2xl transform hover:scale-110 transition-all duration-300 text-green-600 hover:text-green-700 font-bold text-lg sm:text-xl disabled:opacity-50 hover:shadow-green-200/50"
                            data-testid="submit-caption-button"
                          >
                            <NotebookPen className="mr-2 sm:mr-3 h-5 w-5 sm:h-6 sm:w-6" />
                            🚀 Submit Caption
                          </Button>
                        </div>
                      </div>
                    )}
                        </div>
                      </>
                    ) : (
                      // Judge Decision Section
                      <>
                        <div className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl">
                          
                          {/* Header */}
                          <div className="text-center mb-6">
                            <div className="relative">
                              <h3 className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                                ⚖️ Judge's Decision
                              </h3>
                              <div className="hidden sm:block absolute -top-2 -right-8 animate-bounce">
                                <img src={judgeIconMain} alt="Judge Icon" className="w-6 h-6" />
                              </div>
                            </div>
                            <p className="text-gray-600 font-medium mt-2 text-sm sm:text-base">Choose the funniest caption!</p>
                          </div>
                          
                          {/* Submitted Cards Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                                  className="relative group cursor-pointer transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-in fade-in-0 slide-in-from-right-4"
                                  style={{ animationDelay: `${index * 150}ms` }}
                                  data-testid={`submitted-card-${index}`}
                                >
                                  <div className={`absolute inset-0 bg-gradient-to-r ${cardColor} rounded-2xl sm:rounded-3xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300`} />
                                  <div className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-2xl sm:rounded-3xl p-3 sm:p-4 shadow-2xl min-h-[120px] sm:min-h-[140px] flex flex-col justify-between">
                                    
                                    {/* Card Content */}
                                    <div className="flex-1 flex items-center justify-center">
                                      <p className="text-gray-900 font-bold text-center leading-relaxed text-xs sm:text-sm">{card.text}</p>
                                    </div>
                                    
                                    {/* Card Footer */}
                                    <div className="mt-3 sm:mt-4 flex items-center justify-between">
                                      <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Anonymous</div>
                                      <div className="text-xs text-yellow-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
                                        Click to select 🏆
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Judge waiting for captions - Show photo with waiting message */}
            {isJudge && selectedPhotoCard && !allPlayersSubmitted && (
              <div className="w-full max-w-7xl mx-2 sm:mx-4 animate-in fade-in-0 slide-in-from-right-8 duration-700">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  
                  {/* Left Side - Selected Photo Card */}
                  <div className="relative">
                    <div className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl h-fit lg:sticky lg:top-8">
                      
                      {/* Photo Header */}
                      <div className="text-center mb-4 sm:mb-6">
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            🖼️ Photo Card
                          </h3>
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" />
                        </div>
                      </div>

                      {/* Photo Display */}
                      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl mb-4">
                        <img 
                          src={selectedPhotoCard?.imageUrl || ''} 
                          alt={selectedPhotoCard?.description || ''}
                          className="w-full h-64 sm:h-80 lg:h-96 object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </div>
                      
                      {/* Photo Description */}
                      <div className="text-center">
                        <p className="text-gray-900 font-bold text-sm sm:text-base lg:text-lg leading-relaxed mb-3">
                          {selectedPhotoCard?.description || ''}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <Camera className="w-4 h-4" />
                          <span className="text-xs sm:text-sm font-medium">Waiting for captions...</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Waiting Message */}
                  <div className="relative">
                    <div className="relative bg-white/95 backdrop-blur-sm border-2 border-white/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl flex items-center justify-center min-h-[400px]">
                      
                      <div className="text-center">
                        <div className="mb-6">
                          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-pulse">
                            <NotebookPen className="w-10 h-10 text-white animate-bounce" />
                          </div>
                        </div>
                        
                        <h3 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent mb-4">
                          📝 Waiting for Captions
                        </h3>
                        
                        <p className="text-gray-600 font-medium text-sm sm:text-base mb-6">
                          Players are writing their funniest captions for your photo!
                        </p>
                        
                        <div className="flex items-center justify-center gap-2 text-amber-500">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-200" />
                          <span className="text-xs sm:text-sm font-medium ml-2">Please wait...</span>
                        </div>
                      </div>
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