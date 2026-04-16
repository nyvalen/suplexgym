// app/components/OfflineBanner.tsx
//
// Two parts:
//   1. A slide-up bottom sheet that fires once when the connection drops.
//   2. A persistent small FAB (floating badge) shown while offline so the user
//      can re-open the offline tickets screen after dismissing the sheet.

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Modal,
  Platform,
} from "react-native";
import { useNetInfo } from "@react-native-community/netinfo";
import { router } from "expo-router";
import { useTheme } from "../theme/ThemeContext";

export function OfflineBanner() {
  const netInfo = useNetInfo();
  const { isDark } = useTheme();

  // True while we are offline (even after sheet is dismissed)
  const [isOffline, setIsOffline] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const wasConnected = useRef<boolean | null>(null);

  // Sheet animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // FAB pulse
  const fabScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (netInfo.isConnected === null) return;
    const isNowConnected = netInfo.isConnected;

    if (wasConnected.current === true && isNowConnected === false) {
      // Transitioned → offline: show sheet
      setIsOffline(true);
      showModal();
    } else if (isNowConnected === true && wasConnected.current === false) {
      // Back online
      setIsOffline(false);
      hideModal();
    }

    wasConnected.current = isNowConnected;
  }, [netInfo.isConnected]);

  // Pulse the FAB every 3 s so it draws attention
  useEffect(() => {
    if (!isOffline || modalVisible) return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(fabScale, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fabScale, {
          toValue: 1.0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [isOffline, modalVisible]);

  const showModal = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideModal = (cb?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      cb?.();
    });
  };

  const goOfflineTickets = () => {
    hideModal(() => router.push("/offline-tickets" as any));
  };

  const sheetColor = isDark ? "#18181b" : "#ffffff";
  const handleColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";
  const dividerColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";

  return (
    <>
      {/* ── Slide-up sheet ─────────────────────────────────────────────────── */}
      {modalVisible && (
        <Modal
          transparent
          visible={modalVisible}
          animationType="none"
          statusBarTranslucent
          onRequestClose={() => hideModal()}
        >
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.55)",
              justifyContent: "flex-end",
              opacity: opacityAnim,
            }}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={() => hideModal()}
            />

            <Animated.View
              style={{
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
                backgroundColor: sheetColor,
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                paddingHorizontal: 24,
                paddingTop: 16,
                paddingBottom: Platform.OS === "ios" ? 44 : 28,
                borderTopWidth: 1,
                borderColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
              }}
            >
              {/* Handle */}
              <View
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: handleColor,
                  alignSelf: "center",
                  marginBottom: 20,
                }}
              />

              {/* Icon + text */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isDark
                      ? "rgba(248,113,113,0.15)"
                      : "rgba(220,38,38,0.08)",
                    borderWidth: 1,
                    borderColor: isDark
                      ? "rgba(248,113,113,0.3)"
                      : "rgba(220,38,38,0.2)",
                  }}
                ></View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "800",
                      color: isDark ? "#fafafa" : "#09090b",
                      letterSpacing: -0.3,
                    }}
                  >
                    No Internet Connection
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: isDark ? "#a1a1aa" : "#52525b",
                      marginTop: 2,
                    }}
                  >
                    Your saved tickets are still available offline.
                  </Text>
                </View>
              </View>

              <View
                style={{
                  height: 1,
                  backgroundColor: dividerColor,
                  marginVertical: 16,
                }}
              />

              <TouchableOpacity
                onPress={goOfflineTickets}
                activeOpacity={0.85}
                style={{
                  backgroundColor: "#7c3aed",
                  borderRadius: 18,
                  paddingVertical: 16,
                  alignItems: "center",
                  marginBottom: 10,
                  shadowColor: "#7c3aed",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 10,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}
                >
                  View Saved Tickets
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => hideModal()}
                activeOpacity={0.7}
                style={{ paddingVertical: 12, alignItems: "center" }}
              >
                <Text
                  style={{
                    color: isDark ? "#71717a" : "#a1a1aa",
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  Dismiss
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </Modal>
      )}

      {/* ── Persistent FAB — visible while offline even after sheet dismissed ─ */}
      {isOffline && !modalVisible && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: Platform.OS === "ios" ? 104 : 88,
            right: 16,
            transform: [{ scale: fabScale }],
            zIndex: 999,
          }}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            onPress={() => router.push("/offline-tickets" as any)}
            activeOpacity={0.85}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: "#7c3aed",
              borderRadius: 24,
              paddingVertical: 10,
              paddingHorizontal: 16,
              shadowColor: "#7c3aed",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.5,
              shadowRadius: 14,
              elevation: 12,
            }}
          >
            {/* Red dot */}
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#f87171",
              }}
            />
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
              Offline Tickets
            </Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </>
  );
}
