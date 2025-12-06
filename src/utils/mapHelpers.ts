/**
 * Azure Maps Helper Functions
 * Utility functions for generating satellite view links and static map images
 */

/**
 * Generate Azure Maps satellite imagery link for a given location
 */
export const getAzureMapsSatelliteLink = (latitude: number, longitude: number): string => {
  // Use Bing Maps satellite view which is powered by Azure
  return `https://www.bing.com/maps?cp=${latitude}~${longitude}&style=a&lvl=18&sp=point.${latitude}_${longitude}`;
};

/**
 * Generate Azure Maps static satellite image URL
 */
export const getAzureMapsStaticImage = (latitude: number, longitude: number): string => {
  const subscriptionKey = import.meta.env.VITE_AZURE_MAPS_KEY;
  return `https://atlas.microsoft.com/map/static/png?subscription-key=${subscriptionKey}&api-version=1.0&layer=basic&style=satellite&zoom=16&center=${longitude},${latitude}&width=400&height=300`;
};
