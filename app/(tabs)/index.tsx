import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CustomAlert } from "../../components/CustomAlert";
import { Colors } from "../../constants/Colors";
import { useGame } from "../../contexts/GameContext";
import { StorageService } from "../../services/storage";

export default function HomeScreen() {
  const { state, loadGames } = useGame();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [showNoActiveGameAlert, setShowNoActiveGameAlert] = useState(false);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      console.log("Loading stored games...");
      const games = await StorageService.loadGames();
      console.log("Loaded games:", games.length);
      loadGames(games);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleNewGame = () => {
    router.push("/game/setup");
  };

  const handleContinueGame = () => {
    const activeGame = state.games.find((game) => game.isActive);
    if (activeGame) {
      router.push(`/game/${activeGame.id}` as any);
    } else {
      setShowNoActiveGameAlert(true);
    }
  };

  const hasActiveGame = state.games.some((game) => game.isActive);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["bottom"]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>RummyScore</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Contador de puntos para Rummy
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            { backgroundColor: colors.tint },
          ]}
          onPress={handleNewGame}>
          <Ionicons name="add-circle-outline" size={24} color="white" />
          <Text style={styles.buttonText}>Nueva Partida</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.secondaryButton,
            {
              backgroundColor: hasActiveGame ? colors.secondary : colors.border,
              borderColor: colors.border,
            },
          ]}
          onPress={handleContinueGame}
          disabled={!hasActiveGame}>
          <Ionicons
            name="play-circle-outline"
            size={24}
            color={hasActiveGame ? "white" : colors.text}
          />
          <Text
            style={[
              styles.buttonText,
              { color: hasActiveGame ? "white" : colors.text },
            ]}>
            Continuar Partida
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <Text style={[styles.statsText, { color: colors.text }]}>
          Partidas jugadas: {state.games.length}
        </Text>
        <Text style={[styles.statsText, { color: colors.text }]}>
          Partidas activas: {state.games.filter((g) => g.isActive).length}
        </Text>
      </View>

      <CustomAlert
        visible={showNoActiveGameAlert}
        title="No hay partidas activas"
        message="Inicia una nueva partida para continuar."
        icon="information-circle-outline"
        buttons={[
          {
            text: "OK",
            style: "default",
            onPress: () => setShowNoActiveGameAlert(false),
          },
        ]}
        onClose={() => setShowNoActiveGameAlert(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 40,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  primaryButton: {
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  secondaryButton: {
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  statsContainer: {
    alignItems: "center",
    gap: 8,
  },
  statsText: {
    fontSize: 14,
    opacity: 0.7,
  },
});
