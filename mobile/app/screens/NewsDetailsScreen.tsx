import React, { useRef, useEffect } from "react";
import {
  View, Text, Image, TouchableOpacity,
  ScrollView, Animated, StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme, tokens } from "../theme/ThemeContext";

const FALLBACK = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

export default function NewsDetailsScreen({ route }: any) {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
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
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Hero */}
      <View style={{ height: 300, position: "relative" }}>
        <Image source={{ uri: article.imagePath || FALLBACK }} style={{ width: "100%", height: 300 }} resizeMode="cover" />
        <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.45)" }} />

        {/* Purple tint overlay */}
        <View style={{ position: "absolute", inset: 0, backgroundColor: "rgba(124,58,237,0.12)" }} />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: "absolute", top: 56, left: 20,
            width: 42, height: 42, borderRadius: 21,
            backgroundColor: "rgba(0,0,0,0.55)",
            alignItems: "center", justifyContent: "center",
            borderWidth: 1, borderColor: "rgba(255,255,255,0.2)",
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Content card */}
      <Animated.View style={{
        flex: 1, backgroundColor: t.bg,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        marginTop: -28, overflow: "hidden",
        opacity: fadeIn, transform: [{ translateY: slideUp }],
      }}>
        {/* Purple accent bar */}
        <View style={{ height: 3, backgroundColor: t.primary, marginHorizontal: 24, borderRadius: 2, marginTop: 16, marginBottom: 0 }} />

        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          <Text style={{
            fontSize: 26, fontWeight: "800", color: t.text,
            letterSpacing: -0.5, lineHeight: 34, marginBottom: 10,
          }}>
            {article.title}
          </Text>

          {article.createdAt && (
            <Text style={{ color: t.textMuted, fontSize: 12, marginBottom: 20, fontWeight: "500", letterSpacing: 0.5 }}>
              📅 {new Date(article.createdAt).toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" })}
            </Text>
          )}

          <View style={{ height: 1, backgroundColor: t.border, marginBottom: 20 }} />

          <Text style={{ fontSize: 16, color: t.textSub, lineHeight: 28, letterSpacing: 0.1 }}>
            {article.content}
          </Text>
        </ScrollView>
      </Animated.View>
    </View>
  );
}
