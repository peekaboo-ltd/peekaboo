import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
} from '@react-email/components';
import * as React from 'react';
import { emailFontFamily, emailFontUrl, emailTokens } from './tokens';

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

export const EmailLayout = ({ children, preview }: EmailLayoutProps) => {
  return (
    <Html>
      <Head>
        <link href={emailFontUrl} rel="stylesheet" />
      </Head>
      {preview && (
        <span style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
          {preview}
        </span>
      )}
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.logo}>Peekaboo</Text>
          </Section>

          <Section style={styles.content}>{children}</Section>

          <Section style={styles.footerDivider} />
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              &copy; {new Date().getFullYear()} Peekaboo. All rights reserved.
            </Text>
            <Text style={styles.footerText}>Kigali, Rwanda</Text>
            <Text style={styles.footerLinks}>
              <Link href="https://peekaboo.co.rw" style={styles.footerLink}>
                Website
              </Link>
              {' | '}
              <Link href="mailto:support@peekaboo.co.rw" style={styles.footerLink}>
                Support
              </Link>
              {' | '}
              <Link href="https://peekaboo.co.rw/track" style={styles.footerLink}>
                Track order
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const styles = {
  body: {
    backgroundColor: emailTokens.surfaceSunken,
    fontFamily: emailFontFamily,
    margin: '0',
    padding: '0',
  },
  container: {
    margin: '0 auto',
    padding: '20px 0',
    maxWidth: '600px',
  },
  header: {
    backgroundColor: emailTokens.ink,
    padding: '20px 24px',
    textAlign: 'center' as const,
  },
  logo: {
    color: emailTokens.paper,
    fontSize: '20px',
    fontWeight: '500' as const,
    margin: '0',
    fontFamily: emailFontFamily,
  },
  content: {
    backgroundColor: emailTokens.paper,
    padding: '32px 24px',
  },
  footerDivider: {
    borderTop: `1px solid ${emailTokens.line}`,
    margin: '0',
  },
  footer: {
    backgroundColor: emailTokens.ink,
    padding: '24px',
    textAlign: 'center' as const,
  },
  footerText: {
    color: emailTokens.muted,
    fontSize: '12px',
    lineHeight: '1.4',
    margin: '4px 0',
    fontFamily: emailFontFamily,
  },
  footerLinks: {
    color: emailTokens.muted,
    fontSize: '12px',
    lineHeight: '1.4',
    margin: '8px 0 0',
    fontFamily: emailFontFamily,
  },
  footerLink: {
    color: emailTokens.paper,
    textDecoration: 'underline' as const,
  },
};
