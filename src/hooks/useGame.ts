import { useState, useCallback } from 'react';
import { GameState, Player, Card, CardColor } from '../types/game';
import { createDeck, shuffleDeck, canPlayCard } from '../utils/deck';

const INITIAL_HAND_SIZE = 7;

export function useGame() {
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentPlayerIndex: 0,
    direction: 1,
    drawPile: [],
    discardPile: [],
    currentColor: 'red',
    gameStarted: false,
    winner: null,
    skipNext: false,
    drawAmount: 0
  });

  const addPlayer = useCallback((playerName: string) => {
    if (gameState.players.length >= 6 || gameState.gameStarted) return;
    
    const newPlayer: Player = {
      id: `player-${Date.now()}-${Math.random()}`,
      name: playerName,
      hand: [],
      hasCalledUno: false
    };
    
    setGameState(prev => ({
      ...prev,
      players: [...prev.players, newPlayer]
    }));
  }, [gameState.players.length, gameState.gameStarted]);

  const removePlayer = useCallback((playerId: string) => {
    if (gameState.gameStarted) return;
    
    setGameState(prev => ({
      ...prev,
      players: prev.players.filter(p => p.id !== playerId)
    }));
  }, [gameState.gameStarted]);

  const startGame = useCallback(() => {
    if (gameState.players.length < 2) return;
    
    const deck = createDeck();
    const players = gameState.players.map(player => ({
      ...player,
      hand: deck.splice(0, INITIAL_HAND_SIZE),
      hasCalledUno: false
    }));
    
    const firstCard = deck.shift()!;
    let currentColor: CardColor = firstCard.color;
    
    // If first card is wild, set to red by default
    if (firstCard.color === 'wild') {
      currentColor = 'red';
    }
    
    setGameState(prev => ({
      ...prev,
      players,
      drawPile: deck,
      discardPile: [firstCard],
      currentColor,
      gameStarted: true,
      winner: null,
      currentPlayerIndex: 0,
      direction: 1,
      skipNext: false,
      drawAmount: 0
    }));
  }, [gameState.players]);

  const drawCard = useCallback((playerId: string, amount: number = 1) => {
    setGameState(prev => {
      const playerIndex = prev.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return prev;
      
      let drawPile = [...prev.drawPile];
      let discardPile = [...prev.discardPile];
      
      // If draw pile is empty, reshuffle discard pile
      if (drawPile.length < amount && discardPile.length > 1) {
        const topCard = discardPile.pop()!;
        drawPile = [...drawPile, ...shuffleDeck(discardPile)];
        discardPile = [topCard];
      }
      
      const drawnCards = drawPile.splice(0, Math.min(amount, drawPile.length));
      const newPlayers = prev.players.map((player, idx) => {
        if (idx === playerIndex) {
          return {
            ...player,
            hand: [...player.hand, ...drawnCards],
            hasCalledUno: false
          };
        }
        return player;
      });
      
      return {
        ...prev,
        players: newPlayers,
        drawPile,
        discardPile
      };
    });
  }, []);

  const playCard = useCallback((playerId: string, cardId: string, chosenColor?: CardColor) => {
    setGameState(prev => {
      const playerIndex = prev.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1 || playerIndex !== prev.currentPlayerIndex) return prev;
      
      const player = prev.players[playerIndex];
      const cardIndex = player.hand.findIndex(c => c.id === cardId);
      if (cardIndex === -1) return prev;
      
      const card = player.hand[cardIndex];
      const topCard = prev.discardPile[prev.discardPile.length - 1];
      
      if (!canPlayCard(card, topCard, prev.currentColor)) return prev;
      
      // Handle forced draw
      if (prev.drawAmount > 0 && card.type !== 'draw2' && card.type !== 'wild4') {
        return prev; // Must play draw card or draw cards
      }
      
      const newHand = player.hand.filter(c => c.id !== cardId);
      let newCurrentColor = prev.currentColor;
      let newDirection = prev.direction;
      let skipNext = false;
      let drawAmount = prev.drawAmount;
      
      // Handle special cards
      switch (card.type) {
        case 'skip':
          skipNext = true;
          newCurrentColor = card.color;
          break;
        case 'reverse':
          newDirection = prev.direction * -1 as 1 | -1;
          newCurrentColor = card.color;
          break;
        case 'draw2':
          drawAmount += 2;
          newCurrentColor = card.color;
          break;
        case 'wild':
          newCurrentColor = chosenColor || 'red';
          break;
        case 'wild4':
          drawAmount += 4;
          newCurrentColor = chosenColor || 'red';
          break;
        default:
          newCurrentColor = card.color;
      }
      
      const newPlayers = prev.players.map((p, idx) => {
        if (idx === playerIndex) {
          return { ...p, hand: newHand, hasCalledUno: false };
        }
        return p;
      });
      
      // Check for winner
      let winner = null;
      if (newHand.length === 0) {
        winner = player.id;
      }
      
      // Calculate next player
      let nextPlayerIndex = prev.currentPlayerIndex;
      if (!winner) {
        nextPlayerIndex = (prev.currentPlayerIndex + newDirection + prev.players.length) % prev.players.length;
        
        // Handle draw amount
        if (drawAmount > 0) {
          const nextPlayer = newPlayers[nextPlayerIndex];
          const drawnCards = prev.drawPile.slice(0, drawAmount);
          newPlayers[nextPlayerIndex] = {
            ...nextPlayer,
            hand: [...nextPlayer.hand, ...drawnCards]
          };
          drawAmount = 0;
        }
        
        // Skip next player if needed
        if (skipNext) {
          nextPlayerIndex = (nextPlayerIndex + newDirection + prev.players.length) % prev.players.length;
        }
      }
      
      return {
        ...prev,
        players: newPlayers,
        currentPlayerIndex: nextPlayerIndex,
        direction: newDirection,
        discardPile: [...prev.discardPile, card],
        currentColor: newCurrentColor,
        winner,
        skipNext: false,
        drawAmount,
        drawPile: drawAmount > 0 ? prev.drawPile.slice(drawAmount) : prev.drawPile
      };
    });
  }, []);

  const callUno = useCallback((playerId: string) => {
    setGameState(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.id === playerId ? { ...p, hasCalledUno: true } : p
      )
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
      players: gameState.players.map(p => ({ ...p, hand: [], hasCalledUno: false })),
      currentPlayerIndex: 0,
      direction: 1,
      drawPile: [],
      discardPile: [],
      currentColor: 'red',
      gameStarted: false,
      winner: null,
      skipNext: false,
      drawAmount: 0
    });
  }, [gameState.players]);

  return {
    gameState,
    addPlayer,
    removePlayer,
    startGame,
    drawCard,
    playCard,
    callUno,
    resetGame
  };
}