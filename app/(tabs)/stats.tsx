import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useGame } from "../../contexts/GameContext";

export default function StatsScreen() {
  const { state } = useGame();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const calculateStats = () => {
    const totalGames = state.games.length;
    const completedGames = state.games.filter((g) => !g.isActive);
    const activeGames = state.games.filter((g) => g.isActive);

    // Player stats
    const playerStats = new Map();

    state.games.forEach((game) => {
      game.players.forEach((player) => {
        if (!playerStats.has(player.name)) {
          playerStats.set(player.name, {
            name: player.name,
            gamesPlayed: 0,
            totalScore: 0,
            wins: 0,
            averageScore: 0,
          });
        }

        const stats = playerStats.get(player.name);
        stats.gamesPlayed++;
        stats.totalScore += player.totalScore;

        if (game.winner === player.id) {
          stats.wins++;
        }

        stats.averageScore = Math.round(stats.totalScore / stats.gamesPlayed);
      });
    });

    return {
      totalGames,
      completedGames: completedGames.length,
      activeGames: activeGames.length,
      playerStats: Array.from(playerStats.values()).sort(
        (a, b) => b.wins - a.wins
      ),
    };
  };

  const stats = calculateStats();

  const StatCard = ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: string | number;
    icon: string;
  }) => (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}>
      <Ionicons name={icon as any} size={24} color={colors.tint} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );

  if (state.games.length === 0) {
    return (
      <View
        style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="stats-chart-outline" size={64} color={colors.border} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No hay estadísticas
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.text }]}>
          Juega algunas partidas para ver tus estadísticas
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Resumen General
        </Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Partidas"
            value={stats.totalGames}
            icon="game-controller"
          />
          <StatCard
            title="Completadas"
            value={stats.completedGames}
            icon="checkmark-circle"
          />
          <StatCard
            title="En Progreso"
            value={stats.activeGames}
            icon="play-circle"
          />
          <StatCard
            title="Jugadores"
            value={stats.playerStats.length}
            icon="people"
          />
        </View>

        {stats.playerStats.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Estadísticas por Jugador
            </Text>
            {stats.playerStats.map((player, index) => (
              <View
                key={player.name}
                style={[
                  styles.playerCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}>
                <View style={styles.playerHeader}>
                  <Text style={[styles.playerName, { color: colors.text }]}>
                    {player.name}
                  </Text>
                  {index === 0 && (
                    <View
                      style={[
                        styles.crownBadge,
                        { backgroundColor: colors.warning },
                      ]}>
                      <Ionicons name="trophy" size={16} color="white" />
                    </View>
                  )}
                </View>

                <View style={styles.playerStatsRow}>
                  <View style={styles.playerStat}>
                    <Text
                      style={[styles.playerStatValue, { color: colors.text }]}>
                      {player.gamesPlayed}
                    </Text>
                    <Text
                      style={[styles.playerStatLabel, { color: colors.text }]}>
                      Partidas
                    </Text>
                  </View>

                  <View style={styles.playerStat}>
                    <Text
                      style={[styles.playerStatValue, { color: colors.text }]}>
                      {player.wins}
                    </Text>
                    <Text
                      style={[styles.playerStatLabel, { color: colors.text }]}>
                      Victorias
                    </Text>
                  </View>

                  <View style={styles.playerStat}>
                    <Text
                      style={[styles.playerStatValue, { color: colors.text }]}>
                      {player.gamesPlayed > 0
                        ? Math.round((player.wins / player.gamesPlayed) * 100)
                        : 0}
                      %
                    </Text>
                    <Text
                      style={[styles.playerStatLabel, { color: colors.text }]}>
                      Win Rate
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statTitle: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: "center",
  },
  playerCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  playerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  playerName: {
    fontSize: 18,
    fontWeight: "600",
  },
  crownBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  playerStatsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  playerStat: {
    alignItems: "center",
  },
  playerStatValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
  playerStatLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
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
});
