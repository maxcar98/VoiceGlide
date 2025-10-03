# VoiceGlide — “Tappy not bird” (React Native + Expo + TypeScript)

Ett litet “tappa-för-att-hoppa”-spel: undvik pelare, samla poäng och spara en **Top-10-lista** lokalt och säkert.

**Repo:** https://github.com/maxcar98/VoiceGlide

---

## Tech-stack
- **React Native** (TypeScript)
- **Expo** (managed workflow)
- **React Navigation** (Native Stack)

---

## Projektstruktur
```
App.tsx
src/
  audio/
    sound.ts
  components/
    Player.tsx
    Obstacles.tsx
    NamePrompt.tsx
    PrimaryButton.tsx
  context/
    ScoresContext.tsx
  logic/
    game.ts
  screens/
    HomeScreen.tsx
    PlayScreen.tsx
    LeaderboardScreen.tsx
assets/
  sounds/
    bgm.mp3
    hit.mp3
    jump.mp3
```

## Komponenter jag använder

### React Native
- `View`, `Text`, `Pressable` – layout, text och input  
- `FlatList` – topplistan (Leaderboard)  
- `Modal`, `TextInput` – namn-prompt vid highscore  
- `Animated` – liten “pop”-animation på spelaren  
- `Dimensions` – skärmstorlek i `game.ts`  
- `react-native-safe-area-context` → `SafeAreaView`, `useSafeAreaInsets`  

### Expo SDK (minst 4 uppfyllda)
- **expo-av** – bakgrundsmusik & träff-ljud (`Audio.Sound`, `setAudioModeAsync`)  
- **expo-haptics** – haptisk feedback (hopp/krasch)  
- **expo-keep-awake** – hindrar skärmen från att släckas (`useKeepAwake`)  
- **expo-linear-gradient** – gradient-bakgrunder i UI  
- **expo-secure-store** – sparar Top-10 säkert och lokalt  

### Navigation
- **React Navigation (Native Stack)** med tre skärmar:
  - `Home` → `Play` → `Leaderboard`
  - Header av/på per skärm via `screenOptions`

---

## Så bygger och kör du projektet

### 1. Klona projektet
```bash
# HTTPS
git clone https://github.com/maxcar98/VoiceGlide.git
cd VoiceGlide
```

### 2. Installera beroenden
```bash
npm install
```
> `npm install` läser `package.json` och hämtar **alla** paket (inkl. Expo-modulerna ovan).

### 3. Starta utvecklingsservern
```bash
npx expo start
```
- iOS-simulator: tryck `i` (kräver Xcode)  
- Android-emulator: tryck `a` (kräver Android Studio)  
- Fysisk enhet: skanna QR-koden i **Expo Go** (mobil & dator på samma nät)  

> Om nätverket strular – byt *Connection* till **Tunnel** i Expo Dev Tools.

### 4. Felsökning
```bash
# Rensa cache
npx expo start -c

# Om paket saknas (ovanligt, bara vid mismatch)
npx expo install expo-av expo-haptics expo-keep-awake expo-linear-gradient expo-secure-store react-native-safe-area-context @react-navigation/native @react-navigation/native-stack
```

---

## Hur spelet fungerar (översikt)
- **Spelfaser:** `ready` → `playing` → `gameover`  
- **Spel-loop:** `requestAnimationFrame` uppdaterar fysik/hinder/poäng/kollision endast när fasen är `playing`  
- **Topplista:** `ScoresContext` läser från **expo-secure-store** vid start och sparar automatiskt när listan ändras  
- **Ljud & haptik:** BGM start/stopp + träff-ljud och vibration vid kollision  

---

## Genomförda krav (för godkänt)
- [x] **Minst 4 RN-komponenter** (View, Text, Pressable, FlatList, Modal, TextInput, Animated, Dimensions, SafeAreaView)  
- [x] **Minst 4 Expo SDK** (expo-av, expo-haptics, expo-keep-awake, expo-linear-gradient, expo-secure-store)  
- [x] **React Navigation** används (Native Stack)  
- [x] **Git & GitHub** har använts — publik repo: `maxcar98/VoiceGlide`  
- [x] **README.md** med titel, beskrivning, körinstruktioner & komponentlista  
- [x] **Inlämnad i tid**  
- [x] **Muntlig presentation** genomförd  

---

