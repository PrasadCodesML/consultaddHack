"use client"

import { ThemeProvider } from "@/components/theme-provider"
import React from "react"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="system" 
      enableSystem
      disableTransitionOnChange
      storageKey="rfp-analyzer-theme"
      forcedTheme="light" // Force light theme initially to match server render
    >
      {children}
    </ThemeProvider>
  )
}