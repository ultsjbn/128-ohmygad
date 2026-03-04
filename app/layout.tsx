import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import "./fonts.css";
import "@snowball-tech/design-tokens/dist/web/css/variables.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  icons: {
    icon: '/logo.png',
  },
  metadataBase: new URL(defaultUrl),
  title: "OhMyGAD!",
  description: "Event Management Platform for UPB Kasarian Gender Program",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
