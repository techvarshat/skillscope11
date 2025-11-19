import express from 'express';
import cors from 'cors';
import axios from 'axios';

const PORT = process.env.PORT || 4000;
const YT_KEY = process.env.YOUTUBE_API_KEY;

const app = express();
app.use(cors());
app.use(express.json());



function unifiedScore(views = 0, publishedAt) {
  const now = Date.now();
  const pub = publishedAt ? new Date(publishedAt).getTime() : now;
  const days = Math.max(1, Math.floor((now - pub) / (1000 * 60 * 60 * 24)));
  const pop = Math.log10(views + 1);
  const popNorm = Math.min(1, pop / 7);
  const recencyNorm = 1 / (1 + days / 365);
  const score = (popNorm * 0.65 + recencyNorm * 0.35) * 100;
  return Math.round(score * 10) / 10;
}

async function fetchYouTubeVideosByQuery(query, maxResults = 20) {
  if (!YT_KEY) throw new Error('YOUTUBE_API_KEY not set in environment');
  const eduQuery = `${query} (tutorial OR course OR learn OR lesson OR beginners)`;
  const searchUrl = 'https://www.googleapis.com/youtube/v3/search';
  const sres = await axios.get(searchUrl, {
    params: {
      part: 'snippet',
      q: eduQuery,
      type: 'video',
      maxResults: Math.min(maxResults * 2, 50),
      videoDuration: 'medium',
      relevanceLanguage: 'en',
      key: YT_KEY
    }
  });
  const items = sres.data.items || [];
  const ids = items.map(i => i.id.videoId).filter(Boolean).join(',');
  if (!ids) return [];
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
  return { vids, channelStats };
}

async function normalizeYouTubeVideo(v) {
  const s = v.snippet || {};
  const stats = v.statistics || {};
  const id = v.id;
  const views = Number(stats.viewCount || 0);
  const likes = Number(stats.likeCount || 0);
  const comments = Number(stats.commentCount || 0);
  const publishedAt = s.publishedAt;
  const title = s.title?.toLowerCase() || '';
  const desc = s.description?.toLowerCase() || '';
  // Only keep educational filter
  const isEducational = title.includes('tutorial') || title.includes('course') || title.includes('learn') || title.includes('lesson') || title.includes('guide') || title.includes('how to') || desc.includes('learn') || desc.includes('tutorial') || desc.includes('course outline') || desc.includes('curriculum');
  if (!isEducational) return null;

  // Custom rating formula using only YouTube API fields: views, likes, comments, publishedAt
  // Formula: Rating = 3 + (engagement_score * 0.8 + popularity_score * 0.2) * time_decay, clamped 3-5, rounded to 1 decimal
  const now = Date.now();
  const pub = publishedAt ? new Date(publishedAt).getTime() : now;
  const ageDays = Math.max(1, Math.floor((now - pub) / (1000 * 60 * 60 * 24)));
  const timeDecay = Math.pow(0.95, ageDays / 30); // decay 5% per month
  const engagementRate = (likes + comments) / Math.max(1, views / 1000);
  const engagementScore = Math.min(1, engagementRate / 10); // normalize to 0-1
  const popularityScore = Math.min(1, Math.log10(views + 1) / 8); // normalize log views
  const combinedScore = engagementScore * 0.8 + popularityScore * 0.2;
  const rating = Math.round((Math.min(5, Math.max(3, 3 + combinedScore * timeDecay * 2))) * 10) / 10; // round to 1 decimal

  // Summary from description
  const summary = s.description?.slice(0, 200) || '';
  return {
    id,
    title: s.title || '',
    provider: 'YouTube',
    url: `https://www.youtube.com/watch?v=${id}`,
    rating: Math.min(5, Math.max(0, rating)), // clamp 0-5
    views,
    category: 'Learning',
    thumbnail: (s.thumbnails && (s.thumbnails.high?.url || s.thumbnails.default?.url)) || '',
    summary,
    createdAt: publishedAt || new Date().toISOString(),
    unifiedScore: unifiedScore(views, publishedAt)
  };
}

app.get('/api/search', async (req, res) => {
  try {
    const q = req.query.q;
    const max = Number(req.query.max) || 20;
    if (!q) return res.status(400).json({ error: 'missing query param q' });
    const { vids, channelStats } = await fetchYouTubeVideosByQuery(q, max);
    const results = [];
    for (const v of vids) {
      const normalized = await normalizeYouTubeVideo(v, channelStats);
      if (normalized) results.push(normalized);
    }
    results.sort((a, b) => b.rating - a.rating);
    const bestPicks = results.slice(0, 3);
    const remaining = results.slice(3);
    res.json({ bestPicks, results: remaining });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`SkillScope backend listening on http://localhost:${PORT}`);
});
