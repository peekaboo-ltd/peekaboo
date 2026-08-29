export const emailTokens = {
  paper: '#ffffff',
  ink: '#000000',
  surface: '#f3f3f3',
  surfaceHover: '#e2e2e2',
  surfaceSunken: '#fafafa',
  line: '#e2e2e2',
  lineStrong: '#afafaf',
  muted: '#6e6e6e',
  mutedWeak: '#757575',
  disabledFg: '#afafaf',
  radiusControl: '8px',
  radiusCard: '12px',
  radiusPill: '999px',
  danger: '#b91c1c',
  dangerSurface: '#fef2f2',
  dangerLine: '#fecaca',
  approve: '#15803d',
  approveSurface: '#f0fdf4',
  approveLine: '#bbf7d0',
  warning: '#b45309',
  warningSurface: '#fffbeb',
  warningLine: '#fde68a',
} as const;

export const emailFontFamily =
  "'DM Sans', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif";

export const emailFontUrl =
  'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500&display=swap';

export const emailType = {
  display: { fontSize: '28px', lineHeight: '1.16', fontWeight: '500' as const },
  h2: { fontSize: '24px', lineHeight: '1.16', fontWeight: '500' as const },
  h3: { fontSize: '20px', lineHeight: '1.3', fontWeight: '500' as const },
  body: { fontSize: '16px', lineHeight: '1.6', fontWeight: '400' as const },
  bodySm: { fontSize: '14px', lineHeight: '1.55', fontWeight: '400' as const },
  label: { fontSize: '14px', lineHeight: '1.2', fontWeight: '500' as const },
  meta: { fontSize: '13px', lineHeight: '1.5', fontWeight: '400' as const },
  eyebrow: { fontSize: '12px', lineHeight: '1.4', fontWeight: '500' as const },
};
