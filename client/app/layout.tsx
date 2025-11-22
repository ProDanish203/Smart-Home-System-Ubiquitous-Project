import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import ReactQueryProvider from "@/store/react-query-provider";

const poppins = Poppins({
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  display: "swap",
  variable: "--font-roboto",
});
export const metadata: Metadata = {
  title: "Smart Home System",
  description:
    "A Next.js project for Smart Home System using UbiComp technologies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          roboto.className,
          poppins.variable,
          "antialiased overflow-x-clip relative min-w-screen w-full min-h-screen"
        )}
      >
        <ReactQueryProvider>
          <Toaster richColors position="top-right" />
          <main>{children}</main>
          <div id="modal-root" />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
