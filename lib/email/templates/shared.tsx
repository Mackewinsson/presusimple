import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

const accentColor = "#d3ff3d";
const darkBackground = "#0f172a";

interface EmailLayoutProps {
  preview: string;
  heading: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, heading, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={headerStyle}>
            <Text style={logoStyle}>Presusimple</Text>
          </Section>
          <Heading style={headingStyle}>{heading}</Heading>
          {children}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              © {new Date().getFullYear()} Presusimple. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function EmailButton({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Section style={{ textAlign: "center" as const, margin: "24px 0" }}>
      <Link href={href} style={buttonStyle}>
        {label}
      </Link>
    </Section>
  );
}

const bodyStyle = {
  backgroundColor: "#f8fafc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
  margin: 0,
  padding: "24px 0",
};

const containerStyle = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  margin: "0 auto",
  maxWidth: "560px",
  overflow: "hidden" as const,
};

const headerStyle = {
  backgroundColor: darkBackground,
  padding: "20px 32px",
};

const logoStyle = {
  color: accentColor,
  fontSize: "20px",
  fontWeight: 700,
  margin: 0,
};

const headingStyle = {
  color: "#0f172a",
  fontSize: "24px",
  fontWeight: 700,
  lineHeight: "32px",
  margin: "32px 32px 16px",
  padding: 0,
};

export const paragraphStyle = {
  color: "#475569",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 32px 16px",
};

const footerStyle = {
  borderTop: "1px solid #e2e8f0",
  marginTop: "32px",
  padding: "24px 32px",
};

const footerTextStyle = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "18px",
  margin: 0,
  textAlign: "center" as const,
};

const buttonStyle = {
  backgroundColor: darkBackground,
  borderRadius: "6px",
  color: accentColor,
  display: "inline-block",
  fontSize: "16px",
  fontWeight: 600,
  padding: "12px 24px",
  textDecoration: "none",
};
