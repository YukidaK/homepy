// Tela 3 — Lista (CRUD) genérica. Carrega registros da API, permite buscar,
// criar (Novo), editar, excluir e, no caso de Dispositivos, ligar/desligar o LED.
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { ENTITIES } from "../entities/config";
import { apiDelete, apiGet, apiPost } from "../api/client";
import { PrimaryButton, StatusBadge } from "../components/ui";
import { colors, radius } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "EntityList">;
type Row = Record<string, any>;

export default function EntityListScreen({ route, navigation }: Props) {
  const cfg = ENTITIES[route.params.entity];
  const [rows, setRows] = useState<Row[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [ledBusy, setLedBusy] = useState<number | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGet<Row[]>(cfg.endpoint);
      setRows(data);
    } catch (e: any) {
      Alert.alert("Erro", e?.message ?? "Não foi possível carregar.");
    } finally {
      setLoading(false);
    }
  }, [cfg.endpoint]);

  // Recarrega sempre que a tela volta ao foco (ex.: depois de salvar no formulário)
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  function confirmarExcluir(row: Row) {
    Alert.alert("Excluir", `Deseja excluir "${row[cfg.nameField]}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await apiDelete(`${cfg.endpoint}/${row[cfg.pk]}`);
            carregar();
          } catch (e: any) {
            Alert.alert("Erro", e?.message ?? "Não foi possível excluir.");
          }
        },
      },
    ]);
  }

  async function alternarLed(row: Row, ligar: boolean) {
    setLedBusy(row[cfg.pk]);
    try {
      await apiPost(`${cfg.endpoint}/${row[cfg.pk]}/led`, { on: ligar });
      carregar();
    } catch (e: any) {
      Alert.alert("Erro", e?.message ?? "Não foi possível acionar o LED.");
    } finally {
      setLedBusy(null);
    }
  }

  const termo = busca.trim().toLowerCase();
  const visiveis = termo
    ? rows.filter((r) => String(r[cfg.nameField] ?? "").toLowerCase().includes(termo))
    : rows;

  function renderItem({ item }: { item: Row }) {
    const ativo = String(item[cfg.statusField ?? ""] ?? "").toLowerCase() === "ativo";
    return (
      <View style={styles.row}>
        <Text style={styles.id}>{item[cfg.pk]}</Text>
        <View style={styles.info}>
          <Text style={styles.nome}>{item[cfg.nameField]}</Text>
          {cfg.statusField && <StatusBadge status={item[cfg.statusField]} />}
        </View>

        {cfg.hasLed &&
          (ledBusy === item[cfg.pk] ? (
            <ActivityIndicator color={colors.yellow} style={styles.ledSlot} />
          ) : (
            <View style={styles.ledSlot}>
              <Text style={styles.ledLabel}>LED</Text>
              <Switch value={ativo} onValueChange={(v) => alternarLed(item, v)} />
            </View>
          ))}

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("EntityForm", { entity: route.params.entity, id: item[cfg.pk] })
            }
          >
            <Ionicons name="create-outline" size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmarExcluir(item)}>
            <Ionicons name="trash-outline" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder={`Buscar ${cfg.title.toLowerCase()}...`}
        placeholderTextColor={colors.textMuted}
        value={busca}
        onChangeText={setBusca}
      />

      <PrimaryButton
        label={`+ Novo ${cfg.singular}`}
        color={colors.green}
        textColor={colors.onPrimary}
        onPress={() => navigation.navigate("EntityForm", { entity: route.params.entity })}
        style={{ marginBottom: 12 }}
      />

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={visiveis}
          keyExtractor={(item) => String(item[cfg.pk])}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum registro encontrado.</Text>}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16 },
  search: {
    backgroundColor: colors.inputBg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    gap: 10,
  },
  id: { color: colors.textMuted, width: 28, fontWeight: "700" },
  info: { flex: 1, gap: 6 },
  nome: { color: colors.text, fontSize: 16, fontWeight: "500" },
  ledSlot: { alignItems: "center", width: 52 },
  ledLabel: { color: colors.textMuted, fontSize: 10, marginBottom: 2 },
  actions: { flexDirection: "row", gap: 12 },
  edit: { fontSize: 20 },
  delete: { fontSize: 20 },
  empty: { color: colors.textMuted, textAlign: "center", marginTop: 32 },
});
