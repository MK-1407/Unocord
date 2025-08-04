import React, { useState } from 'react';
import { Player } from '../types/game';
import { UserPlus, Users, Play } from 'lucide-react';

interface GameSetupProps {
  players: Player[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (playerId: string) => void;
  onStartGame: () => void;
}

export default function GameSetup({ players, onAddPlayer, onRemovePlayer, onStartGame }: GameSetupProps) {
  const [playerName, setPlayerName] = useState('');

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && players.length < 6) {
      onAddPlayer(playerName.trim());
      setPlayerName('');
    }
  };

  const canStart = players.length >= 2;

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">UNO Game</h1>
        <p className="text-gray-600">Add 2-6 players to start</p>
      </div>

      {/* Add player form */}
      <form onSubmit={handleAddPlayer} className="mb-6">
        <div className="flex space-x-2">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter player name..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={20}
          />
          <button
            type="submit"
            disabled={!playerName.trim() || players.length >= 6}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <UserPlus size={18} />
            <span>Add</span>
          </button>
        </div>
      </form>

      {/* Players list */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Users size={20} className="text-gray-600" />
          <span className="font-medium text-gray-700">Players ({players.length}/6)</span>
        </div>
        
        {players.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No players added yet
          </div>
        ) : (
          <div className="space-y-2">
            {players.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium">{player.name}</span>
                </div>
                <button
                  onClick={() => onRemovePlayer(player.id)}
                  className="text-red-500 hover:text-red-700 px-2 py-1 rounded text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start game button */}
      <button
        onClick={onStartGame}
        disabled={!canStart}
        className={`
          w-full py-3 rounded-lg font-bold flex items-center justify-center space-x-2
          transform transition-all duration-200
          ${canStart 
            ? 'bg-green-500 text-white hover:bg-green-600 hover:scale-105' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        <Play size={20} />
        <span>Start Game</span>
      </button>

      {!canStart && players.length < 2 && (
        <p className="text-sm text-red-500 text-center mt-2">
          Need at least 2 players to start
        </p>
      )}
    </div>
  );
}