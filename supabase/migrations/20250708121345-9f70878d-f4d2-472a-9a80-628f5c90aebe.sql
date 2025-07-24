
-- Drop existing restrictive policies for user-images bucket
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Create more permissive policies for the user-images bucket (similar to event-images)
CREATE POLICY "Allow public uploads to user-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'user-images');

CREATE POLICY "Allow public access to user-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'user-images');

CREATE POLICY "Allow public updates to user-images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'user-images');

CREATE POLICY "Allow public deletes from user-images" ON storage.objects
  FOR DELETE USING (bucket_id = 'user-images');
