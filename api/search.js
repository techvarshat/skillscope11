export default async function handler(req, res) {
  try {
    const q = (req.query.q || req.url && new URL(req.url, 'http://localhost').searchParams.get('q')) || '';
    const max = Number(req.query.max || 20);
    if (!q) return res.status(400).json({ error: 'missing query q' });

    const YT_KEY = process.env.YOUTUBE_API_KEY;
    if (!YT_KEY) return res.status(500).json({ error: 'YOUTUBE_API_KEY not set' });

    const eduQuery = `${q} (tutorial OR course OR learn OR lesson OR beginners)`;
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: eduQuery,
      type: 'video',
      maxResults: String(Math.min(max * 2, 50)),
      videoDuration: 'medium',
      key: YT_KEY
    });

    const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`);
    if (!searchRes.ok) {
      const t = await searchRes.text();
      return res.status(502).json({ error: 'YouTube search failed', detail: t });
    }

    const sjson = await searchRes.json();
    const ids = (sjson.items || []).map(i => i.id?.videoId).filter(Boolean).join(',');
    if (!ids) return res.json([]);

    const detailsParams = new URLSearchParams({ part: 'snippet,statistics,contentDetails', id: ids, key: YT_KEY });
    const detailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?${detailsParams.toString()}`);
    if (!detailsRes.ok) {
      const t = await detailsRes.text();
      return res.status(502).json({ error: 'YouTube videos failed', detail: t });
    }

    const djson = await detailsRes.json();
    const items = djson.items || [];

    // helper to test educational keywords
    const isEducational = (title = '', desc = '') => {
      const a = `${title} ${desc}`.toLowerCase();
      return ['tutorial', 'course', 'learn', 'lesson', 'guide', 'how to', 'curriculum', 'course outline', 'beginner'].some(k => a.includes(k));
    };

    const results = items.map(v => {
      const s = v.snippet || {};
      const stats = v.statistics || {};
      const id = v.id;
      if (!isEducational(s.title || '', s.description || '')) return null;
      const shortSummary = `${s.description?.split('\n')[0]?.slice(0, 140) || ''}`;
      return {
        id,
        title: s.title || '',
        provider: 'YouTube',
        url: `https://www.youtube.com/watch?v=${id}`,
        rating: 3, // placeholder (AI rating can be added later)
        views: Number(stats.viewCount || 0),
        category: 'Learning',
        thumbnail: (s.thumbnails && (s.thumbnails.high?.url || s.thumbnails.default?.url)) || '',
        summary: shortSummary,
        reviews: [],
        createdAt: s.publishedAt || new Date().toISOString()
      };
    }).filter(Boolean).sort((a,b) => b.views - a.views).slice(0, max);

    return res.json(results);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: String(e && e.message || e) });
  }
}
