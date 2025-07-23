-- Update farmers table to link with user accounts
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE;
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS invite_sent_at TIMESTAMPTZ;
ALTER TABLE public.farmers ADD COLUMN IF NOT EXISTS account_created_at TIMESTAMPTZ;

-- Create farmer invitations table for tracking
CREATE TABLE IF NOT EXISTS public.farmer_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id INTEGER REFERENCES public.farmers(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  invite_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'base64url'),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.farmer_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage farmer invitations" 
ON public.farmer_invitations 
FOR ALL 
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Create function to automatically create farmer invitation when farmer is added
CREATE OR REPLACE FUNCTION public.create_farmer_invitation()
RETURNS TRIGGER AS $$
DECLARE
  invitation_email TEXT;
BEGIN
  -- Generate email if not provided, using farmer name
  IF NEW.user_id IS NULL THEN
    -- Create invitation email based on farmer name
    invitation_email := LOWER(REPLACE(NEW.name, ' ', '.')) || '@farmnet.local';
    
    -- Insert invitation
    INSERT INTO public.farmer_invitations (farmer_id, email, invited_by)
    VALUES (NEW.id, invitation_email, auth.uid());
    
    -- Update farmer with invite token
    UPDATE public.farmers 
    SET invite_sent_at = now()
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS create_farmer_invitation_trigger ON public.farmers;
CREATE TRIGGER create_farmer_invitation_trigger
AFTER INSERT ON public.farmers
FOR EACH ROW
EXECUTE FUNCTION public.create_farmer_invitation();

-- Create function to handle farmer account creation from invitation
CREATE OR REPLACE FUNCTION public.complete_farmer_invitation(
  invitation_token TEXT,
  user_password TEXT,
  user_email TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  invitation RECORD;
  new_user_id UUID;
  farmer_record RECORD;
  result JSON;
BEGIN
  -- Get invitation details
  SELECT fi.*, f.name, f.id as farmer_id
  INTO invitation
  FROM public.farmer_invitations fi
  JOIN public.farmers f ON fi.farmer_id = f.id
  WHERE fi.invite_token = invitation_token
  AND fi.used_at IS NULL
  AND fi.expires_at > now();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation token');
  END IF;
  
  -- Use provided email or invitation email
  IF user_email IS NULL THEN
    user_email := invitation.email;
  END IF;
  
  -- Create user account (this will be handled by the application)
  -- For now, we'll return the details needed for account creation
  
  RETURN json_build_object(
    'success', true,
    'farmer_id', invitation.farmer_id,
    'farmer_name', invitation.name,
    'email', user_email,
    'invitation_id', invitation.id
  );
END;
$$ LANGUAGE plpgsql;

-- Update farmer with user_id after account creation
CREATE OR REPLACE FUNCTION public.link_farmer_to_user(
  invitation_token TEXT,
  user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  invitation RECORD;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation
  FROM public.farmer_invitations
  WHERE invite_token = invitation_token
  AND used_at IS NULL
  AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Update farmer with user_id
  UPDATE public.farmers 
  SET user_id = user_id, account_created_at = now()
  WHERE id = invitation.farmer_id;
  
  -- Mark invitation as used
  UPDATE public.farmer_invitations
  SET used_at = now()
  WHERE id = invitation.id;
  
  -- Update user profile role to farmer
  UPDATE public.profiles
  SET role = 'farmer'
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;