// Legal sources only: TMDB (metadata), YouTube (CC-licensed + embeddable), Archive.org (public domain).
const TMDB = process.env.EXPO_PUBLIC_TMDB_KEY || '';
const YT = process.env.EXPO_PUBLIC_YT_KEY || '';
export const hasTmdb = !!TMDB, hasYt = !!YT;
const IMG = 'https://image.tmdb.org/t/p/';

const norm = (m, type) => ({
  id: `tmdb:${m.media_type || type}:${m.id}`, src: 'tmdb', tmdbId: m.id, type: m.media_type || type,
  title: m.title || m.name, year: (m.release_date || m.first_air_date || '').slice(0, 4),
  rating: m.vote_average ? +m.vote_average.toFixed(1) : null,
  poster: m.poster_path ? IMG + 'w342' + m.poster_path : null, overview: m.overview || '',
});

export async function tmdb(path, params = {}, type = 'movie') {
  if (!TMDB) return [];
  try {
    const q = new URLSearchParams({ api_key: TMDB, ...params });
    const j = await (await fetch(`https://api.themoviedb.org/3${path}?${q}`)).json();
    return (j.results || []).filter(m => m.poster_path || m.title || m.name)
      .filter(m => m.media_type !== 'person').map(m => norm(m, type));
  } catch { return []; }
}

export async function archive(query = 'collection:feature_films', rows = 20) {
  try {
    const q = `(${query}) AND mediatype:movies`;
    const u = `https://archive.org/advancedsearch.php?q=${encodeURIComponent(q)}&fl[]=identifier&fl[]=title&fl[]=year&fl[]=description&rows=${rows}&output=json&sort[]=downloads+desc`;
    const j = await (await fetch(u)).json();
    return j.response.docs.map(d => ({
      id: `ia:${d.identifier}`, src: 'ia', iaId: d.identifier, type: 'movie', title: d.title, year: String(d.year || ''),
      rating: null, poster: `https://archive.org/services/img/${d.identifier}`,
      overview: (Array.isArray(d.description) ? d.description[0] : d.description || 'Public domain film from the Internet Archive.').replace(/<[^>]+>/g, ''),
    }));
  } catch { return []; }
}

// Returns {sd, hd} mp4 URLs hosted by Archive.org
export async function archiveFiles(id) {
  const j = await (await fetch(`https://archive.org/metadata/${id}`)).json();
  const f = (j.files || []).filter(x => /\.mp4$/i.test(x.name) && !/sample/i.test(x.name)).sort((a, b) => a.size - b.size);
  if (!f.length) return null;
  const url = x => `https://archive.org/download/${id}/${encodeURIComponent(x.name)}`;
  return { sd: url(f[0]), hd: url(f[f.length - 1]) };
}

// YouTube: ONLY Creative-Commons licensed, embeddable, long videos
export async function ytSearch(q, max = 15) {
  if (!YT) return [];
  try {
    const p = new URLSearchParams({ part: 'snippet', type: 'video', videoEmbeddable: 'true', videoLicense: 'creativeCommon', videoDuration: 'long', maxResults: max, q, key: YT });
    const j = await (await fetch(`https://www.googleapis.com/youtube/v3/search?${p}`)).json();
    return (j.items || []).map(v => ({
      id: `yt:${v.id.videoId}`, src: 'yt', videoId: v.id.videoId, type: 'movie', title: v.snippet.title,
      year: v.snippet.publishedAt.slice(0, 4), rating: null, poster: v.snippet.thumbnails.high?.url, overview: v.snippet.description,
    }));
  } catch { return []; }
}

// Decide what can legally be played for an item.
export async function findPlayable(item) {
  if (item.src === 'yt') return { kind: 'yt', videoId: item.videoId };
  if (item.src === 'ia') return { kind: 'ia', id: item.iaId };
  const [yt] = await ytSearch(`${item.title} ${item.year} full movie`, 3);
  if (yt) return { kind: 'yt', videoId: yt.videoId };
  const [ia] = await archive(`title:("${item.title.replace(/"/g, '')}")`, 1);
  if (ia) return { kind: 'ia', id: ia.iaId };
  const t = await tmdb(`/${item.type}/${item.tmdbId}/videos`, {}, item.type).catch(() => []);
  try {
    const j = await (await fetch(`https://api.themoviedb.org/3/${item.type}/${item.tmdbId}/videos?api_key=${TMDB}`)).json();
    const v = (j.results || []).find(x => x.site === 'YouTube' && x.type === 'Trailer') || (j.results || []).find(x => x.site === 'YouTube');
    if (v) return { kind: 'yt', videoId: v.key, trailer: true };
  } catch {}
  return null;
}
