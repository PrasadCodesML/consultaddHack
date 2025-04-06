import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import Providers from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "ConsultAdd: RFP Analyzer",
  description: "Simplify and speed up the process of checking eligibility and compliance for RFPs",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}



import './globals.css'

