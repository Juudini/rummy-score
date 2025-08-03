import { GAME_RULES, GameType, Player } from "../constants/GameTypes";

export const ScoringUtils = {
  calculateWinner(players: Player[], gameType: GameType): Player | null {
    if (players.length === 0) return null;

    const maxScore = GAME_RULES[gameType].maxScore;
    const playersOverLimit = players.filter((p) => p.totalScore >= maxScore);

    if (playersOverLimit.length > 0) {
      return playersOverLimit.reduce((prev, current) =>
        current.totalScore > prev.totalScore ? current : prev
      );
    }

    return null;
  },

  isGameOver(players: Player[], gameType: GameType): boolean {
    const maxScore = GAME_RULES[gameType].maxScore;
    return players.some((player) => player.totalScore >= maxScore);
  },

  getLeadingPlayer(players: Player[]): Player | null {
    if (players.length === 0) return null;

    return players.reduce((prev, current) =>
      current.totalScore > prev.totalScore ? current : prev
    );
  },

  calculateHandValue(cards: string[]): number {
    let total = 0;

    for (const card of cards) {
      const value = card.slice(0, -1); // Remove suit

      if (value === "A") {
        total += 15;
      } else if (value === "2") {
        total += 20; // Wild card
      } else if (["3", "4", "5", "6", "7"].includes(value)) {
        total += 5;
      } else if (["8", "9", "10", "J", "Q", "K"].includes(value)) {
        total += 10;
      } else if (value === "JOKER") {
        total += 50;
      } else {
        total += parseInt(value) || 0;
      }
    }

    return total;
  },

  formatScore(score: number): string {
    return score.toString().padStart(3, "0");
  },

  getScoreColor(score: number, gameType: GameType): string {
    const maxScore = GAME_RULES[gameType].maxScore;
    const percentage = score / maxScore;

    if (percentage < 0.5) return "#4CAF50";
    if (percentage < 0.8) return "#ff9800";
    return "#f44336";
  },
};
