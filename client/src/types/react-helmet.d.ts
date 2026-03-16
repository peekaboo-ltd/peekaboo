declare module 'react-helmet' {
  import { ComponentType, ReactNode } from 'react';

  export const Helmet: ComponentType<{ children?: ReactNode }>;
}
