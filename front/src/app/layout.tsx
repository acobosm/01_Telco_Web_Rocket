import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "./theme";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Telco Customer Management",
  description: "Manage Northwind customers with Rocket Backend & Next.js Frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={outfit.variable}>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
