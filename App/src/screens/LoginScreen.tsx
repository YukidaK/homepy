// Tela 1 — Login. Autentica na API e entra no app.
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { FormField, PrimaryButton } from "../components/ui";
import { colors } from "../theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@casa.com");
  const [senha, setSenha] = useState("123456");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      await login(email.trim(), senha);
    } catch (e: any) {
      Alert.alert("Não foi possível entrar", e?.message ?? "Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.logoWrap}>
        <Ionicons name="home" size={64} color={colors.text} />
      </View>
      <Text style={styles.title}>Bem-vindo!</Text>
      <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>

      <View style={styles.form}>
        <FormField
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="seu@email.com"
        />
        <FormField
          label="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          placeholder="••••••"
        />

        <TouchableOpacity onPress={() => Alert.alert("Recuperação", "Procure o administrador do sistema.")}>
          <Text style={styles.forgot}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <PrimaryButton
          label="Entrar"
          onPress={handleLogin}
          loading={loading}
          textColor={colors.onPrimary}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    padding: 28,
    gap: 8,
  },
  logoWrap: { alignItems: "center", marginBottom: 8 },
  logo: { fontSize: 64 },
  title: { fontSize: 30, fontWeight: "bold", color: colors.text, textAlign: "center" },
  subtitle: { fontSize: 15, color: colors.textMuted, textAlign: "center", marginBottom: 16 },
  form: { gap: 16 },
  forgot: { color: colors.primary, textAlign: "right", fontSize: 13 },
});
