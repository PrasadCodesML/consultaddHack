'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertTriangle, Download, FileText } from "lucide-react"
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

export default function RFPDetailPage({ params }: { params: { id: string } }) {
  const [rfpData, setRfpData] = useState<RFPData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRfpDialog, setShowRfpDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("eligibility")

  useEffect(() => {
    const fetchRFPData = async () => {
      try {
        const response = await fetch(`/api/rfps/${params.id}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setRfpData(data)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch RFP data:', err)
        setError('Failed to load RFP data')
        setLoading(false)
      }
    }

    fetchRFPData()
  }, [params.id])

  const handleExportReport = () => {
    if (!rfpData) return

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
  }

  if (loading) {
    return <div className="container mx-auto py-6">Loading...</div>
  }

  if (error || !rfpData) {
    return <div className="container mx-auto py-6">Error: {error || 'Failed to load RFP data'}</div>
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{rfpData.name}</h1>
          <p className="text-muted-foreground">{rfpData.company}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant={
                rfpData.status === "Eligible"
                  ? "success"
                  : rfpData.status === "Not Eligible"
                    ? "destructive"
                    : "outline"
              }
            >
              {rfpData.status}
            </Badge>
            <Badge variant="outline">{rfpData.date}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowRfpDialog(true)}>
            <FileText className="h-4 w-4 mr-2" />
            View Original
          </Button>
          <Button size="sm" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="eligibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Analysis</CardTitle>
              <CardDescription>Assessment of company eligibility for RFP submission</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Matched Requirements</h3>
                  <div className="space-y-2">
                    {rfpData.eligibility.matches.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-md bg-green-50 dark:bg-green-950/20"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span>{item.requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Unmatched Requirements</h3>
                  <div className="space-y-2">
                    {rfpData.eligibility.mismatches.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded-md bg-red-50 dark:bg-red-950/20">
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span>{item.requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Eligibility Assessment</h4>
                      <p className="text-sm">
                        Your company meets 4 out of 5 requirements. The missing requirement (Local office presence) may
                        be addressed by partnering with a local firm or establishing a temporary project office.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submission Checklist</CardTitle>
              <CardDescription>Required documents and materials for RFP submission</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rfpData.checklist.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-2">
                      {item.status === "complete" ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span>{item.item}</span>
                      {item.required && <Badge variant="outline">Required</Badge>}
                    </div>
                    <Button variant={item.status === "complete" ? "outline" : "default"} size="sm">
                      {item.status === "complete" ? "View" : "Upload"}
                    </Button>
                  </div>
                ))}

                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-md mt-6">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Submission Status</h4>
                      <p className="text-sm">
                        4 out of 6 items are complete. You must complete all required items before the submission
                        deadline on April 15, 2025.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
              <CardDescription>Potential risks and suggested modifications to RFP terms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {rfpData.risks.map((item, index) => (
                  <div key={index} className="p-4 border rounded-md space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{item.clause}</h3>
                      <Badge
                        variant={item.risk === "High" ? "destructive" : item.risk === "Medium" ? "outline" : "success"}
                      >
                        {item.risk} Risk
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.suggestion}</p>
                  </div>
                ))}

                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-md">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Risk Assessment</h4>
                      <p className="text-sm">
                        We've identified 1 high-risk clause. Please review and consider negotiating terms to reduce potential exposure.
                      </p>
                    </div>
                  </div>
                </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Original RFP Dialog */}
        {/* Dialog to preview the original RFP PDF */}
        <Dialog open={showRfpDialog} onOpenChange={setShowRfpDialog}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>Original RFP Document</DialogTitle>
              <DialogDescription>
                Preview of the uploaded RFP file.
              </DialogDescription>
            </DialogHeader>
            {rfpData.pdfFileName ? (
              <iframe
                src={`/api/pdf/${rfpData.pdfFileName}`}
                title="RFP PDF Preview"
                className="w-full h-full border rounded"
              />
            ) : (
              <div className="text-center py-10 text-sm text-muted-foreground">
                No RFP PDF uploaded for this entry.
              </div>
            )}
            <DialogClose asChild>
              <Button className="absolute right-4 top-4" size="sm" variant="ghost">
                Close
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

