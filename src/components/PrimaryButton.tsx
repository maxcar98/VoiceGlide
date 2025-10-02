import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, Text, TextStyle, ViewStyle } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function PrimaryButton({
  title,
  onPress,
  style,
  textStyle,
}: Props) {
  return (
    <Pressable
      onPress={async () => {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}
        onPress();
      }}
      style={({ pressed }) => [
        {
          backgroundColor: "#22c55e",
          borderRadius: 10,
          paddingVertical: 14,
          paddingHorizontal: 20,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale: pressed ? 0.98 : 1 }],
          shadowColor: "#000",
          shadowOpacity: 0.35,
          shadowRadius: 8,
          elevation: 6,
        },
        style,
      ]}
    >
      <Text
        style={[
          {
            color: "black",
            fontWeight: "800",
            fontSize: 18,
            letterSpacing: 0.3,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
