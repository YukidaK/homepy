// Componentes de UI reutilizáveis (botão, campo de formulário, badge de status, card).
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { colors, radius } from "../theme";

type ButtonProps = {
  label: string;
  onPress: () => void;
  color?: string;
  textColor?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  onPress,
  color = colors.primary,
  textColor = colors.onPrimary,
  loading,
  disabled,
  style,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }, (loading || disabled) && styles.disabled, style]}
      onPress={onPress}
      disabled={loading || disabled}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

type FieldProps = TextInputProps & { label: string };

export function FormField({ label, ...rest }: FieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        {...rest}
      />
    </View>
  );
}

export function StatusBadge({ status }: { status?: string }) {
  const ativo = (status || "").toLowerCase() === "ativo";
  return (
    <View
      style={[
        styles.badge,
        ativo
          ? { backgroundColor: "#ffffff" }
          : { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.badgeText, { color: ativo ? "#000000" : colors.textMuted }]}>
        {status || "—"}
      </Text>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: { opacity: 0.6 },
  buttonText: { fontSize: 16, fontWeight: "600" },
  fieldWrap: { gap: 6 },
  fieldLabel: { color: colors.textMuted, fontSize: 13 },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 12, fontWeight: "700" },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
  },
});
