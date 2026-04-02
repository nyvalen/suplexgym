import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 280;
const FALLBACK_IMG = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

const C = {
  bg: "#0D1117",
  surface: "#161B22",
  border: "#30363D",
  text: "#F0F6FC",
  textSub: "#8B949E",
  textMuted: "#6E7681",
  accent: "#C4873A",
};

export default function NewsDetailsScreen({ route }: any) {
  const navigation = useNavigation();
  const { article } = route.params;

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Hero image */}
      <View style={styles.heroContainer}>
        <Image
          source={{ uri: article.imagePath || FALLBACK_IMG }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.heroGradient} />
        {/* Back button overlaid on hero */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Animated.View
        style={[styles.content, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Title block */}
          <Text style={styles.title}>{article.title}</Text>
          {article.subtitle ? (
            <Text style={styles.subtitle}>{article.subtitle}</Text>
          ) : null}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Body */}
          <Text style={styles.body}>{article.content}</Text>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  heroContainer: {
    height: HERO_HEIGHT,
    position: "relative",
  },
  heroImage: { width: "100%", height: HERO_HEIGHT },
  heroGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: HERO_HEIGHT * 0.6,
    backgroundColor: "transparent",
    // Gradient achieved with bg overlay
  },

  backBtn: {
    position: "absolute",
    top: 56,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  backBtnText: { color: "#fff", fontSize: 18, fontWeight: "600", lineHeight: 22 },

  content: {
    flex: 1,
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    overflow: "hidden",
  },
  scrollContent: { padding: 24, paddingBottom: 60 },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: C.textSub,
    lineHeight: 22,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 20,
  },
  body: {
    fontSize: 15,
    color: "#C9D1D9",
    lineHeight: 26,
  },
});
