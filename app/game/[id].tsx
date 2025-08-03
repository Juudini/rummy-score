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
import { CustomAlert } from "../../components/CustomAlert";
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
  const [showNextRoundAlert, setShowNextRoundAlert] = useState(false);
  const [showFinishGameAlert, setShowFinishGameAlert] = useState(false);

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
    setShowNextRoundAlert(true);
  };

  const handleFinishGame = () => {
    setShowFinishGameAlert(true);
  };

  const confirmNextRound = () => {
    nextRound();
    setShowNextRoundAlert(false);
  };

  const confirmFinishGame = async () => {
    try {
      await finishGame();
      setShowFinishGameAlert(false);
      setTimeout(() => {
        router.replace("/");
      }, 500);
    } catch (error) {
      console.error("Error finishing game:", error);
      Alert.alert("Error", "No se pudo finalizar la partida correctamente.");
    }
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
        <View style={styles.headerLeft}>
          <Text style={[styles.gameType, { color: colors.text }]}>
            {currentGame.gameType === "gin"
              ? "Gin Rummy"
              : currentGame.gameType === "rummy500"
              ? "Rummy 500"
              : "Rummy 1500"}
          </Text>
          <View style={styles.roundContainer}>
            <Ionicons name="reload" size={14} color={colors.tint} />
            <Text style={[styles.roundText, { color: colors.tint }]}>
              Ronda {currentGame.currentRound}
            </Text>
          </View>
        </View>

        {leadingPlayer && (
          <View
            style={[
              styles.leaderInfo,
              {
                backgroundColor: colors.warning + "15",
                borderColor: colors.warning,
              },
            ]}>
            <Ionicons name="trophy" size={16} color={colors.warning} />
            <Text style={[styles.leaderText, { color: colors.text }]}>
              {leadingPlayer.name}
            </Text>
          </View>
        )}
      </View>

      {/* Game Stats Bar */}
      <View
        style={[
          styles.statsBar,
          {
            backgroundColor:
              isGameOver && winner ? colors.success : colors.card,
            borderColor: colors.border,
          },
        ]}>
        {isGameOver && winner ? (
          <View style={styles.winnerStatsBar}>
            <Ionicons name="trophy" size={20} color="white" />
            <Text style={styles.winnerStatsText}>
              ¡{winner.name} ha ganado con {winner.totalScore} puntos!
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.text }]}>
                Jugadores
              </Text>
              <Text style={[styles.statValue, { color: colors.tint }]}>
                {currentGame.players.length}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.text }]}>
                Puntos objetivo
              </Text>
              <Text style={[styles.statValue, { color: colors.tint }]}>
                {currentGame.gameType === "gin"
                  ? "100"
                  : currentGame.gameType === "rummy500"
                  ? "500"
                  : "1500"}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Players List */}
      <ScrollView
        style={styles.playersContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.playersContent}>
        {currentGame.players
          .sort((a, b) => b.totalScore - a.totalScore)
          .map((player, index) => {
            const isLeader = player.id === leadingPlayer?.id;
            const progressPercentage = Math.min(
              Math.max(
                (player.totalScore /
                  (currentGame.gameType === "gin"
                    ? 100
                    : currentGame.gameType === "rummy500"
                    ? 500
                    : 1500)) *
                  100,
                0
              ), // Ensure minimum 0% for negative scores
              100
            );

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
                {/* Player Header */}
                <View style={styles.playerHeader}>
                  <View style={styles.playerNameContainer}>
                    <View
                      style={[
                        styles.positionBadge,
                        {
                          backgroundColor:
                            index === 0 ? colors.warning : colors.border,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.positionText,
                          { color: index === 0 ? "white" : colors.text },
                        ]}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text style={[styles.playerName, { color: colors.text }]}>
                      {player.name}
                    </Text>
                    {index === 0 && (
                      <View
                        style={[
                          styles.crownBadge,
                          { backgroundColor: colors.warning },
                        ]}>
                        <Ionicons name="trophy" size={12} color="white" />
                      </View>
                    )}
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
                    {player.totalScore}
                  </Text>
                </View>

                {/* Progress Bar */}
                <View
                  style={[
                    styles.progressContainer,
                    { backgroundColor: colors.border },
                  ]}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width:
                          player.totalScore < 0
                            ? "0%"
                            : `${progressPercentage}%`,
                        backgroundColor: ScoringUtils.getScoreColor(
                          player.totalScore,
                          currentGame.gameType
                        ),
                      },
                    ]}
                  />
                </View>

                {/* Action Buttons */}
                <View style={styles.playerActions}>
                  <TouchableOpacity
                    style={[
                      styles.scoreButton,
                      styles.negativeButton,
                      { backgroundColor: colors.error },
                    ]}
                    onPress={() => handleQuickScore(player.id, -5)}>
                    <Text style={styles.scoreButtonText}>-5</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.scoreButton,
                      styles.negativeButton,
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
                    <Ionicons name="create-outline" size={18} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.scoreButton,
                      styles.positiveButton,
                      { backgroundColor: colors.success },
                    ]}
                    onPress={() => handleQuickScore(player.id, 10)}>
                    <Text style={styles.scoreButtonText}>+10</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.scoreButton,
                      styles.positiveButton,
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
      <SafeAreaView>
        <View
          style={[
            styles.actionButtons,
            { backgroundColor: colors.card, borderTopColor: colors.border },
          ]}>
          {isGameOver && winner ? (
            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.finishGameButton,
                { backgroundColor: colors.success },
              ]}
              onPress={handleFinishGame}>
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color="white"
              />
              <Text style={styles.actionButtonText}>Terminar Partida</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.secondary },
                ]}
                onPress={openCamera}>
                <Ionicons name="camera-outline" size={22} color="white" />
                <Text style={styles.actionButtonText}>Escanear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.tint }]}
                onPress={handleNextRound}>
                <Ionicons name="refresh-outline" size={22} color="white" />
                <Text style={styles.actionButtonText}>Nueva Ronda</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.warning },
                ]}
                onPress={handleFinishGame}>
                <Ionicons name="stop-outline" size={22} color="white" />
                <Text style={styles.actionButtonText}>Finalizar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>

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

      {/* Custom Alerts */}
      <CustomAlert
        visible={showNextRoundAlert}
        title="Nueva Ronda"
        message="¿Estás seguro de que quieres iniciar una nueva ronda?"
        icon="refresh-outline"
        buttons={[
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => setShowNextRoundAlert(false),
          },
          {
            text: "Continuar",
            style: "default",
            onPress: confirmNextRound,
          },
        ]}
        onClose={() => setShowNextRoundAlert(false)}
      />

      <CustomAlert
        visible={showFinishGameAlert}
        title="Finalizar Partida"
        message="¿Estás seguro de que quieres finalizar la partida?"
        icon="stop-outline"
        buttons={[
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => setShowFinishGameAlert(false),
          },
          {
            text: "Finalizar",
            style: "destructive",
            onPress: confirmFinishGame,
          },
        ]}
        onClose={() => setShowFinishGameAlert(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  headerLeft: {
    flex: 1,
  },
  gameType: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  roundContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  roundText: {
    fontSize: 14,
    fontWeight: "500",
  },
  leaderInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  leaderText: {
    fontSize: 14,
    fontWeight: "600",
  },
  statsBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 20,
  },
  playersContainer: {
    flex: 1,
  },
  playersContent: {
    padding: 16,
    paddingBottom: 100,
  },
  playerCard: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  playerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  playerNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  positionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  positionText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  playerName: {
    fontSize: 18,
    fontWeight: "600",
  },
  crownBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  playerScore: {
    fontSize: 28,
    fontWeight: "bold",
  },
  progressContainer: {
    height: 6,
    borderRadius: 3,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  playerActions: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  scoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 50,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  negativeButton: {
    transform: [{ scale: 0.95 }],
  },
  positiveButton: {
    transform: [{ scale: 1.05 }],
  },
  customButton: {
    width: 50,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  scoreButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  actionButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  finishGameButton: {
    flex: 1,
  },
  winnerStatsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    flex: 1,
  },
  winnerStatsText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
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
