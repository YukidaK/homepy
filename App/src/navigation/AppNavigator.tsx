// Navegação principal (native-stack): deslogado vê só Login; logado vê o restante.
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./types";
import { useAuth } from "../context/AuthContext";
import { ENTITIES } from "../entities/config";
import { colors } from "../theme";
import LoginScreen from "../screens/LoginScreen";
import MenuScreen from "../screens/MenuScreen";
import GrupoScreen from "../screens/GrupoScreen";
import EntityListScreen from "../screens/EntityListScreen";
import EntityFormScreen from "../screens/EntityFormScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { usuario } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      {!usuario ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : (
        <>
          <Stack.Screen name="Menu" component={MenuScreen} options={{ title: "Casa Automática" }} />
          <Stack.Screen
            name="EntityList"
            component={EntityListScreen}
            options={({ route }) => ({ title: ENTITIES[route.params.entity].title })}
          />
          <Stack.Screen name="EntityForm" component={EntityFormScreen} options={{ title: "Formulário" }} />
          <Stack.Screen name="Grupo" component={GrupoScreen} options={{ title: "Grupo" }} />
        </>
      )}
    </Stack.Navigator>
  );
}
