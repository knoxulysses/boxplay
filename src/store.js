// Local-only state (My List, history, premium, rewards) persisted with AsyncStorage. No server needed.
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Ctx = createContext();
export const useStore = () => useContext(Ctx);
const KEY = 'boxplay:v1';

export function StoreProvider({ children }) {
  const [s, setS] = useState({ ready: false, uid: '', list: [], history: {}, premium: false, coins: 0, streak: 0, lastCheckin: '' });
  useEffect(() => {
    AsyncStorage.getItem(KEY).then(r => {
      const d = r ? JSON.parse(r) : {};
      setS(p => ({ ...p, ...d, uid: d.uid || String(Math.floor(1e8 + Math.random() * 9e8)), ready: true }));
    });
  }, []);
  useEffect(() => { if (s.ready) AsyncStorage.setItem(KEY, JSON.stringify({ ...s, ready: undefined })); }, [s]);

  const api = {
    ...s,
    inList: id => s.list.some(m => m.id === id),
    toggleList: item => setS(p => ({ ...p, list: p.list.some(m => m.id === item.id) ? p.list.filter(m => m.id !== item.id) : [item, ...p.list] })),
    saveProgress: (item, pos, dur) => setS(p => ({ ...p, history: { ...p.history, [item.id]: { item, pos, dur, at: Date.now() } } })),
    clearHistory: () => setS(p => ({ ...p, history: {} })),
    setPremium: v => setS(p => ({ ...p, premium: v })),
    checkin: () => {
      const today = new Date().toDateString(), yest = new Date(Date.now() - 864e5).toDateString();
      if (s.lastCheckin === today) return 0;
      const streak = s.lastCheckin === yest ? s.streak + 1 : 1, gain = 10 + Math.min(streak, 7) * 5;
      setS(p => ({ ...p, streak, coins: p.coins + gain, lastCheckin: today }));
      return gain;
    },
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
