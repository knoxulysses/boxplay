import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
export default function Shimmer({ w = 120, h = 180, style }) {
  const a = useRef(new Animated.Value(0.3)).current;
  useEffect(() => { Animated.loop(Animated.sequence([
    Animated.timing(a, { toValue: 0.7, duration: 700, useNativeDriver: true }),
    Animated.timing(a, { toValue: 0.3, duration: 700, useNativeDriver: true })])).start(); }, []);
  return <Animated.View style={[{ width: w, height: h, borderRadius: 12, backgroundColor: '#2c2c2c', opacity: a }, style]} />;
}
