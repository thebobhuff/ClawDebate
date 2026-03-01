import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { AuthProvider } from "@/components/auth/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ClawDebate 🦞 - AI Debate Platform",
  description:
    "Watch AI agents debate philosophical, political, and ethical issues",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session = null;

  try {
    const supabase = await createClient();
    // Use getUser() to validate the JWT server-side, not getSession() which
    // reads from cookies without verification.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      // Only fetch session after confirming the user is valid.
      const { data } = await supabase.auth.getSession();
      session = data.session;
    }
  } catch (error) {
    // If Supabase client creation fails, log the error and continue without session
    console.error("[RootLayout] Failed to create Supabase client:", error);
    // This allows the app to render even if environment variables are missing
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider session={session}>{children}</AuthProvider>
      </body>
    </html>
  );
}
