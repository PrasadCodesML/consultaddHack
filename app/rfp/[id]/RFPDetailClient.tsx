"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertTriangle, Download, FileText, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"

interface RFPData {
  name: string
  company: string
  status: string
  date: string
  pdfFileName?: string
  eligibility: {
    matches: Array<{ requirement: string }>
    mismatches: Array<{ requirement: string }>
  }
  checklist: Array<{ item: string; status: string; required?: boolean }>
  risks: Array<{ clause: string; risk: string; suggestion: string }>
}

interface RFPDetailClientProps {
  rfpData: RFPData
}

export default function RFPDetailClient({ rfpData }: RFPDetailClientProps) {
  const [showRfpDialog, setShowRfpDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("eligibility")

  const handleExportReport = () => {
    const reportContent = `
      RFP ANALYSIS REPORT
      
      RFP Name: ${rfpData.name}
      Company: ${rfpData.company}
      Status: ${rfpData.status}
      Date: ${rfpData.date}
      
      ELIGIBILITY ASSESSMENT
      
      Matched Requirements:
      ${rfpData.eligibility.matches.map((item) => `- ${item.requirement}`).join("\n")}
      
      Unmatched Requirements:
      ${rfpData.eligibility.mismatches.map((item) => `- ${item.requirement}`).join("\n")}
      
      SUBMISSION CHECKLIST
      
      ${rfpData.checklist.map((item) => `- ${item.item}: ${item.status.toUpperCase()}`).join("\n")}
      
      RISK ANALYSIS
      
      ${rfpData.risks.map((item) => `- ${item.clause} (${item.risk} Risk)\n  Suggestion: ${item.suggestion}`).join("\n\n")}
      
      FLAGS
      
      - WARNING: Bank Letter of Creditworthiness not available
      - ISSUE: No MBE Certification
      - VERIFIED: Certificate of Insurance verified
    `

    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${rfpData.name.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").toLowerCase()}-report.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    alert(
      "In a real application, this would download a properly formatted PDF report with all flags and analysis data.",
    )
  }

  // Rest of your component JSX remains the same, but using rfpData directly from props
  return (
    <div className="container mx-auto py-6">
      {/* Your existing JSX here */}
    </div>
  )
}