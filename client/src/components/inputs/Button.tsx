import { type IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type FC, type MouseEventHandler, type ReactNode, type HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';
import { Loader } from './Loader.tsx';
import { Button as ButtonUI } from '../ui/button';

interface ButtonProps extends Omit<HTMLAttributes<HTMLButtonElement | HTMLAnchorElement>, 'onClick'> {
  route?: string;
  value?: ReactNode;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  type?: 'submit' | 'button' | 'reset';
  disabled?: boolean;
  primary?: boolean;
  styled?: boolean;
  submit?: boolean;
  danger?: boolean;
  icon?: IconProp;
  isLoading?: boolean;
  children?: ReactNode;
}

const Button: FC<ButtonProps> = ({
  route = '#',
  value,
  onClick,
  type = null,
  disabled = false,
  primary = false,
  styled = true,
  className,
  submit = false,
  danger = false,
  icon = undefined,
  isLoading = false,
  children,
  ...rest
}) => {
  if (submit || type === 'submit' || type === 'button' || type === 'reset') {
    return (
      <ButtonUI
        type={type || 'submit'}
        onClick={onClick as MouseEventHandler<HTMLButtonElement> | undefined}
        className={`py-[6px] flex font-normal items-center gap-2 justify-center text-center border-[1px] border-primary-900 px-4 rounded-sm text-[13px] text-primary-900 bg-white hover:bg-primary-900 hover:text-white cursor-pointer ease-in-out duration-400 hover:scale-[1.005] max-[800px]:!text-[13px] max-md:!py-2 ${
          !styled &&
          '!bg-transparent !shadow-none !text-primary-900 hover:!scale-[1.005] !py-0 !px-0 !border-none hover:!bg-transparent hover:!text-primary-900'
        } ${className} ${
          primary &&
          '!bg-primary-900 !text-white hover:!bg-primary-800 hover:!text-white !shadow-sm !border-primary-900'
        }
        ${
          danger &&
          '!bg-red-700 !border-none !text-white hover:!bg-red-700 hover:!text-white !shadow-sm'
        } ${
          disabled &&
          '!bg-secondary !shadow-none hover:!scale-[1] !cursor-not-allowed hover:!bg-secondary hover:text-opacity-80 !duration-0 text-white text-opacity-80 !border-none text-center transition-all'
        }`}
        disabled={disabled}
        {...rest}
      >
        {isLoading ? (
          <Loader className={primary ? 'text-white' : 'text-primary-900'} />
        ) : (
          <>
            {icon && <FontAwesomeIcon icon={icon} />}
            {children || value}
          </>
        )}
        </ButtonUI>
    );
  }

  return (
    <Link
      to={route}
      onClick={(e) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        if (onClick) {
          onClick(e);
        }
      }}
      className={`py-[6px] text-center flex items-center gap-2 justify-center border-[1px] border-primary-900 px-4 rounded-sm text-[13px] text-primary-900 bg-white hover:bg-primary-900 hover:text-white cursor-pointer ease-in-out duration-400 hover:scale-[1.005] max-[800px]:!text-[13px] max-md:!py-2 ${
        !styled &&
        '!bg-transparent !shadow-none !text-primary-900 hover:!scale-[1.005] !py-0 !px-0 !border-none hover:!bg-transparent hover:!text-primary-900'
      } ${className} ${
        primary &&
        '!bg-primary-900 !text-white hover:!bg-primary-800 hover:!text-white !shadow-sm !border-primary-900'
      }
      ${
        danger &&
        '!bg-red-700 !border-none !text-white hover:!bg-red-700 hover:!text-white !shadow-sm'
      } ${
        disabled &&
        '!bg-secondary !shadow-none hover:!scale-[1] !cursor-default hover:!bg-secondary hover:text-opacity-80 !duration-0 text-white text-opacity-80 !border-none text-center transition-all'
      }`}
      {...rest}
    >
      {isLoading ? (
        <Loader className={primary ? 'text-white' : 'text-primary-900'} />
      ) : (
        <>
          {icon && <FontAwesomeIcon icon={icon} />}
          {children || value}
        </>
      )}
    </Link>
  );
};

export default Button;
