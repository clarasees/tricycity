-- Create photos table
CREATE TABLE IF NOT EXISTS photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  altitude DECIMAL(10, 2),
  timestamp TIMESTAMP WITH TIME ZONE,
  camera_make TEXT,
  camera_model TEXT,
  file_size INTEGER,
  mime_type TEXT
);

-- Enable Row Level Security
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read photos
CREATE POLICY "Photos are publicly accessible"
  ON photos FOR SELECT
  TO public
  USING (true);

-- Create a policy that allows anyone to insert photos
CREATE POLICY "Anyone can upload photos"
  ON photos FOR INSERT
  TO public
  WITH CHECK (true);

-- Create a policy that allows anyone to delete photos
CREATE POLICY "Anyone can delete photos"
  ON photos FOR DELETE
  TO public
  USING (true);

-- Create a storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Photos are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'photos');

CREATE POLICY "Anyone can upload photos"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Anyone can delete photos"
  ON storage.objects FOR DELETE
  TO public
  USING (bucket_id = 'photos');
