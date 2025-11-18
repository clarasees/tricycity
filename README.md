# Photo Geolocation Viewer

A React application that allows users to upload photos and view their geolocation data on an interactive map.

## Features

- Upload photos with GPS/EXIF data
- Extract and display location information (latitude, longitude, altitude)
- Interactive map showing all photo locations
- Photo gallery with metadata display
- Camera information (make, model)
- Timestamp display
- Delete photos functionality

## Tech Stack

- **Frontend**: React + Vite
- **Backend/Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Maps**: Leaflet + React-Leaflet
- **EXIF Extraction**: exifr
- **Deployment**: Netlify

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API to find your credentials
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Create Database Schema

1. Go to your Supabase project's SQL Editor
2. Copy the contents of `supabase-schema.sql`
3. Run the SQL to create the necessary tables, storage bucket, and policies

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Deployment to Netlify

### Option 1: Deploy via Netlify CLI

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Initialize and deploy:
```bash
netlify init
netlify deploy --prod
```

### Option 2: Deploy via Netlify UI

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and create a new site
3. Connect your GitHub repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables in Site Settings > Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy!

## Usage

1. **Upload a Photo**: Click the "Choose Photo" button and select an image with GPS data
2. **View Gallery**: Scroll down to see all uploaded photos with their metadata
3. **View on Map**: Click "View on Map" on any photo card to focus on its location
4. **Interactive Map**: Click on any marker to see photo details in a popup
5. **Delete Photos**: Click the "Delete" button on any photo card to remove it

## Important Notes

- Only photos with GPS/EXIF data will show location information
- Photos taken with modern smartphones typically include GPS data
- Make sure GPS/Location Services were enabled when the photo was taken
- The app currently uses public storage and database policies (anyone can read/write)
- For production use, consider implementing authentication and proper access control

## Customization

### Change Default Map Location

Edit `src/components/PhotoMap.jsx`:

```javascript
const [center, setCenter] = useState([YOUR_LAT, YOUR_LON])
```

### Adjust Map Tile Provider

Edit the `TileLayer` component in `src/components/PhotoMap.jsx` to use different map styles.

### Modify Photo Grid Layout

Edit the CSS in `src/App.css` under `.photo-grid` to change the grid layout.

## License

MIT
