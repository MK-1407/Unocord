const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173","https://unocord.vercel.app"],
    methods: ["GET", "POST"]
  }
});

app.use(cors());
// Allow express to parse JSON bodies
app.use(express.json());

app.post("/api/token", async (req, res) => {
  
  // Exchange the code for an access_token
  const response = await fetch(`https://discord.com/api/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: "1401108264262828083",
      client_secret: "OVIJulaj6W69_vx_ST3mPNr0AeiIq_70",
      grant_type: "authorization_code",
      code: req.body.code,
    }),
  });

  // Retrieve the access_token from the response
  const { access_token } = await response.json();

  // Return the access_token to our client as { access_token: "..."}
  res.send({access_token});
});
// Game state storage
const games = new Map();
const playerSockets = new Map();

// Card creation utilities
function createDeck() {
  const cards = [];
  const colors = ['red', 'blue', 'green', 'yellow'];

  // Number cards (0-9)
  colors.forEach(color => {
    // One 0 card per color
    cards.push({
      id: `${color}-0-${Math.random()}`,
      color,
      type: 'number',
      value: 0
    });

    // Two of each number 1-9 per color
    for (let i = 1; i <= 9; i++) {
      for (let j = 0; j < 2; j++) {
        cards.push({
          id: `${color}-${i}-${j}-${Math.random()}`,
          color,
          type: 'number',
          value: i
        });
      }
    }

    // Two of each action card per color
    const actionTypes = ['skip', 'reverse', 'draw2'];
    actionTypes.forEach(type => {
      for (let i = 0; i < 2; i++) {
        cards.push({
          id: `${color}-${type}-${i}-${Math.random()}`,
          color,
          type
        });
      }
    });
  });

  // Wild cards (4 each)
  for (let i = 0; i < 4; i++) {
    cards.push({
      id: `wild-${i}-${Math.random()}`,
      color: 'wild',
      type: 'wild'
    });

    cards.push({
      id: `wild4-${i}-${Math.random()}`,
      color: 'wild',
      type: 'wild4'
    });
  }

  return shuffleDeck(cards);
}

function shuffleDeck(deck) {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function canPlayCard(card, topCard, currentColor) {
  if (card.type === 'wild' || card.type === 'wild4') {
    return true;
  }

  if (card.color === currentColor) {
    return true;
  }

  if (card.type === topCard.type && card.type !== 'number') {
    return true;
  }

  if (card.type === 'number' && topCard.type === 'number' && card.value === topCard.value) {
    return true;
  }

  return false;
}

function createGameState(gameId) {
  return {
    id: gameId,
    players: [],
    currentPlayerIndex: 0,
    direction: 1,
    drawPile: [],
    discardPile: [],
    currentColor: 'red',
    gameStarted: false,
    winner: null,
    skipNext: false,
    drawAmount: 0,
    lastAction: null
  };
}

function getPublicGameState(game, playerId) {
  return {
    ...game,
    players: game.players.map(player => ({
      ...player,
      hand: player.id === playerId ? player.hand : player.hand.map(() => ({ hidden: true }))
    })),
    drawPile: game.drawPile.map(() => ({ hidden: true }))
  };
}

function broadcastGameState(gameId) {
  const game = games.get(gameId);
  if (!game) return;

  game.players.forEach(player => {
    const socket = playerSockets.get(player.id);
    if (socket) {
      socket.emit('gameState', getPublicGameState(game, player.id));
    }
  });
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('createGame', (playerName) => {
    const gameId = uuidv4().substring(0, 6).toUpperCase();
    const playerId = uuidv4();

    const game = createGameState(gameId);
    game.players.push({
      id: playerId,
      name: playerName,
      hand: [],
      hasCalledUno: false,
      socketId: socket.id
    });

    games.set(gameId, game);
    playerSockets.set(playerId, socket);

    socket.join(gameId);
    socket.emit('gameCreated', { gameId, playerId });
    socket.emit('gameState', getPublicGameState(game, playerId));
  });

  socket.on('joinGame', ({ gameId, playerName }) => {
    const game = games.get(gameId);
    if (!game) {
      socket.emit('error', 'Game not found');
      return;
    }

    if (game.players.length >= 6) {
      socket.emit('error', 'Game is full');
      return;
    }

    if (game.gameStarted) {
      socket.emit('error', 'Game already started');
      return;
    }

    const playerId = uuidv4();
    game.players.push({
      id: playerId,
      name: playerName,
      hand: [],
      hasCalledUno: false,
      socketId: socket.id
    });

    playerSockets.set(playerId, socket);
    socket.join(gameId);
    socket.emit('gameJoined', { gameId, playerId });

    broadcastGameState(gameId);
  });

  socket.on('startGame', ({ gameId, playerId }) => {
    const game = games.get(gameId);
    if (!game || game.players.length < 2) return;

    const deck = createDeck();
    game.players.forEach(player => {
      player.hand = deck.splice(0, 7);
      player.hasCalledUno = false;
    });

    const firstCard = deck.shift();
    let currentColor = firstCard.color;

    if (firstCard.color === 'wild') {
      currentColor = 'red';
    }

    game.drawPile = deck;
    game.discardPile = [firstCard];
    game.currentColor = currentColor;
    game.gameStarted = true;
    game.currentPlayerIndex = 0;
    game.direction = 1;
    game.skipNext = false;
    game.drawAmount = 0;
    game.winner = null;

    broadcastGameState(gameId);
  });

  socket.on('playCard', ({ gameId, playerId, cardId, chosenColor }) => {
    const game = games.get(gameId);
    if (!game || !game.gameStarted) return;

    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1 || playerIndex !== game.currentPlayerIndex) return;

    const player = game.players[playerIndex];
    const cardIndex = player.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const card = player.hand[cardIndex];
    const topCard = game.discardPile[game.discardPile.length - 1];

    if (!canPlayCard(card, topCard, game.currentColor)) return;

    // Handle forced draw
    if (game.drawAmount > 0 && card.type !== 'draw2' && card.type !== 'wild4') {
      return;
    }

    const newHand = player.hand.filter(c => c.id !== cardId);
    let newCurrentColor = game.currentColor;
    let newDirection = game.direction;
    let skipNext = false;
    let drawAmount = game.drawAmount;

    // Handle special cards
    switch (card.type) {
      case 'skip':
        skipNext = true;
        newCurrentColor = card.color;
        break;
      case 'reverse':
        newDirection = game.direction * -1;
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

    player.hand = newHand;
    player.hasCalledUno = false;

    // Check for winner
    if (newHand.length === 0) {
      game.winner = playerId;
      broadcastGameState(gameId);
      return;
    }

    // Calculate next player
    let nextPlayerIndex = (game.currentPlayerIndex + newDirection + game.players.length) % game.players.length;

    // Handle draw amount
    if (drawAmount > 0) {
      const nextPlayer = game.players[nextPlayerIndex];
      const drawnCards = game.drawPile.splice(0, Math.min(drawAmount, game.drawPile.length));
      nextPlayer.hand.push(...drawnCards);
      drawAmount = 0;
    }

    // Skip next player if needed
    if (skipNext) {
      nextPlayerIndex = (nextPlayerIndex + newDirection + game.players.length) % game.players.length;
    }

    game.currentPlayerIndex = nextPlayerIndex;
    game.direction = newDirection;
    game.discardPile.push(card);
    game.currentColor = newCurrentColor;
    game.skipNext = false;
    game.drawAmount = drawAmount;
    game.lastAction = `${player.name} played ${card.type === 'number' ? card.value : card.type}`;

    broadcastGameState(gameId);
  });

  socket.on('drawCard', ({ gameId, playerId }) => {
    const game = games.get(gameId);
    if (!game || !game.gameStarted) return;

    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1 || playerIndex !== game.currentPlayerIndex) return;

    const player = game.players[playerIndex];
    const amount = game.drawAmount > 0 ? game.drawAmount : 1;

    // Reshuffle if needed
    if (game.drawPile.length < amount && game.discardPile.length > 1) {
      const topCard = game.discardPile.pop();
      game.drawPile.push(...shuffleDeck(game.discardPile));
      game.discardPile = [topCard];
    }

    const drawnCards = game.drawPile.splice(0, Math.min(amount, game.drawPile.length));
    player.hand.push(...drawnCards);

    if (game.drawAmount > 0) {
      game.drawAmount = 0;
      // Move to next player after forced draw
      game.currentPlayerIndex = (game.currentPlayerIndex + game.direction + game.players.length) % game.players.length;
    }

    game.lastAction = `${player.name} drew ${drawnCards.length} card${drawnCards.length > 1 ? 's' : ''}`;

    broadcastGameState(gameId);
  });

  socket.on('passTurn', ({ gameId, playerId }) => {
    const game = games.get(gameId);
    if (!game || !game.gameStarted) return;

    const playerIndex = game.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1 || playerIndex !== game.currentPlayerIndex) return;

    // Player passes turn after drawing (no validation here, handled client-side)
    game.currentPlayerIndex = (game.currentPlayerIndex + game.direction + game.players.length) % game.players.length;
    game.lastAction = `${game.players[playerIndex].name} passed`;

    broadcastGameState(gameId);
  });


  socket.on('callUno', ({ gameId, playerId }) => {
    const game = games.get(gameId);
    if (!game) return;

    const player = game.players.find(p => p.id === playerId);
    if (player && player.hand.length === 2) {
      player.hasCalledUno = true;
      game.lastAction = `${player.name} called UNO!`;
      broadcastGameState(gameId);
    }
  });

  socket.on('resetGame', ({ gameId, playerId }) => {
    const game = games.get(gameId);
    if (!game) return;

    game.players.forEach(player => {
      player.hand = [];
      player.hasCalledUno = false;
    });
    game.currentPlayerIndex = 0;
    game.direction = 1;
    game.drawPile = [];
    game.discardPile = [];
    game.currentColor = 'red';
    game.gameStarted = false;
    game.winner = null;
    game.skipNext = false;
    game.drawAmount = 0;
    game.lastAction = null;

    broadcastGameState(gameId);
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);

    // Find and remove player from games
    for (const [gameId, game] of games.entries()) {
      const playerIndex = game.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        const player = game.players[playerIndex];
        playerSockets.delete(player.id);
        game.players.splice(playerIndex, 1);

        if (game.players.length === 0) {
          games.delete(gameId);
        } else {
          // Adjust current player index if needed
          if (game.currentPlayerIndex >= game.players.length) {
            game.currentPlayerIndex = 0;
          }
          broadcastGameState(gameId);
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
