-- Fix the encoding function for invite tokens
CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Update the farmer_invitations table to use the new function
ALTER TABLE public.farmer_invitations 
ALTER COLUMN invite_token SET DEFAULT public.generate_invite_token();

-- Update existing null tokens
UPDATE public.farmer_invitations 
SET invite_token = public.generate_invite_token() 
WHERE invite_token IS NULL;