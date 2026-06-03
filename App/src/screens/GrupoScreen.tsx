// Tela 4 — Grupo. Lista RA + Nome Completo dos integrantes.
// PREENCHA com os dados reais do seu grupo (mesmo grupo de Sistemas Embarcados).
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "../components/ui";
import { colors } from "../theme";

type Integrante = { ra: string; nome: string };

const INTEGRANTES: Integrante[] = [
  { ra: "52725", nome: "Vinicius Silveira Campos" },
  { ra: "52168", nome: "Rogério Tiritan Marcone" },
  { ra: "52772", nome: "Felipe Inacio de Paula" },
  { ra: "52418", nome: "Matheus Yuuki Okida Kamiya" },
  { ra: "52668", nome: "Reuel Vitor Lanzetti" },
];

export default function GrupoScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Grupo</Text>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.cell, styles.ra, styles.headerText]}>RA</Text>
          <Text style={[styles.cell, styles.nome, styles.headerText]}>Nome Completo</Text>
        </View>
        {INTEGRANTES.map((i, idx) => (
          <View
            key={idx}
            style={[styles.row, idx % 2 === 1 && { backgroundColor: colors.cardAlt }]}
          >
            <Text style={[styles.cell, styles.ra]}>{i.ra}</Text>
            <Text style={[styles.cell, styles.nome]}>{i.nome}</Text>
          </View>
        ))}
      </Card>

      <Text style={styles.total}>Total de alunos: {INTEGRANTES.length}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.bg, padding: 20, gap: 16, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: "bold", color: colors.text },
  row: { flexDirection: "row", paddingVertical: 14, paddingHorizontal: 14 },
  headerRow: { backgroundColor: colors.cardAlt },
  headerText: { fontWeight: "700", color: colors.text },
  cell: { color: colors.text, fontSize: 15 },
  ra: { width: 90 },
  nome: { flex: 1 },
  total: { color: colors.textMuted, fontSize: 14, textAlign: "right" },
});
