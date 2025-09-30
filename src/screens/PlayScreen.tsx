import * as Haptics from "expo-haptics";
import { useKeepAwake } from "expo-keep-awake";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Obstacles, { Obstacle } from "../components/Obstacles";
import Player from "../components/Player";

type GamePhase = "ready" | "playing" | "gameover";

export default function PlayScreen() {
  useKeepAwake();

  const insets = useSafeAreaInsets();

  const HEIGHT = Dimensions.get("window").height;
  const WIDTH = Dimensions.get("window").width;

  // --- Player ---
  const PLAYER_SIZE = 32;
  const PLAYER_RADIUS_RENDER = PLAYER_SIZE / 2;
  const PLAYER_RADIUS_HIT = PLAYER_RADIUS_RENDER * 0.88; // lite mindre hitbox

  const [y, setY] = useState(HEIGHT * 0.5);
  const yRef = useRef(y);
  useEffect(() => {
    yRef.current = y;
  }, [y]);

  const velYRef = useRef(0);
  const [jumpTick, setJumpTick] = useState(0);

  // Physics
  const GRAVITY = 0.75;
  const JUMP_VELOCITY = -11.5;
  const FLOOR_Y = HEIGHT - 6;
  const CEIL_Y = 6;
  const PLAYER_X = Math.min(100, WIDTH * 0.25);

  // --- Game state ---
  const [phase, setPhase] = useState<GamePhase>("ready");
  const [score, setScore] = useState(0);

  // --- Obstacles ---
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  useEffect(() => {
    obstaclesRef.current = obstacles;
  }, [obstacles]);

  // Obstacle config
  const OBSTACLE_WIDTH = Math.max(48, Math.floor(WIDTH * 0.12));
  const GAP_HEIGHT = Math.max(140, Math.floor(HEIGHT * 0.26));
  const SCROLL_SPEED = Math.max(2.6, WIDTH * 0.0045);
  const SPAWN_INTERVAL_MS = 1500;
  const FIRST_SPAWN_DELAY_MS = 1000;

  // Tap → start / jump / restart
  const handleTap = async () => {
    if (phase === "gameover") {
      setPhase("ready");
      setY(HEIGHT * 0.5);
      velYRef.current = 0;
      setObstacles([]);
      setScore(0);
      try {
        await Haptics.selectionAsync();
      } catch {}
      return;
    }

    if (phase === "ready") {
      setScore(0);
      setObstacles([]);
      velYRef.current = JUMP_VELOCITY;
      setJumpTick((t) => t + 1);
      setPhase("playing");
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
      return;
    }

    if (phase !== "playing") return;

    velYRef.current = JUMP_VELOCITY;
    setJumpTick((t) => t + 1);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
  };

  // Spawn loop
  useEffect(() => {
    if (phase !== "playing") return;

    let spawnDelayTimeout: NodeJS.Timeout | null = null;
    let spawnInterval: NodeJS.Timeout | null = null;

    const spawn = () => {
      const marginTop = 60;
      const marginBottom = 60;
      const minY = marginTop + GAP_HEIGHT / 2;
      const maxY = HEIGHT - marginBottom - GAP_HEIGHT / 2;
      const gapY = rand(minY, maxY);
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      setObstacles((prev) => [
        ...prev,
        {
          id,
          x: WIDTH + OBSTACLE_WIDTH,
          gapY,
          width: OBSTACLE_WIDTH,
          gap: GAP_HEIGHT,
          scored: false,
        },
      ]);
    };

    spawnDelayTimeout = setTimeout(() => {
      spawn();
      spawnInterval = setInterval(spawn, SPAWN_INTERVAL_MS);
    }, FIRST_SPAWN_DELAY_MS);

    return () => {
      if (spawnDelayTimeout) clearTimeout(spawnDelayTimeout);
      if (spawnInterval) clearInterval(spawnInterval);
    };
  }, [
    phase,
    WIDTH,
    HEIGHT,
    GAP_HEIGHT,
    OBSTACLE_WIDTH,
    SPAWN_INTERVAL_MS,
    FIRST_SPAWN_DELAY_MS,
  ]);

  // Main loop
  useEffect(() => {
    let raf = 0;

    const tick = () => {
      if (phase === "playing") {
        velYRef.current += GRAVITY;
        let nextY = yRef.current + velYRef.current;

        if (nextY < CEIL_Y) {
          nextY = CEIL_Y;
          velYRef.current = 0;
        }
        if (nextY > FLOOR_Y) {
          nextY = FLOOR_Y;
          velYRef.current = 0;
        }

        yRef.current = nextY;
        setY(nextY);

        const moved = obstaclesRef.current.map((o) => ({
          ...o,
          x: o.x - SCROLL_SPEED,
        }));

        let gained = 0;
        const withScore = moved.map((o) => {
          if (!o.scored && o.x + o.width < PLAYER_X) {
            gained += 1;
            return { ...o, scored: true };
          }
          return o;
        });

        const kept = withScore.filter((o) => o.x + o.width > 0);

        setObstacles(kept);
        if (gained) setScore((s) => s + gained);

        const hit = checkCollisionCircleVsColumns(
          PLAYER_X,
          yRef.current,
          PLAYER_RADIUS_HIT,
          kept
        );
        if (hit) {
          velYRef.current = 0; // frys direkt vit kollision
          setPhase("gameover");
          try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          } catch {}
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, GRAVITY, FLOOR_Y, CEIL_Y, SCROLL_SPEED]);

  // Reset to ready when entering screen
  useEffect(() => {
    setPhase("ready");
    setY(HEIGHT * 0.5);
    velYRef.current = 0;
    setObstacles([]);
    setScore(0);
  }, [HEIGHT]);

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={{ flex: 1 }}
    >
      {/* solid top bar */}
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
          {/* Score */}
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

          {/* Game Over overlay + final score in center */}
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
            </View>
          )}

          {/* Obstacles */}
          <Obstacles items={obstacles} />

          {/* Player */}
          <View style={{ flex: 1 }}>
            <Player x={PLAYER_X} y={y} jumpTick={jumpTick} />
          </View>
        </Pressable>
      </SafeAreaView>
    </LinearGradient>
  );
}

function rand(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min));
}

// Förenklade kollisionerna lite så man inte förlorar pga pyttesmå missar
// (speciellt på högupplösta skärmar där spelaren är liten)
const EDGE_PAD = 3;

function checkCollisionCircleVsColumns(
  px: number,
  py: number,
  pr: number,
  obstacles: Obstacle[]
) {
  for (const o of obstacles) {
    // require overlap with a small inward pad on both sides
    const overlapX =
      px + pr > o.x + EDGE_PAD && px - pr < o.x + o.width - EDGE_PAD;
    if (!overlapX) continue;

    // widen the passable gap a touch
    const gapTop = o.gapY - o.gap / 2 - EDGE_PAD;
    const gapBottom = o.gapY + o.gap / 2 + EDGE_PAD;

    if (py - pr < gapTop) return true; // hit top column
    if (py + pr > gapBottom) return true; // hit bottom column
  }
  return false;
}
