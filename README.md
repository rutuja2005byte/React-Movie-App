react-movie-app

Quick start

1. Install dependencies

```bash
npm install
```

2. Create a `.env.local` file in project root with:

```
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_ID=your_collection_id
VITE_TMDB_API_KEY=your_tmdb_api_key
```

3. Run dev server

```bash
npm run dev
```

Notes

- The app logs masked env values in the browser console at startup to help verify values without exposing secrets.
- If Appwrite shows "Collection not found", confirm the `VITE_APPWRITE_COLLECTION_ID` in Appwrite console.
- If OMDB calls time out, verify `VITE_TMDB_API_KEY` and network connectivity.
