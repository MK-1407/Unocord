import React from 'react';
import Card from './Card';
import { GameState, CardColor } from '../types/game';

interface GameBoardProps {
  gameState: GameState;
  onDrawCard: () => void;
  onColorChoice: (color: CardColor) => void;
  showColorPicker: boolean;
}

export default function GameBoard({ 
  gameState, 
  onDrawCard, 
  onColorChoice, 
  showColorPicker 
}: GameBoardProps) {
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  const canDraw = gameState.drawPile.length > 0 || gameState.discardPile.length > 1;

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Current color indicator */}
      <div className="flex items-center space-x-4">
        <div className="text-lg font-semibold">Current Color:</div>
        <div className={`
          w-8 h-8 rounded-full border-2 border-gray-800
          ${gameState.currentColor === 'red' ? 'bg-red-500' : ''}
          ${gameState.currentColor === 'blue' ? 'bg-blue-500' : ''}
          ${gameState.currentColor === 'green' ? 'bg-green-500' : ''}
          ${gameState.currentColor === 'yellow' ? 'bg-yellow-500' : ''}
          ${gameState.currentColor === 'wild' ? 'bg-gradient-to-r from-red-500 via-blue-500 to-green-500' : ''}
        `} />
      </div>

      {/* Game board */}
      <div className="flex items-center space-x-8">
        {/* Draw pile */}
        <div className="flex flex-col items-center space-y-2">
          <div className="text-sm font-medium text-gray-600">Draw Pile</div>
          <div
            className={`
              w-16 h-24 bg-blue-900 rounded-lg border-2 border-gray-800 shadow-lg
              flex items-center justify-center cursor-pointer transform transition-all duration-200
              ${canDraw ? 'hover:scale-105 hover:shadow-xl' : 'opacity-50 cursor-not-allowed'}
            `}
            onClick={canDraw ? onDrawCard : undefined}
          >
            <div className="text-white font-bold text-lg">UNO</div>
          </div>
          <div className="text-xs text-gray-500">
            {gameState.drawPile.length} cards
          </div>
        </div>

        {/* Discard pile */}
        <div className="flex flex-col items-center space-y-2">
          <div className="text-sm font-medium text-gray-600">Discard Pile</div>
          {topCard && <Card card={topCard} />}
          <div className="text-xs text-gray-500">
            {gameState.discardPile.length} cards
          </div>
        </div>
      </div>

      {/* Color picker for wild cards */}
      {showColorPicker && (
        <div className="flex flex-col items-center space-y-3 p-4 bg-white rounded-lg shadow-lg border">
          <div className="text-lg font-semibold">Choose a color:</div>
          <div className="flex space-x-3">
            {(['red', 'blue', 'green', 'yellow'] as CardColor[]).map(color => (
              <button
                key={color}
                className={`
                  w-12 h-12 rounded-full border-2 border-gray-800 shadow-lg
                  transform transition-all duration-200 hover:scale-110
                  ${color === 'red' ? 'bg-red-500' : ''}
                  ${color === 'blue' ? 'bg-blue-500' : ''}
                  ${color === 'green' ? 'bg-green-500' : ''}
                  ${color === 'yellow' ? 'bg-yellow-500' : ''}
                `}
                onClick={() => onColorChoice(color)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Game direction indicator */}
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <span>Direction:</span>
        <span className="font-bold">
          {gameState.direction === 1 ? '→ Clockwise' : '← Counter-clockwise'}
        </span>
      </div>

      {/* Draw amount indicator */}
      {gameState.drawAmount > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg">
          Next player must draw {gameState.drawAmount} cards!
        </div>
      )}
    </div>
  );
}