import axios from 'axios';

export default async function handler(req, res) {
  try {
    const q = req.query.q || '';
    const max = Number(req.query.max) || 20;
    const YT_KEY = process.env.YOUTUBE_API_KEY;

    if (!YT_KEY) return res.status(500).json({ error: 'YOUTUBE_API_KEY not set' });
    const eduQuery = `${q} (tutorial OR course OR learn OR lesson OR beginners)`;
    const searchUrl = 'https://www.googleapis.com/youtube/v3/search';
    const sres = await axios.get(searchUrl, {
      params: {
        part: 'snippet',
        q: eduQuery,
        type: 'video',
        maxResults: Math.min(max * 2, 50),
        videoDuration: 'medium',
        relevanceLanguage: 'en',
        key: YT_KEY
      }
    });
    const items = sres.data.items || [];
    const ids = items.map(i => i.id.videoId).filter(Boolean).join(',');
    if (!ids) return res.json([]);
    const detailsUrl = 'https://www.googleapis.com/youtube/v3/videos';
    const dres = await axios.get(detailsUrl, {
      params: { part: 'snippet,statistics,contentDetails', id: ids, key: YT_KEY }
    });
    const vids = dres.data.items || [];
    // Collect channel IDs for subscriber counts
    const channelIds = vids.map(v => v.snippet.channelId).filter(Boolean).join(',');
    let channelStats = {};
    if (channelIds) {
      const channelsUrl = 'https://www.googleapis.com/youtube/v3/channels';
      const cres = await axios.get(channelsUrl, {
        params: { part: 'statistics', id: channelIds, key: YT_KEY }
      });
      const channels = cres.data.items || [];
      channels.forEach(ch => {
        channelStats[ch.id] = Number(ch.statistics.subscriberCount || 0);
      });
    }

    const results = [];
    for (const v of vids) {
      const s = v.snippet || {};
      const stats = v.statistics || {};
      const id = v.id;
      const title = s.title?.toLowerCase() || '';
      const desc = s.description?.toLowerCase() || '';
      const isEducational = title.includes('tutorial') || title.includes('course') || title.includes('learn') || title.includes('lesson') || title.includes('guide') || title.includes('how to') || desc.includes('learn') || desc.includes('tutorial') || desc.includes('course outline') || desc.includes('curriculum');
      if (!isEducational) continue;
      const views = Number(stats.viewCount || 0);
      const likes = Number(stats.likeCount || 0);
      const comments = Number(stats.commentCount || 0);
      const subscribers = channelStats[s.channelId] || 0;
      // Formula: rating = min(10, (likes/views * 100) + (comments/views * 100) + (subscribers/1000000 * 10))
      const likeRate = views > 0 ? (likes / views) * 100 : 0;
      const commentRate = views > 0 ? (comments / views) * 100 : 0;
      const subRate = (subscribers / 1000000) * 10;
      const rating = Math.min(10, likeRate + commentRate + subRate);
      const summary = s.description?.slice(0, 200) || '';
      results.push({
        id,
        title: s.title || '',
        provider: 'YouTube',
        url: `https://www.youtube.com/watch?v=${id}`,
        rating,
        views,
        category: 'Learning',
        thumbnail: (s.thumbnails && (s.thumbnails.high?.url || s.thumbnails.default?.url)) || '',
        summary,
        createdAt: s.publishedAt || new Date().toISOString()
      });
    }
    results.sort((a, b) => b.rating - a.rating);
    const bestPicks = results.slice(0, 3);
    const remaining = results.slice(3, max + 3);
    res.json({ bestPicks, results: remaining });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}
