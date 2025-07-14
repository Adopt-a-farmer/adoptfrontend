-- Update the default currency for payments to KES
ALTER TABLE public.payments 
ALTER COLUMN currency SET DEFAULT 'KES';