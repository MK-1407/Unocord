import React, { useState, useCallback } from 'react';
import { useSocket } from './hooks/useSocket';
import { canPlayCard } from './utils/deck';
import { CardColor } from './types/game';
import OnlineGameSetup from './components/OnlineGameSetup';
import GameBoard from './components/GameBoard';
import PlayerHand from './components/PlayerHand';
import CircularPlayerLayout from './components/CircularPlayerLayout';
import { RotateCcw, Trophy } from 'lucide-react';

function App() {
  const {
    connected,
    gameState,
    playerId,
    gameId,
    error,
    createGame,
    joinGame,
    startGame,
    playCard,
    drawCard,
    passTurn,
    callUno,
    resetGame
  } = useSocket();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWildCard, setPendingWildCard] = useState<string | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  const currentPlayer = gameState?.players.find(p => p.id === playerId);
  const topCard = gameState?.discardPile[gameState.discardPile.length - 1];
  const isMyTurn = gameState?.players[gameState.currentPlayerIndex]?.id === playerId;

  const getPlayableCards = useCallback(() => {
    if (!currentPlayer || !topCard || !gameState) return [];

    return currentPlayer.hand
      .filter(card => canPlayCard(card, topCard, gameState.currentColor))
      .map(card => card.id);
  }, [currentPlayer, topCard, gameState]);

  const handlePlayCard = useCallback((cardId: string) => {
    if (!currentPlayer || !isMyTurn) return;

    const card = currentPlayer.hand.find(c => c.id === cardId);
    if (!card) return;

    // Handle wild cards - show color picker
    if (card.type === 'wild' || card.type === 'wild4') {
      setPendingWildCard(cardId);
      setShowColorPicker(true);
      return;
    }

    playCard(cardId);
  }, [currentPlayer, isMyTurn, playCard]);

  const handleColorChoice = useCallback((color: CardColor) => {
    if (pendingWildCard) {
      playCard(pendingWildCard, color);
      setPendingWildCard(null);
      setShowColorPicker(false);
    }
  }, [pendingWildCard, playCard]);

  const handleDrawCard = useCallback(() => {
    if (isMyTurn) {
      drawCard();
      setHasDrawn(true);
    }
  }, [isMyTurn, drawCard]);

  const handlePass = useCallback(() => {
    if (isMyTurn && hasDrawn) {
      passTurn();
      setHasDrawn(false);
    }
  }, [isMyTurn, hasDrawn, passTurn]);


  const handleCallUno = useCallback(() => {
    if (currentPlayer && currentPlayer.hand.length === 2) {
      callUno();
    }
  }, [currentPlayer, callUno]);

  if (!gameState || !gameState.gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-row items-center justify-center p-4">
        <OnlineGameSetup
          connected={connected}
          gameId={gameId}
          players={gameState?.players || []}
          onCreateGame={createGame}
          onJoinGame={joinGame}
          onStartGame={startGame}
          error={error}
        />
      </div>
    );
  }

  if (gameState.winner) {
    const winner = gameState.players.find(p => p.id === gameState.winner);
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <Trophy className="mx-auto mb-4 text-yellow-500" size={64} />
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Game Over!</h1>
          <p className="text-xl text-gray-600 mb-6">
            🎉 {winner?.name} wins! 🎉
          </p>
          <button
            onClick={resetGame}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transform transition-all duration-200 hover:scale-105 flex items-center space-x-2 mx-auto"
          >
            <RotateCcw size={20} />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    );
  }

  const playableCards = getPlayableCards();
  const currentTurnPlayer = gameState.players[gameState.currentPlayerIndex];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4">
  {/* Header */}
  <div className="text-center mb-4">
    <h1 className="text-3xl font-bold text-gray-800 mb-2">UNO Game</h1>
    <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
      <span>Game ID: <code className="bg-gray-100 px-2 py-1 rounded font-mono">{gameId}</code></span>
      <span>Current Turn: <strong>{currentTurnPlayer?.name}</strong></span>
      <button
        onClick={resetGame}
        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center space-x-1"
      >
        <RotateCcw size={14} />
        <span>Reset</span>
      </button>
    </div>
  </div>

  {/* Side-by-side section */}
  <div className="flex flex-col md:flex-row gap-4 w-full">
    {/* Circular player layout */}
    <div className="flex-1 bg-white rounded-lg shadow-lg p-4">
      <CircularPlayerLayout
        players={gameState.players}
        currentPlayerId={currentTurnPlayer?.id || ''}
        myPlayerId={playerId || ''}
        currentPlayerIndex={gameState.currentPlayerIndex}
      />
    </div>

    {/* Game board */}
    <div className="flex-1 bg-white rounded-lg shadow-lg p-4 flex flex-col items-center">
      <GameBoard
        gameState={gameState}
        onDrawCard={handleDrawCard}
        onColorChoice={handleColorChoice}
        showColorPicker={showColorPicker}
      />

      {gameState.lastAction && (
        <div className="text-center mt-4">
          <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm">
            {gameState.lastAction}
          </div>
        </div>
      )}
    </div>

    {/* Player hand */}
    {currentPlayer && (
      <div className="flex-1 bg-white rounded-lg shadow-lg p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Your Hand</h2>
          {!isMyTurn && (
            <div className="text-gray-500 text-sm">
              Waiting for {currentTurnPlayer?.name}'s turn...
            </div>
          )}
          {currentPlayer.hand.length === 2 && !currentPlayer.hasCalledUno && (
            <button
              onClick={handleCallUno}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-bold animate-pulse"
            >
              Call UNO!
            </button>
          )}
        </div>

        <PlayerHand
          player={currentPlayer}
          isCurrentPlayer={true}
          onPlayCard={isMyTurn ? handlePlayCard : undefined}
          playableCards={playableCards}
          showCards={true}
        />

        {isMyTurn && playableCards.length === 0 && (
          <div className="text-center mt-4">
            {!hasDrawn ? (
              <p className="text-gray-600 mb-2">No playable cards - draw from the pile</p>
            ) : (
              <button
                onClick={() => {
                  passTurn();
                  setHasDrawn(false);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Pass
              </button>
            )}
          </div>
        )}
      </div>
    )}
  </div>
</div>

  );
}

export default App;