import React, { createContext, ReactNode, useContext, useReducer } from "react";
import { Game, GameType, Player } from "../constants/GameTypes";
import { StorageService } from "../services/storage";

interface GameState {
  currentGame: Game | null;
  games: Game[];
  players: Player[];
}

interface GameContextType {
  state: GameState;
  createGame: (players: Player[], gameType: GameType) => string; // Return game ID
  updateScore: (playerId: string, score: number) => void;
  nextRound: () => void;
  finishGame: () => void;
  loadGames: (games: Game[]) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

type GameAction =
  | {
      type: "CREATE_GAME";
      payload: { players: Player[]; gameType: GameType; gameId: string };
    }
  | { type: "UPDATE_SCORE"; payload: { playerId: string; score: number } }
  | { type: "NEXT_ROUND" }
  | { type: "FINISH_GAME" }
  | { type: "LOAD_GAMES"; payload: Game[] };

const gameReducer = (state: GameState, action: GameAction): GameState => {
  console.log("=== REDUCER CALLED ===");
  console.log("Action type:", action.type);
  console.log("Current state games count:", state.games.length);

  switch (action.type) {
    case "CREATE_GAME": {
      console.log("Processing CREATE_GAME action");
      console.log("Payload:", action.payload);

      const newGame: Game = {
        id: action.payload.gameId,
        players: action.payload.players,
        currentRound: 1,
        gameType: action.payload.gameType,
        isActive: true,
        createdAt: new Date(),
      };

      console.log("New game object created:", newGame);

      const newState = {
        ...state,
        currentGame: newGame,
        games: [...state.games, newGame],
      };

      console.log("New state created - games count:", newState.games.length);
      console.log("Current game set to:", newState.currentGame?.id);

      return newState;
    }
    case "UPDATE_SCORE": {
      if (!state.currentGame) return state;

      const updatedPlayers = state.currentGame.players.map((player) =>
        player.id === action.payload.playerId
          ? {
              ...player,
              totalScore: player.totalScore + action.payload.score,
              roundScores: [
                ...player.roundScores,
                {
                  round: state.currentGame!.currentRound,
                  score: action.payload.score,
                  total: player.totalScore + action.payload.score,
                },
              ],
            }
          : player
      );

      const updatedGame = { ...state.currentGame, players: updatedPlayers };

      return {
        ...state,
        currentGame: updatedGame,
        games: state.games.map((game) =>
          game.id === updatedGame.id ? updatedGame : game
        ),
      };
    }
    case "NEXT_ROUND": {
      if (!state.currentGame) return state;

      const updatedGame = {
        ...state.currentGame,
        currentRound: state.currentGame.currentRound + 1,
      };

      return {
        ...state,
        currentGame: updatedGame,
        games: state.games.map((game) =>
          game.id === updatedGame.id ? updatedGame : game
        ),
      };
    }
    case "FINISH_GAME": {
      if (!state.currentGame) return state;

      const winner = state.currentGame.players.reduce((prev, current) =>
        current.totalScore > prev.totalScore ? current : prev
      );

      const updatedGame = {
        ...state.currentGame,
        isActive: false,
        completedAt: new Date(),
        winner: winner.id,
      };

      return {
        ...state,
        currentGame: null,
        games: state.games.map((game) =>
          game.id === updatedGame.id ? updatedGame : game
        ),
      };
    }
    case "LOAD_GAMES":
      return {
        ...state,
        games: action.payload,
      };
    default:
      return state;
  }
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, {
    currentGame: null,
    games: [],
    players: [],
  });

  const createGame = (players: Player[], gameType: GameType): string => {
    console.log("=== CREATE GAME CALLED ===");
    console.log("Players received:", players);
    console.log("Game type received:", gameType);

    const gameId = Date.now().toString();
    console.log("Generated game ID:", gameId);

    console.log("About to dispatch CREATE_GAME action...");
    dispatch({ type: "CREATE_GAME", payload: { players, gameType, gameId } });
    console.log("Dispatch completed, returning game ID:", gameId);

    return gameId;
  };

  const updateScore = (playerId: string, score: number) => {
    dispatch({ type: "UPDATE_SCORE", payload: { playerId, score } });
    // Save to storage after score update
    setTimeout(async () => {
      try {
        await StorageService.saveGames(state.games);
      } catch (error) {
        console.error("Error saving games after score update:", error);
      }
    }, 100);
  };

  const nextRound = () => {
    dispatch({ type: "NEXT_ROUND" });
    // Save to storage after round change
    setTimeout(async () => {
      try {
        await StorageService.saveGames(state.games);
      } catch (error) {
        console.error("Error saving games after next round:", error);
      }
    }, 100);
  };

  const finishGame = async () => {
    dispatch({ type: "FINISH_GAME" });
    // Save to storage after finishing game
    setTimeout(async () => {
      try {
        // Get the updated state after dispatch
        const updatedGames = [...state.games];
        if (state.currentGame) {
          const gameIndex = updatedGames.findIndex(
            (g) => g.id === state.currentGame?.id
          );
          if (gameIndex !== -1) {
            updatedGames[gameIndex] = {
              ...state.currentGame,
              isActive: false,
              completedAt: new Date(),
              winner: state.currentGame.players.reduce((prev, current) =>
                current.totalScore > prev.totalScore ? current : prev
              ).id,
            };
          }
        }
        await StorageService.saveGames(updatedGames);
        console.log("Game saved to storage after finishing");
      } catch (error) {
        console.error("Error saving games after finish:", error);
      }
    }, 100);
  };

  const loadGames = (games: Game[]) => {
    dispatch({ type: "LOAD_GAMES", payload: games });
  };

  return (
    <GameContext.Provider
      value={{
        state,
        createGame,
        updateScore,
        nextRound,
        finishGame,
        loadGames,
      }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
