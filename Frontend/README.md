
Civix — Vite + Tailwind registration (fixed)
===========================================

Quick start (exact commands):

1. Extract the ZIP to a folder, open terminal in that folder.
2. Install dependencies:
   npm install

3. Start development server:
   npm run dev

4. Open the URL Vite prints (normally http://localhost:5173)

Notes / troubleshooting:
- Do NOT include <link rel="stylesheet" href="/dist/output.css"> in index.html. Vite processes styles via imports.
- If Tailwind classes don't load, make sure you ran 'npm install' then 'npm run dev' and you are opening the correct URL.
- For production build: npm run build and then npm run preview to test the production bundle.
