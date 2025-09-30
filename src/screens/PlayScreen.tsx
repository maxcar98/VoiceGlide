import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import Obstacles, { Obstacle } from "../components/Obstacles";
import Player from "../components/Player";

export default function PlayScreen() {
  useKeepAwake();

  const H = Dimensions.get("window").height;
  const W = Dimensions.get("window").width;

  // --- Spelare ---
  const [y, setY] = useState(H * 0.5);
  const yRef = useRef(y);
  useEffect(() => {
    yRef.current = y;
  }, [y]);
  const vyRef = useRef(0);

  const [jumpTick, setJumpTick] = useState(0);

  const GRAVITY = 0.75;
  const JUMP_VELOCITY = -11.5;
  const FLOOR = H - 6;
  const CEIL = 6;
  const PLAYER_X = Math.min(100, W * 0.25);

  const onTap = async () => {
    vyRef.current = JUMP_VELOCITY;
    setJumpTick((t) => t + 1);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  };

  // --- Hinder ---
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const obsRef = useRef<Obstacle[]>([]);
  useEffect(() => {
    obsRef.current = obstacles;
  }, [obstacles]);

  // Konstanter för hinder
  const OBSTACLE_WIDTH = Math.max(48, Math.floor(W * 0.12));
  const GAP = Math.max(120, Math.floor(H * 0.24)); // öppningens höjd
  const SPEED = Math.max(2.6, W * 0.0045); // px per frame
  const SPAWN_MS = 1600; // spawn-intervall

  //töm hinder vid inladdning
  useEffect(() => {
    setObstacles([]);
  }, []);

  // Spawn-timer
  useEffect(() => {
    const spawn = () => {
      const marginTop = 60;
      const marginBottom = 60;
      const minY = marginTop + GAP / 2;
      const maxY = H - marginBottom - GAP / 2;
      const gapY = rand(minY, maxY);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      setObstacles((prev) => [
        ...prev,
        {
          id,
          x: W + OBSTACLE_WIDTH, // börja precis utanför högerkanten
          gapY,
          width: OBSTACLE_WIDTH,
          gap: GAP,
        },
      ]);
    };

    spawn();
    const tid = setInterval(spawn, SPAWN_MS);
    return () => clearInterval(tid);
  }, [W, H, GAP, OBSTACLE_WIDTH, SPAWN_MS]);

  // Huvud-loop: fysik + flytta hinder
  useEffect(() => {
    let raf = 0;

    const tick = () => {
      // Spelare – fysik
      vyRef.current += GRAVITY;
      let nextY = yRef.current + vyRef.current;

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

      // Hinder – flytta åt vänster & städa bort utanför skärm
      const moved = obsRef.current.map((o) => ({ ...o, x: o.x - SPEED }));
      const kept = moved.filter((o) => o.x + o.width > 0);
      if (kept.length !== obsRef.current.length) {
        setObstacles(kept);
      } else {
        setObstacles(moved);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [GRAVITY, FLOOR, CEIL, SPEED]);

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={{ flex: 1 }}
    >
      <Pressable onPressIn={onTap} style={{ flex: 1 }}>
        {/* HUD */}
        <Text
          style={{ color: "white", position: "absolute", top: 40, left: 20 }}
        >
          Tryck för att hoppa · Hindren saknar kollision (än)
        </Text>

        {/* Hinder */}
        <Obstacles items={obstacles} />

        {/* Spelare */}
        <View style={{ flex: 1 }}>
          <Player x={PLAYER_X} y={y} jumpTick={jumpTick} />
        </View>
      </Pressable>
    </LinearGradient>
  );
}

function rand(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min));
}
