import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { controlClassName } from './control';
import {
  createSessionToken,
  retrievePlace,
  suggestPlaces,
  type SearchFeature,
  type SearchSuggestion,
} from '@/utils/mapboxSearch.util';
import { useI18n } from '@/i18n/i18n';

export interface PlaceSearchResult {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  formattedAddress: string;
  name: string;
  /** Mapbox feature id (older saved locations hold a Google place id here). */
  placeId?: string;
}

const SUGGEST_DEBOUNCE_MS = 200;

interface PlaceSearchProps {
  onLocationSelect: (location: PlaceSearchResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  country?: string | string[];
  emptyOption?: {
    label: string;
    description?: string;
    icon?: ReactNode;
    disabled?: boolean;
    onSelect: () => void | Promise<void>;
  };
}

const PlaceSearch = ({
  onLocationSelect,
  placeholder,
  className = '',
  disabled = false,
  value,
  onChange,
  country,
  emptyOption,
}: PlaceSearchProps) => {
  const { t, language } = useI18n();
  const resolvedPlaceholder = placeholder ?? t('common.searchLocation');
  const [inputValue, setInputValue] = useState(value || '');
  const [predictions, setPredictions] = useState<SearchSuggestion[]>([]);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  // One token per search: every suggest call plus the final retrieve bill as a
  // single Mapbox session.
  const sessionTokenRef = useRef<string | null>(null);
  const suggestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestAbortRef = useRef<AbortController | null>(null);
  const predictionRequest = useRef(0);
  const [mapsFailed, setMapsFailed] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const normalizedCountry = (typeof country === 'string' ? [country] : country)?.map(
    (countryCode) => countryCode.toLowerCase(),
  );
  const countryKey = normalizedCountry?.join(',');
  const isMapsUnavailable = inputValue.length > 2 && mapsFailed;
  const showEmptyOption = Boolean(
    emptyOption && isFocused && inputValue.trim().length === 0,
  );

  const handlePlaceSelect = useCallback(
    (place: SearchFeature) => {
      const formattedAddress =
        place.fullAddress ||
        [place.name, place.placeFormatted].filter(Boolean).join(', ');
      const result: PlaceSearchResult = {
        coordinates: {
          latitude: Number(place.latitude.toFixed(8)),
          longitude: Number(place.longitude.toFixed(8)),
        },
        formattedAddress,
        name: place.name || '',
        placeId: place.mapboxId,
      };

      setInputValue(formattedAddress || place.name || '');
      setPredictions([]);
      onLocationSelect(result);

      if (onChange) {
        onChange(formattedAddress || place.name || '');
      }
    },
    [onLocationSelect, onChange]
  );

  useEffect(
    () => () => {
      if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);
      suggestAbortRef.current?.abort();
    },
    [],
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

    const requestId = ++predictionRequest.current;
    if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);
    suggestAbortRef.current?.abort();

    if (newValue.length <= 2) {
      setPredictions([]);
      setMapsFailed(false);
      return;
    }

    updateDropdownPosition();
    suggestTimerRef.current = setTimeout(() => {
      const controller = new AbortController();
      suggestAbortRef.current = controller;
      sessionTokenRef.current ??= createSessionToken();

      suggestPlaces({
        query: newValue,
        sessionToken: sessionTokenRef.current,
        country: countryKey ? countryKey.split(',') : undefined,
        language,
        signal: controller.signal,
      })
        .then((suggestions) => {
          if (requestId !== predictionRequest.current) return;
          setPredictions(suggestions);
          setMapsFailed(false);
          updateDropdownPosition();
        })
        .catch(() => {
          if (controller.signal.aborted || requestId !== predictionRequest.current) return;
          setPredictions([]);
          setMapsFailed(true);
        });
    }, SUGGEST_DEBOUNCE_MS);
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
    suggestion: SearchSuggestion,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const sessionToken = sessionTokenRef.current ?? createSessionToken();
    // retrieve closes the billing session; the next search starts a new one.
    sessionTokenRef.current = null;

    retrievePlace({ mapboxId: suggestion.mapboxId, sessionToken, language })
      .then((place) => {
        if (!place) return;
        handlePlaceSelect(place);
        setPredictions([]);
        setDropdownPosition(null);
      })
      .catch(() => setMapsFailed(true));
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Check if the focus is moving to the dropdown
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (dropdownRef.current && dropdownRef.current.contains(relatedTarget)) {
      return; // Don't close if clicking on dropdown
    }
    // Delay closing to allow click events to fire
    setTimeout(() => {
      setIsFocused(false);
      setPredictions([]);
      setDropdownPosition(null);
    }, 200);
  };

  const handleEmptyOptionSelect = () => {
    if (!emptyOption || emptyOption.disabled) return;

    setIsFocused(false);
    setPredictions([]);
    setDropdownPosition(null);
    inputRef.current?.blur();
    void emptyOption.onSelect();
  };

  const dropdownContent =
    (showEmptyOption || predictions.length > 0) && dropdownPosition ? (
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
      onBlur={(event) => {
        const nextTarget = event.relatedTarget as Node | null;
        if (nextTarget && dropdownRef.current?.contains(nextTarget)) return;
        setIsFocused(false);
        setPredictions([]);
        setDropdownPosition(null);
      }}
    >
      {showEmptyOption && emptyOption ? (
        <li
          className="flex cursor-pointer items-center gap-3 px-4 py-2.5 outline-none transition-[background-color,opacity] duration-200 ease-(--ease-flat) hover:bg-(--surface) focus-visible:bg-(--surface) aria-disabled:pointer-events-none aria-disabled:opacity-50"
          onClick={handleEmptyOptionSelect}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleEmptyOptionSelect();
            }
          }}
          role="option"
          aria-selected="false"
          aria-disabled={emptyOption.disabled || undefined}
          tabIndex={emptyOption.disabled ? -1 : 0}
        >
          {emptyOption.icon ? (
            <span
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-(--surface) text-(--ink)"
              aria-hidden="true"
            >
              {emptyOption.icon}
            </span>
          ) : null}
          <span className="min-w-0">
            <strong className="block text-sm font-normal text-(--ink)">
              {emptyOption.label}
            </strong>
            {emptyOption.description ? (
              <span className="mt-0.5 block text-[0.8125rem] text-(--muted)">
                {emptyOption.description}
              </span>
            ) : null}
          </span>
        </li>
      ) : null}

      {predictions.map((prediction) => (
        <li
          key={prediction.mapboxId}
          className="cursor-pointer px-4 py-2.5 transition-[background-color] duration-200 ease-(--ease-flat) hover:bg-(--surface)"
          onMouseDown={(e) => handleSuggestionClick(prediction, e)}
          role="option"
        >
          <strong className="block text-sm font-normal text-(--ink)">
            {prediction.name}
          </strong>
          <address className="mt-0.5 block text-[0.8125rem] not-italic text-(--muted)">
            {prediction.placeFormatted || prediction.fullAddress}
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
          onFocus={() => {
            setIsFocused(true);
            updateDropdownPosition();
          }}
          onBlur={handleInputBlur}
          placeholder={resolvedPlaceholder}
          disabled={disabled}
          autoComplete="off"
          className={controlClassName}
        />
        {isMapsUnavailable && (
          <p className="mt-1 text-xs text-(--danger)">{t('common.mapsLoadFailed')}</p>
        )}
      </section>
      {dropdownContent && createPortal(dropdownContent, document.body)}
    </>
  );
};

export default PlaceSearch;
