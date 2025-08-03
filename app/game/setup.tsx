import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { GameType, Player } from "../../constants/GameTypes";
import { useGame } from "../../contexts/GameContext";

export default function GameSetupScreen() {
  const { createGame, state } = useGame();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [playerNames, setPlayerNames] = useState<string[]>(["", ""]);
  const [gameType, setGameType] = useState<GameType>("gin");
  const [showPlayerHistory, setShowPlayerHistory] = useState(false);

  // Get all unique players from game history
  const historicalPlayers = useMemo(() => {
    const playerSet = new Set<string>();
    state.games.forEach((game) => {
      game.players.forEach((player) => {
        playerSet.add(player.name);
      });
    });
    return Array.from(playerSet).sort();
  }, [state.games]);

  const addPlayer = () => {
    if (playerNames.length < 6) {
      setPlayerNames([...playerNames, ""]);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 2) {
      setPlayerNames(playerNames.filter((_, i) => i !== index));
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const startGame = () => {
    console.log("Start game button pressed!");
    console.log("Player names before filtering:", playerNames);

    const validNames = playerNames.filter((name) => name.trim().length > 0);
    console.log("Valid names after filtering:", validNames);
    console.log("Valid names length:", validNames.length);

    if (validNames.length < 2) {
      console.log("Not enough players, showing alert");
      Alert.alert("Error", "Necesitas al menos 2 jugadores para comenzar.");
      return;
    }

    console.log("Creating players array...");
    const players: Player[] = validNames.map((name, index) => ({
      id: `player_${index}_${Date.now()}`,
      name: name.trim(),
      totalScore: 0,
      roundScores: [],
      wins: 0,
    }));

    console.log("Players created:", players);
    console.log("Game type selected:", gameType);
    console.log("About to call createGame...");

    try {
      const gameId = createGame(players, gameType);
      console.log("Game created successfully with ID:", gameId);
      console.log("About to navigate to:", `/game/${gameId}`);

      // Try different navigation approaches
      router.push(`/game/${gameId}`);
      console.log("Navigation called");
    } catch (error) {
      console.error("Error in createGame:", error);
      Alert.alert("Error", `No se pudo crear la partida: ${error}`);
    }
  };

  const addPlayerFromHistory = (playerName: string) => {
    // Find first empty slot or add new slot
    const emptyIndex = playerNames.findIndex((name) => name.trim() === "");
    if (emptyIndex !== -1) {
      const updated = [...playerNames];
      updated[emptyIndex] = playerName;
      setPlayerNames(updated);
    } else if (playerNames.length < 6) {
      setPlayerNames([...playerNames, playerName]);
    }
  };

  const isPlayerSelected = (playerName: string) => {
    return playerNames.some((name) => name.trim() === playerName);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            Configurar Partida
          </Text>

          {/* Game Type Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Tipo de Juego
            </Text>
            <View style={styles.gameTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.gameTypeButton,
                  {
                    borderColor:
                      gameType === "gin" ? colors.tint : colors.border,
                    backgroundColor:
                      gameType === "gin" ? colors.tint : colors.card,
                  },
                ]}
                onPress={() => setGameType("gin")}>
                <Text
                  style={[
                    styles.gameTypeText,
                    { color: gameType === "gin" ? "white" : colors.text },
                  ]}>
                  Gin Rummy
                </Text>
                <Text
                  style={[
                    styles.gameTypeSubtext,
                    { color: gameType === "gin" ? "white" : colors.text },
                  ]}>
                  Hasta 100 puntos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.gameTypeButton,
                  {
                    borderColor:
                      gameType === "rummy500" ? colors.tint : colors.border,
                    backgroundColor:
                      gameType === "rummy500" ? colors.tint : colors.card,
                  },
                ]}
                onPress={() => setGameType("rummy500")}>
                <Text
                  style={[
                    styles.gameTypeText,
                    { color: gameType === "rummy500" ? "white" : colors.text },
                  ]}>
                  Rummy 500
                </Text>
                <Text
                  style={[
                    styles.gameTypeSubtext,
                    { color: gameType === "rummy500" ? "white" : colors.text },
                  ]}>
                  Hasta 500 puntos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.gameTypeButton,
                  {
                    borderColor:
                      gameType === "rummy1500" ? colors.tint : colors.border,
                    backgroundColor:
                      gameType === "rummy1500" ? colors.tint : colors.card,
                  },
                ]}
                onPress={() => setGameType("rummy1500")}>
                <Text
                  style={[
                    styles.gameTypeText,
                    { color: gameType === "rummy1500" ? "white" : colors.text },
                  ]}>
                  Rummy 1500
                </Text>
                <Text
                  style={[
                    styles.gameTypeSubtext,
                    { color: gameType === "rummy1500" ? "white" : colors.text },
                  ]}>
                  Hasta 1500 puntos
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Players Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Jugadores ({playerNames.length})
              </Text>

              {historicalPlayers.length > 0 && (
                <TouchableOpacity
                  style={[
                    styles.historyButton,
                    { backgroundColor: colors.secondary },
                  ]}
                  onPress={() => setShowPlayerHistory(!showPlayerHistory)}>
                  <Ionicons name="people" size={16} color="white" />
                  <Text style={styles.historyButtonText}>Historial</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Player History Selection */}
            {showPlayerHistory && historicalPlayers.length > 0 && (
              <View
                style={[
                  styles.historyContainer,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}>
                <Text style={[styles.historyTitle, { color: colors.text }]}>
                  Seleccionar jugadores del historial:
                </Text>
                <View style={styles.historyPlayersGrid}>
                  {historicalPlayers.map((playerName) => (
                    <TouchableOpacity
                      key={playerName}
                      style={[
                        styles.historyPlayerChip,
                        {
                          backgroundColor: isPlayerSelected(playerName)
                            ? colors.tint
                            : colors.card,
                          borderColor: colors.border,
                          opacity: isPlayerSelected(playerName) ? 0.7 : 1,
                        },
                      ]}
                      onPress={() =>
                        !isPlayerSelected(playerName) &&
                        addPlayerFromHistory(playerName)
                      }
                      disabled={isPlayerSelected(playerName)}>
                      <Text
                        style={[
                          styles.historyPlayerText,
                          {
                            color: isPlayerSelected(playerName)
                              ? "white"
                              : colors.text,
                          },
                        ]}>
                        {playerName}
                      </Text>
                      {isPlayerSelected(playerName) && (
                        <Ionicons name="checkmark" size={14} color="white" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {playerNames.map((name, index) => (
              <View key={index} style={styles.playerRow}>
                <TextInput
                  style={[
                    styles.playerInput,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder={`Jugador ${index + 1}`}
                  placeholderTextColor={colors.text + "80"}
                  value={name}
                  onChangeText={(text) => updatePlayerName(index, text)}
                  maxLength={20}
                />

                {playerNames.length > 2 && (
                  <TouchableOpacity
                    style={[
                      styles.removeButton,
                      { backgroundColor: colors.error },
                    ]}
                    onPress={() => removePlayer(index)}>
                    <Ionicons name="remove" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {playerNames.length < 6 && (
              <TouchableOpacity
                style={[
                  styles.addPlayerButton,
                  {
                    backgroundColor: colors.secondary,
                    borderColor: colors.border,
                  },
                ]}
                onPress={addPlayer}>
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.addPlayerText}>Agregar Jugador</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.tint }]}
            onPress={() => {
              console.log("Button physically pressed");
              startGame();
            }}>
            <Ionicons name="play" size={24} color="white" />
            <Text style={styles.startButtonText}>Comenzar Partida</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  gameTypeContainer: {
    flexDirection: "column",
    gap: 12,
  },
  gameTypeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
  },
  gameTypeText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  gameTypeSubtext: {
    fontSize: 12,
    opacity: 0.8,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  playerInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  addPlayerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 8,
  },
  addPlayerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 12,
  },
  startButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  historyButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  historyContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
  },
  historyPlayersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  historyPlayerChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  historyPlayerText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
