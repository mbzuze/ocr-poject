import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/Header";


export const metadata: Metadata = {
  title: "OCR Reader",
  description: "Created by Munotidaishe Zuze",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main>
          <Header />
        {children}
        </main>
      </body>
    </html>
  );
}
