import React from 'react';
import Card from './Card';
import { Player, Card as CardType } from '../types/game';

interface PlayerHandProps {
  player: Player;
  isCurrentPlayer: boolean;
  onPlayCard?: (cardId: string) => void;
  playableCards: string[];
  showCards?: boolean;
}

export default function PlayerHand({ 
  player, 
  isCurrentPlayer, 
  onPlayCard, 
  playableCards,
  showCards = false 
}: PlayerHandProps) {
  const cardCount = player.hand.length;
  
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className={`
        px-3 py-1 rounded-full text-sm font-medium
        ${isCurrentPlayer ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}
      `}>
        {player.name} ({cardCount} cards)
        {player.hasCalledUno && cardCount === 1 && (
          <span className="ml-2 text-yellow-300 font-bold">UNO!</span>
        )}
      </div>
      
      <div className="flex items-center space-x-1">
        {showCards ? (
          player.hand.map((card, index) => (
            <div
              key={card.id}
              className="transform transition-all duration-200"
              style={{
                transform: `translateX(${index * -8}px) rotate(${(index - cardCount / 2) * 2}deg)`,
                zIndex: index
              }}
            >
              <Card
                card={card}
                onClick={onPlayCard ? () => onPlayCard(card.id) : undefined}
                playable={playableCards.includes(card.id)}
                className={playableCards.includes(card.id) ? 'ring-2 ring-green-400' : ''}
              />
            </div>
          ))
        ) : (
          // Show card backs for other players
          Array.from({ length: Math.min(cardCount, 10) }).map((_, index) => (
            <div
              key={index}
              className="w-16 h-24 bg-blue-900 rounded-lg border-2 border-gray-800 shadow-lg
                         flex items-center justify-center transform transition-all duration-200"
              style={{
                transform: `translateX(${index * -8}px) rotate(${(index - cardCount / 2) * 2}deg)`,
                zIndex: index
              }}
            >
              <div className="text-white font-bold text-lg">UNO</div>
            </div>
          ))
        )}
        
        {cardCount > 10 && !showCards && (
          <div className="ml-2 text-sm text-gray-600">
            +{cardCount - 10} more
          </div>
        )}
      </div>
    </div>
  );
}