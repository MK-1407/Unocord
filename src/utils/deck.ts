import { Card, CardColor, CardType } from '../types/game';

export function createDeck(): Card[] {
  const cards: Card[] = [];
  const colors: CardColor[] = ['red', 'blue', 'green', 'yellow'];
  
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
    const actionTypes: CardType[] = ['skip', 'reverse', 'draw2'];
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

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function canPlayCard(card: Card, topCard: Card, currentColor: CardColor): boolean {
  // Wild cards can always be played
  if (card.type === 'wild' || card.type === 'wild4') {
    return true;
  }
  
  // Same color
  if (card.color === currentColor) {
    return true;
  }
  
  // Same type/value
  if (card.type === topCard.type && card.type !== 'number') {
    return true;
  }
  
  if (card.type === 'number' && topCard.type === 'number' && card.value === topCard.value) {
    return true;
  }
  
  return false;
}