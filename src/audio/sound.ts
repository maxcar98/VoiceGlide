import { Audio } from "expo-av";

let initialized = false;

// BGM
let bgmSound: Audio.Sound | null = null;

// Hit SFX (en enda instans räcker)
let hitSound: Audio.Sound | null = null;

async function ensureInit() {
  if (initialized) return;
  initialized = true;

  try {
    await Audio.setAudioModeAsync({
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      // lämna interruptions default för att slippa deprec-varningar
    });
  } catch {
    // ignore
  }

  // Förladda hit-ljudet
  try {
    const created = await Audio.Sound.createAsync(
      require("../../assets/sounds/hit.mp3.mp3"),
      { volume: 0.9 }
    );
    hitSound = created.sound;
  } catch {
    // ignore
  }
}

export async function startBGM() {
  await ensureInit();
  if (!bgmSound) {
    const created = await Audio.Sound.createAsync(
      require("../../assets/sounds/bgm.mp3.mp3"),
      { isLooping: true, volume: 0.7 }
    );
    bgmSound = created.sound;
  }
  try {
    await bgmSound.setIsLoopingAsync(true);
    await bgmSound.playAsync();
  } catch {
    // ignore
  }
}

export async function stopBGM() {
  if (!bgmSound) return;
  try {
    await bgmSound.stopAsync();
    await bgmSound.setPositionAsync(0);
  } catch {
    // ignore
  }
}

export async function playHit() {
  await ensureInit();
  if (!hitSound) return;
  try {
    await hitSound.setPositionAsync(0);
    await hitSound.replayAsync();
  } catch {
    // ignore
  }
}

export async function cleanupAudio() {
  try {
    await stopBGM();
    if (bgmSound) {
      await bgmSound.unloadAsync();
      bgmSound = null;
    }
    if (hitSound) {
      await hitSound.unloadAsync();
      hitSound = null;
    }
  } catch {
    // ignore
  }
}
