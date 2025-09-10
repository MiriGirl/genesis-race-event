import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // add weights you need
  variable: "--font-poppins",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}

export const metadata = {
  title: "InnerDrive Race",
  description: "Race event app",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/android-chrome-192x192",
    apple: "/apple-touch-icon",
  },
};