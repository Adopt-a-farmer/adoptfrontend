
// import { supabase } from '@/integrations/mock/client';

export const initialFarmers = [
  {
    name: "John Kamau",
    location: "Kiambu, Gatundu North",
    description: "A dedicated coffee farmer with over 15 years of experience. John has been working to improve his coffee quality and expand his farm to provide better opportunities for his family and community.",
    crops: ["Coffee", "Maize"],
    farming_experience_years: 15,
    fundinggoal: 5000,
    fundingraised: 2150,
    supporters: 23,
    featured: true,
    image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Mary Wanjiku",
    location: "Nakuru, Nakuru Town West",
    description: "Mary is a vegetable farmer who specializes in organic farming methods. She's looking to expand her greenhouse operations and introduce new vegetable varieties to the local market.",
    crops: ["Vegetables", "Fruits"],
    farming_experience_years: 8,
    fundinggoal: 3500,
    fundingraised: 1200,
    supporters: 15,
    featured: false,
    image_url: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Peter Ochieng",
    location: "Kisumu, Kisumu Central",
    description: "A rice farmer near Lake Victoria who has been working to improve irrigation systems and rice quality. Peter wants to modernize his farming techniques and equipment.",
    crops: ["Rice", "Maize"],
    farming_experience_years: 12,
    fundinggoal: 4200,
    fundingraised: 1800,
    supporters: 19,
    featured: true,
    image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Grace Nyong'o",
    location: "Machakos, Machakos Town",
    description: "Grace grows drought-resistant crops and has been a pioneer in water conservation techniques. She's working to establish a community seed bank for local farmers.",
    crops: ["Sorghum", "Millet", "Beans"],
    farming_experience_years: 20,
    fundinggoal: 6000,
    fundingraised: 3400,
    supporters: 28,
    featured: false,
    image_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Samuel Kipchoge",
    location: "Uasin Gishu, Eldoret East",
    description: "Samuel is a wheat and maize farmer in the fertile highlands. He's looking to invest in modern farming equipment and improve post-harvest storage facilities.",
    crops: ["Wheat", "Maize"],
    farming_experience_years: 18,
    fundinggoal: 7500,
    fundingraised: 4200,
    supporters: 35,
    featured: true,
    image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    name: "Alice Muthoni",
    location: "Nyeri, Nyeri Town",
    description: "A tea farmer who has been working to improve the quality of her tea leaves. Alice wants to establish direct trade relationships and get better prices for her produce.",
    crops: ["Tea", "Coffee"],
    farming_experience_years: 14,
    fundinggoal: 4800,
    fundingraised: 2100,
    supporters: 22,
    featured: false,
    image_url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  }
];

export const seedFarmers = async () => {
  try {
    console.log('Seeding farmers...');
    
    // Check if farmers already exist
    const { data: existingFarmers, error: fetchError } = await supabase
      .from('farmers')
      .select('name');
      
    if (fetchError) {
      console.error('Error checking existing farmers:', fetchError);
      return;
    }
    
    if (existingFarmers && existingFarmers.length > 0) {
      console.log('Farmers already exist, skipping seed');
      return;
    }
    
    const { error } = await supabase
      .from('farmers')
      .insert(initialFarmers);
      
    if (error) {
      console.error('Error seeding farmers:', error);
    } else {
      console.log('Farmers seeded successfully!');
    }
  } catch (error) {
    console.error('Error in seedFarmers:', error);
  }
};
