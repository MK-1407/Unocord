export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wild';
export type CardType = 'number' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4';

export interface Card {
  id: string;
  color: CardColor;
  type: CardType;
  value?: number; // For number cards (0-9)
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  hasCalledUno: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  direction: 1 | -1; // 1 for clockwise, -1 for counterclockwise
  drawPile: Card[];
  discardPile: Card[];
  currentColor: CardColor;
  gameStarted: boolean;
  winner: string | null;
  skipNext: boolean;
  drawAmount: number;
}