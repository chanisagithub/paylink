import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

import { Providers } from "@/app/providers";
import { PageTransition } from "@/components/shared/page-transition";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: {
    default: "PayLink",
    template: "%s | PayLink",
  },
  description: "Branded payment links with conversion analytics and secure Stripe checkout.",
  icons: {
    icon: "/paylink-logo.png",
    apple: "/paylink-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${headingFont.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>
          <PageTransition>{children}</PageTransition>
        </Providers>
      </body>
    </html>
  );
}
