import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { GameProvider } from "../contexts/GameContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <GameProvider>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: Colors[colorScheme ?? "light"].background,
            },
            headerTintColor: Colors[colorScheme ?? "light"].text,
            headerTitleStyle: {
              fontWeight: "600",
            },
          }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="game/setup"
            options={{
              title: "Configurar Jugadores",
              presentation: "modal",
              headerBackTitle: "Cancelar",
            }}
          />
          <Stack.Screen
            name="game/[id]"
            options={{
              title: "Partida",
              headerBackTitle: "Inicio",
            }}
          />
          <Stack.Screen
            name="game/camera"
            options={{
              title: "Escanear Cartas",
              presentation: "modal",
              headerBackTitle: "Cancelar",
            }}
          />
          <Stack.Screen
            name="+not-found"
            options={{
              title: "Página no encontrada",
            }}
          />
        </Stack>
      </GameProvider>
    </SafeAreaProvider>
  );
}
