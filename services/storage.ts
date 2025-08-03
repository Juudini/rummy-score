import AsyncStorage from "@react-native-async-storage/async-storage";
import { Game, Player } from "../constants/GameTypes";

const GAMES_KEY = "rummykeeper_games";
const PLAYERS_KEY = "rummykeeper_players";
const SETTINGS_KEY = "rummykeeper_settings";

export interface AppSettings {
  isDarkMode: boolean;
  soundEnabled: boolean;
  defaultGameType: "gin" | "rummy500";
}

export const StorageService = {
  // Games
  async saveGames(games: Game[]): Promise<void> {
    try {
      // Convert dates to strings for JSON serialization
      const serializedGames = games.map((game) => ({
        ...game,
        createdAt: game.createdAt.toISOString(),
        completedAt: game.completedAt?.toISOString(),
      }));
      await AsyncStorage.setItem(GAMES_KEY, JSON.stringify(serializedGames));
    } catch (error) {
      console.error("Error saving games:", error);
      throw error;
    }
  },

  async loadGames(): Promise<Game[]> {
    try {
      const gamesJson = await AsyncStorage.getItem(GAMES_KEY);
      if (!gamesJson) return [];

      const parsedGames = JSON.parse(gamesJson);
      // Convert date strings back to Date objects
      return parsedGames.map((game: any) => ({
        ...game,
        createdAt: new Date(game.createdAt),
        completedAt: game.completedAt ? new Date(game.completedAt) : undefined,
      }));
    } catch (error) {
      console.error("Error loading games:", error);
      return [];
    }
  },

  // Players
  async savePlayers(players: Player[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
    } catch (error) {
      console.error("Error saving players:", error);
      throw error;
    }
  },

  async loadPlayers(): Promise<Player[]> {
    try {
      const playersJson = await AsyncStorage.getItem(PLAYERS_KEY);
      return playersJson ? JSON.parse(playersJson) : [];
    } catch (error) {
      console.error("Error loading players:", error);
      return [];
    }
  },

  // Settings
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving settings:", error);
      throw error;
    }
  },

  async loadSettings(): Promise<AppSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
      return settingsJson
        ? JSON.parse(settingsJson)
        : {
            isDarkMode: false,
            soundEnabled: true,
            defaultGameType: "gin",
          };
    } catch (error) {
      console.error("Error loading settings:", error);
      return {
        isDarkMode: false,
        soundEnabled: true,
        defaultGameType: "gin",
      };
    }
  },

  // Clear all data
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([GAMES_KEY, PLAYERS_KEY, SETTINGS_KEY]);
    } catch (error) {
      console.error("Error clearing storage:", error);
      throw error;
    }
  },
};
