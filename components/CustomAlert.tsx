import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Colors } from "../constants/Colors";

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons: Array<{
    text: string;
    onPress: () => void;
    style?: "default" | "cancel" | "destructive";
  }>;
  onClose: () => void;
  icon?: string;
}

export function CustomAlert({
  visible,
  title,
  message,
  buttons,
  onClose,
  icon,
}: CustomAlertProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const getButtonStyle = (style?: string) => {
    switch (style) {
      case "destructive":
        return { backgroundColor: colors.error };
      case "cancel":
        return { backgroundColor: colors.border };
      default:
        return { backgroundColor: colors.tint };
    }
  };

  const getButtonTextColor = (style?: string) => {
    return style === "cancel" ? colors.text : "white";
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.alertContainer, { backgroundColor: colors.card }]}>
          {icon && (
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: colors.tint + "15" },
              ]}>
              <Ionicons name={icon as any} size={32} color={colors.tint} />
            </View>
          )}

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.text }]}>
            {message}
          </Text>

          <View style={styles.buttonsContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  getButtonStyle(button.style),
                  buttons.length === 1 && styles.singleButton,
                ]}
                onPress={() => {
                  button.onPress();
                  onClose();
                }}>
                <Text
                  style={[
                    styles.buttonText,
                    { color: getButtonTextColor(button.style) },
                  ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  alertContainer: {
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.8,
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonsContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  singleButton: {
    minWidth: 120,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
