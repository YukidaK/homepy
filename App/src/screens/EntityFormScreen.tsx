// Tela 5 — Formulário (CRUD) genérico. Cria ou edita um registro conforme a
// configuração da entidade. Salvar -> POST/PUT; Cancelar -> volta.
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { ENTITIES, type FieldConfig } from "../entities/config";
import { apiGet, apiPost, apiPut } from "../api/client";
import { FormField, PrimaryButton } from "../components/ui";
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "EntityForm">;
type FormState = Record<string, string>;

export default function EntityFormScreen({ route, navigation }: Props) {
  const cfg = ENTITIES[route.params.entity];
  const editId = route.params.id;
  const editando = editId !== undefined;

  const [form, setForm] = useState<FormState>({});
  const [loading, setLoading] = useState(editando);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: editando ? `Editar ${cfg.singular}` : `Novo ${cfg.singular}` });
  }, [editando, cfg.singular, navigation]);

  // Carrega os dados quando estiver editando
  useEffect(() => {
    if (!editando) return;
    (async () => {
      try {
        const data = await apiGet<Record<string, any>>(`${cfg.endpoint}/${editId}`);
        const next: FormState = {};
        for (const f of cfg.fields) {
          next[f.key] = data[f.key] != null ? String(data[f.key]) : "";
        }
        setForm(next);
      } catch (e: any) {
        Alert.alert("Erro", e?.message ?? "Não foi possível carregar.");
      } finally {
        setLoading(false);
      }
    })();
  }, [editando, editId, cfg]);

  function setField(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function salvar() {
    if (!form[cfg.nameField]?.trim()) {
      Alert.alert("Atenção", "Preencha o nome.");
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      for (const f of cfg.fields) {
        const v = form[f.key];
        if (v === undefined || v === "") continue;
        payload[f.key] = f.kind === "number" ? Number(v) : v;
      }
      if (editando) await apiPut(`${cfg.endpoint}/${editId}`, payload);
      else await apiPost(cfg.endpoint, payload);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Erro", e?.message ?? "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  function renderField(f: FieldConfig) {
    if (f.kind === "status") {
      const ativo = (form[f.key] ?? "").toLowerCase() === "ativo";
      return (
        <View key={f.key} style={styles.statusRow}>
          <Text style={styles.statusLabel}>{f.label}</Text>
          <View style={styles.statusControl}>
            <Text style={styles.statusValue}>{ativo ? "Ativo" : "Inativo"}</Text>
            <Switch value={ativo} onValueChange={(v) => setField(f.key, v ? "Ativo" : "Inativo")} />
          </View>
        </View>
      );
    }
    return (
      <FormField
        key={f.key}
        label={f.label}
        value={form[f.key] ?? ""}
        onChangeText={(t) => setField(f.key, t)}
        secureTextEntry={f.kind === "password"}
        autoCapitalize={f.kind === "email" ? "none" : "sentences"}
        keyboardType={
          f.kind === "email"
            ? "email-address"
            : f.kind === "number"
            ? "numeric"
            : f.kind === "phone"
            ? "phone-pad"
            : "default"
        }
      />
    );
  }

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <Text style={styles.loading}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {cfg.fields.map(renderField)}

      <PrimaryButton label="Salvar" color={colors.green} onPress={salvar} loading={saving} />
      <PrimaryButton
        label="Cancelar"
        color={colors.red}
        textColor={colors.text}
        onPress={() => navigation.goBack()}
        disabled={saving}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 16 },
  loading: { color: colors.textMuted, textAlign: "center" },
  statusRow: { gap: 6 },
  statusLabel: { color: colors.textMuted, fontSize: 13 },
  statusControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statusValue: { color: colors.text, fontSize: 15 },
});
