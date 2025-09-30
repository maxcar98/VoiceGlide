import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import Player from "../components/Player";

export default function PlayScreen() {
  const H = Dimensions.get("window").height;
  const [targetY, setTargetY] = useState(H * 0.5);
  const [y, setY] = useState(H * 0.5);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const next = y + (targetY - y) * 0.2 + 0.2;
      const clamped = Math.max(0, Math.min(H, next));
      setY(clamped);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [y, targetY, H]);

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={{ flex: 1 }}
    >
      <Text style={{ color: "white", position: "absolute", top: 40, left: 20 }}>
        Teststyrning med slider (mic kommer sen)
      </Text>

      <View style={{ flex: 1 }}>
        <Player x={80} y={y} />
      </View>

      <View style={{ padding: 16 }}>
        <Slider
          minimumValue={0}
          maximumValue={1}
          value={0.5}
          onValueChange={(v) => setTargetY(H * (1 - v))}
        />
      </View>
    </LinearGradient>
  );
}
