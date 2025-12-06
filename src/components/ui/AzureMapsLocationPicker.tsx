import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Locate, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationData {
  coordinates: Coordinates;
  formattedAddress?: string;
  county?: string;
  subCounty?: string;
}

interface AzureMapsLocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialCoordinates?: Coordinates;
  showMapLink?: boolean;
}

const AZURE_MAPS_KEY = import.meta.env.VITE_AZURE_MAPS_KEY;

export const AzureMapsLocationPicker: React.FC<AzureMapsLocationPickerProps> = ({
  onLocationSelect,
  initialCoordinates,
  showMapLink = true
}) => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(initialCoordinates || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'success' | 'error'>('idle');
  const [addressInfo, setAddressInfo] = useState<string>('');

  // Reverse geocode coordinates to get address using Azure Maps
  const reverseGeocode = useCallback(async (lat: number, lon: number) => {
    if (!AZURE_MAPS_KEY) {
      console.warn('Azure Maps key not configured');
      return null;
    }

    try {
      const response = await fetch(
        `https://atlas.microsoft.com/search/address/reverse/json?api-version=1.0&subscription-key=${AZURE_MAPS_KEY}&query=${lat},${lon}&language=en-US`
      );

      if (!response.ok) {
        throw new Error('Failed to reverse geocode');
      }

      const data = await response.json();
      
      if (data.addresses && data.addresses.length > 0) {
        const address = data.addresses[0].address;
        return {
          formattedAddress: address.freeformAddress || '',
          county: address.countrySubdivision || address.municipality || '',
          subCounty: address.municipalitySubdivision || address.countrySecondarySubdivision || ''
        };
      }
      
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }, []);

  // Get current location from browser
  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLocationStatus('requesting');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLocationStatus('error');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newCoordinates = { latitude, longitude };
        
        setCoordinates(newCoordinates);
        setLocationStatus('success');

        // Try to get address info
        const addressData = await reverseGeocode(latitude, longitude);
        
        if (addressData) {
          setAddressInfo(addressData.formattedAddress || '');
          onLocationSelect({
            coordinates: newCoordinates,
            formattedAddress: addressData.formattedAddress,
            county: addressData.county,
            subCounty: addressData.subCounty
          });
        } else {
          onLocationSelect({
            coordinates: newCoordinates
          });
        }

        setIsLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationStatus('error');
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location permission denied. Please enable location access in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable. Please try again.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out. Please try again.');
            break;
          default:
            setError('An error occurred while getting your location.');
        }
        
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  }, [onLocationSelect, reverseGeocode]);

  // Handle manual coordinate input
  const handleManualInput = (field: 'latitude' | 'longitude', value: string) => {
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) return;

    const newCoordinates = {
      latitude: field === 'latitude' ? numValue : (coordinates?.latitude || 0),
      longitude: field === 'longitude' ? numValue : (coordinates?.longitude || 0)
    };

    setCoordinates(newCoordinates);
    
    // Validate ranges
    if (newCoordinates.latitude >= -90 && newCoordinates.latitude <= 90 &&
        newCoordinates.longitude >= -180 && newCoordinates.longitude <= 180) {
      onLocationSelect({ coordinates: newCoordinates });
    }
  };

  // Generate Azure Maps satellite view URL
  const getAzureMapsUrl = useCallback(() => {
    if (!coordinates) return '';
    
    // Azure Maps satellite imagery URL with coordinates
    return `https://atlas.microsoft.com/map/static/png?api-version=1.0&subscription-key=${AZURE_MAPS_KEY}&layer=satellite&zoom=17&center=${coordinates.longitude},${coordinates.latitude}&width=800&height=600`;
  }, [coordinates]);

  // Generate link to Azure Maps in browser (for viewing in full maps interface)
  const getAzureMapsBrowserUrl = useCallback(() => {
    if (!coordinates) return '';
    // Azure Maps web viewer URL
    return `https://www.bing.com/maps?cp=${coordinates.latitude}~${coordinates.longitude}&lvl=17&style=a`;
  }, [coordinates]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-600" />
          Farm Location
        </CardTitle>
        <CardDescription>
          Share your farm's location for verification. This helps adopters and administrators verify your farm.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Get Current Location Button */}
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant={locationStatus === 'success' ? 'outline' : 'default'}
            className={`w-full ${locationStatus === 'success' ? 'border-green-500 text-green-600' : ''}`}
            onClick={getCurrentLocation}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Getting location...
              </>
            ) : locationStatus === 'success' ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Location captured
              </>
            ) : (
              <>
                <Locate className="mr-2 h-4 w-4" />
                Get Current Location
              </>
            )}
          </Button>

          {locationStatus === 'success' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Location successfully captured! 
                {addressInfo && <span className="block mt-1 font-medium">{addressInfo}</span>}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Manual Coordinate Input */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="latitude">Latitude</Label>
            <Input
              id="latitude"
              type="number"
              step="0.000001"
              min="-90"
              max="90"
              placeholder="-1.2921"
              value={coordinates?.latitude || ''}
              onChange={(e) => handleManualInput('latitude', e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="longitude">Longitude</Label>
            <Input
              id="longitude"
              type="number"
              step="0.000001"
              min="-180"
              max="180"
              placeholder="36.8219"
              value={coordinates?.longitude || ''}
              onChange={(e) => handleManualInput('longitude', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        {/* Coordinates Display */}
        {coordinates && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Selected Coordinates:</p>
                <p className="font-mono text-sm">
                  {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                </p>
              </div>
              
              {showMapLink && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getAzureMapsBrowserUrl(), '_blank')}
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  View Map
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Info text */}
        <p className="text-xs text-gray-500">
          Your location coordinates will be used to display your farm on the map and allow administrators 
          to verify your farm using satellite imagery.
        </p>
      </CardContent>
    </Card>
  );
};

export default AzureMapsLocationPicker;
