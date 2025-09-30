// src/screens/PlayScreen.tsx
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import Player from "../components/Player";

export default function PlayScreen() {
  useKeepAwake();

  const H = Dimensions.get("window").height;
  const W = Dimensions.get("window").width;

  // position + hastighet
  const [y, setY] = useState(H * 0.5);
  const yRef = useRef(y);
  useEffect(() => {
    yRef.current = y;
  }, [y]);
  const vyRef = useRef(0);

  // hopptick för att trigga liten “pop”-animation
  const [jumpTick, setJumpTick] = useState(0);

  // Känsla (justera fritt)
  const GRAVITY = 0.75; // större = faller snabbare
  const JUMP_VELOCITY = -11.5; // fast impuls, varje tap reset:ar till detta
  const FLOOR = H - 6;
  const CEIL = 6;
  const PLAYER_X = Math.min(100, W * 0.25); // lite in från vänster

  // Tap → hopp (RESET, inte additiv stapling)
  const onTap = async () => {
    vyRef.current = JUMP_VELOCITY; // <-- reset, inte +=
    setJumpTick((t) => t + 1);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  };

  // Spelloop
  useEffect(() => {
    let raf = 0;

    const tick = () => {
      // fysik
      vyRef.current += GRAVITY;
      let nextY = yRef.current + vyRef.current;

      // clamp tak/golv
      if (nextY < CEIL) {
        nextY = CEIL;
        vyRef.current = 0;
      }
      if (nextY > FLOOR) {
        nextY = FLOOR;
        vyRef.current = 0;
      }

      yRef.current = nextY;
      setY(nextY);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [H]);

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={{ flex: 1 }}
    >
      {/* onPressIn → snabbare respons än onPress */}
      <Pressable onPressIn={onTap} style={{ flex: 1 }}>
        {/* HUD */}
        <Text
          style={{ color: "white", position: "absolute", top: 60, left: 90 }}
        >
          Tryck var som helst för att hoppa
        </Text>

        <View style={{ flex: 1 }}>
          <Player x={PLAYER_X} y={y} jumpTick={jumpTick} />
        </View>
      </Pressable>
    </LinearGradient>
  );
}
