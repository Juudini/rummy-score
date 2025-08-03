import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { Game } from "../../constants/GameTypes";
import { useGame } from "../../contexts/GameContext";

export default function HistoryScreen() {
  const { state } = useGame();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  // Get unique dates from all games with better organization
  const gameCalendarData = useMemo(() => {
    const dateMap = new Map();
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Group games by month and year
    state.games.forEach((game) => {
      const gameDate = new Date(game.createdAt);
      const monthKey = `${gameDate.getFullYear()}-${gameDate.getMonth()}`;

      if (!dateMap.has(monthKey)) {
        dateMap.set(monthKey, {
          year: gameDate.getFullYear(),
          month: gameDate.getMonth(),
          dates: [],
        });
      }

      const monthData = dateMap.get(monthKey);
      const existingDate = monthData.dates.find(
        (d: any) => d.date.toDateString() === gameDate.toDateString()
      );

      if (existingDate) {
        existingDate.gameCount++;
      } else {
        monthData.dates.push({
          date: gameDate,
          gameCount: 1,
        });
      }
    });

    return Array.from(dateMap.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [state.games]);

  // Filter games based on selected criteria
  const filteredGames = useMemo(() => {
    let filtered = [...state.games];

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter((game) => {
        const gameDate = new Date(game.createdAt);
        return gameDate.toDateString() === selectedDate.toDateString();
      });
    }

    // Filter by selected players
    if (selectedPlayers.length > 0) {
      filtered = filtered.filter((game) =>
        selectedPlayers.every((playerName) =>
          game.players.some((player) => player.name === playerName)
        )
      );
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [state.games, selectedDate, selectedPlayers]);

  // Get all unique player names from all games
  const allPlayers = useMemo(() => {
    const playerSet = new Set<string>();
    state.games.forEach((game) => {
      game.players.forEach((player) => {
        playerSet.add(player.name);
      });
    });
    return Array.from(playerSet);
  }, [state.games]);

  const togglePlayerFilter = (playerName: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerName)
        ? prev.filter((name) => name !== playerName)
        : [...prev, playerName]
    );
  };

  const clearFilters = () => {
    setSelectedDate(null);
    setSelectedPlayers([]);
  };

  const onDateSelect = (date: Date) => {
    setSelectedDate(
      selectedDate?.toDateString() === date.toDateString() ? null : date
    );
    setShowDatePicker(false);
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  const hasActiveFilters = selectedDate || selectedPlayers.length > 0;

  const openGameDetails = (game: Game) => {
    setSelectedGame(game);
  };

  const closeGameDetails = () => {
    setSelectedGame(null);
  };

  const renderGameItem = ({ item }: { item: Game }) => (
    <TouchableOpacity
      style={[
        styles.gameCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
      onPress={() =>
        item.isActive ? router.push(`/game/${item.id}`) : openGameDetails(item)
      }>
      <View style={styles.gameHeader}>
        <Text style={[styles.gameTitle, { color: colors.text }]}>
          {item.gameType === "gin" ? "Gin Rummy" : "Rummy 500"}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: item.isActive ? colors.success : colors.border },
          ]}>
          <Text
            style={[
              styles.statusText,
              { color: item.isActive ? "white" : colors.text },
            ]}>
            {item.isActive ? "Activa" : "Finalizada"}
          </Text>
        </View>
      </View>

      <Text style={[styles.gameDate, { color: colors.text }]}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>

      <View style={styles.playersContainer}>
        {item.players.map((player, index) => (
          <Text
            key={player.id}
            style={[styles.playerScore, { color: colors.text }]}>
            {player.name}: {player.totalScore}
            {index < item.players.length - 1 && " • "}
          </Text>
        ))}
      </View>

      {item.isActive && (
        <View style={styles.continueContainer}>
          <Ionicons name="play-circle" size={16} color={colors.tint} />
          <Text style={[styles.continueText, { color: colors.tint }]}>
            Toca para continuar
          </Text>
        </View>
      )}

      {!item.isActive && (
        <View style={styles.detailsHint}>
          <Ionicons name="information-circle" size={16} color={colors.tint} />
          <Text style={[styles.detailsText, { color: colors.tint }]}>
            Toca para ver detalles
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderRoundScores = () => {
    if (!selectedGame) return null;

    const maxRounds = Math.max(
      ...selectedGame.players.map((p) =>
        Math.max(...p.roundScores.map((rs) => rs.round), 0)
      )
    );

    return (
      <View style={styles.roundsContainer}>
        <Text style={[styles.modalSectionTitle, { color: colors.text }]}>
          Puntuación por Ronda
        </Text>

        {/* Header */}
        <View style={styles.tableHeader}>
          <Text
            style={[
              styles.tableHeaderCell,
              styles.playerColumn,
              { color: colors.text },
            ]}>
            Jugador
          </Text>
          {Array.from({ length: maxRounds }, (_, i) => (
            <Text
              key={i}
              style={[
                styles.tableHeaderCell,
                styles.roundColumn,
                { color: colors.text },
              ]}>
              R{i + 1}
            </Text>
          ))}
          <Text
            style={[
              styles.tableHeaderCell,
              styles.totalColumn,
              { color: colors.text },
            ]}>
            Total
          </Text>
        </View>

        {/* Player rows */}
        {selectedGame.players.map((player) => (
          <View
            key={player.id}
            style={[styles.tableRow, { borderColor: colors.border }]}>
            <Text
              style={[
                styles.tableCell,
                styles.playerColumn,
                { color: colors.text },
              ]}>
              {player.name}
            </Text>
            {Array.from({ length: maxRounds }, (_, roundIndex) => {
              const roundScore = player.roundScores.find(
                (rs) => rs.round === roundIndex + 1
              );
              return (
                <Text
                  key={roundIndex}
                  style={[
                    styles.tableCell,
                    styles.roundColumn,
                    { color: colors.text },
                  ]}>
                  {roundScore ? `+${roundScore.score}` : "-"}
                </Text>
              );
            })}
            <Text
              style={[
                styles.tableCell,
                styles.totalColumn,
                styles.totalScore,
                { color: colors.text },
              ]}>
              {player.totalScore}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  if (state.games.length === 0) {
    return (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="list-outline" size={64} color={colors.border} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No hay partidas
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.text }]}>
          Inicia una nueva partida para ver el historial
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filter Header */}
      <View
        style={[
          styles.filterHeader,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.tint }]}
          onPress={() => setShowFilters(!showFilters)}>
          <Ionicons name="filter" size={20} color="white" />
          <Text style={styles.filterButtonText}>Filtros</Text>
          {hasActiveFilters && <View style={styles.filterIndicator} />}
        </TouchableOpacity>

        {hasActiveFilters && (
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: colors.error }]}
            onPress={clearFilters}>
            <Ionicons name="close" size={16} color="white" />
            <Text style={styles.clearButtonText}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Panel */}
      {showFilters && (
        <View
          style={[
            styles.filterPanel,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}>
          {/* Date Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterTitle, { color: colors.text }]}>
              Filtrar por Fecha
            </Text>

            <View style={styles.datePickerContainer}>
              <TouchableOpacity
                style={[
                  styles.datePickerButton,
                  {
                    backgroundColor: colors.background,
                    borderColor: selectedDate ? colors.tint : colors.border,
                  },
                ]}
                onPress={() => setShowDatePicker(true)}>
                <Ionicons
                  name="calendar"
                  size={20}
                  color={selectedDate ? colors.tint : colors.text}
                />
                <Text
                  style={[
                    styles.datePickerText,
                    { color: selectedDate ? colors.tint : colors.text },
                  ]}>
                  {selectedDate
                    ? selectedDate.toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    : "Seleccionar fecha"}
                </Text>
              </TouchableOpacity>

              {selectedDate && (
                <TouchableOpacity
                  style={[
                    styles.clearButton,
                    { backgroundColor: colors.error },
                  ]}
                  onPress={clearDateFilter}>
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              )}
            </View>

            {/* Custom Calendar Modal */}
            <Modal
              visible={showDatePicker}
              animationType="slide"
              presentationStyle="pageSheet"
              onRequestClose={() => setShowDatePicker(false)}>
              <View
                style={[
                  styles.calendarModal,
                  { backgroundColor: colors.background },
                ]}>
                <View
                  style={[
                    styles.calendarHeader,
                    { borderBottomColor: colors.border },
                  ]}>
                  <Text style={[styles.calendarTitle, { color: colors.text }]}>
                    Seleccionar Fecha
                  </Text>
                  <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.calendarContent}>
                  {gameCalendarData.map((monthData, monthIndex) => (
                    <View
                      key={`${monthData.year}-${monthData.month}`}
                      style={styles.monthSection}>
                      <Text
                        style={[styles.monthHeader, { color: colors.text }]}>
                        {new Date(
                          monthData.year,
                          monthData.month
                        ).toLocaleDateString("es-ES", {
                          month: "long",
                          year: "numeric",
                        })}
                      </Text>

                      <View style={styles.datesGrid}>
                        {monthData.dates.map(
                          (dateInfo: any, dateIndex: number) => (
                            <TouchableOpacity
                              key={dateIndex}
                              style={[
                                styles.dateCard,
                                {
                                  backgroundColor:
                                    selectedDate?.toDateString() ===
                                    dateInfo.date.toDateString()
                                      ? colors.tint
                                      : colors.card,
                                  borderColor: colors.border,
                                },
                              ]}
                              onPress={() => onDateSelect(dateInfo.date)}>
                              <Text
                                style={[
                                  styles.dateNumber,
                                  {
                                    color:
                                      selectedDate?.toDateString() ===
                                      dateInfo.date.toDateString()
                                        ? "white"
                                        : colors.text,
                                  },
                                ]}>
                                {dateInfo.date.getDate()}
                              </Text>
                              <Text
                                style={[
                                  styles.dateMonth,
                                  {
                                    color:
                                      selectedDate?.toDateString() ===
                                      dateInfo.date.toDateString()
                                        ? "white"
                                        : colors.text,
                                  },
                                ]}>
                                {dateInfo.date.toLocaleDateString("es-ES", {
                                  month: "short",
                                })}
                              </Text>
                              <View
                                style={[
                                  styles.gameCountBadge,
                                  {
                                    backgroundColor:
                                      selectedDate?.toDateString() ===
                                      dateInfo.date.toDateString()
                                        ? "rgba(255,255,255,0.3)"
                                        : colors.tint,
                                  },
                                ]}>
                                <Text
                                  style={[
                                    styles.gameCountText,
                                    { color: "white" },
                                  ]}>
                                  {dateInfo.gameCount}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          )
                        )}
                      </View>
                    </View>
                  ))}

                  {gameCalendarData.length === 0 && (
                    <View style={styles.emptyCalendar}>
                      <Ionicons
                        name="calendar-outline"
                        size={64}
                        color={colors.border}
                      />
                      <Text
                        style={[
                          styles.emptyCalendarText,
                          { color: colors.text },
                        ]}>
                        No hay fechas con partidas
                      </Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            </Modal>
          </View>

          {/* Player Filter */}
          <View style={styles.filterSection}>
            <Text style={[styles.filterTitle, { color: colors.text }]}>
              Filtrar por Jugadores
            </Text>
            <View style={styles.playersGrid}>
              {allPlayers.map((playerName) => (
                <TouchableOpacity
                  key={playerName}
                  style={[
                    styles.playerChip,
                    {
                      backgroundColor: selectedPlayers.includes(playerName)
                        ? colors.tint
                        : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => togglePlayerFilter(playerName)}>
                  <Text
                    style={[
                      styles.playerChipText,
                      {
                        color: selectedPlayers.includes(playerName)
                          ? "white"
                          : colors.text,
                      },
                    ]}>
                    {playerName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* Results Summary */}
      <View style={styles.summaryContainer}>
        <Text style={[styles.summaryText, { color: colors.text }]}>
          {filteredGames.length} partida
          {filteredGames.length !== 1 ? "s" : ""} encontrada
          {filteredGames.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={filteredGames}
        renderItem={renderGameItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Game Details Modal */}
      <Modal
        visible={selectedGame !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeGameDetails}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Detalles de la Partida
            </Text>
            <TouchableOpacity onPress={closeGameDetails}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedGame && (
              <>
                <View style={styles.gameInfo}>
                  <Text style={[styles.gameInfoTitle, { color: colors.text }]}>
                    {selectedGame.gameType === "gin"
                      ? "Gin Rummy"
                      : selectedGame.gameType === "rummy500"
                      ? "Rummy 500"
                      : "Rummy 1500"}
                  </Text>
                  <Text style={[styles.gameInfoDate, { color: colors.text }]}>
                    {new Date(selectedGame.createdAt).toLocaleDateString()} -{" "}
                    {new Date(selectedGame.createdAt).toLocaleTimeString()}
                  </Text>
                  {selectedGame.completedAt && (
                    <Text style={[styles.gameInfoDate, { color: colors.text }]}>
                      Finalizada:{" "}
                      {new Date(selectedGame.completedAt).toLocaleTimeString()}
                    </Text>
                  )}
                </View>

                {selectedGame.winner && (
                  <View
                    style={[
                      styles.winnerSection,
                      { backgroundColor: colors.success },
                    ]}>
                    <Ionicons name="trophy" size={24} color="white" />
                    <Text style={styles.winnerText}>
                      Ganador:{" "}
                      {
                        selectedGame.players.find(
                          (p) => p.id === selectedGame.winner
                        )?.name
                      }
                    </Text>
                  </View>
                )}

                {renderRoundScores()}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  gameCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  gameHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  gameDate: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  playersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  playerScore: {
    fontSize: 14,
  },
  continueContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  continueText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
  },
  detailsHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 4,
  },
  detailsText: {
    fontSize: 12,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  gameInfo: {
    marginBottom: 20,
  },
  gameInfoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  gameInfoDate: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  winnerSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  winnerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  roundsContainer: {
    marginTop: 10,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 2,
    borderBottomColor: "#e0e0e0",
    paddingVertical: 8,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  tableCell: {
    fontSize: 12,
    textAlign: "center",
  },
  playerColumn: {
    flex: 2,
    textAlign: "left",
  },
  roundColumn: {
    flex: 1,
  },
  totalColumn: {
    flex: 1,
  },
  totalScore: {
    fontWeight: "bold",
  },
  filterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    position: "relative",
  },
  filterButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  filterIndicator: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ff4444",
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  clearButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  filterPanel: {
    padding: 16,
    borderBottomWidth: 1,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  dateScrollContainer: {
    maxHeight: 80,
  },
  dateChipsContainer: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 16,
  },
  dateChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    minWidth: 80,
  },
  dateChipText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  dateChipYear: {
    fontSize: 12,
    opacity: 0.8,
  },
  noDataText: {
    fontSize: 14,
    opacity: 0.7,
    fontStyle: "italic",
  },
  playersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  playerChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  playerChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  summaryContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    opacity: 0.7,
  },
  datePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  datePickerButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    gap: 8,
  },
  datePickerText: {
    fontSize: 14,
    fontWeight: "500",
  },
  calendarModal: {
    flex: 1,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  calendarContent: {
    flex: 1,
    padding: 16,
  },
  monthSection: {
    marginBottom: 24,
  },
  monthHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "capitalize",
  },
  datesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  dateCard: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 2,
  },
  dateMonth: {
    fontSize: 12,
    opacity: 0.8,
    textTransform: "capitalize",
  },
  gameCountBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  gameCountText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  emptyCalendar: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyCalendarText: {
    fontSize: 16,
    marginTop: 16,
    opacity: 0.7,
  },
});
