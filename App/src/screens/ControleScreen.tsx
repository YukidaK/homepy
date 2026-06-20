import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PICO_URL } from "../config";
import { colors, radius } from "../theme";

async function pico(endpoint: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${PICO_URL}/${endpoint}`, { signal: controller.signal });
    return await res.json() as { led: string; door: string };
  } catch {
    throw new Error("Sem conexão com o Pico W");
  } finally {
    clearTimeout(timeout);
  }
}

export default function ControleScreen() {
  const [ledOn, setLedOn] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [loadingLed, setLoadingLed] = useState(false);
  const [loadingDoor, setLoadingDoor] = useState(false);

  async function toggleLed() {
    setLoadingLed(true);
    try {
      const estado = await pico(ledOn ? "led/off" : "led/on");
      setLedOn(estado.led === "on");
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    } finally {
      setLoadingLed(false);
    }
  }

  async function toggleDoor() {
    setLoadingDoor(true);
    try {
      const estado = await pico(doorOpen ? "door/close" : "door/open");
      setDoorOpen(estado.door === "open");
    } catch (e: any) {
      Alert.alert("Erro", e.message);
    } finally {
      setLoadingDoor(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💡 LED</Text>
        <View style={[styles.indicator, ledOn ? styles.indicatorOn : styles.indicatorOff]} />
        <Text style={styles.status}>{ledOn ? "Ligado" : "Desligado"}</Text>
        <TouchableOpacity
          style={[styles.btn, ledOn ? styles.btnRed : styles.btnGreen, loadingLed && styles.btnDisabled]}
          onPress={toggleLed}
          disabled={loadingLed}
        >
          {loadingLed
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>{ledOn ? "Desligar" : "Ligar"}</Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🪟 Cortina</Text>
        <View style={[styles.cortina, doorOpen ? styles.cortinaAberta : styles.cortinaFechada]} />
        <Text style={styles.status}>{doorOpen ? "Aberta" : "Fechada"}</Text>
        <TouchableOpacity
          style={[styles.btn, doorOpen ? styles.btnRed : styles.btnBlue, loadingDoor && styles.btnDisabled]}
          onPress={toggleDoor}
          disabled={loadingDoor}
        >
          {loadingDoor
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>{doorOpen ? "Fechar" : "Abrir"}</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    padding: 24,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 24,
    alignItems: "center",
    width: "100%",
    gap: 12,
  },
  cardTitle: { fontSize: 20, fontWeight: "600", color: colors.text },
  indicator: { width: 70, height: 70, borderRadius: 35 },
  indicatorOn: { backgroundColor: "#FFD700" },
  indicatorOff: { backgroundColor: "#444" },
  cortina: { width: 50, height: 70, borderRadius: 6 },
  cortinaAberta: { backgroundColor: "#27ae60" },
  cortinaFechada: { backgroundColor: "#c0392b" },
  status: { fontSize: 16, color: colors.textMuted },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: radius.md,
    minWidth: 160,
    alignItems: "center",
  },
  btnGreen: { backgroundColor: "#27ae60" },
  btnRed: { backgroundColor: "#c0392b" },
  btnBlue: { backgroundColor: "#2980b9" },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
