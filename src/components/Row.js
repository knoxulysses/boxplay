import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import MovieCard from './MovieCard';
import Shimmer from './Shimmer';
import { C } from '../theme';
export default function Row({ title, load }) {
  const [data, setData] = useState(null);
  useEffect(() => { let on = true; load().then(d => on && setData(d)); return () => { on = false; }; }, [title]);
  if (data && !data.length) return null;
  return (
    <View style={{ marginBottom: 22 }}>
      <Text style={{ color: C.text, fontSize: 18, fontWeight: '700', marginHorizontal: 16, marginBottom: 10 }}>{title}</Text>
      {data ? <FlatList horizontal showsHorizontalScrollIndicator={false} data={data} keyExtractor={i => i.id}
        contentContainerStyle={{ paddingHorizontal: 16 }} renderItem={({ item }) => <MovieCard item={item} />} />
        : <View style={{ flexDirection: 'row', paddingHorizontal: 16 }}>{[0, 1, 2].map(i => <Shimmer key={i} style={{ marginRight: 12 }} />)}</View>}
    </View>
  );
}
