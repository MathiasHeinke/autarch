# Social Listening Skill

## Description
Scans Reddit, X (Twitter), and longevity communities for mentions of ARES Bio.OS, relevant keywords, and sentiment analysis.

## Trigger
Daily cron at 10:00 UTC, or manual via `/social-listening`

## Steps
1. Use Apify Reddit Scraper to search:
   - r/longevity, r/biohacking, r/Supplements, r/QuantifiedSelf
   - Keywords: "bio tracking app", "biomarker", "longevity app", "health optimization", "ARES"
2. Use Apify Twitter/X Scraper for:
   - Keywords: "longevity app", "biomarker tracking", "health OS"
   - Influencer monitoring: top longevity/biohacking accounts
3. Analyze results:
   ```json
   {
     "date": "YYYY-MM-DD",
     "mentions": {
       "ares_direct": 0,
       "competitor_mentions": {"whoop": 12, "oura": 8},
       "keyword_hits": 45
     },
     "top_posts": [
       {
         "platform": "reddit",
         "subreddit": "r/longevity",
         "title": "...",
         "url": "...",
         "upvotes": 234,
         "sentiment": "positive",
         "relevance": "high"
       }
     ],
     "trending_topics": ["..."],
     "engagement_opportunities": [
       "High-engagement post in r/biohacking about X — comment opportunity"
     ]
   }
   ```

## Apify Actors Used
- `apify/reddit-scraper`
- `apify/twitter-scraper` or `apify/tweet-scraper`
