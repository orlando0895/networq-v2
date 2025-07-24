-- Update the handle_new_user function to handle Google OAuth data better
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insert profile with better handling of Google OAuth data
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  
  -- Insert contact card with enhanced Google data handling
  INSERT INTO public.user_contact_cards (user_id, name, email)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)  -- Use email username as fallback
    ),
    new.email
  );
  
  RETURN new;
END;
$$;