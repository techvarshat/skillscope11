# TODO: Implement Video Rating Formula and Best Picks

## Tasks
- [x] Modify api/search.js to fetch channel subscriber counts by collecting channel IDs and making a batch API call for channel statistics.
- [x] Remove the getAIAnalysis function and its usage in api/search.js.
- [x] Implement a new rating formula in api/search.js: rating = Math.min(10, (likes / Math.max(views, 1) * 100) + (comments / Math.max(views, 1) * 100) + (subscribers / 1000000 * 10))
- [x] Update the results object in api/search.js to use the calculated rating instead of AI rating.
- [x] Change sorting in api/search.js to sort results by rating descending.
- [x] Modify the response structure in api/search.js to include a "bestPicks" array with the top 3 videos by rating, and "results" with the remaining videos sorted by rating.
- [x] Test the API to ensure ratings are calculated correctly, no errors, and best picks are displayed properly.
- [x] Remove OpenRouter and Udemy references from the codebase.
