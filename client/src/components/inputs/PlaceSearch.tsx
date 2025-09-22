import { useState, useEffect, useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export interface PlaceSearchResult {
  place: google.maps.places.PlaceResult;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  formattedAddress: string;
  name: string;
}

interface PlaceSearchProps {
  onLocationSelect: (location: PlaceSearchResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

const PlaceSearch = ({
  onLocationSelect,
  placeholder = 'Search for a location...',
  className = '',
  disabled = false,
  value,
  onChange,
}: PlaceSearchProps) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const places = useMapsLibrary('places');

  const handlePlaceSelect = useCallback(
    (place: google.maps.places.PlaceResult) => {
      if (!place.geometry?.location) return;

      const result: PlaceSearchResult = {
        place,
        coordinates: {
          latitude: Number(place.geometry.location.lat().toFixed(8)),
          longitude: Number(place.geometry.location.lng().toFixed(8)),
        },
        formattedAddress: place.formatted_address || '',
        name: place.name || '',
      };

      setInputValue(place.formatted_address || place.name || '');
      setPredictions([]);
      onLocationSelect(result);

      if (onChange) {
        onChange(place.formatted_address || place.name || '');
      }
    },
    [onLocationSelect, onChange]
  );

  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (onChange) {
      onChange(newValue);
    }

    if (newValue.length > 2 && places) {
      const service = new places.AutocompleteService();
      service.getQueryPredictions(
        { input: newValue },
        (predictions, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setPredictions(
              predictions as google.maps.places.AutocompletePrediction[]
            );
          } else {
            setPredictions([]);
          }
        }
      );
    } else {
      setPredictions([]);
    }
  };

  const handleSuggestionClick = (
    prediction: google.maps.places.AutocompletePrediction
  ) => {
    if (!places) return;

    const service = new places.PlacesService(document.createElement('div'));
    service.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['geometry', 'name', 'formatted_address', 'place_id', 'geometry.location', 'geometry.location_type', 'geometry.viewport'],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place) {
          handlePlaceSelect(place);
        }
      }
    );
  };

  return (
    <section className={`place-search ${className}`}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={() => setTimeout(() => setPredictions([]), 200)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        className="w-full px-3 py-2 placeholder:text-[13px] text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
      />

      {predictions.length > 0 && (
        <ul
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {predictions.map((prediction) => (
            <li
              key={prediction.place_id}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
              onClick={() => handleSuggestionClick(prediction)}
              role="option"
            >
              <strong className="font-medium text-gray-900 text-[14px]">
                {prediction.structured_formatting?.main_text}
              </strong>
              <address className="text-sm text-gray-600 not-italic text-[14px]">
                {prediction.structured_formatting?.secondary_text}
              </address>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default PlaceSearch;
