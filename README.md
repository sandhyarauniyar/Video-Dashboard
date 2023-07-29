Features Implemented
- Charts for Streaming Storage, Transcoding Usage, Storage Usage
- Top assets table
- Total usage section bar
- Filter By Last 7 days, 14 days, and last 30 days.

Assumptions 
- Response data is json which is hardcoded at backend
- Top_assets and asset_duration are in the same order

Tech Stacks Used
Next.js for front-end and endpoint also written in Next.js

Improvements
- Code can be modularized further into components
- Data can be filtered at the backend side rather than front-end
  
How to run?
npm run dev

NOTE - No data will be shown on filter as the data is older than 30days
