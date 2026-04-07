import { Button as ReactEmailButton } from '@react-email/components';
import * as React from 'react';

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const EmailButton = ({
  href,
  children,
  variant = 'primary',
}: EmailButtonProps) => {
  const bgColors = {
    primary: '#1a1a2e',
    secondary: '#6c757d',
    danger: '#dc3545',
  };

  return (
    <ReactEmailButton
      href={href}
      style={{
        backgroundColor: bgColors[variant],
        color: '#ffffff',
        padding: '12px 24px',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500' as const,
        display: 'inline-block',
        textAlign: 'center' as const,
      }}
    >
      {children}
    </ReactEmailButton>
  );
};
