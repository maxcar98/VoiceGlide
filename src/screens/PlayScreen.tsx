// src/screens/PlayScreen.tsx
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import NamePrompt from "../components/NamePrompt";
import Obstacles from "../components/Obstacles";
import Player from "../components/Player";
import PrimaryButton from "../components/PrimaryButton";
import { useScores } from "../context/ScoresContext";
import {
  applyScoring,
  checkCollision,
  createConfig,
  type GameConfig,
  moveObstacles,
  type Obstacle,
  spawnObstacle,
  stepPlayer,
  trimOffscreen,
} from "../logic/game";

type GamePhase = "ready" | "playing" | "gameover";

export default function PlayScreen() {
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  // Window metrics (for placing start text only)
  const HEIGHT = Dimensions.get("window").height;

  // Config
  const cfgRef = useRef<GameConfig>(createConfig());

  // Player state
  const [y, setY] = useState(cfgRef.current.HEIGHT * 0.5);
  const yRef = useRef(y);
  useEffect(() => {
    yRef.current = y;
  }, [y]);

  const velYRef = useRef(0);
  const [jumpTick, setJumpTick] = useState(0);

  // Game state
  const [phase, setPhase] = useState<GamePhase>("ready");
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0); // <-- NYTT
  useEffect(() => {
    scoreRef.current = score; // håll ref i synk
  }, [score]);

  // Obstacles
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);

  const { qualifies, addScore } = useScores();
  const [askName, setAskName] = useState(false);
  const [newScoreId, setNewScoreId] = useState<string | null>(null);

  // Tap → start / jump / restart
  const handleTap = async () => {
    const cfg = cfgRef.current;

    if (phase === "gameover") {
      setPhase("ready");
      setY(cfg.HEIGHT * 0.5);
      velYRef.current = 0;
      setObstacles([]);
      setScore(0);
      scoreRef.current = 0; // <-- reset ref också
      try {
        await Haptics.selectionAsync();
      } catch {}
      return;
    }

    if (phase === "ready") {
      setScore(0);
      scoreRef.current = 0;
      setObstacles([]);
      velYRef.current = cfg.JUMP_VELOCITY;
      setJumpTick((t) => t + 1);
      setPhase("playing");
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      return;
    }

    if (phase !== "playing") return;

    velYRef.current = cfg.JUMP_VELOCITY;
    setJumpTick((t) => t + 1);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  };

  // Spawn loop
  useEffect(() => {
    if (phase !== "playing") return;
    const cfg = cfgRef.current;

    let spawnDelayTimeout: NodeJS.Timeout | null = null;
    let spawnInterval: NodeJS.Timeout | null = null;

    const spawn = () => setObstacles((prev) => [...prev, spawnObstacle(cfg)]);

    const FIRST_SPAWN_DELAY_MS = 1000;
    const SPAWN_INTERVAL_MS = 1500;

    spawnDelayTimeout = setTimeout(() => {
      spawn();
      spawnInterval = setInterval(spawn, SPAWN_INTERVAL_MS);
    }, FIRST_SPAWN_DELAY_MS);

    return () => {
      if (spawnDelayTimeout) clearTimeout(spawnDelayTimeout);
      if (spawnInterval) clearInterval(spawnInterval);
    };
  }, [phase]);

  // Main loop
  useEffect(() => {
    let raf = 0;

    const tick = () => {
      if (phase === "playing") {
        const cfg = cfgRef.current;

        // Player step
        const p = stepPlayer(yRef.current, velYRef.current, cfg);
        velYRef.current = p.velY;
        yRef.current = p.y;
        setY(p.y);

        // Obstacles step
        let moved = moveObstacles(obstaclesRef.current, cfg);
        const { items: withScore, gained } = applyScoring(moved, cfg.PLAYER_X);

        if (gained) {
          // uppdatera både state och ref
          setScore((s) => {
            const ns = s + gained;
            scoreRef.current = ns;
            return ns;
          });
        }

        const kept = trimOffscreen(withScore);
        setObstacles(kept);

        // Collision
        const hit = checkCollision(
          cfg.PLAYER_X,
          yRef.current,
          cfg.PLAYER_HIT_RADIUS,
          kept,
          cfg
        );
        if (hit) {
          velYRef.current = 0;
          setPhase("gameover");

          // Kolla high score
          if (qualifies(scoreRef.current)) {
            setAskName(true);
          }

          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } catch {}
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  // Reset on mount
  useEffect(() => {
    const cfg = cfgRef.current;
    setPhase("ready");
    setY(cfg.HEIGHT * 0.5);
    velYRef.current = 0;
    setObstacles([]);
    setScore(0);
    scoreRef.current = 0;
  }, []);

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={{ flex: 1 }}
    >
      {/* Solid top bar*/}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: insets.top + 2,
          backgroundColor: "#0b1720",
          zIndex: 100,
          elevation: 100,
        }}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <Pressable onPressIn={handleTap} style={{ flex: 1 }}>
          {/* Score – big, top-right */}
          <Text
            style={{
              position: "absolute",
              top: insets.top + 8,
              right: 20,
              zIndex: 50,
              elevation: 50,
              color: "white",
              fontSize: 48,
              fontWeight: "900",
              letterSpacing: 0.5,
              textShadowColor: "rgba(0,0,0,0.9)",
              textShadowOffset: { width: 0, height: 3 },
              textShadowRadius: 6,
            }}
          >
            {score}
          </Text>

          {/* Start overlay */}
          {phase === "ready" && (
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: HEIGHT * 0.32,
                alignItems: "center",
                zIndex: 45,
                elevation: 45,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 34,
                  fontWeight: "900",
                  textShadowColor: "rgba(0,0,0,0.7)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                }}
              >
                Tap to jump
              </Text>
              <Text style={{ color: "white", opacity: 0.9, marginTop: 6 }}>
                Obstacles start after a short moment
              </Text>
            </View>
          )}

          {/* Game Over overlay */}
          {phase === "gameover" && (
            <View
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
                zIndex: 60,
                elevation: 60,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 56,
                  fontWeight: "800",
                  textShadowColor: "rgba(0,0,0,0.9)",
                  textShadowOffset: { width: 0, height: 3 },
                  textShadowRadius: 6,
                  marginBottom: 10,
                }}
              >
                GAME OVER
              </Text>
              <Text
                style={{
                  color: "white",
                  fontSize: 44,
                  fontWeight: "800",
                  marginBottom: 20,
                  textShadowColor: "rgba(0,0,0,0.7)",
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                }}
              >
                Score: {score}
              </Text>

              <Text
                style={{
                  color: "white",
                  opacity: 0.95,
                  marginTop: 6,
                  fontSize: 16,
                }}
              >
                Tap to restart
              </Text>

              <PrimaryButton
                title="View leaderboard"
                onPress={() =>
                  navigation.navigate("Leaderboard", {
                    highlightId: newScoreId,
                  })
                }
                style={{
                  marginTop: 14,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                }}
              />
            </View>
          )}

          {/* Obstacles */}
          <Obstacles items={obstacles} />

          {/* Player */}
          <View style={{ flex: 1 }}>
            <Player x={cfgRef.current.PLAYER_X} y={y} jumpTick={jumpTick} />
          </View>
        </Pressable>

        {/* Name prompt */}
        <NamePrompt
          visible={askName}
          score={scoreRef.current} // senaste poängen
          onCancel={() => setAskName(false)}
          onSubmit={(name) => {
            const id = addScore(name, scoreRef.current);
            setNewScoreId(id);
            setAskName(false);
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
