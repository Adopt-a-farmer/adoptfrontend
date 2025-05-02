
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

// Mock updates data - in a real app this would come from an API
const mockUpdates = [
  {
    id: 1,
    farmerId: 1,
    title: "Irrigation System Installation Complete",
    content: "I'm excited to announce that we've successfully installed the new drip irrigation system! This will help us reduce water usage by up to 60% while ensuring our crops get exactly what they need. Looking forward to seeing improved yields in the coming season.",
    date: "2025-04-25",
    images: ["https://images.unsplash.com/photo-1629721671030-a83fcab7141a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"]
  },
  {
    id: 2,
    farmerId: 1,
    title: "Seedlings Are Growing Well",
    content: "Just wanted to give a quick update on our seedlings. They're growing much faster than expected thanks to the new greenhouse structure. The tomatoes and kale varieties are particularly thriving. Thanks to all supporters who helped make this possible!",
    date: "2025-04-15",
    images: ["https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"]
  },
  {
    id: 3,
    farmerId: 2,
    title: "First Harvest of the Season",
    content: "We're proud to share that we've completed our first harvest of the season. The quality of produce is excellent, and we've already sold 70% to local markets. Your support has been instrumental in helping us expand our production capacity.",
    date: "2025-03-30",
    images: ["https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"]
  },
  {
    id: 4,
    farmerId: 3,
    title: "New Fish Ponds Construction Started",
    content: "Construction of our new fish ponds has begun! This expansion will allow us to increase our tilapia production by nearly 40%. We're implementing sustainable aquaculture practices and expect to complete construction in about three weeks.",
    date: "2025-04-10",
    images: []
  }
];

interface FarmerUpdatesProps {
  farmerId: number;
}

const FarmerUpdates = ({ farmerId }: FarmerUpdatesProps) => {
  // Filter updates for the current farmer
  const farmerUpdates = mockUpdates.filter(update => update.farmerId === farmerId);
  
  if (farmerUpdates.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Farm Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">No updates available yet. Check back soon!</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Farm Updates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {farmerUpdates.map((update) => (
            <div key={update.id} className="border-b pb-6 last:border-0">
              <h3 className="text-lg font-semibold">{update.title}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-1 mb-3">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{new Date(update.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <p className="text-gray-700">{update.content}</p>
              
              {update.images && update.images.length > 0 && (
                <div className="mt-4 grid grid-cols-1 gap-2">
                  {update.images.map((image, index) => (
                    <img 
                      key={index} 
                      src={image} 
                      alt={`Update image ${index + 1}`} 
                      className="rounded-md w-full object-cover h-48"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FarmerUpdates;
