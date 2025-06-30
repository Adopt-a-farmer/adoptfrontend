
-- Create table to track farmer adoptions/assignments
CREATE TABLE public.farmer_adoptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id INTEGER NOT NULL REFERENCES public.farmers(id) ON DELETE CASCADE,
  adopter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  adoption_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  monthly_contribution NUMERIC NOT NULL DEFAULT 0,
  total_contributed NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(farmer_id, adopter_id)
);

-- Enable RLS for farmer_adoptions
ALTER TABLE public.farmer_adoptions ENABLE ROW LEVEL SECURITY;

-- Create policies for farmer_adoptions
CREATE POLICY "Users can view their own adoptions" 
  ON public.farmer_adoptions 
  FOR SELECT 
  USING (auth.uid() = adopter_id);

CREATE POLICY "Users can create their own adoptions" 
  ON public.farmer_adoptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = adopter_id);

CREATE POLICY "Users can update their own adoptions" 
  ON public.farmer_adoptions 
  FOR UPDATE 
  USING (auth.uid() = adopter_id);

-- Create table for farmer categories/produce classification
CREATE TABLE public.farmer_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT,
  color TEXT DEFAULT '#10b981',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default categories
INSERT INTO public.farmer_categories (name, description, icon_name, color) VALUES
('Horticulture', 'Fruit and vegetable farming', 'leaf', '#10b981'),
('Livestock', 'Cattle, poultry, and animal husbandry', 'cow', '#f59e0b'),
('Aquaculture', 'Fish farming and aquatic agriculture', 'fish', '#3b82f6'),
('Grain Crops', 'Cereals, maize, and staple crops', 'wheat', '#8b5cf6'),
('Cash Crops', 'Coffee, tea, and export crops', 'coffee', '#ef4444');

-- Add category_id to farmers table
ALTER TABLE public.farmers ADD COLUMN category_id UUID REFERENCES public.farmer_categories(id);

-- Update existing farmers with default categories based on their crops
UPDATE public.farmers 
SET category_id = (
  SELECT id FROM public.farmer_categories 
  WHERE name = CASE 
    WHEN 'Coffee' = ANY(crops) OR 'Tea' = ANY(crops) THEN 'Cash Crops'
    WHEN 'Dairy Cows' = ANY(crops) OR 'Chicken' = ANY(crops) THEN 'Livestock'
    WHEN 'Tilapia' = ANY(crops) OR 'Catfish' = ANY(crops) OR 'Fish' = ANY(crops) THEN 'Aquaculture'
    WHEN 'Maize' = ANY(crops) OR 'Rice' = ANY(crops) THEN 'Grain Crops'
    ELSE 'Horticulture'
  END
  LIMIT 1
);

-- Enable realtime for farmers table
ALTER TABLE public.farmers REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.farmers;

-- Enable realtime for farmer_adoptions table
ALTER TABLE public.farmer_adoptions REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.farmer_adoptions;

-- Create function to get farmer with adoption info
CREATE OR REPLACE FUNCTION public.get_farmers_with_adoption_info()
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  location TEXT,
  description TEXT,
  crops TEXT[],
  farming_experience_years INTEGER,
  fundinggoal NUMERIC,
  fundingraised NUMERIC,
  supporters INTEGER,
  featured BOOLEAN,
  image_url TEXT,
  category_name TEXT,
  category_color TEXT,
  category_icon TEXT,
  total_adopters BIGINT,
  avg_monthly_contribution NUMERIC
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    f.id,
    f.name,
    f.location,
    f.description,
    f.crops,
    f.farming_experience_years,
    f.fundinggoal,
    f.fundingraised,
    f.supporters,
    f.featured,
    f.image_url,
    fc.name as category_name,
    fc.color as category_color,
    fc.icon_name as category_icon,
    COALESCE(fa.adopter_count, 0) as total_adopters,
    COALESCE(fa.avg_contribution, 0) as avg_monthly_contribution
  FROM public.farmers f
  LEFT JOIN public.farmer_categories fc ON f.category_id = fc.id
  LEFT JOIN (
    SELECT 
      farmer_id,
      COUNT(*) as adopter_count,
      AVG(monthly_contribution) as avg_contribution
    FROM public.farmer_adoptions 
    WHERE status = 'active'
    GROUP BY farmer_id
  ) fa ON f.id = fa.farmer_id
  ORDER BY f.featured DESC, f.created_at DESC;
$$;
