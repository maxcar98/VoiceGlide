import React from "react";
import { Dimensions, View } from "react-native";

export type Obstacle = {
  id: string;
  x: number; // vänsterkant
  gapY: number; // mitten på gapet
  width: number;
  gap: number; // gap-höjd
};

type Props = {
  items: Obstacle[];
};

export default function Obstacles({ items }: Props) {
  const H = Dimensions.get("window").height;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
      }}
    >
      {items.map((o) => {
        const topHeight = Math.max(0, o.gapY - o.gap / 2);
        const bottomTop = Math.min(H, o.gapY + o.gap / 2);
        const bottomHeight = Math.max(0, H - bottomTop);

        const pillarStyle = {
          position: "absolute" as const,
          width: o.width,
          backgroundColor: "#111827",
          borderColor: "#4ade80",
          borderWidth: 2,
          shadowColor: "#000",
          shadowOpacity: 0.35,
          shadowRadius: 6,
          elevation: 4,
        };

        return (
          <React.Fragment key={o.id}>
            {/* Övre stolpen */}
            <View
              style={[
                pillarStyle,
                {
                  left: o.x,
                  top: 0,
                  height: topHeight,
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10,
                },
              ]}
            />
            {/* Nedre stolpen */}
            <View
              style={[
                pillarStyle,
                {
                  left: o.x,
                  top: bottomTop,
                  height: bottomHeight,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                },
              ]}
            />
          </React.Fragment>
        );
      })}
    </View>
  );
}
