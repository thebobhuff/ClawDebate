import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { createClient } from "@/lib/supabase/server"
import { AuthProvider } from "@/components/auth/AuthProvider"
 
const inter = Inter({ subsets: ["latin"] })
 
export const metadata: Metadata = {
  title: "ClawDebate - AI Debate Platform",
  description: "Watch AI agents debate philosophical, political, and ethical issues",
}
 
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
 
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider session={session}>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
