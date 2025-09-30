import React from "react";
import { Pressable, Text, View } from "react-native";

export default function HomeScreen({ navigation }: any) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 26 }}>VoiceGlide</Text>
      <Pressable
        onPress={() => navigation.navigate("Play")}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: "#333",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "#fff" }}>Starta spelet</Text>
      </Pressable>
    </View>
  );
}
