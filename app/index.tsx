import 'react-native-get-random-values';

import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View } from "react-native";

export default function Index() {
  const router = useRouter();
  
  useEffect(() => {
    // Add a small delay to ensure the layout is mounted
    const timer = setTimeout(() => {
      router.replace("/SplashScreen");
    }, 10);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return <View style={{ flex: 1, backgroundColor: '#000' }} />;
}