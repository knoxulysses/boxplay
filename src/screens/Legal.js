import React from 'react';
import { ScrollView, Text, Pressable, Linking } from 'react-native';
import { C, DMCA_EMAIL } from '../theme';
const P = ({ h, children }) => <><Text style={{ color: C.text, fontWeight: '800', fontSize: 16, marginTop: 18 }}>{h}</Text><Text style={{ color: '#ccc', lineHeight: 21, marginTop: 6 }}>{children}</Text></>;
export default function Legal() {
  return (
    <ScrollView style={{ backgroundColor: C.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={{ color: C.text, fontSize: 22, fontWeight: '800' }}>BoxPlay</Text>
      <P h="About">BoxPlay is a discovery app and hosts no video files. All videos are embedded from YouTube (Creative-Commons licensed, embeddable videos only) or streamed from Archive.org (public-domain films). Posters and descriptions come from TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.</P>
      <P h="Terms of Use">All video content belongs to its respective owners and is subject to YouTube's Terms of Service and Archive.org's terms. BoxPlay does not download, copy, or redistribute video. Availability may change at any time. The app is provided "as is" without warranty.</P>
      <P h="DMCA / Copyright">If you own a copyright in a video listed here, use the Report button in the player or email below with the content ID, your contact details, and a good-faith statement. We will remove the listing promptly. Please also report infringing uploads to YouTube / Archive.org directly.</P>
      <Pressable onPress={() => Linking.openURL(`mailto:${DMCA_EMAIL}?subject=DMCA notice`)}><Text style={{ color: C.danger, marginTop: 14, fontWeight: '700' }}>⚑ {DMCA_EMAIL}</Text></Pressable>
    </ScrollView>
  );
}
