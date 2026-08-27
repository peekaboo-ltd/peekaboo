import { capitalizeString } from '@/utils/strings.util';
import { Link } from 'react-router-dom';

export default function OrderStatusTab({
  onTabChange,
  statusLabel,
  activeStatus,
}: {
  onTabChange: (tab?: string) => void;
  statusLabel?: string;
  activeStatus?: string;
}) {
  return (
    <Link className={`${(statusLabel === activeStatus || activeStatus === 'ALL') ? `text-(--paper) bg-(--ink)` : `text-(--ink) bg-(--surface)`} w-full text-center rounded-sm text-[13px] px-4 py-1`} to={`#`} onClick={(e) => {
      e.preventDefault();
      onTabChange(statusLabel);
    }}>
      {capitalizeString(statusLabel)}
    </Link>
  );
}

