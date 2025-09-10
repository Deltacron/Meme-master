import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGameState } from "@/hooks/use-game-state";
import { JudgeSelection } from "@/components/game/judge-selection";
import { GamePlay } from "@/components/game/game-play";
import { GameEnd } from "@/components/game/game-end";
import { type Player } from "@shared/schema";

interface GameProps {
  params: { code: string };
}

export default function Game({ params }: GameProps) {
  const [, setLocation] = useLocation();
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const {
    gameState,
    setCurrentPlayer: setGameStatePlayer,
    joinRoom,
    revealNumberCard,
    startRound,
    selectPhotoCard,
    submitCaptionCard,
    exchangeCard,
    selectWinner,
    restartGame,
  } = useGameState();

  useEffect(() => {
    // Get current player from localStorage
    const storedPlayer = localStorage.getItem("currentPlayer");
    if (storedPlayer) {
      const player = JSON.parse(storedPlayer);
      setCurrentPlayer(player);
      setGameStatePlayer(player);
      joinRoom(player.id, player.roomId);
    } else {
      // Redirect to home if no player info
      setLocation("/");
    }
  }, []);

  // Update current player when game state changes
  useEffect(() => {
    if (gameState && currentPlayer) {
      const updatedCurrentPlayer = gameState.players.find(
        (p) => p.id === currentPlayer.id,
      );
      if (
        updatedCurrentPlayer &&
        JSON.stringify(updatedCurrentPlayer) !== JSON.stringify(currentPlayer)
      ) {
        setCurrentPlayer(updatedCurrentPlayer);
      }
    }
  }, [gameState, currentPlayer]);

  const handlePlayAgain = () => {
    // Reset game state on server and return to lobby
    restartGame();
    setLocation(`/lobby/${params.code}`);
  };

  const handleNewRoom = () => {
    // Clear player info and return to home
    localStorage.removeItem("currentPlayer");
    localStorage.removeItem("playerName");
    setLocation("/");
  };

  if (!gameState || !currentPlayer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-foreground">
            Loading game...
          </p>
        </div>
      </div>
    );
  }

  // Check if all players have revealed their number cards
  const allRevealed = gameState.players.every((p) => p.numberCard !== null);

  // Find judge player (lowest number card)
  const judgePlayer = allRevealed
    ? gameState.players.reduce((lowest, player) =>
        (player.numberCard || 999) < (lowest.numberCard || 999)
          ? player
          : lowest,
      )
    : null;

  // Calculate game duration (mock for now)
  const gameTime = "12:34";

  if (gameState.room.status === "finished") {
    const winner = gameState.players.find((p) => p.trophies >= 5);
    if (winner) {
      return (
        <GameEnd
          winner={winner}
          players={gameState.players}
          totalRounds={gameState.room.currentRound}
          gameTime={gameTime}
          onPlayAgain={handlePlayAgain}
          onNewRoom={handleNewRoom}
        />
      );
    }
  }

  if (gameState.room.status === "selecting_judge") {
    return (
      <JudgeSelection
        players={gameState.players}
        currentPlayerId={currentPlayer.id}
        onRevealCard={revealNumberCard}
        onStartRound={startRound}
        allRevealed={allRevealed}
        judgePlayer={judgePlayer}
      />
    );
  }

  if (gameState.room.status === "playing") {
    return (
      <GamePlay
        gameState={gameState}
        currentPlayerId={currentPlayer.id}
        onSelectPhotoCard={selectPhotoCard}
        onSubmitCaptionCard={submitCaptionCard}
        onExchangeCard={exchangeCard}
        onSelectWinner={selectWinner}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Game Status: {gameState.room.status}
        </h1>
        <p className="text-muted-foreground">
          Waiting for game state to update...
        </p>
      </div>
    </div>
  );
}
