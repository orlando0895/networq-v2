-- Update the contacts that were incorrectly labeled as mutual_contact when they should be business_card
UPDATE public.contacts 
SET added_via = 'business_card'
WHERE name IN ('KIT MERKLEY', 'Christina Martinez', 'JAMES KELLER', 'HALEY COLEMAN', 'JOE BLACK', 'Justin Yocom')
AND added_via = 'mutual_contact';