import { Dimensions } from 'react-native';

export type Obstacle = {
  id: string;
  x: number;
  width: number;
  gapY: number;
  gap: number;
  scored?: boolean;
};

export type GameConfig = {
  HEIGHT: number;
  WIDTH: number;

  // Player
  PLAYER_SIZE: number;
  PLAYER_X: number;
  PLAYER_HIT_RADIUS: number; // kollisionsradie

  // Physics
  GRAVITY: number;
  JUMP_VELOCITY: number;
  FLOOR_Y: number;
  CEIL_Y: number;

  // Obstacles
  OBSTACLE_WIDTH: number;
  GAP_HEIGHT: number;
  SCROLL_SPEED: number;

  // Collision forgiveness
  EDGE_PAD: number; // px – drar in pelarsidor och breddar gapet lite
};

export function createConfig(): GameConfig {
  const { height: H, width: W } = Dimensions.get('window');

  const PLAYER_SIZE = 32;
  const PLAYER_RENDER_RADIUS = PLAYER_SIZE / 2;

  return {
    HEIGHT: H,
    WIDTH: W,

    PLAYER_SIZE,
    PLAYER_X: Math.min(100, W * 0.25),
    PLAYER_HIT_RADIUS: PLAYER_RENDER_RADIUS * 0.88, // lite snällare träffyta

    GRAVITY: 0.75,
    JUMP_VELOCITY: -11.5,
    FLOOR_Y: H - 6,
    CEIL_Y: 6,

    OBSTACLE_WIDTH: Math.max(48, Math.floor(W * 0.12)),
    GAP_HEIGHT: Math.max(140, Math.floor(H * 0.26)),
    SCROLL_SPEED: Math.max(2.6, W * 0.0045),

    EDGE_PAD: 3,
  };
}

// ----- Player -----
export function stepPlayer(y: number, velY: number, cfg: GameConfig) {
  let v = velY + cfg.GRAVITY;
  let nextY = y + v;

  if (nextY < cfg.CEIL_Y) { nextY = cfg.CEIL_Y; v = 0; }
  if (nextY > cfg.FLOOR_Y) { nextY = cfg.FLOOR_Y; v = 0; }

  return { y: nextY, velY: v };
}

// ----- Obstacles -----
export function spawnObstacle(cfg: GameConfig): Obstacle {
  const marginTop = 60;
  const marginBottom = 60;
  const minY = marginTop + cfg.GAP_HEIGHT / 2;
  const maxY = cfg.HEIGHT - marginBottom - cfg.GAP_HEIGHT / 2;
  const gapY = rand(minY, maxY);
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  return {
    id,
    x: cfg.WIDTH + cfg.OBSTACLE_WIDTH,
    width: cfg.OBSTACLE_WIDTH,
    gapY,
    gap: cfg.GAP_HEIGHT,
    scored: false,
  };
}

export function moveObstacles(items: Obstacle[], cfg: GameConfig): Obstacle[] {
  return items.map(o => ({ ...o, x: o.x - cfg.SCROLL_SPEED }));
}

export function applyScoring(items: Obstacle[], playerX: number) {
  let gained = 0;
  const updated = items.map(o => {
    if (!o.scored && o.x + o.width < playerX) {
      gained += 1;
      return { ...o, scored: true };
    }
    return o;
  });
  return { items: updated, gained };
}

export function trimOffscreen(items: Obstacle[]) {
  return items.filter(o => o.x + o.width > 0);
}

// ----- Collision -----
export function checkCollision(
  px: number, py: number, pr: number,
  obstacles: Obstacle[], cfg: GameConfig
) {
  for (const o of obstacles) {
    // kräver överlapp med inåtdragna kanter (förlåtelse)
    const overlapX =
      px + pr > o.x + cfg.EDGE_PAD &&
      px - pr < o.x + o.width - cfg.EDGE_PAD;
    if (!overlapX) continue;

    // bredda gapet en aning (visuellt rättvist)
    const gapTop = (o.gapY - o.gap / 2) - cfg.EDGE_PAD;
    const gapBottom = (o.gapY + o.gap / 2) + cfg.EDGE_PAD;

    if (py - pr < gapTop) return true;    // träff top
    if (py + pr > gapBottom) return true; // träff bottom
  }
  return false;
}

// ----- Utils -----
function rand(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min));
}
