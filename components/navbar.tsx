"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UploadIcon as FileUpload, BarChart3, Home } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <FileUpload className="h-6 w-6" />
          <span className="text-xl font-bold">ConsultAI: RFP Analyzer</span>
        </Link>
        <nav className="ml-auto flex gap-4">
          <Link href="/">
            <Button variant={pathname === "/" ? "default" : "ghost"}>
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link href="/upload">
            <Button variant={pathname === "/upload" ? "default" : "ghost"}>
              <FileUpload className="mr-2 h-4 w-4" />
              Upload RFP
            </Button>
          </Link>
          <Link href="/analytics">
            <Button variant={pathname === "/analytics" ? "default" : "ghost"}>
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}

