import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
  const [showEnglish, setShowEnglish] = useState(false);

  const handleContinue = () => {
    router.replace('/StartScreen');
  };

  const handleSeeTranslation = () => {
    setShowEnglish(!showEnglish);
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
        {/* Header with icon and title vertically aligned */}
        <View style={styles.headerContainer}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../assets/images/oplogo.png')}
              resizeMode="cover"
            />
          </View>
          <Text style={styles.title}>
            {showEnglish ? 'Welcome to Obaa Panyin' : 'Akwaaba wo Obaa Panyin'}
          </Text>
        </View>

        {/* Main content */}
        <View style={styles.mainContent}>
          <Text style={styles.description}>
            {showEnglish 
              ? 'Your Akan voice companion for pregnancy and newborn care. Ask by speaking and hear spoken answers.'
              : 'Wo Akan-kasa boafo ma awo-ntoasoo ne awoakyre. Ka wo asemmisa na tie mmuaee.'
            }
          </Text>

          <TouchableOpacity onPress={handleSeeTranslation} style={styles.translationButton}>
            <Text style={styles.translationText}>
              {showEnglish ? 'Hwe Wa Twi Mu' : 'See English translation'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Privacy Notice */}
        <View style={styles.noticeContainer}>
          <View style={styles.noticeItem}>
            <View style={styles.iconWrapper}>
              <Image
                source={require('../assets/images/lock.png')} 
                resizeMode="cover"
              />
            </View>
            <View style={styles.noticeContent}>
              <Text style={styles.noticeTitle}>
                {showEnglish 
                  ? "Don't share sensitive personal information."
                  : 'Mfa wo ho ahintasem nnhyɛ ha'
                }
              </Text>
              <Text style={styles.noticeDescription}>
                {showEnglish
                  ? 'IDs, accounts, passwords, financial details, etc.'
                  : 'ID, account, password, sikasem, etc.'
                }
              </Text>
            </View>
          </View>

          <View style={styles.noticeItem}>
            <View style={styles.iconWrapper}>
              <Image
                source={require('../assets/images/flag.png')} 
                resizeMode="cover"
              />
            </View>
            <View style={styles.noticeContent}>
              <Text style={styles.noticeTitle}>
                {showEnglish
                  ? "This doesn't replace medical care."
                  : 'Ɛnyɛ ayaresabea.'
                }
              </Text>
              <Text style={styles.noticeDescription}>
                {showEnglish
                  ? 'If you have symptoms or concerns, contact a midwife/doctor or visit a health facility.'
                  : 'Sɛ wohia dɔkota, anaa wohu simptom a, frɛ wo midwife/dɔkotani anaa ko ayaresabea ntem.'
                }
              </Text>
              {showEnglish && (
                <Text style={styles.noticeDescription}>
                  If it's urgent, <Text style={styles.urgentText}>seek emergency care immediately</Text>.
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>
            {showEnglish ? 'Continue' : 'Toa so'}
          </Text>
        </TouchableOpacity>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            {showEnglish 
              ? <>
                  By continuing, you agree to our{' '}
                  <Text style={styles.linkText} onPress={handleTermsPress}>Terms</Text>
                  {' '}and have read our{' '}
                  <Text style={styles.linkText} onPress={handlePrivacyPress}>Privacy Policy</Text>
                </>
              : <>
                  Wɔtoa so a, wopene yɛn{' '}
                  <Text style={styles.linkText} onPress={handleTermsPress}>Terms</Text>
                  {' '}so na wokenkan yɛn{' '}
                  <Text style={styles.linkText} onPress={handlePrivacyPress}>Privacy Policy</Text>
                </>
            }
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#133D75',
    textAlign: 'center',
    lineHeight: 36,
  },
  mainContent: {
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    color: '#424242',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'left',
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
  iconWrapper: {
    marginRight: 16,
    marginTop: 2,
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#133D75',
    marginBottom: 4,
    lineHeight: 22,
  },
  noticeDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 4,
  },
  urgentText: {
    fontWeight: '600',
    color: '#133D75',
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#F8F9FA',
  },
  continueButton: {
    backgroundColor: '#133D75',
    paddingVertical: 16,
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