import React, { useEffect, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";

type Props = {
  visible: boolean;
  score: number;
  onCancel: () => void;
  onSubmit: (name: string) => void;
};

export default function NamePrompt({
  visible,
  score,
  onCancel,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (visible) setName("");
  }, [visible]);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: "80%",
            backgroundColor: "#0f172a",
            borderRadius: 10,
            padding: 16,
            borderWidth: 1,
            borderColor: "#22c55e",
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 8,
            }}
          >
            New high score: {score}
          </Text>
          <Text style={{ color: "white", marginBottom: 8 }}>
            Enter your name:
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#94a3b8"
            style={{
              color: "white",
              borderWidth: 1,
              borderColor: "#334155",
              borderRadius: 6,
              paddingHorizontal: 10,
              paddingVertical: 8,
              marginBottom: 12,
            }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            <Pressable onPress={onCancel} style={{ padding: 8 }}>
              <Text style={{ color: "white" }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => onSubmit(name)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: "#22c55e",
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "black", fontWeight: "800" }}>Save</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
