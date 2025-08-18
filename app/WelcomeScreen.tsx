import { useRouter } from 'expo-router';
import React from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const WelcomeScreen = () => {
  const router = useRouter();

  const handleContinue = () => {
    router.replace('/StartScreen');
  };

  const handleSeeTranslation = () => {
    // Handle English translation functionality
    console.log('Show English translation');
  };

  const handleTermsPress = () => {
    // Handle Terms navigation
    console.log('Navigate to Terms');
  };

  const handlePrivacyPress = () => {
    // Handle Privacy Policy navigation
    console.log('Navigate to Privacy Policy');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with icon and title horizontally aligned */}
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../assets/images/oplogo.png')}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.title}>Welcome to Obaa Panyin</Text>
        </View>

        {/* Main content */}
        <View style={styles.mainContent}>
          <Text style={styles.description}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. In a purus et diam semper 
            imperdiet. Vivamus ultricies feugiat odio sed sollicitudin.
          </Text>

          <TouchableOpacity onPress={handleSeeTranslation} style={styles.translationButton}>
            <Text style={styles.translationText}>See English translation</Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Notice */}
        <View style={styles.noticeContainer}>
          <View style={styles.noticeItem}>
            <View>
                    <Image
                      source={require('../assets/images/lock.png')} 
                      resizeMode="cover"
                    />
            </View>
            <View style={styles.noticeContent}>
              <Text style={styles.noticeTitle}>
                Please don't share any sensitive personal information.
              </Text>
              <Text style={styles.noticeDescription}>
                Your privacy and security are important, and it's best to keep private details out of our conversations.
              </Text>
            </View>
          </View>

          <View style={styles.noticeItem}>
            <View >
                <View>
                    <Image
                      source={require('../assets/images/flag.png')} 
                      resizeMode="cover"
                    />
            </View>
            </View>
            <View style={styles.noticeContent}>
              <Text style={styles.noticeTitle}>
                Never use this as a substitute for professional medical attention/advice.
              </Text>
              <Text style={styles.noticeDescription}>
                Always consult with a qualified healthcare provider for any health concerns.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText} onPress={handleTermsPress}>Terms</Text>
            {' '}and have read our{' '}
            <Text style={styles.linkText} onPress={handlePrivacyPress}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    marginBottom: 16,
  },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#133D75',
    textAlign: 'center',
    lineHeight: 36,
  },
  mainContent: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#424242',
    lineHeight: 24,
    marginBottom: 16,
  },
  translationButton: {
    alignSelf: 'flex-start',
  },
  translationText: {
    fontSize: 16,
    color: '#C19D5D',
    fontWeight: '500',
  },
  noticeContainer: {
    marginBottom: 40,
  },
  noticeItem: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  lockIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  lockIconText: {
    fontSize: 20,
  },
  medicalIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  medicalIconText: {
    fontSize: 20,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#133D75',
    marginBottom: 8,
    lineHeight: 22,
  },
  noticeDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#F8F9FA',
  },
  continueButton: {
    backgroundColor: '#133D75',
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  termsContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  termsText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
  },
  linkText: {
    color: '#133D75',
    fontWeight: '500',
    alignSelf: 'baseline',
    margin: 0,
    padding: 0,
  },


});

export default WelcomeScreen;