import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '../types/game';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    socketRef.current = io('https://unocord.onrender.com');
    
    socketRef.current.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    socketRef.current.on('disconnect', () => {
      setConnected(false);
    });

    socketRef.current.on('gameCreated', ({ gameId: newGameId, playerId: newPlayerId }) => {
      setGameId(newGameId);
      setPlayerId(newPlayerId);
    });

    socketRef.current.on('gameJoined', ({ gameId: newGameId, playerId: newPlayerId }) => {
      setGameId(newGameId);
      setPlayerId(newPlayerId);
    });

    socketRef.current.on('gameState', (newGameState: GameState) => {
      setGameState(newGameState);
    });

    socketRef.current.on('error', (errorMessage: string) => {
      setError(errorMessage);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const createGame = (playerName: string) => {
    if (socketRef.current) {
      socketRef.current.emit('createGame', playerName);
    }
  };

  const joinGame = (gameId: string, playerName: string) => {
    if (socketRef.current) {
      socketRef.current.emit('joinGame', { gameId, playerName });
    }
  };

  const startGame = () => {
    if (socketRef.current && gameId && playerId) {
      socketRef.current.emit('startGame', { gameId, playerId });
    }
  };

  const playCard = (cardId: string, chosenColor?: string) => {
    if (socketRef.current && gameId && playerId) {
      socketRef.current.emit('playCard', { gameId, playerId, cardId, chosenColor });
    }
  };

  const drawCard = () => {
    if (socketRef.current && gameId && playerId) {
      socketRef.current.emit('drawCard', { gameId, playerId });
    }
  };

  const passTurn = () => {
  if (socketRef.current && gameId && playerId) {
    socketRef.current.emit('passTurn', { gameId, playerId });
  }
};


  const callUno = () => {
    if (socketRef.current && gameId && playerId) {
      socketRef.current.emit('callUno', { gameId, playerId });
    }
  };

  const resetGame = () => {
    if (socketRef.current && gameId && playerId) {
      socketRef.current.emit('resetGame', { gameId, playerId });
    }
  };

  return {
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
  };
}
