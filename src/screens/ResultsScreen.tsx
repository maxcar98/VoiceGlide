import React from "react";
import { Pressable, Text, View } from "react-native";

export default function ResultsScreen({ navigation, route }: any) {
  const score = route?.params?.score ?? 0;
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 22 }}>Game Over</Text>
      <Text>Poäng: {score}</Text>
      <Pressable
        onPress={() => navigation.replace("Play")}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: "#333",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff" }}>Spela igen</Text>
      </Pressable>
    </View>
  );
}
