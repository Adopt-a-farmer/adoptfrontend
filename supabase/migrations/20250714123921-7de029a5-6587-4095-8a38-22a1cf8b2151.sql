-- Add policy to allow edge functions to insert payments
CREATE POLICY "Edge functions can create payments" 
ON public.payments 
FOR INSERT 
WITH CHECK (true);

-- Add policy to allow edge functions to update payments 
CREATE POLICY "Edge functions can update payments" 
ON public.payments 
FOR UPDATE 
USING (true);