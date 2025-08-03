import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import { useGame } from "../../contexts/GameContext";
import { ScoringUtils } from "../../utils/scoring";

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, updateScore, nextRound, finishGame } = useGame();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState<number>(0);
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [customScore, setCustomScore] = useState("");

  // Find the current game by ID
  const currentGame =
    state.currentGame?.id === id
      ? state.currentGame
      : state.games.find((g) => g.id === id);

  console.log("Looking for game with ID:", id);
  console.log("Current game:", state.currentGame?.id);
  console.log(
    "All games:",
    state.games.map((g) => ({ id: g.id, isActive: g.isActive }))
  );
  console.log("Found game:", currentGame?.id);

  useEffect(() => {
    console.log(
      "Effect running - currentGame:",
      currentGame?.id,
      "isActive:",
      currentGame?.isActive
    );

    if (!currentGame) {
      console.log("No game found, showing alert");
      setTimeout(() => {
        Alert.alert(
          "Partida no encontrada",
          "No se pudo encontrar la partida. Regresando al inicio.",
          [{ text: "OK", onPress: () => router.replace("/") }]
        );
      }, 1000); // Give time for the game to be created
      return;
    }

    if (!currentGame.isActive) {
      console.log("Game is not active, redirecting to home");
      Alert.alert("Partida finalizada", "Esta partida ya ha terminado.", [
        { text: "OK", onPress: () => router.replace("/") },
      ]);
      return;
    }
  }, [currentGame, id]);

  // Show loading for a bit longer to allow game creation
  if (!currentGame) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Cargando partida...
          </Text>
        </View>
      </View>
    );
  }

  const handleQuickScore = (playerId: string, points: number) => {
    updateScore(playerId, points);
  };

  const handleCustomScore = (playerId: string) => {
    setSelectedPlayer(playerId);
    setScoreInput(0);
    setScoreModalVisible(true);
  };

  const submitCustomScore = () => {
    if (selectedPlayer && customScore) {
      const points = parseInt(customScore) || 0;
      updateScore(selectedPlayer, points);
      setScoreModalVisible(false);
      setSelectedPlayer(null);
      setCustomScore("");
    }
  };

  const handleNextRound = () => {
    Alert.alert(
      "Nueva Ronda",
      "¿Estás seguro de que quieres iniciar una nueva ronda?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Continuar", onPress: nextRound },
      ]
    );
  };

  const handleFinishGame = async () => {
    Alert.alert(
      "Finalizar Partida",
      "¿Estás seguro de que quieres finalizar la partida?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Finalizar",
          style: "destructive",
          onPress: async () => {
            try {
              await finishGame();
              // Give time for the context to save data
              setTimeout(() => {
                router.replace("/");
              }, 500);
            } catch (error) {
              console.error("Error finishing game:", error);
              Alert.alert(
                "Error",
                "No se pudo finalizar la partida correctamente."
              );
            }
          },
        },
      ]
    );
  };

  const openCamera = () => {
    router.push("/game/camera");
  };

  const winner = ScoringUtils.calculateWinner(
    currentGame.players,
    currentGame.gameType
  );
  const isGameOver = ScoringUtils.isGameOver(
    currentGame.players,
    currentGame.gameType
  );
  const leadingPlayer = ScoringUtils.getLeadingPlayer(currentGame.players);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}>
      {/* Game Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}>
        <View>
          <Text style={[styles.gameType, { color: colors.text }]}>
            {currentGame.gameType === "gin"
              ? "Gin Rummy"
              : currentGame.gameType === "rummy500"
              ? "Rummy 500"
              : "Rummy 1500"}
          </Text>
          <Text style={[styles.roundText, { color: colors.text }]}>
            Ronda {currentGame.currentRound}
          </Text>
        </View>
        {leadingPlayer && (
          <View style={styles.leaderInfo}>
            <Ionicons name="trophy" size={16} color={colors.warning} />
            <Text style={[styles.leaderText, { color: colors.text }]}>
              {leadingPlayer.name}
            </Text>
          </View>
        )}
      </View>

      {/* Players List */}
      <ScrollView
        style={styles.playersContainer}
        showsVerticalScrollIndicator={false}>
        {currentGame.players
          .sort((a, b) => b.totalScore - a.totalScore)
          .map((player, index) => {
            const isLeader = player.id === leadingPlayer?.id;
            return (
              <View
                key={player.id}
                style={[
                  styles.playerCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isLeader ? colors.warning : colors.border,
                    borderWidth: isLeader ? 2 : 1,
                  },
                ]}>
                <View style={styles.playerInfo}>
                  <View style={styles.playerNameContainer}>
                    {index === 0 && (
                      <Ionicons
                        name="trophy"
                        size={20}
                        color={colors.warning}
                      />
                    )}
                    <Text style={[styles.playerName, { color: colors.text }]}>
                      {player.name}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.playerScore,
                      {
                        color: ScoringUtils.getScoreColor(
                          player.totalScore,
                          currentGame.gameType
                        ),
                      },
                    ]}>
                    {ScoringUtils.formatScore(player.totalScore)}
                  </Text>
                </View>

                <View style={styles.playerActions}>
                  <TouchableOpacity
                    style={[
                      styles.scoreButton,
                      { backgroundColor: colors.error },
                    ]}
                    onPress={() => handleQuickScore(player.id, -5)}>
                    <Text style={styles.scoreButtonText}>-5</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.scoreButton,
                      { backgroundColor: colors.error },
                    ]}
                    onPress={() => handleQuickScore(player.id, -10)}>
                    <Text style={styles.scoreButtonText}>-10</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.customButton,
                      { backgroundColor: colors.secondary },
                    ]}
                    onPress={() => handleCustomScore(player.id)}>
                    <Ionicons name="create" size={16} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.scoreButton,
                      { backgroundColor: colors.success },
                    ]}
                    onPress={() => handleQuickScore(player.id, 10)}>
                    <Text style={styles.scoreButtonText}>+10</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.scoreButton,
                      { backgroundColor: colors.success },
                    ]}
                    onPress={() => handleQuickScore(player.id, 25)}>
                    <Text style={styles.scoreButtonText}>+25</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.secondary }]}
          onPress={openCamera}>
          <Ionicons name="camera" size={20} color="white" />
          <Text style={styles.actionButtonText}>Escanear</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.tint }]}
          onPress={handleNextRound}>
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.actionButtonText}>Nueva Ronda</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.warning }]}
          onPress={handleFinishGame}>
          <Ionicons name="stop" size={20} color="white" />
          <Text style={styles.actionButtonText}>Finalizar</Text>
        </TouchableOpacity>
      </View>

      {/* Winner Alert */}
      {isGameOver && winner && (
        <View style={[styles.winnerAlert, { backgroundColor: colors.success }]}>
          <Ionicons name="trophy" size={24} color="white" />
          <Text style={styles.winnerText}>
            ¡{winner.name} ha ganado con {winner.totalScore} puntos!
          </Text>
        </View>
      )}

      {/* Custom Score Modal */}
      <Modal
        visible={scoreModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setScoreModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Agregar Puntos Personalizados
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Ingresa los puntos"
              placeholderTextColor={colors.text + "80"}
              value={customScore}
              onChangeText={setCustomScore}
              keyboardType="numeric"
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                onPress={() => setScoreModalVisible(false)}>
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
                onPress={submitCustomScore}>
                <Text style={styles.modalButtonText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  gameType: {
    fontSize: 18,
    fontWeight: "600",
  },
  roundText: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  leaderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  leaderText: {
    fontSize: 14,
    fontWeight: "500",
  },
  playersContainer: {
    flex: 1,
    padding: 16,
  },
  playerCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  playerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  playerNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playerName: {
    fontSize: 18,
    fontWeight: "600",
  },
  playerScore: {
    fontSize: 24,
    fontWeight: "bold",
  },
  playerActions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },
  scoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 44,
    alignItems: "center",
  },
  customButton: {
    width: 44,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  winnerAlert: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  winnerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
  },
});
