import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, Linking, Dimensions } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Video } from 'expo-av';
import { findPlayable, archiveFiles } from '../api';
import { showRewarded } from '../ads';
import { useStore } from '../store';
import { C, DMCA_EMAIL } from '../theme';

const Msg = ({ t }) => <Text style={{ color: C.sub, padding: 24, textAlign: 'center' }}>{t}</Text>;

export default function Player({ route }) {
  const { item } = route.params;
  const { history, saveProgress, premium } = useStore();
  const [p, setP] = useState(undefined);   // playable; null = no legal source found
  const [files, setFiles] = useState(null);
  const [hd, setHd] = useState(premium);   // HD unlock + watermark removal
  const yt = useRef(), last = history[item.id], tick = useRef(0);
  const w = Dimensions.get('window').width;

  useEffect(() => { (async () => {
    const pl = await findPlayable(item);
    if (pl?.kind === 'ia') setFiles(await archiveFiles(pl.id).catch(() => null));
    setP(pl);
  })(); }, []);

  useEffect(() => { // YouTube progress tracking every 5s
    if (p?.kind !== 'yt') return;
    const t = setInterval(async () => {
      try { const [c, d] = await Promise.all([yt.current.getCurrentTime(), yt.current.getDuration()]); if (c > 5) saveProgress(item, c, d); } catch {}
    }, 5000);
    return () => clearInterval(t);
  }, [p]);

  const unlock = async () => { if (await showRewarded()) setHd(true); };
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ width: w, height: w * 9 / 16, backgroundColor: '#000', justifyContent: 'center' }}>
        {p === undefined ? <ActivityIndicator color={C.accent} size="large" />
          : p === null ? <Msg t="No legal free stream found for this title." />
          : p.kind === 'yt' ? <YoutubePlayer ref={yt} height={w * 9 / 16} videoId={p.videoId} play initialPlayerParams={{ start: Math.floor(last?.pos || 0) }} />
          : files ? <Video source={{ uri: hd ? files.hd : files.sd }} style={{ flex: 1 }} useNativeControls shouldPlay resizeMode="contain"
              positionMillis={(last?.pos || 0) * 1000}
              onPlaybackStatusUpdate={s => { if (s.isLoaded && Date.now() - tick.current > 5000 && s.positionMillis > 5000) { tick.current = Date.now(); saveProgress(item, s.positionMillis / 1000, s.durationMillis / 1000); } }} />
          : <Msg t="No playable file on Archive.org." />}
        {!hd && p && <Text pointerEvents="none" style={{ position: 'absolute', top: 8, right: 10, color: '#fff7', fontWeight: '800' }}>BoxPlay</Text>}
      </View>
      <View style={{ padding: 16 }}>
        <Text style={{ color: C.text, fontSize: 20, fontWeight: '800' }}>{item.title}</Text>
        {p?.trailer && <Text style={{ color: C.accent, marginTop: 6 }}>No free full movie available, so the official trailer is playing.</Text>}
        {!hd && <Pressable onPress={unlock} style={{ backgroundColor: C.card, borderRadius: 12, padding: 14, marginTop: 16 }}>
          <Text style={{ color: C.accent, fontWeight: '700' }}>▶ Watch a short ad: Unlock HD / Remove Watermark</Text></Pressable>}
        <Text style={{ color: C.sub, fontSize: 12, marginTop: 20 }}>Streamed from {p?.kind === 'ia' ? 'Archive.org (public domain)' : 'YouTube (embedded)'}. BoxPlay does not host this video.</Text>
        <Pressable onPress={() => Linking.openURL(`mailto:${DMCA_EMAIL}?subject=${encodeURIComponent('DMCA report: ' + item.title)}&body=${encodeURIComponent('Content ID: ' + item.id + '\n\nDescribe the issue:')}`)}>
          <Text style={{ color: C.danger, marginTop: 14 }}>⚑ Report this video (DMCA)</Text></Pressable>
      </View>
    </View>
  );
}
