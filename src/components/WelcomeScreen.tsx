import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Image,
  Dimensions
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  emailInput: string;
  setEmailInput: (email: string) => void;
  phoneInput: string;
  setPhoneInput: (phone: string) => void;
  onLogin: () => void;
}

export default function WelcomeScreen({
  emailInput,
  setEmailInput,
  phoneInput,
  setPhoneInput,
  onLogin
}: WelcomeScreenProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [showLoginForm, setShowLoginForm] = useState(false);

  const slides = [
    {
      title: "Your #1 Nightlife Group",
      subtitle: "Find friends who share your vibe and never go to bars alone.",
      image: require('../../assets/onboarding_groups.png')
    },
    {
      title: "Discover Curated Venues",
      subtitle: "Explore the best wine rooms, rooftops, and karaoke spots in Poblacion and BGC.",
      image: require('../../assets/onboarding_venues.png')
    },
    {
      title: "Drink Moderately & Stay Safe",
      subtitle: "Coordinate safety timers, share location alerts, and look out for one another.",
      image: require('../../assets/logo.png')
    }
  ];

  const handleNext = () => {
    if (slideIndex < slides.length - 1) {
      setSlideIndex(slideIndex + 1);
    } else {
      setShowLoginForm(true);
    }
  };

  const handleSkip = () => {
    setShowLoginForm(true);
  };

  if (!showLoginForm) {
    /* 1. RESPONSIVE INTRO SLIDES (NO SCROLLING - FITS HEIGHT 100%) */
    return (
      <View style={styles.responsiveContainer}>
        
        {/* Top Spacer or Small Indicator */}
        <View style={{ height: 10 }} />

        {/* Dynamic Scaling Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={slides[slideIndex].image} 
            style={[
              styles.slideImage, 
              slideIndex === 2 && styles.logoSlideImage
            ]} 
            resizeMode="cover"
          />
        </View>

        {/* Text Details Area */}
        <View style={styles.textContainer}>
          <Text style={styles.slideTitle}>{slides[slideIndex].title}</Text>
          <Text style={styles.slideSubtitle}>{slides[slideIndex].subtitle}</Text>
        </View>

        {/* Dots Indicators Row */}
        <View style={styles.indicatorContainer}>
          {slides.map((_, i) => (
            <View 
              key={i} 
              style={[styles.indicator, slideIndex === i && styles.indicatorActive]} 
            />
          ))}
        </View>

        {/* Skip / Next Actions Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>
              {slideIndex === slides.length - 1 ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom padding to offset safe area indicator */}
        <View style={{ height: 16 }} />
      </View>
    );
  }

  /* 2. SCROLLABLE LOGIN FORM (TO PREVENT KEYBOARD OVERLAYS) */
  return (
    <ScrollView contentContainerStyle={styles.welcomeContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.formWrapper}>
        <View style={styles.welcomeHero}>
          <View style={styles.welcomeLogoContainer}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={{ width: 77, height: 77, borderRadius: 22 }} 
            />
          </View>
          <Text style={styles.welcomeTitle}>NatsVibe</Text>
          <Text style={styles.welcomeTagline}>Go out with a group, not guesswork.</Text>
        </View>

        <View style={styles.welcomeForm}>
          <Text style={styles.welcomeInputLabel}>Sign up with Email</Text>
          <TextInput 
            style={styles.welcomeInput} 
            placeholder="e.g. renz@email.com" 
            placeholderTextColor="#6B7280"
            keyboardType="email-address"
            value={emailInput}
            onChangeText={setEmailInput}
          />

          <Text style={styles.welcomeInputLabel}>Mobile Phone (for safety checks)</Text>
          <TextInput 
            style={styles.welcomeInput} 
            placeholder="e.g. +63 917 123 4567" 
            placeholderTextColor="#6B7280"
            keyboardType="phone-pad"
            value={phoneInput}
            onChangeText={setPhoneInput}
          />

          <TouchableOpacity style={styles.welcomeBtn} onPress={onLogin}>
            <Text style={styles.welcomeBtnText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setShowLoginForm(false); setSlideIndex(0); }} style={{ marginTop: 14 }}>
            <Text style={styles.backLinkText}>View feature details again</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By signing up, you agree to verified profile reviews and safe community guidelines.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

// Compute responsive dimensions
const computedImageHeight = height * 0.28; // 28% of screen height (more compact & responsive)
const computedImageWidth = computedImageHeight; // square aspect ratio

const styles = StyleSheet.create({
  // Intro screen responsive container (no scroll, flex distribution)
  responsiveContainer: {
    flex: 1,
    backgroundColor: '#07050E',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: computedImageHeight + 20,
    marginTop: 15,
  },
  slideImage: {
    width: computedImageWidth,
    height: computedImageHeight,
    borderRadius: 24,
    backgroundColor: '#120E22',
  },
  logoSlideImage: {
    // scale logo slightly down to avoid overly massive display
    width: computedImageWidth * 0.7,
    height: computedImageWidth * 0.7,
    borderRadius: 24,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  slideSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 19,
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginVertical: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  indicatorActive: {
    backgroundColor: '#8B5CF6',
    width: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
    marginTop: 4,
  },
  skipButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  skipText: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '600',
  },
  nextBtn: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Form View Layout
  welcomeContainer: {
    padding: 30,
    justifyContent: 'center',
    minHeight: '100%',
    backgroundColor: '#07050E',
  },
  formWrapper: {
    width: '100%',
  },
  welcomeHero: {
    alignItems: 'center',
    marginBottom: 28,
  },
  welcomeLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -1,
    marginBottom: 6,
  },
  welcomeTagline: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  welcomeForm: {
    gap: 12,
  },
  welcomeInputLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  welcomeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 8,
  },
  welcomeBtn: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  welcomeBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  backLinkText: {
    color: '#8B5CF6',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  termsText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 15,
  },
});
