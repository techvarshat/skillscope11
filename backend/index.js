import express from 'express';
import cors from 'cors';
import axios from 'axios';

const PORT = process.env.PORT || 4000;
const YT_KEY = process.env.YOUTUBE_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_KEY;

const app = express();
app.use(cors());
app.use(express.json());

async function getAIAnalysis(title, description) {
  try {
    const preferred = process.env.PREFERRED_OPENROUTER_MODEL || 'openai/gpt-oss-safeguard-20b';
    const fallbackModel = 'mistralai/mistral-7b-instruct';
    const models = [preferred, fallbackModel];
    for (const model of models) {
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model,
            messages: [
              { role: 'system', content: 'You are a helpful expert at analyzing educational content.' },
              { role: 'user', content: `Analyze this educational video content and provide:\n1. A concise 2-sentence summary\n2. A quality rating from 1-5 stars based on educational value\nFormat: {summary: "...", rating: X}\n\nTitle: ${title}\nDescription: ${description}` }
            ],
            max_tokens: 300
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENROUTER_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        let content = response.data.choices?.[0]?.message?.content || '';
        content = content.replace(/^```\w*\n/, '').replace(/\n```$/, '').trim();
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            const parsed = JSON.parse(match[0]);
            return { summary: parsed.summary || '', rating: Number(parsed.rating) || 3 };
          } catch (e) { continue; }
        }
        return { summary: String(content).slice(0, 300), rating: 3 };
      } catch (err) { continue; }
    }
    return { summary: description?.slice(0, 140) || '', rating: 3 };
  } catch (e) {
    return { summary: description?.slice(0, 140) || '', rating: 3 };
  }
}

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
  // Remove all restrictions except educational filter
  const searchUrl = 'https://www.googleapis.com/youtube/v3/search';
  // Fetch up to 100 results for better coverage
  const sres = await axios.get(searchUrl, {
    params: {
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: 50,
      order: 'relevance',
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
  return vids;
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

  // AI only for summary
  const analysis = await getAIAnalysis(s.title || '', s.description || '');
  return {
    id,
    title: s.title || '',
    provider: 'YouTube',
    url: `https://www.youtube.com/watch?v=${id}`,
    rating: Math.min(5, Math.max(0, rating)), // clamp 0-5
    views,
    category: 'Learning',
    thumbnail: (s.thumbnails && (s.thumbnails.high?.url || s.thumbnails.default?.url)) || '',
    summary: analysis.summary,
    createdAt: publishedAt || new Date().toISOString(),
    unifiedScore: unifiedScore(views, publishedAt)
  };
}

app.get('/api/search', async (req, res) => {
  try {
    const q = req.query.q;
    if (!q) return res.status(400).json({ error: 'missing query param q' });
    const max = Number(req.query.max) || 40;
    // Fetch a large number of YouTube results for better coverage
    const vids = await fetchYouTubeVideosByQuery(q, 100);
    const mapped = await Promise.all(vids.map(v => normalizeYouTubeVideo(v)));
    const ytResults = mapped.filter(Boolean);

    // Use only YouTube results
    const merged = ytResults;

    // Sort by rating (descending) - highest rated first
    merged.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    // Create top section with top 4 videos
    const topVideos = merged.slice(0, 4);

    // Return all results with top section
    const response = {
      top: topVideos,
      results: merged.slice(0, Math.max(max, 40))
    };
    res.json(response);
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
});

app.listen(PORT, () => {
  console.log(`SkillScope backend listening on http://localhost:${PORT}`);
});
