import React from 'react';
import { Card as CardType, CardColor } from '../types/game';

interface CardProps {
  card: CardType;
  onClick?: () => void;
  className?: string;
  playable?: boolean;
}

const colorClasses: Record<CardColor, string> = {
  red: 'bg-gradient-to-br from-red-400 to-red-600 text-white',
  blue: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white',
  green: 'bg-gradient-to-br from-green-400 to-green-600 text-white',
  yellow: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black',
  wild: 'bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white'
};

export default function Card({ card, onClick, className = '', playable = false }: CardProps) {
  const getCardContent = () => {
    switch (card.type) {
      case 'number':
        return card.value?.toString();
      case 'skip':
        return '⊘';
      case 'reverse':
        return '⇄';
      case 'draw2':
        return '+2';
      case 'wild':
        return 'W';
      case 'wild4':
        return '+4';
      default:
        return '?';
    }
  };

  const getCardTitle = () => {
    switch (card.type) {
      case 'number':
        return `${card.color} ${card.value}`;
      case 'skip':
        return `${card.color} Skip`;
      case 'reverse':
        return `${card.color} Reverse`;
      case 'draw2':
        return `${card.color} Draw 2`;
      case 'wild':
        return 'Wild';
      case 'wild4':
        return 'Wild Draw 4';
      default:
        return 'Unknown';
    }
  };

  return (
    <div
      className={`
        relative w-16 h-24 rounded-lg border-2 border-gray-800 shadow-lg cursor-pointer
        flex items-center justify-center font-bold text-xl select-none
        transition-all duration-200 transform
        ${colorClasses[card.color]}
        ${playable ? 'hover:scale-110 hover:shadow-xl ring-2 ring-green-400' : ''}
        ${onClick ? 'hover:scale-105' : ''}
        ${className}
      `}
      onClick={onClick}
      title={getCardTitle()}
    >
      <div className="text-center">
        {getCardContent()}
      </div>
      
      {/* Card corners */}
      <div className="absolute top-1 left-1 text-xs opacity-75">
        {getCardContent()}
      </div>
      <div className="absolute bottom-1 right-1 text-xs opacity-75 transform rotate-180">
        {getCardContent()}
      </div>
    </div>
  );
}