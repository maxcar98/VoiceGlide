import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import PrimaryButton from "../components/PrimaryButton";

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={{ flex: 1 }}
    >
      {/* Solid top bar (samma som Play) */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: insets.top + 2,
          backgroundColor: "#0b1720",
          zIndex: 100,
          elevation: 100,
        }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Titel / logga */}
          <Text
            style={{
              color: "white",
              fontSize: 44,
              fontWeight: "900",
              letterSpacing: 0.6,
              textShadowColor: "rgba(0,0,0,0.9)",
              textShadowOffset: { width: 0, height: 3 },
              textShadowRadius: 6,
              marginBottom: 10,
              textAlign: "center",
            }}
          >
            Tappy not bird
          </Text>
          <Text
            style={{
              color: "white",
              opacity: 0.9,
              textAlign: "center",
              fontSize: 16,
              marginBottom: 28,
            }}
          >
            Tap to jump. Dodge pillars, win
          </Text>

          {/* Stor PLAY-knapp */}
          <PrimaryButton
            title="PLAY"
            onPress={() => navigation.navigate("Play")}
            style={{ width: "80%", marginBottom: 14, paddingVertical: 18 }}
            textStyle={{ fontSize: 20 }}
          />

          {/* Sekundär: View leaderboard – samma stil för konsekvens */}
          <PrimaryButton
            title="View leaderboard"
            onPress={() => navigation.navigate("Leaderboard")}
            style={{
              width: "80%",
              backgroundColor: "#22c55e",
              opacity: 0.95,
            }}
          />
        </View>

        {/* Liten footer */}
        <View style={{ alignItems: "center", marginBottom: 18 }}>
          <Text style={{ color: "white", opacity: 0.7 }}>
            v1 • Expo + React Native
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
