import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ScoreEntry = {
  id: string;
  name: string;
  score: number;
  date: number;
};

type Ctx = {
  scores: ScoreEntry[];
  getScores: () => ScoreEntry[];
  qualifies: (score: number) => boolean;
  addScore: (name: string, score: number) => string; // returns id
  topLimit: number;
};

const ScoresContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "vg_scores_v1";
const TOP_LIMIT = 10;

export function ScoresProvider({ children }: { children: React.ReactNode }) {
  const [scores, setScores] = useState<ScoreEntry[]>([]);

  // Load once (om det finns sparat)
  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(STORAGE_KEY);
        if (raw) {
          const parsed: ScoreEntry[] = JSON.parse(raw);
          setScores(parsed);
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  // Persist when scores change
  useEffect(() => {
    (async () => {
      try {
        await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(scores));
      } catch {
        // ignore
      }
    })();
  }, [scores]);

  const getScores = () => scores;

  const qualifies = (score: number) => {
    if (TOP_LIMIT <= 0) return false;
    if (scores.length < TOP_LIMIT) return score > 0; // vad som helst >0 kvalar i början
    const worstTop = scores[scores.length - 1]?.score ?? -Infinity;
    return score > worstTop;
  };

  const addScore = (name: string, score: number) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const entry: ScoreEntry = {
      id,
      name: name.trim() || "Anon",
      score,
      date: Date.now(),
    };
    const next = [...scores, entry]
      .sort((a, b) => b.score - a.score || a.date - b.date) // högst score först, äldre vinner vid tie
      .slice(0, TOP_LIMIT);
    setScores(next);
    return id;
  };

  const value = useMemo(
    () => ({ scores, getScores, qualifies, addScore, topLimit: TOP_LIMIT }),
    [scores]
  );

  return (
    <ScoresContext.Provider value={value}>{children}</ScoresContext.Provider>
  );
}

export function useScores() {
  const ctx = useContext(ScoresContext);
  if (!ctx) throw new Error("useScores must be used inside <ScoresProvider>");
  return ctx;
}
