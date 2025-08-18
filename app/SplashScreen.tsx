
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";


const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/WelcomeScreen");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);
  return (
<View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Full screen background image */}
      <Image
        source={require('../assets/images/momchild.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Dark overlay for better text readability */}
      <View style={styles.overlay} />
      
      {/* Content container */}
      <View style={styles.contentContainer}>
        
        {/* Top spacer */}
        <View style={styles.topSpacer} />
        
        {/* App title - positioned in center */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Obaa Panyin</Text>
        </View>
          <View style={styles.titleContainer}>
          <Text style={styles.creditText}>A gift from google</Text>
        </View>
        
        {/* Bottom section with credits */}
        <View style={styles.bottomSection}>
          <View style={styles.creditsContainer}>
            <Text style={styles.creditText}>
              Powered by <Text style={styles.highlightText}>DCS-HCI Lab</Text>
            </Text>
            <Text style={styles.creditText}>
              Sponsored by <Text style={styles.highlightText}>BANGA</Text>
            </Text>
          </View>
        </View>
        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: width,
    height: height,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    zIndex: 10,
  },
  topSpacer: {
    flex: 1,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  creditsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  creditText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginVertical: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  highlightText: {
    color: '#FDE68A', // Yellow-200 equivalent
    fontWeight: '600',
  },
});
