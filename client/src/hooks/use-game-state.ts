import { useState, useEffect } from 'react';
import { useSocket } from './use-socket';
import { useToast } from '@/hooks/use-toast';
import { type GameState, type Player } from '@shared/schema';

export function useGameState() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const { send, on, off } = useSocket();
  const { toast } = useToast();

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

    const handleGameRestarted = (data: any) => {
      setGameState(data.gameState);
      
      // Redirect ALL players to lobby when game is restarted
      const roomCode = data.gameState?.room?.code;
      if (roomCode) {
        console.log('🔄 Game restarted, redirecting to lobby:', roomCode);
        // Use window.location to ensure all players get redirected
        window.location.href = `/lobby/${roomCode}`;
      }
    };

    const handlePlayerDisconnected = (data: any) => {
      setGameState(data.gameState);
      
      // Only show toast for other players disconnecting (not for yourself)
      if (currentPlayer && data.playerId !== currentPlayer.id) {
        const disconnectedPlayerName = gameState?.players.find(p => p.id === data.playerId)?.name || 'A player';
        toast({
          title: "👋 Player Left",
          description: `${disconnectedPlayerName} has disconnected from the game.`,
        });
      }
    };

    const handleError = (data: any) => {
      setError(data.message);
      setIsLoading(false);
      toast({
        title: "❌ Connection Error",
        description: data.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    };

    const handleConnectionStatusChange = (status: 'connected' | 'connecting' | 'disconnected') => {
      const prevStatus = connectionStatus;
      setConnectionStatus(status);
      
      if (status === 'connected' && prevStatus !== 'connected') {
        // Force component reload on successful reconnection to fix UI responsiveness
        if (currentPlayer?.id && gameState?.room.id) {
          console.log('🔄 Reconnected successfully, refreshing game state');
          joinRoom(currentPlayer.id, gameState.room.id);
        }
        
        // Only show connected toast if we were previously disconnected
        if (prevStatus === 'disconnected' || prevStatus === 'connecting') {
          toast({
            title: "✅ Connected",
            description: "Successfully reconnected to the game!",
          });
        }
      } else if (status === 'disconnected' && prevStatus === 'connected') {
        // Only show disconnected toast when actually losing connection
        toast({
          title: "⚠️ Disconnected", 
          description: "Connection lost. Please refresh the page to reconnect.",
          variant: "destructive",
        });
      }
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
    on('game_restarted', handleGameRestarted);
    on('player_disconnected', handlePlayerDisconnected);
    on('error', handleError);
    on('connection_status', handleConnectionStatusChange);

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
      off('game_restarted', handleGameRestarted);
      off('player_disconnected', handlePlayerDisconnected);
      off('error', handleError);
      off('connection_status', handleConnectionStatusChange);
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

  const restartGame = () => {
    send('restart_game');
  };

  return {
    gameState,
    currentPlayer,
    isLoading,
    error,
    connectionStatus,
    setCurrentPlayer,
    setError,
    joinRoom,
    startGame,
    revealNumberCard,
    startRound,
    selectPhotoCard,
    submitCaptionCard,
    exchangeCard,
    selectWinner,
    restartGame
  };
}
