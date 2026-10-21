import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Row from '../components/Row';
import MovieCard from '../components/MovieCard';
import { tmdb, archive, ytSearch, hasTmdb } from '../api';
import { Banner } from '../ads';
import { useStore } from '../store';
import { C } from '../theme';

const classics = { title: 'Classic Movies (Archive.org)', load: () => archive('collection:feature_films') };
const tv = p => () => tmdb('/discover/tv', p, 'tv');
const mv = p => () => tmdb('/discover/movie', p);
const TABS = {
  Popular: [
    { title: 'Trending Now', load: () => tmdb('/trending/movie/week') },
    { title: 'Popular', load: () => tmdb('/movie/popular') },
    { title: 'Free on YouTube (Creative Commons)', load: () => ytSearch('full movie') },
    classics,
  ],
  'TOP 100': [1, 2, 3, 4, 5].map(p => ({ title: `Top Rated #${(p - 1) * 20 + 1}-${p * 20}`, load: () => tmdb('/movie/top_rated', { page: p }) })),
  Nollywood: [
    { title: 'Nollywood Movies', load: mv({ with_origin_country: 'NG', sort_by: 'popularity.desc' }) },
    { title: 'Nollywood Series', load: tv({ with_origin_country: 'NG', sort_by: 'popularity.desc' }) },
    { title: 'Nollywood on YouTube (CC)', load: () => ytSearch('nollywood full movie') },
  ],
  Philippine: [
    { title: 'Pinoy Movies', load: mv({ with_origin_country: 'PH', sort_by: 'popularity.desc' }) },
    { title: 'Pinoy Series', load: tv({ with_origin_country: 'PH', sort_by: 'popularity.desc' }) },
    { title: 'Pinoy on YouTube (CC)', load: () => ytSearch('pinoy full movie') },
  ],
  Anime: [{ title: 'Anime Series', load: tv({ with_genres: 16, with_original_language: 'ja', sort_by: 'popularity.desc' }) },
          { title: 'Anime Movies', load: mv({ with_genres: 16, with_original_language: 'ja', sort_by: 'popularity.desc' }) }],
  'K-Drama': [{ title: 'K-Drama', load: tv({ with_genres: 18, with_original_language: 'ko', sort_by: 'popularity.desc' }) },
              { title: 'Korean Movies', load: mv({ with_original_language: 'ko', sort_by: 'popularity.desc' }) }],
};

export default function Home() {
  const { premium, list, history } = useStore();
  const [tab, setTab] = useState('Popular');
  const [q, setQ] = useState('');
  const [res, setRes] = useState(null);

  // Live search (debounced): TMDB + Archive.org + local My List/History
  useEffect(() => {
    if (q.trim().length < 2) return setRes(null);
    const t = setTimeout(async () => {
      const term = q.trim().toLowerCase();
      const local = [...list, ...Object.values(history).map(h => h.item)].filter(m => m.title.toLowerCase().includes(term));
      const [a, b] = await Promise.all([tmdb('/search/multi', { query: q }), archive(`title:(${q.replace(/["()]/g, '')})`, 10)]);
      const seen = new Set();
      setRes([...local, ...a, ...b].filter(m => !seen.has(m.id) && seen.add(m.id)));
    }, 400);
    return () => clearTimeout(t);
  }, [q]);

  const rows = hasTmdb ? TABS[tab] : [classics];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, margin: 16, borderRadius: 24, paddingHorizontal: 14 }}>
        <Ionicons name="search" size={18} color={C.sub} />
        <TextInput value={q} onChangeText={setQ} placeholder="Search movies & series" placeholderTextColor={C.sub}
          style={{ flex: 1, color: C.text, paddingVertical: 12, paddingHorizontal: 8 }} />
        {!!q && <Ionicons name="close-circle" size={18} color={C.sub} onPress={() => setQ('')} />}
      </View>
      {res ? (
        <FlatList data={res} numColumns={3} keyExtractor={i => i.id} contentContainerStyle={{ paddingHorizontal: 16 }}
          columnWrapperStyle={{ marginBottom: 16 }} ListEmptyComponent={<Text style={{ color: C.sub, textAlign: 'center' }}>No results</Text>}
          renderItem={({ item }) => <MovieCard item={item} width={105} />} />
      ) : (
        <>
          <View style={{ height: 44 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {Object.keys(TABS).map(t => (
                <Pressable key={t} onPress={() => setTab(t)} style={{ marginRight: 22, justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: tab === t ? C.accent : 'transparent' }}>
                  <Text style={{ color: tab === t ? C.text : C.sub, fontWeight: '700', fontSize: 15 }}>{t}</Text>
                </Pressable>))}
            </ScrollView>
          </View>
          <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}>
            {!hasTmdb && <Text style={{ color: C.sub, marginHorizontal: 16, marginBottom: 16 }}>Add your free TMDB key in .env to unlock all tabs. Showing public-domain classics for now.</Text>}
            {rows.map(r => <Row key={tab + r.title} title={r.title} load={r.load} />)}
          </ScrollView>
        </>
      )}
      <Banner premium={premium} />
    </SafeAreaView>
  );
}
