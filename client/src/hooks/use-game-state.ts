import { useState, useEffect } from 'react';
import { useSocket } from './use-socket';
import { type GameState, type Player } from '@shared/schema';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { send, on, off } = useSocket();

  useEffect(() => {
    const handleGameState = (data: any) => {
      setGameState(data.gameState);
      setIsLoading(false);
    };

    const handlePlayerJoined = (data: any) => {
      setGameState(data.gameState);
    };

    const handleJudgeSelectionStarted = (data: any) => {
      setGameState(data.gameState);
    };

    const handleNumberCardRevealed = (data: any) => {
      setGameState(data.gameState);
    };

    const handleRoundStarted = (data: any) => {
      setGameState(data.gameState);
    };

    const handlePhotoCardSelected = (data: any) => {
      setGameState(data.gameState);
    };

    const handleCardSubmitted = (data: any) => {
      setGameState(data.gameState);
    };

    const handleCardExchanged = (data: any) => {
      setGameState(data.gameState);
    };

    const handleRoundWinnerSelected = (data: any) => {
      setGameState(data.gameState);
    };

    const handleGameFinished = (data: any) => {
      setGameState(data.gameState);
    };

    const handlePlayerDisconnected = (data: any) => {
      setGameState(data.gameState);
    };

    const handleError = (data: any) => {
      setError(data.message);
      setIsLoading(false);
    };

    on('game_state', handleGameState);
    on('player_joined', handlePlayerJoined);
    on('judge_selection_started', handleJudgeSelectionStarted);
    on('number_card_revealed', handleNumberCardRevealed);
    on('round_started', handleRoundStarted);
    on('photo_card_selected', handlePhotoCardSelected);
    on('card_submitted', handleCardSubmitted);
    on('card_exchanged', handleCardExchanged);
    on('round_winner_selected', handleRoundWinnerSelected);
    on('game_finished', handleGameFinished);
    on('player_disconnected', handlePlayerDisconnected);
    on('error', handleError);

    return () => {
      off('game_state', handleGameState);
      off('player_joined', handlePlayerJoined);
      off('judge_selection_started', handleJudgeSelectionStarted);
      off('number_card_revealed', handleNumberCardRevealed);
      off('round_started', handleRoundStarted);
      off('photo_card_selected', handlePhotoCardSelected);
      off('card_submitted', handleCardSubmitted);
      off('card_exchanged', handleCardExchanged);
      off('round_winner_selected', handleRoundWinnerSelected);
      off('game_finished', handleGameFinished);
      off('player_disconnected', handlePlayerDisconnected);
      off('error', handleError);
    };
  }, [on, off]);

  const joinRoom = (playerId: string, roomId: string) => {
    setIsLoading(true);
    setError(null);
    send('join_room', { playerId, roomId });
    
    // Add timeout fallback in case no response comes back
    setTimeout(() => {
      if (isLoading) {
        console.warn('Join room timeout - stopping loading state');
        setIsLoading(false);
      }
    }, 5000);
  };

  const startGame = () => {
    send('start_game');
  };

  const revealNumberCard = () => {
    send('reveal_number_card');
  };

  const startRound = () => {
    send('start_round');
  };

  const selectPhotoCard = (cardId: string) => {
    send('select_photo_card', { cardId });
  };

  const submitCaptionCard = (cardId: string) => {
    send('submit_caption_card', { cardId });
  };

  const exchangeCard = (cardId: string) => {
    send('exchange_card', { cardId });
  };

  const selectWinner = (winnerId: string) => {
    send('select_winner', { winnerId });
  };

  return {
    gameState,
    currentPlayer,
    isLoading,
    error,
    setCurrentPlayer,
    setError,
    joinRoom,
    startGame,
    revealNumberCard,
    startRound,
    selectPhotoCard,
    submitCaptionCard,
    exchangeCard,
    selectWinner
  };
}
