import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";

type Props = {
  x: number;
  y: number;
  jumpTick: number;
  size?: number;
  style?: ViewStyle;
};

export default function Player({ x, y, jumpTick, size = 32, style }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.15,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [jumpTick, scale]);

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "gold",
          transform: [{ scale }],
          shadowColor: "#000",
          shadowOpacity: 0.25,
          shadowRadius: 6,
          elevation: 3,
        },
        style,
      ]}
    />
  );
}
