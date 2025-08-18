import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Only redirect if currently on SplashScreen
    if (segments[0] === "SplashScreen") {
      const timer = setTimeout(() => {
        router.replace("/WelcomeScreen");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [router, segments]);

  return (
    <Stack>
      <Stack.Screen name="SplashScreen" options={{ headerShown: false }} />
      <Stack.Screen name="WelcomeScreen" options={{ headerShown: false }} />
      <Stack.Screen name="StartScreen" options={{ headerShown: false }} />
    </Stack>
  );
}