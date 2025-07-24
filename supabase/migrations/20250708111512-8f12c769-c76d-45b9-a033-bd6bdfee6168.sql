
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update event images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete event images" ON storage.objects;

-- Create more permissive policies for the event-images bucket
CREATE POLICY "Allow public uploads to event-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'event-images');

CREATE POLICY "Allow public access to event-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-images');

CREATE POLICY "Allow public updates to event-images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'event-images');

CREATE POLICY "Allow public deletes from event-images" ON storage.objects
  FOR DELETE USING (bucket_id = 'event-images');
