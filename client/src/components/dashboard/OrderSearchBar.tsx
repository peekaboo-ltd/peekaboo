import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

export default function OrderSearchBar({
  initialValue = '',
  onSearch,
  placeholder = 'Search by Order ID…',
}: {
  initialValue?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
}) {
  const navigate = useNavigate();
  const [value, setValue] = useState(initialValue);

  const trimmed = useMemo(() => value.trim(), [value]);

  return (
    <form
      className="w-full max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        if (!trimmed) return;
        if (onSearch) return onSearch(trimmed);
        navigate(`/orders?referenceId=${encodeURIComponent(trimmed)}`);
      }}
    >
      <label htmlFor="order-search" className="sr-only">
        Search orders by Order ID
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <FontAwesomeIcon icon={faSearch} />
        </span>
        <Input
          id="order-search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
          autoComplete="off"
          inputMode="search"
        />
      </div>
    </form>
  );
}

