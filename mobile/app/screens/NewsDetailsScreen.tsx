import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme, tokens } from "../theme/ThemeContext";

const FALLBACK =
  "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

export default function NewsDetailsScreen({ route }: any) {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const { article } = route.params;

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Hero image */}
      <View style={{ height: 300, position: "relative" }}>
        <Image
          source={{ uri: article.imagePath || FALLBACK }}
          style={{ width: "100%", height: 300 }}
          resizeMode="cover"
        />
        {/* Multi-layer overlay for depth — matches web's gradient-to */}
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        />
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(124,58,237,0.15)",
          }}
        />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: "absolute",
            top: 56,
            left: 20,
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: "rgba(0,0,0,0.5)",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.2)",
          }}
          activeOpacity={0.8}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "600" }}>
            ←
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content card — pulls up over image */}
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: t.bg,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          marginTop: -28,
          overflow: "hidden",
          opacity: fadeIn,
          transform: [{ translateY: slideUp }],
        }}
      >
        {/* Purple accent bar */}
        <View
          style={{
            height: 3,
            backgroundColor: "#7c3aed",
            marginHorizontal: 24,
            borderRadius: 2,
            marginTop: 18,
          }}
        />

        <ScrollView
          contentContainerStyle={{
            padding: 24,
            paddingTop: 18,
            paddingBottom: 60,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{
              fontSize: 26,
              fontWeight: "800",
              color: t.text,
              letterSpacing: -0.5,
              lineHeight: 34,
              marginBottom: 10,
            }}
          >
            {article.title}
          </Text>

          {article.createdAt && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 20,
                backgroundColor: isDark
                  ? "rgba(124,58,237,0.12)"
                  : "rgba(124,58,237,0.07)",
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 6,
                alignSelf: "flex-start",
                borderWidth: 1,
                borderColor: isDark
                  ? "rgba(124,58,237,0.25)"
                  : "rgba(124,58,237,0.15)",
              }}
            >
              <Text
                style={{ color: "#8b5cf6", fontSize: 12, fontWeight: "600" }}
              >
                {new Date(article.createdAt).toLocaleDateString("hu-HU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
          )}

          <View
            style={{
              height: 1,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.06)",
              marginBottom: 20,
            }}
          />

          <Text
            style={{
              fontSize: 16,
              color: t.textSub,
              lineHeight: 28,
              letterSpacing: 0.1,
            }}
          >
            {article.content}
          </Text>
        </ScrollView>
      </Animated.View>
    </View>
  );
}
