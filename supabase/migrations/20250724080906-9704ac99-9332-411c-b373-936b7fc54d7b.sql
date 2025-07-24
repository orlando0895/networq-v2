-- Add avatar_url column to user_contact_cards table
ALTER TABLE public.user_contact_cards 
ADD COLUMN avatar_url TEXT;

-- Add profile_picture_url column to contacts table  
ALTER TABLE public.contacts
ADD COLUMN profile_picture_url TEXT;

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true);

-- Create storage policies for profile pictures
CREATE POLICY "Profile pictures are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload their own profile pictures" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own profile pictures" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile pictures" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);