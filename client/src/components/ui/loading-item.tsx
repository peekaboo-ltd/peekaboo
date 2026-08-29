import type { ReactNode } from 'react';

import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type LoadingItemProps = {
  title: string;
  trailing?: ReactNode;
  className?: string;
};

export function LoadingItem({ title, trailing, className }: LoadingItemProps) {
  return (
    <div
      className={cn(
        'flex w-full max-w-xs flex-col gap-4 [--radius:1rem]',
        className,
      )}
    >
      <Item variant="muted">
        <ItemMedia>
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="line-clamp-1">{title}</ItemTitle>
        </ItemContent>
        {trailing ? (
          <ItemContent className="flex-none justify-end">{trailing}</ItemContent>
        ) : null}
      </Item>
    </div>
  );
}
