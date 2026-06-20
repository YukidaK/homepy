// Tela 2 — Menu. Lista os itens navegáveis + Sair (logout).
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import type { EntityKey } from "../entities/config";
import { useAuth } from "../context/AuthContext";
import { colors, radius } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Menu">;

type IconName = keyof typeof Ionicons.glyphMap;
type Item =
  | { icon: IconName; label: string; entity: EntityKey }
  | { icon: IconName; label: string; route: "Grupo" | "Controle" }
  | { icon: IconName; label: string; action: "logout" };

const ITEMS: Item[] = [
  { icon: "bulb-outline", label: "Controle", route: "Controle" },
  { icon: "hardware-chip-outline", label: "Dispositivos", entity: "dispositivos" },
  { icon: "home-outline", label: "Casas", entity: "casas" },
  { icon: "people-outline", label: "Clientes", entity: "clientes" },
  { icon: "person-outline", label: "Usuários", entity: "usuarios" },
  { icon: "school-outline", label: "Grupo", route: "Grupo" },
  { icon: "log-out-outline", label: "Sair", action: "logout" },
];

export default function MenuScreen({ navigation }: Props) {
  const { usuario, logout } = useAuth();

  function handlePress(item: Item) {
    if ("entity" in item) navigation.navigate("EntityList", { entity: item.entity });
    else if ("route" in item) navigation.navigate(item.route);
    else logout();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.hello}>Menu</Text>
        <Text style={styles.user}>Olá, {usuario?.nome ?? "usuário"}</Text>
      </View>

      {ITEMS.map((item) => (
        <TouchableOpacity key={item.label} style={styles.row} onPress={() => handlePress(item)}>
          <Ionicons name={item.icon} size={22} color={colors.text} style={styles.icon} />
          <Text style={styles.rowLabel}>{item.label}</Text>
          <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.bg, padding: 20, gap: 12, flexGrow: 1 },
  header: { marginBottom: 8 },
  hello: { fontSize: 26, fontWeight: "bold", color: colors.text },
  user: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 18,
    gap: 14,
  },
  icon: { fontSize: 22 },
  rowLabel: { flex: 1, color: colors.text, fontSize: 17, fontWeight: "500" },
  chevron: { color: colors.textMuted, fontSize: 24 },
});
