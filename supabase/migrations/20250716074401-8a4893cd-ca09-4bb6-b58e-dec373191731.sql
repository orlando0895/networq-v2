-- Allow users to view basic profile info of other users for messaging/contact purposes
CREATE POLICY "Users can view basic profile info of others for messaging"
ON public.profiles
FOR SELECT
USING (true);