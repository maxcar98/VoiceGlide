import React from "react";
import { View } from "react-native";

export default function Player({ x, y }: { x: number; y: number }) {
  return (
    <View
      style={{
        position: "absolute",
        left: x - 16,
        top: y - 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "gold",
      }}
    />
  );
}
