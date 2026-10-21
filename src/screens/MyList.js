import React from 'react';
import { ScrollView, Text, FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MovieCard from '../components/MovieCard';
import { useStore } from '../store';
import { C } from '../theme';

const Section = ({ title, data, prog }) => data.length ? (
  <View style={{ marginBottom: 22 }}>
    <Text style={{ color: C.text, fontSize: 18, fontWeight: '700', margin: 16, marginBottom: 10 }}>{title}</Text>
    <FlatList horizontal data={data} keyExtractor={i => i.item.id} contentContainerStyle={{ paddingHorizontal: 16 }}
      renderItem={({ item }) => <MovieCard item={item.item} progress={prog ? item.pos / (item.dur || 1) : undefined} />} />
  </View>) : null;

export default function MyList() {
  const { list, history } = useStore();
  const hist = Object.values(history).sort((a, b) => b.at - a.at);
  const cont = hist.filter(h => h.dur && h.pos / h.dur < 0.95);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScrollView>
        <Section title="Continue Watching" data={cont} prog />
        <Section title="My List" data={list.map(item => ({ item }))} />
        <Section title="Watch History" data={hist} />
        {!list.length && !hist.length && <Text style={{ color: C.sub, textAlign: 'center', marginTop: 80 }}>Nothing here yet. Save titles with + on a movie page.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}
