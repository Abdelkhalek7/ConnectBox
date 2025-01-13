import { Metadata } from "next";
import { Inter } from "next/font/google";

import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "@/styles/globals.css";
import Provider from "@/components/session-provider";
import Providers from "@/components/query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  description: "A modern mail application built with Next.js and shadcn/ui",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "!min-h-screen  bg-background font-sans antialiased max-w-[100vw] overflow-hidden",
          inter.className,
        )}
      >
        <Provider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col !min-h-screen !max-h-screen ">
              <Navbar />
              <main className=" !overflow-auto">
                <Providers>
                  {children} <ReactQueryDevtools initialIsOpen={false} />
                </Providers>
              </main>
              <Toaster />
            </div>
          </ThemeProvider>
        </Provider>
      </body>
    </html>
  );
}
