// Banner fixo no topo, visível só quando o app está em MODO OFFLINE (sem banco).
// Deixa explícito que os dados são locais/temporários e NÃO vêm do banco de dados.
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useOffline } from "../offline/state";

export default function OfflineBanner() {
  const offline = useOffline();
  const insets = useSafeAreaInsets();
  if (!offline) return null;

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8 }]}>
      <Ionicons name="cloud-offline-outline" size={16} color="#000" />
      <Text style={styles.text}>
        MODO DEMONSTRAÇÃO — sem conexão com o banco de dados (dados locais, não salvos)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  text: { color: "#000000", fontSize: 12, fontWeight: "700", flex: 1 },
});
