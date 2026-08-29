import { type IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type FC, type MouseEventHandler, type ReactNode, type HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { Button as ButtonUI } from '../ui/button';
import { cn } from '@/lib/utils';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'link'
  | 'danger'
  | 'approve';

interface ButtonProps extends Omit<HTMLAttributes<HTMLButtonElement | HTMLAnchorElement>, 'onClick'> {
  route?: string;
  value?: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  type?: 'submit' | 'button' | 'reset' | null;
  disabled?: boolean;
  /** Shorthand for variant="primary". */
  primary?: boolean;
  submit?: boolean;
  /** Shorthand for variant="danger". */
  danger?: boolean;
  /** Shorthand for variant="approve". */
  approve?: boolean;
  icon?: IconProp;
  isLoading?: boolean;
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: 'sm' | 'default' | 'lg';
  /** Associates a submit button with a form by id when rendered outside it. */
  form?: string;
}

// This wrapper adds routing, loading, and a FontAwesome icon slot. Everything
// visual comes from ui/button so there is exactly one button in the app —
// it used to re-declare the full style string and drift from the primitive.
const uiVariant = {
  primary: 'default',
  secondary: 'secondary',
  outline: 'outline',
  ghost: 'ghost',
  link: 'link',
  danger: 'destructive',
  approve: 'approve',
} as const;

const Button: FC<ButtonProps> = ({
  route = '#',
  value,
  onClick,
  type = null,
  disabled = false,
  primary = false,
  className,
  submit = false,
  danger = false,
  approve = false,
  icon,
  isLoading = false,
  children,
  variant,
  size = 'default',
  ...rest
}) => {
  const resolved: ButtonVariant =
    variant ??
    (danger ? 'danger' : approve ? 'approve' : primary ? 'primary' : 'outline');

  const classes = cn(className);

  const content = isLoading ? (
    <Spinner />
  ) : (
    <>
      {icon ? <FontAwesomeIcon icon={icon} aria-hidden="true" /> : null}
      {children || value}
    </>
  );

  if (submit || type) {
    return (
      <ButtonUI
        type={type || 'submit'}
        variant={uiVariant[resolved]}
        size={size}
        onClick={onClick as MouseEventHandler<HTMLButtonElement> | undefined}
        className={classes}
        disabled={disabled || isLoading}
        {...rest}
      >
        {content}
      </ButtonUI>
    );
  }

  return (
    <ButtonUI
      asChild
      variant={uiVariant[resolved]}
      size={size}
      className={classes}
      disabled={disabled || isLoading}
    >
      <Link
        to={disabled ? '#' : route}
        onClick={(event) => {
          if (disabled || isLoading) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        }}
        aria-disabled={disabled || isLoading || undefined}
        {...rest}
      >
        {content}
      </Link>
    </ButtonUI>
  );
};

export default Button;
