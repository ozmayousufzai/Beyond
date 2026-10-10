# BEYOND — Opportunity Discovery
 
A React + Vite frontend with an Express API. Keep the folder structure shown below; do not put all files in one folder.
 
## Folder structure
 
```text
beyond/
  index.html
  package.json
  package-lock.json
  vite.config.js
  .env.example
  .gitignore
  README.md
  src/
    main.jsx
    styles.css
  server/
    index.js
    opportunities.json
```
 
## Run on Windows
 
1. Create a folder called `beyond`.
2. Download each file from the links in the ChatGPT message and save it in the matching folder above. Create `src` and `server` folders if needed.
3. Install the current Node.js LTS release if `node --version` and `npm --version` do not work.
4. Open the `beyond` folder in VS Code. Open **Terminal → New Terminal** and make sure the terminal is in the folder containing `package.json`.
5. Run `npm install` and wait for it to finish.
6. In terminal 1 run `npm run server`.
7. Open a second terminal in the same project folder and run `npm run dev`.
8. Open the local URL printed by Vite, usually `http://localhost:5173`.
 
## Job sources
 
- **RemoteOK** — free public JSON feed at `https://remoteok.com/api`; the site asks aggregators to credit RemoteOK and link to original job listings.
- **Arbeitnow** — public job-board API at `https://www.arbeitnow.com/api/job-board-api`; primarily useful for Europe and remote roles.
- **ACBAR** — BEYOND reads the public ACBAR jobs listing page server-side because a documented public JSON API was not identified. The page's HTML can change, so check `/api/sources` to see whether its parser is currently connected.
 
The server refreshes sources about once an hour and keeps working if one source is unavailable. Listings from the original source link back to that source. When all live sources fail, the interface uses clearly marked local preview records. Those records are not real opportunities; do not apply through their example links.
 
## Useful endpoints
 
- `GET http://localhost:3001/api/health`
- `GET http://localhost:3001/api/sources`
- `GET http://localhost:3001/api/opportunities`
- `POST http://localhost:3001/api/sources/refresh` (force refresh)
 
The local development API is not a production deployment. Before publishing, configure production CORS, persistent rate limiting, monitoring, and hosting for both the frontend and backend.
