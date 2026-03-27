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
              background: "rgba(255, 252, 247, 0.85)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              boxShadow:
                "0 4px 16px rgba(28, 25, 23, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
              borderRadius: "12px",
            },
          }}
        />
      </body>
    </html>
  );
}
