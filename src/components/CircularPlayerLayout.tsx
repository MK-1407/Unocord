import React from 'react';
import { Player } from '../types/game';
import { Crown, User } from 'lucide-react';

interface CircularPlayerLayoutProps {
  players: Player[];
  currentPlayerId: string;
  myPlayerId: string;
  currentPlayerIndex: number;
}

export default function CircularPlayerLayout({ 
  players, 
  currentPlayerId, 
  myPlayerId, 
  currentPlayerIndex 
}: CircularPlayerLayoutProps) {
  const getPlayerPosition = (index: number, total: number) => {
    // Find my position and rotate so I'm at the bottom
    const myIndex = players.findIndex(p => p.id === myPlayerId);
    const adjustedIndex = (index - myIndex + total) % total;
    
    // Calculate angle for circular positioning
    const angle = (adjustedIndex * 360) / total - 90; // -90 to start from top
    const radius = 180;
    
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    
    return { x, y, angle: adjustedIndex };
  };

  return (
    <div className="relative w-96 h-96 mx-auto">
      {/* Center area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-32 h-32 bg-green-600 rounded-full border-4 border-green-800 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">UNO</span>
        </div>
      </div>
      
      {/* Players positioned in circle */}
      {players.map((player, index) => {
        const { x, y, angle } = getPlayerPosition(index, players.length);
        const isCurrentPlayer = index === currentPlayerIndex;
        const isMe = player.id === myPlayerId;
        const cardCount = Array.isArray(player.hand) ? player.hand.length : player.hand?.length || 0;
        
        return (
          <div
            key={player.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
            style={{
              left: `50%`,
              top: `50%`,
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`
            }}
          >
            <div className={`
              flex flex-col items-center space-y-2 p-3 rounded-lg transition-all duration-300
              ${isCurrentPlayer ? 'bg-yellow-100 border-2 border-yellow-400 shadow-lg scale-110' : 'bg-white border border-gray-300'}
              ${isMe ? 'ring-2 ring-blue-400' : ''}
            `}>
              {/* Player avatar */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center text-white font-bold
                ${isMe ? 'bg-blue-500' : 'bg-gray-500'}
                ${isCurrentPlayer ? 'ring-2 ring-yellow-400' : ''}
              `}>
                {isCurrentPlayer && <Crown className="w-6 h-6 text-yellow-600 absolute -top-2" />}
                <User className="w-6 h-6" />
              </div>
              
              {/* Player name */}
              <div className="text-center">
                <div className={`text-sm font-medium ${isMe ? 'text-blue-600' : 'text-gray-700'}`}>
                  {isMe ? 'You' : player.name}
                </div>
                <div className="text-xs text-gray-500">
                  {cardCount} card{cardCount !== 1 ? 's' : ''}
                </div>
              </div>
              
              {/* UNO indicator */}
              {player.hasCalledUno && cardCount === 1 && (
                <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
                  UNO!
                </div>
              )}
              
              {/* Card stack visualization */}
              <div className="flex items-center justify-center">
                {cardCount > 0 && (
                  <div className="relative">
                    {Array.from({ length: Math.min(3, cardCount) }).map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-12 bg-blue-900 rounded border border-gray-600 absolute"
                        style={{
                          transform: `translateX(${i * 2}px) translateY(${i * -1}px)`,
                          zIndex: 3 - i
                        }}
                      />
                    ))}
                    {cardCount > 3 && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {cardCount}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}