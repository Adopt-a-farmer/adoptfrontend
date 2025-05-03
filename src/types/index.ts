
export type Profile = {
  id: string;
  full_name: string | null;
  role: 'admin' | 'farmer' | 'adopter' | 'supplier' | 'investor';
  email: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type Farmer = {
  id: number;
  name: string;
  location: string;
  description: string | null;
  crops: string[];
  farming_experience_years: number | null;
  fundinggoal: number;
  fundingraised: number;
  supporters: number;
  featured: boolean;
  image_url: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

export type Payment = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_type: string;
  user_id: string;
  farmer_id: number | null;
  commission_amount: number;
  payment_date: string;
  created_at: string;
  updated_at: string;
}

export type Supplier = {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  product_categories: string[] | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export type StatusUpdate = {
  id: string;
  farmer_id: number;
  update_type: string;
  description: string;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
