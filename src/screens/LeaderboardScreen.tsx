// src/screens/LeaderboardScreen.tsx
import { useRoute } from "@react-navigation/native";
import React, { useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useScores } from "../context/ScoresContext";

export default function LeaderboardScreen() {
  const { scores } = useScores();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const highlightId: string | null = route.params?.highlightId ?? null;

  const data = useMemo(() => scores, [scores]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#0b1720", paddingTop: insets.top }}
    >
      <Text
        style={{
          color: "white",
          fontSize: 28,
          fontWeight: "800",
          textAlign: "center",
          marginVertical: 12,
        }}
      >
        Leaderboard (Top 10)
      </Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={({ item, index }) => {
          const highlight = item.id === highlightId;
          return (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
                paddingHorizontal: 12,
                marginBottom: 8,
                borderRadius: 8,
                backgroundColor: highlight ? "#22c55e" : "#111827",
                borderWidth: 1,
                borderColor: highlight ? "#16a34a" : "#1f2937",
              }}
            >
              <Text
                style={{
                  width: 28,
                  color: highlight ? "black" : "white",
                  fontWeight: "800",
                }}
              >
                {index + 1}.
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: highlight ? "black" : "white",
                  fontWeight: "700",
                }}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              <Text
                style={{
                  color: highlight ? "black" : "white",
                  fontWeight: "800",
                }}
              >
                {item.score}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text
            style={{
              color: "white",
              textAlign: "center",
              marginTop: 20,
              opacity: 0.8,
            }}
          >
            No scores yet — play a round!
          </Text>
        }
      />
    </SafeAreaView>
  );
}
