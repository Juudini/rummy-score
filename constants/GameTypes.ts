export interface Player {
  id: string;
  name: string;
  totalScore: number;
  roundScores: { round: number; score: number; total: number }[];
  wins: number;
}

export interface Game {
  id: string;
  players: Player[];
  currentRound: number;
  gameType: "gin" | "rummy500" | "rummy1500";
  isActive: boolean;
  createdAt: Date;
  completedAt?: Date;
  winner?: string;
}

export type GameType = "gin" | "rummy500" | "rummy1500";

export const GAME_RULES = {
  gin: {
    name: "Gin Rummy",
    maxScore: 100,
    cardValues: {
      ace: 15,
      two: 20, // wild card
      three: 5,
      four: 5,
      five: 5,
      six: 5,
      seven: 5,
      eight: 10,
      nine: 10,
      ten: 10,
      jack: 10,
      queen: 10,
      king: 10,
      joker: 50,
    },
  },
  rummy500: {
    name: "Rummy 500",
    maxScore: 500,
    cardValues: {
      ace: 15,
      two: 20, // wild card
      three: 5,
      four: 5,
      five: 5,
      six: 5,
      seven: 5,
      eight: 10,
      nine: 10,
      ten: 10,
      jack: 10,
      queen: 10,
      king: 10,
      joker: 50,
    },
  },
  rummy1500: {
    name: "Rummy 1500",
    maxScore: 1500,
    cardValues: {
      ace: 15,
      two: 20, // wild card
      three: 5,
      four: 5,
      five: 5,
      six: 5,
      seven: 5,
      eight: 10,
      nine: 10,
      ten: 10,
      jack: 10,
      queen: 10,
      king: 10,
      joker: 50,
    },
  },
};
