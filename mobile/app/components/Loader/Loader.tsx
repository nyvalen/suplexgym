import {
  BlurMask,
  Canvas,
  Path,
  Skia,
  SweepGradient,
  vec,
} from "@shopify/react-native-skia";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const CanvasSize = 100;
const CircleSize = 64;
const StrokeWidth = 10;
const CircleRadius = (CircleSize - StrokeWidth) / 2;

export const Loader = () => {
  const progress = useSharedValue(0);
  const startAnimated = useDerivedValue(() => {
    return interpolate(progress.value, [0, 0.5, 1], [0.3, 0.45, 0.3]);
  });

  const CirclePath = useMemo(() => {
    const skPath = Skia.Path.Make();
    skPath.addCircle(CanvasSize / 2, CanvasSize / 2, CircleRadius);
    return skPath;
  }, []);

  const CirclePath2 = useMemo(() => {
    const skPath = Skia.Path.Make();
    skPath.addCircle(CanvasSize / 2, CanvasSize / 2, CircleRadius * 1.05);
    return skPath;
  }, []);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, []);

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${progress.value * 2 * Math.PI}rad`,
        },
      ],
    };
  }, []);

  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const isLoading = true;

  return (
    <View className="h-full justify-center">
      {isLoading ? (
        <Animated.View
          style={rStyle}
          exiting={FadeOut.duration(500)}
          className="flex-1 items-center h-screen justify-center"
        >
          <Canvas style={{ width: CanvasSize, height: CanvasSize }}>
            <Path
              path={CirclePath}
              color={"white"}
              style={"stroke"}
              strokeWidth={StrokeWidth}
              start={startAnimated}
              end={0.65}
              strokeCap={"round"}
            >
              <SweepGradient
                c={vec(CanvasSize / 2, CanvasSize / 2)}
                colors={["darkpurple", "indigo", "purple", "darkpurple"]}
              />
              <BlurMask blur={3} style={"solid"} />
            </Path>
            <Path
              path={CirclePath2}
              color={"white"}
              style={"stroke"}
              strokeWidth={StrokeWidth}
              start={startAnimated}
              end={0.65}
              strokeCap={"round"}
            >
              <SweepGradient
                c={vec(CanvasSize / 2, CanvasSize / 2)}
                colors={["darkpurple", "indigo", "purple", "darkpurple"]}
              />
              <BlurMask blur={5} style={"outer"} />
            </Path>
          </Canvas>
        </Animated.View>
      ) : null}
    </View>
  );
};
