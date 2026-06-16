import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';

import { ACTION_MINT, getWheelSegmentColor, truncateLabel } from '@/constants/wheel';

const WHEEL_SIZE = 300;
const RADIUS = WHEEL_SIZE / 2;

type WheelProps = {
  labels: string[];
  onSpinComplete: (winner: string) => void;
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function segmentPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

export default function Wheel({ labels, onSpinComplete }: WheelProps) {
  const rotation = useSharedValue(0);
  const [isSpinning, setIsSpinning] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const finishSpin = useCallback(
    (winner: string) => {
      setIsSpinning(false);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSpinComplete(winner);
    },
    [onSpinComplete],
  );

  const spin = useCallback(() => {
    if (isSpinning || labels.length < 2) return;

    const winnerIndex = Math.floor(Math.random() * labels.length);
    const sliceAngle = 360 / labels.length;
    const targetMod = 360 - (winnerIndex * sliceAngle + sliceAngle / 2);
    const currentMod = rotation.value % 360;
    const delta = 360 * 5 + ((targetMod - currentMod + 360) % 360);

    setIsSpinning(true);

    rotation.value = withTiming(
      rotation.value + delta,
      {
        duration: 4000,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(finishSpin)(labels[winnerIndex]);
        }
      },
    );
  }, [finishSpin, isSpinning, labels, rotation]);

  const sliceAngle = labels.length > 0 ? 360 / labels.length : 0;
  const showLabels = labels.length <= 24;
  const labelMaxLength = labels.length > 16 ? 6 : labels.length > 10 ? 10 : 14;

  return (
    <View style={styles.container}>
      <View style={styles.pointer} />
      <Animated.View style={animatedStyle}>
        <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
          <G>
            {labels.map((label, index) => {
              const startAngle = index * sliceAngle;
              const endAngle = (index + 1) * sliceAngle;
              const midAngle = startAngle + sliceAngle / 2;
              const labelPos = polarToCartesian(RADIUS, RADIUS, RADIUS * 0.62, midAngle);
              const fontSize = labels.length > 20 ? 8 : labels.length > 12 ? 10 : 12;

              return (
                <G key={`${index}-${label}`}>
                  <Path
                    d={segmentPath(RADIUS, RADIUS, RADIUS, startAngle, endAngle)}
                    fill={getWheelSegmentColor(index)}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                  {showLabels && (
                    <G transform={`rotate(${midAngle}, ${labelPos.x}, ${labelPos.y})`}>
                      <SvgText
                        x={labelPos.x}
                        y={labelPos.y}
                        fill="#fff"
                        fontSize={fontSize}
                        fontWeight="600"
                        textAnchor="middle"
                        alignmentBaseline="middle">
                        {truncateLabel(label, labelMaxLength)}
                      </SvgText>
                    </G>
                  )}
                </G>
              );
            })}
          </G>
        </Svg>
      </Animated.View>

      <Pressable
        style={[styles.spinButton, { backgroundColor: ACTION_MINT }, isSpinning && styles.spinButtonDisabled]}
        onPress={spin}
        disabled={isSpinning || labels.length < 2}>
        <Text style={styles.spinButtonText}>{isSpinning ? 'Spinning…' : "spin the fuckin' bottle!"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointer: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 22,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#222',
  },
  spinButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  spinButtonDisabled: {
    opacity: 0.6,
  },
  spinButtonText: {
    color: '#F8FAF9',
    fontSize: 16,
    fontWeight: '700',
  },
});
