import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ScoresProvider } from "./src/context/ScoresContext";
import HomeScreen from "./src/screens/HomeScreen";
import LeaderboardScreen from "./src/screens/LeaderboardScreen";
import PlayScreen from "./src/screens/PlayScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ScoresProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Play" component={PlayScreen} />
          <Stack.Screen
            name="Leaderboard"
            component={LeaderboardScreen}
            options={{ headerShown: true, title: "Leaderboard" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ScoresProvider>
  );
}
