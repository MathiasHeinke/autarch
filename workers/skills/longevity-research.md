# Longevity Research Skill

## Description
Scans longevity blogs, PubMed abstracts, and biohacking forums for the latest trends using Apify web scrapers.

## Trigger
Daily cron at 08:00 UTC, or manual via `/longevity-research`

## Steps
1. Use Apify Google Search scraper to find recent articles for:
   - "longevity research 2026"
   - "biohacking biomarkers"
   - "healthspan optimization"
   - "NAD+ NMN research"
   - "hormone optimization longevity"
2. Use Apify Web Scraper to extract content from top 10 results
3. Summarize findings into structured JSON report:
   ```json
   {
     "date": "YYYY-MM-DD",
     "trends": [
       {
         "topic": "Topic Name",
         "summary": "2-3 sentence summary",
         "source_url": "https://...",
         "relevance_to_ares": "How this relates to ARES Bio.OS",
         "content_angle": "Suggested blog/social post angle"
       }
     ],
     "top_5_actionable": ["...", "...", "...", "...", "..."]
   }
   ```
4. Save report to task result in Supabase

## Apify Actors Used
- `apify/google-search-scraper`
- `apify/web-scraper`
