import React, { useState, useEffect } from 'react';
import { farmerService } from '@/services/farmer';

// Simple test component to verify farmer API is working
const FarmerAPITest = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('🧪 Testing Farmer API...');
        const response = await farmerService.getFarmers({ limit: 3 });
        console.log('✅ API Response:', response);
        setFarmers(response.data.farmers || []);
      } catch (err) {
        console.error('❌ API Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testAPI();
  }, []);

  if (loading) return <div>Testing API connection...</div>;
  if (error) return <div>API Error: {error}</div>;

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">✅ Farmer API Test Results</h3>
      <p className="mb-2">Found {farmers.length} farmers</p>
      {farmers.map((farmer, index) => (
        <div key={index} className="mb-2 p-2 bg-gray-50 rounded">
          <p><strong>Name:</strong> {farmer.user?.firstName} {farmer.user?.lastName}</p>
          <p><strong>Farm:</strong> {farmer.farmName}</p>
          <p><strong>Location:</strong> {farmer.location?.county}, {farmer.location?.subCounty}</p>
          <p><strong>Farming Type:</strong> {farmer.farmingType?.join(', ')}</p>
        </div>
      ))}
    </div>
  );
};

export default FarmerAPITest;