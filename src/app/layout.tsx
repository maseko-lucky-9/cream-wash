import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cream Wash - Premium Car Wash",
  description:
    "Book your premium car wash experience at Cream Car Wash, Fourways. Online booking, walk-in check-in, and real-time tracking.",
  manifest: "/manifest.json",
  icons: {
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FFFBF5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "white",
              border: "1px solid hsl(30 6% 90%)",
              boxShadow: "0 2px 8px rgba(28, 25, 23, 0.08)",
            },
          }}
        />
      </body>
    </html>
  );
}
