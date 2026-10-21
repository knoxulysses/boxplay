import React from 'react';
import { View, Text, Image, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { showInterstitial } from '../ads';
import { C } from '../theme';

export default function Detail({ route, navigation }) {
  const { item } = route.params;
  const { inList, toggleList, history, premium } = useStore();
  const h = history[item.id], saved = inList(item.id);
  const play = async () => { if (!premium) await showInterstitial(); navigation.navigate('Player', { item }); };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }}>
      {item.poster && <Image source={{ uri: item.poster.replace('w342', 'w780') }} style={{ width: '100%', height: 420 }} resizeMode="cover" />}
      <View style={{ padding: 16 }}>
        <Text style={{ color: C.text, fontSize: 26, fontWeight: '800' }}>{item.title}</Text>
        <Text style={{ color: C.sub, marginTop: 6 }}>{item.year}{item.rating ? `  •  ★ ${item.rating}` : ''}  •  {item.src === 'ia' ? 'Public Domain' : item.src === 'yt' ? 'YouTube (CC)' : item.type === 'tv' ? 'Series' : 'Movie'}</Text>
        <View style={{ flexDirection: 'row', marginVertical: 18 }}>
          <Pressable onPress={play} style={{ flex: 1, backgroundColor: C.accent, borderRadius: 28, padding: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="play" size={20} color="#000" /><Text style={{ fontWeight: '800', marginLeft: 6 }}>{h ? 'Resume' : 'Play'}</Text>
          </Pressable>
          <Pressable onPress={() => toggleList(item)} style={{ marginLeft: 12, backgroundColor: C.card, borderRadius: 28, paddingHorizontal: 20, justifyContent: 'center' }}>
            <Ionicons name={saved ? 'checkmark' : 'add'} size={24} color={saved ? C.accent : '#fff'} />
          </Pressable>
        </View>
        {h && <View style={{ height: 4, backgroundColor: '#333', borderRadius: 2, marginBottom: 16 }}><View style={{ height: 4, width: `${Math.min(100, (h.pos / (h.dur || 1)) * 100)}%`, backgroundColor: C.accent }} /></View>}
        <Text style={{ color: '#ddd', lineHeight: 22 }}>{item.overview || 'No description available.'}</Text>
        <Text style={{ color: C.sub, fontSize: 11, marginTop: 20 }}>Videos are embedded from YouTube / Archive.org. BoxPlay hosts no video files. Metadata by TMDB.</Text>
      </View>
    </ScrollView>
  );
}
