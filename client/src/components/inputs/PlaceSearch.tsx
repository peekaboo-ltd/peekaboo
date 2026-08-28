import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { controlClassName } from './control';

export interface PlaceSearchResult {
  place: google.maps.places.PlaceResult;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  formattedAddress: string;
  name: string;
  placeId?: string;
}

interface PlaceSearchProps {
  onLocationSelect: (location: PlaceSearchResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  country?: string | string[];
}

const PlaceSearch = ({
  onLocationSelect,
  placeholder = 'Search for a location...',
  className = '',
  disabled = false,
  value,
  onChange,
  country,
}: PlaceSearchProps) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const places = useMapsLibrary('places');
  const normalizedCountry =
    typeof country === 'string'
      ? country.toLowerCase()
      : country?.map((countryCode) => countryCode.toLowerCase());
  const isMapsUnavailable = inputValue.length > 2 && !places;

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
        placeId: place.place_id,
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

  const getViewportMetrics = useCallback(() => {
    const visualViewport = window.visualViewport;
    if (visualViewport) {
      return {
        height: visualViewport.height,
        offsetTop: visualViewport.offsetTop,
        offsetLeft: visualViewport.offsetLeft,
      };
    }
    return {
      height: window.innerHeight,
      offsetTop: 0,
      offsetLeft: 0,
    };
  }, []);

  const updateDropdownPosition = useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const viewport = getViewportMetrics();
      const maxDropdownHeight = 240;
      const availableBelow = viewport.height - rect.bottom;
      const availableAbove = rect.top;
      const shouldOpenAbove = availableBelow < 140 && availableAbove > availableBelow;
      const height = Math.min(
        maxDropdownHeight,
        Math.max(availableBelow, availableAbove, 120)
      );

      setDropdownPosition({
        top: shouldOpenAbove
          ? Math.max(viewport.offsetTop, rect.top - height - 6)
          : Math.max(viewport.offsetTop, rect.bottom + 6),
        left: rect.left + viewport.offsetLeft,
        width: rect.width,
        maxHeight: height,
      });
    }
  }, [getViewportMetrics]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (onChange) {
      onChange(newValue);
    }

    if (newValue.length > 2 && places) {
      updateDropdownPosition();
      const service = new places.AutocompleteService();
      service.getPlacePredictions(
        {
          input: newValue,
          componentRestrictions: normalizedCountry
            ? { country: normalizedCountry }
            : undefined,
        },
        (predictions, status) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setPredictions(
              predictions as google.maps.places.AutocompletePrediction[]
            );
            updateDropdownPosition();
          } else {
            setPredictions([]);
          }
        }
      );
    } else {
      setPredictions([]);
    }
  };

  useEffect(() => {
    if (predictions.length > 0) {
      updateDropdownPosition();
      const handleResize = () => updateDropdownPosition();
      const handleScroll = () => updateDropdownPosition();
      const visualViewport = window.visualViewport;
      window.addEventListener('resize', handleResize);
      window.addEventListener('scroll', handleScroll, true);
      if (visualViewport) {
        visualViewport.addEventListener('resize', handleResize);
        visualViewport.addEventListener('scroll', handleScroll);
      }
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleScroll, true);
        if (visualViewport) {
          visualViewport.removeEventListener('resize', handleResize);
          visualViewport.removeEventListener('scroll', handleScroll);
        }
      };
    }
  }, [predictions.length, updateDropdownPosition]);

  const handleSuggestionClick = (
    prediction: google.maps.places.AutocompletePrediction,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
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
          setPredictions([]);
          setDropdownPosition(null);
        }
      }
    );
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Check if the focus is moving to the dropdown
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (dropdownRef.current && dropdownRef.current.contains(relatedTarget)) {
      return; // Don't close if clicking on dropdown
    }
    // Delay closing to allow click events to fire
    setTimeout(() => {
      setPredictions([]);
      setDropdownPosition(null);
    }, 200);
  };

  const dropdownContent = predictions.length > 0 && dropdownPosition ? (
    <ul
      ref={dropdownRef}
      data-place-search-dropdown
      className="pointer-events-auto fixed z-[10000] max-h-60 overflow-auto rounded-(--radius-control) border border-(--line) bg-(--paper) py-1 shadow-(--shadow-menu)"
      role="listbox"
      style={{
        top: `${dropdownPosition.top}px`,
        left: `${dropdownPosition.left}px`,
        width: `${dropdownPosition.width}px`,
        maxHeight: `${dropdownPosition.maxHeight}px`,
      }}
      onMouseDown={(e) => {
        // Prevent input blur when clicking on dropdown
        e.preventDefault();
      }}
    >
      {predictions.map((prediction) => (
        <li
          key={prediction.place_id}
          className="cursor-pointer px-4 py-2.5 transition-[background-color] duration-200 ease-(--ease-flat) hover:bg-(--surface)"
          onMouseDown={(e) => handleSuggestionClick(prediction, e)}
          role="option"
        >
          <strong className="block text-sm font-normal text-(--ink)">
            {prediction.structured_formatting?.main_text}
          </strong>
          <address className="mt-0.5 block text-[0.8125rem] not-italic text-(--muted)">
            {prediction.structured_formatting?.secondary_text}
          </address>
        </li>
      ))}
    </ul>
  ) : null;

  return (
    <>
      <section className={`place-search ${className} relative`}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={updateDropdownPosition}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={controlClassName}
        />
        {isMapsUnavailable && (
          <p className="mt-1 text-xs text-(--danger)">Maps failed to load.</p>
        )}
      </section>
      {dropdownContent && createPortal(dropdownContent, document.body)}
    </>
  );
};

export default PlaceSearch;
