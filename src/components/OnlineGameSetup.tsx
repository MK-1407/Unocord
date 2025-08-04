import React, { useState } from 'react';
import { Users, Play, Plus, Copy, Check } from 'lucide-react';

interface OnlineGameSetupProps {
  connected: boolean;
  gameId: string | null;
  players: any[];
  onCreateGame: (playerName: string) => void;
  onJoinGame: (gameId: string, playerName: string) => void;
  onStartGame: () => void;
  error: string | null;
}

export default function OnlineGameSetup({ 
  connected, 
  gameId, 
  players, 
  onCreateGame, 
  onJoinGame, 
  onStartGame,
  error 
}: OnlineGameSetupProps) {
  const [playerName, setPlayerName] = useState('');
  const [joinGameId, setJoinGameId] = useState('');
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [copied, setCopied] = useState(false);

  const handleCreateGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onCreateGame(playerName.trim());
    }
  };

  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && joinGameId.trim()) {
      onJoinGame(joinGameId.trim().toUpperCase(), playerName.trim());
    }
  };

  const copyGameId = async () => {
    if (gameId) {
      await navigator.clipboard.writeText(gameId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const canStart = players.length >= 2;

  if (!connected) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Connecting to Server...</h2>
          <p className="text-gray-600">Please wait while we establish connection</p>
        </div>
      </div>
    );
  }

  if (!gameId) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Online UNO</h1>
          <p className="text-gray-600">Create or join a multiplayer game</p>
        </div>

        {/* Mode selector */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              mode === 'create' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setMode('create')}
          >
            Create Game
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
              mode === 'join' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setMode('join')}
          >
            Join Game
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {mode === 'create' ? (
          <form onSubmit={handleCreateGame}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={20}
                required
              />
            </div>
            <button
              type="submit"
              disabled={!playerName.trim()}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center space-x-2"
            >
              <Plus size={20} />
              <span>Create Game</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinGame}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Game ID
              </label>
              <input
                type="text"
                value={joinGameId}
                onChange={(e) => setJoinGameId(e.target.value.toUpperCase())}
                placeholder="Enter game ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                maxLength={6}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={20}
                required
              />
            </div>
            <button
              type="submit"
              disabled={!playerName.trim() || !joinGameId.trim()}
              className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center space-x-2"
            >
              <Users size={20} />
              <span>Join Game</span>
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Game Lobby</h1>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-gray-600">Game ID:</span>
          <code className="bg-gray-100 px-2 py-1 rounded font-mono font-bold text-lg">
            {gameId}
          </code>
          <button
            onClick={copyGameId}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title="Copy game ID"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
        </div>
      </div>

      {/* Players list */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3">
          <Users size={20} className="text-gray-600" />
          <span className="font-medium text-gray-700">Players ({players.length}/6)</span>
        </div>
        
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
              {index === 0 && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                  Host
                </span>
              )}
            </div>
          ))}
        </div>
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

      {!canStart && (
        <p className="text-sm text-gray-500 text-center mt-2">
          Waiting for more players... (need at least 2)
        </p>
      )}

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Share the Game ID with friends to let them join!
        </p>
      </div>
    </div>
  );
}