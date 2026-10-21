import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { C } from '../theme';
export default function MovieCard({ item, width = 120, progress }) {
  const nav = useNavigation();
  return (
    <Pressable onPress={() => nav.navigate('Detail', { item })} style={({ pressed }) => ({ width, marginRight: 12, opacity: pressed ? 0.7 : 1 })}>
      <View style={{ width, height: width * 1.5, borderRadius: 12, overflow: 'hidden', backgroundColor: C.card }}>
        {item.poster ? <Image source={{ uri: item.poster }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : null}
        {progress != null && <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, backgroundColor: '#0008' }}>
          <View style={{ width: `${Math.min(100, progress * 100)}%`, height: 4, backgroundColor: C.accent }} /></View>}
      </View>
      <Text numberOfLines={1} style={{ color: C.text, fontWeight: '600', marginTop: 6, fontSize: 13 }}>{item.title}</Text>
      <Text style={{ color: C.sub, fontSize: 12 }}>{item.year}{item.rating ? `  ★ ${item.rating}` : ''}</Text>
    </Pressable>
  );
}
