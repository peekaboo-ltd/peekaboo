import CustomPopover from '@/components/inputs/CustomPopover';
import Input from '@/components/inputs/Input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { capitalizeString } from '@/utils/strings.util';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Control,
  Controller,
  FieldValues,
  UseFormSetValue,
} from 'react-hook-form';
import { Link } from 'react-router-dom';

export const useStatusFilter = ({
  control,
  setValue,
  applicationStatuses,
  defaultStatuses,
  searchPlaceholder = 'Search status...',
  labelIcon = faGlobe,
  label = 'Status',
}: {
  control: Control<FieldValues>;
  setApplicationStatuses?: Dispatch<SetStateAction<string[]>>;
  setValue: UseFormSetValue<FieldValues>;
  applicationStatuses?: string[];
  defaultStatuses?: string[];
  searchPlaceholder?: string;
  labelIcon?: IconProp;
  label?: string;
}) => {
  const [applicationStatus, setApplicationStatus] = useState<string[]>(
    defaultStatuses || [],
  );
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Track previous defaultStatuses to detect transition from defined to undefined
  const prevDefaultStatusesRef = useRef<string[] | undefined>(defaultStatuses);

  // Memoize applicationStatuses string for comparison
  const applicationStatusesKey = useMemo(
    () => JSON.stringify(applicationStatuses || []),
    [applicationStatuses],
  );

  // Memoize defaultStatuses string for comparison
  const defaultStatusesKey = useMemo(
    () => JSON.stringify(defaultStatuses || []),
    [defaultStatuses],
  );

  // Update applicationStatus when defaultStatuses changes
  useEffect(() => {
    const prevDefaultStatuses = prevDefaultStatusesRef.current;
    prevDefaultStatusesRef.current = defaultStatuses;

    if (defaultStatuses !== undefined) {
      if (defaultStatuses.length > 0) {
        setApplicationStatus(defaultStatuses);
        // Update form values for all statuses
        applicationStatuses?.forEach((status) => {
          setValue(status, defaultStatuses.includes(status));
        });
      } else {
        // Clear selections if defaultStatuses is explicitly empty array
        setApplicationStatus([]);
        applicationStatuses?.forEach((status) => {
          setValue(status, false);
        });
      }
    } else if (prevDefaultStatuses !== undefined) {
      // Clear state when defaultStatuses transitions from defined to undefined
      // Only clear if it was previously defined (to avoid clearing on initial mount)
      setApplicationStatus([]);
      applicationStatuses?.forEach((status) => {
        setValue(status, false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultStatusesKey, applicationStatusesKey]);

  // Normalize search text: convert to lowercase and remove special characters/spaces
  const normalizeSearchText = (text: string): string => {
    return text.toLowerCase().replace(/[_\s-]/g, '');
  };

  // Filter statuses based on search query
  const filteredStatuses = useMemo(() => {
    if (!searchQuery.trim()) {
      return applicationStatuses || [];
    }

    const normalizedQuery = normalizeSearchText(searchQuery);

    return (applicationStatuses || []).filter((status) => {
      // Get the mapped label for the status
      const statusLabel = status;

      // Normalize both the original status and the mapped label
      const normalizedStatus = normalizeSearchText(status);
      const normalizedLabel = normalizeSearchText(statusLabel);

      // Check if search query matches either the original status or the mapped label
      return (
        normalizedStatus.includes(normalizedQuery) ||
        normalizedLabel.includes(normalizedQuery)
      );
    });
  }, [applicationStatuses, searchQuery]);

  // Memoize applicationStatus to ensure stable reference
  const memoizedApplicationStatus = useMemo(
    () => applicationStatus,
    [applicationStatus],
  );

  // Memoize handlers to prevent recreating them on every render
  const handleStatusToggle = useCallback((status: string) => {
    setApplicationStatus((prev) => {
      if (prev.includes(status)) {
        return prev.filter((selectedStatus) => selectedStatus !== status);
      } else {
        return [...prev, status];
      }
    });
  }, []);

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setApplicationStatus([]);
      applicationStatuses?.forEach((status) => {
        setValue(status, false);
      });
    },
    [applicationStatuses, setValue],
  );

  const handleSelectAll = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setApplicationStatus(filteredStatuses);
      filteredStatuses.forEach((status) => {
        setValue(status, true);
      });
    },
    [filteredStatuses, setValue],
  );

  // Memoize the statusFilter JSX to prevent recreating it on every render
  const statusFilterJSX = useMemo(
    () => (
      <CustomPopover
        trigger={
          <Button
            variant="outline"
            className="cursor-pointer font-normal text-[--ink] !justify-start bg-[--paper] flex !w-full items-center gap-2 !h-[38px] text-[13px]"
          >
            <FontAwesomeIcon icon={labelIcon} />
            <p className="text-[13px]">{label}</p>
          </Button>
        }
      >
        <section className="flex flex-col w-full min-w-[14vw] max-h-[75vh] gap-2 px-2">
          {/* Search input */}
          <fieldset className="w-full flex-shrink-0">
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-[13px] h-9"
            />
          </fieldset>

          {/* Scrollable container for statuses and action buttons */}
          <nav
            className="flex flex-col w-full overflow-y-auto bg-[--paper] rounded-md p-2"
            style={{ maxHeight: 'calc(55vh - 50px)' }}
            aria-label="Status Filter List"
          >
            <menu className="flex flex-col w-full min-w-[17vw] gap-3">
              {filteredStatuses.length > 0 ? (
                filteredStatuses.map((status, index) => {
                  return (
                    <Controller
                      name={status}
                      control={control}
                      key={`${status}-${index}`}
                      render={({ field }) => {
                        const isSelected = applicationStatus.includes(status);
                        return (
                          <Link
                            to={`#`}
                            {...field}
                            onClick={(e) => {
                              e.preventDefault();
                              handleStatusToggle(status);
                            }}
                            className="flex items-center w-full cursor-pointer gap-2"
                          >
                            <Checkbox
                              id={status}
                              checked={isSelected}
                              aria-checked={isSelected}
                              className={
                                isSelected
                                  ? 'bg-[--ink] w-4.5 h-4.5 rounded-md cursor-pointer'
                                  : 'w-4.5 h-4.5'
                              }
                            />
                            <p className="text-[13px] text-[--ink]">
                              {capitalizeString(status)}
                            </p>
                          </Link>
                        );
                      }}
                    />
                  );
                })
              ) : (
                <p className="text-[13px] text-[--muted] text-center py-2">
                  No statuses found
                </p>
              )}
            </menu>
            <ul className="flex items-center justify-between w-full gap-2 mt-4">
              <li>
                <Link
                  className="text-center text-[--ink] text-[13px] p-1 px-3 border hover:!border-[--ink] hover:!bg-[--ink] hover:!text-[--paper] font-normal rounded-sm"
                  to={`#`}
                  onClick={handleClear}
                >
                  Clear
                </Link>
              </li>
              <li>
                <Link
                  className="text-center text-[--ink] text-[13px] p-1 px-3 border hover:!border-[--ink] hover:!bg-[--ink] hover:!text-[--paper] font-normal rounded-sm"
                  to={`#`}
                  onClick={handleSelectAll}
                >
                  Select all
                </Link>
              </li>
            </ul>
          </nav>
        </section>
      </CustomPopover>
    ),
    [
      labelIcon,
      label,
      searchPlaceholder,
      searchQuery,
      filteredStatuses,
      applicationStatus,
      control,
      handleStatusToggle,
      handleClear,
      handleSelectAll,
    ],
  );

  return {
    statusFilter: statusFilterJSX,
    applicationStatus: memoizedApplicationStatus,
    setApplicationStatus,
    setValue,
  };
};
