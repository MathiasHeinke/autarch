# Competitor Watch Skill

## Description
Monitors competitor websites (Whoop, Oura, Levels, InsideTracker) for feature launches, pricing changes, and new blog content.

## Trigger
Weekly cron on Mondays at 09:00 UTC, or manual via `/competitor-watch`

## Steps
1. Use Apify Web Scraper to crawl:
   - `https://www.whoop.com/thelocker/` (blog)
   - `https://ouraring.com/blog` (blog)
   - `https://www.levelshealth.com/blog` (blog)
   - `https://www.insidetracker.com/blog` (blog)
   - Pricing pages of each competitor
2. Compare with previous week's snapshot (stored in task history)
3. Generate diff report:
   ```json
   {
     "date": "YYYY-MM-DD",
     "competitors": [
       {
         "name": "Whoop",
         "new_blog_posts": [...],
         "pricing_changes": null,
         "new_features": [...],
         "sentiment_shift": "neutral"
       }
     ],
     "opportunities": [
       "Whoop announced X — ARES Bio.OS could counter with Y"
     ]
   }
   ```
4. Flag high-priority changes for human review

## Apify Actors Used
- `apify/web-scraper`
- `apify/cheerio-scraper` (for lightweight pages)
