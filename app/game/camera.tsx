import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useGame } from "../../contexts/GameContext";
import { OpenAIService } from "../../services/openai";

export default function CameraScreen() {
  const { updateScore, state } = useGame();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const cameraRef = useRef<CameraView>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsAnalyzing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
        shutterSound: false,
      });

      if (photo?.base64) {
        const imageUri = `data:image/jpeg;base64,${photo.base64}`;
        const result = await OpenAIService.analyzeCards(imageUri);

        if (result.error) {
          Alert.alert("Error", result.error);
        } else if (result.totalPoints > 0) {
          Alert.alert(
            "Cartas Detectadas",
            `Se detectaron ${result.totalPoints} puntos. ¿A qué jugador agregar estos puntos?`,
            [
              { text: "Cancelar", style: "cancel" },
              ...(state.currentGame?.players.map((player) => ({
                text: player.name,
                onPress: () => {
                  updateScore(player.id, result.totalPoints);
                  router.back();
                },
              })) || []),
            ]
          );
        } else {
          Alert.alert(
            "No se detectaron cartas",
            "Intenta tomar otra foto con mejor iluminación."
          );
        }
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "No se pudo capturar la imagen.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!permission) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.text, { color: colors.text }]}>
          Solicitando permisos de cámara...
        </Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: colors.background },
        ]}>
        <Ionicons name="camera" size={64} color={colors.border} />
        <Text style={[styles.text, { color: colors.text }]}>
          No hay acceso a la cámara
        </Text>
        <Text style={[styles.subtext, { color: colors.text }]}>
          Necesitamos permisos de cámara para escanear las cartas
        </Text>
        <TouchableOpacity
          style={[styles.permissionButton, { backgroundColor: colors.tint }]}
          onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Dar Permisos</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back" ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={styles.topOverlay}>
            <Text style={styles.instructionText}>
              Enfoca las cartas y presiona el botón para escanear
            </Text>
          </View>

          <View style={styles.scanArea} />

          <View style={styles.bottomOverlay}>
            <TouchableOpacity
              style={[
                styles.captureButton,
                {
                  backgroundColor: colors.tint,
                  opacity: isAnalyzing ? 0.5 : 1,
                },
              ]}
              onPress={takePicture}
              disabled={isAnalyzing}>
              {isAnalyzing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Ionicons name="camera" size={32} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 16,
  },
  subtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    opacity: 0.7,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  topOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  instructionText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
  scanArea: {
    height: 200,
    marginHorizontal: 40,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 12,
    backgroundColor: "transparent",
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  permissionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
