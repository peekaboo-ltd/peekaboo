import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Text,
  Hr,
  Link,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  children: React.ReactNode;
  preview?: string;
}

export const EmailLayout = ({ children, preview }: EmailLayoutProps) => {
  return (
    <Html>
      <Head />
      {preview && (
        <span style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
          {preview}
        </span>
      )}
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.logo}>Peekaboo</Text>
          </Section>

          {/* Content */}
          <Section style={styles.content}>{children}</Section>

          {/* Footer */}
          <Hr style={styles.divider} />
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
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const styles = {
  body: {
    backgroundColor: '#f6f9fc',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    margin: '0',
    padding: '0',
  },
  container: {
    margin: '0 auto',
    padding: '20px 0',
    maxWidth: '600px',
  },
  header: {
    backgroundColor: '#1a1a2e',
    padding: '24px',
    textAlign: 'center' as const,
  },
  logo: {
    color: '#ffffff',
    fontSize: '28px',
    fontWeight: '500' as const,
    margin: '0',
    letterSpacing: '1px',
  },
  content: {
    backgroundColor: '#ffffff',
    padding: '32px 24px',
  },
  divider: {
    backgroundColor: '#e6ebf1',
    color: '#e6ebf1',
    height: '1px',
    margin: '0',
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: '24px',
    textAlign: 'center' as const,
  },
  footerText: {
    color: '#8898aa',
    fontSize: '12px',
    margin: '4px 0',
  },
  footerLinks: {
    color: '#8898aa',
    fontSize: '12px',
    margin: '8px 0 0',
  },
  footerLink: {
    color: '#1a1a2e',
    textDecoration: 'none' as const,
  },
};
