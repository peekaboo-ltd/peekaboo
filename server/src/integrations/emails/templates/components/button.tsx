import { Button as ReactEmailButton } from '@react-email/components';
import * as React from 'react';
import { emailFontFamily, emailTokens } from './tokens';

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export const EmailButton = ({
  href,
  children,
  variant = 'primary',
}: EmailButtonProps) => {
  const variantStyles = {
    primary: {
      backgroundColor: emailTokens.ink,
      color: emailTokens.paper,
      border: `1px solid ${emailTokens.ink}`,
    },
    secondary: {
      backgroundColor: emailTokens.surface,
      color: emailTokens.ink,
      border: `1px solid ${emailTokens.surface}`,
    },
    outline: {
      backgroundColor: 'transparent',
      color: emailTokens.ink,
      border: `1px solid ${emailTokens.ink}`,
    },
    danger: {
      backgroundColor: emailTokens.dangerSurface,
      color: emailTokens.danger,
      border: `1px solid ${emailTokens.dangerLine}`,
    },
  };

  return (
    <ReactEmailButton
      href={href}
      style={{
        ...variantStyles[variant],
        padding: '12px 24px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500' as const,
        fontFamily: emailFontFamily,
        borderRadius: emailTokens.radiusControl,
        display: 'inline-block',
        textAlign: 'center' as const,
      }}
    >
      {children}
    </ReactEmailButton>
  );
};
