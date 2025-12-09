import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

interface Location {
  address: string;
  lat: number;
  lng: number;
}

interface GoogleMapsLocationPickerProps {
  value: Location | null;
  onChange: (location: Location) => void;
  placeholder?: string;
  label?: string;
  allowCurrentLocation?: boolean;
}

export const GoogleMapsLocationPicker = ({
  value,
  onChange,
  placeholder = 'Search for a location',
  label,
  allowCurrentLocation = false,
}: GoogleMapsLocationPickerProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  // Initialize standard autocomplete (fallback for better styling control)
  useEffect(() => {
    if (window.google && inputRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'rw' },
        fields: ['formatted_address', 'geometry', 'name'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (place.geometry && place.geometry.location) {
          const location: Location = {
            address: place.formatted_address || place.name || '',
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          
          onChange(location);
          setSearchQuery(location.address);
          updateMap(location);
        }
      });
    }
  }, [onChange]);

  // Initialize map when location is selected
  const updateMap = (location: Location) => {
    setShowMap(true);
    
    setTimeout(() => {
      if (window.google && mapRef.current && !mapInstanceRef.current) {
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: location.lat, lng: location.lng },
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
        });
        
        const marker = new google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: map,
          draggable: true,
        });

        // Update location when marker is dragged
        marker.addListener('dragend', async () => {
          const position = marker.getPosition();
          if (position) {
            const geocoder = new google.maps.Geocoder();
            const result = await geocoder.geocode({ location: position });
            
            if (result.results[0]) {
              const newLocation: Location = {
                address: result.results[0].formatted_address,
                lat: position.lat(),
                lng: position.lng(),
              };
              onChange(newLocation);
              setSearchQuery(newLocation.address);
            }
          }
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
      } else if (mapInstanceRef.current && markerRef.current) {
        // Update existing map
        const position = { lat: location.lat, lng: location.lng };
        mapInstanceRef.current.setCenter(position);
        markerRef.current.setPosition(position);
      }
    }, 100);
  };

  // Get current location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Reverse geocode to get address
        const geocoder = new google.maps.Geocoder();
        const result = await geocoder.geocode({ location: { lat, lng } });

        if (result.results[0]) {
          const location: Location = {
            address: result.results[0].formatted_address,
            lat,
            lng,
          };
          
          onChange(location);
          setSearchQuery(location.address);
          updateMap(location);
        }
        
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your current location');
        setIsLoadingLocation(false);
      }
    );
  };

  useEffect(() => {
    if (value) {
      setSearchQuery(value.address);
      updateMap(value);
    }
  }, [value]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-900">
          <MapPin className="inline w-4 h-4 mr-2" />
          {label}
        </label>
      )}

      <div className="flex gap-2">
        {/* Search Input */}
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
        />

        {/* Current Location Button */}
        {allowCurrentLocation && (
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLoadingLocation}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Use current location"
          >
            {isLoadingLocation ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {/* Selected Location Display */}
      {value && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 flex items-start gap-2">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="break-words">{value.address}</span>
          </p>
        </div>
      )}

      {/* Interactive Map */}
      {showMap && value && (
        <div className="space-y-2">
          <div 
            ref={mapRef}
            className="w-full h-64 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden"
          />
          <p className="text-xs text-gray-600 text-center">
            📍 Drag the marker to adjust the exact location
          </p>
        </div>
      )}
    </div>
  );
};
