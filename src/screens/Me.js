import React from 'react';
import { ScrollView, View, Text, Pressable, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../store';
import { buyPremium, restorePremium } from '../ads';
import { C, DMCA_EMAIL } from '../theme';

const Item = ({ icon, label, onPress }) => (
  <Pressable onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, padding: 16, borderRadius: 12, marginBottom: 8 }}>
    <Ionicons name={icon} size={20} color={C.accent} /><Text style={{ color: C.text, flex: 1, marginLeft: 12 }}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color={C.sub} /></Pressable>);

export default function Me({ navigation }) {
  const s = useStore();
  const daily = () => { const g = s.checkin(); Alert.alert(g ? `+${g} coins!` : 'Already checked in', g ? 'Come back tomorrow to grow your streak.' : 'Come back tomorrow.'); };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: C.text, fontSize: 22, fontWeight: '800' }}>User ID: {s.uid}</Text>
        <View style={{ backgroundColor: '#2b2410', borderColor: C.accent, borderWidth: 1, borderRadius: 16, padding: 18, marginVertical: 16 }}>
          <Text style={{ color: C.accent, fontSize: 18, fontWeight: '800' }}>Premium Basic {s.premium ? '✓ Active' : ''}</Text>
          <Text style={{ color: '#ddd', marginVertical: 8 }}>Remove all ads and the watermark. One-time $2.99.</Text>
          {!s.premium && <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable onPress={async () => s.setPremium(await buyPremium())} style={{ backgroundColor: C.accent, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 18 }}><Text style={{ fontWeight: '800' }}>Remove ads $2.99</Text></Pressable>
            <Pressable onPress={async () => s.setPremium(await restorePremium())} style={{ padding: 10 }}><Text style={{ color: C.sub }}>Restore</Text></Pressable></View>}
        </View>
        <View style={{ backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 16 }}>
          <Text style={{ color: C.text, fontWeight: '700' }}>🎁 Rewards Center</Text>
          <Text style={{ color: C.sub, marginVertical: 6 }}>Coins: {s.coins}  •  Streak: {s.streak} day(s)</Text>
          <Pressable onPress={daily} style={{ backgroundColor: C.accent, borderRadius: 20, padding: 10, alignSelf: 'flex-start', paddingHorizontal: 18 }}><Text style={{ fontWeight: '800' }}>Daily Check-in</Text></Pressable>
        </View>
        <Item icon="time" label="Watch History" onPress={() => navigation.navigate('My List')} />
        <Item icon="trash" label="Settings: Clear watch history" onPress={() => Alert.alert('Clear history?', '', [{ text: 'Cancel' }, { text: 'Clear', style: 'destructive', onPress: s.clearHistory }])} />
        <Item icon="chatbubble" label="Feedback" onPress={() => Linking.openURL(`mailto:${DMCA_EMAIL}?subject=BoxPlay feedback`)} />
        <Item icon="shield-checkmark" label="About / DMCA / Terms" onPress={() => navigation.navigate('Legal')} />
      </ScrollView>
    </SafeAreaView>
  );
}
