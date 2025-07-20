-- COMPREHENSIVE FIX: Clean up all RLS policies and create a clear, working set

-- Step 1: Remove all existing INSERT policies for contacts
DROP POLICY IF EXISTS "Allow mutual contact addition" ON public.contacts;
DROP POLICY IF EXISTS "Users can insert their own contacts" ON public.contacts;

-- Step 2: Create a single, clear INSERT policy that works for both cases
CREATE POLICY "Users can insert contacts" 
ON public.contacts 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id -- Users can insert their own contacts
);

-- Step 3: Grant the edge function ability to bypass RLS by using SECURITY DEFINER
-- We'll handle mutual addition entirely in the edge function with admin privileges

-- Step 4: Clean up the old database function since we're using edge function now
DROP FUNCTION IF EXISTS public.add_mutual_contact(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT, TEXT, TEXT, TEXT[]);