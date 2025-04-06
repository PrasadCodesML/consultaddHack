'use client'

import { use, useState, useEffect } from 'react'
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
import jsPDF from 'jspdf';

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


export default function RFPDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [rfpData, setRfpData] = useState<RFPData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showRfpDialog, setShowRfpDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("eligibility")
  const [pdfError, setPdfError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRFPData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`/api/rfps/${id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('RFP not found')
          }
          throw new Error(`Failed to load RFP data (Status: ${response.status})`)
        }

        const data = await response.json()
        console.log('Fetched RFP data:', data) // Add this for debugging
        setRfpData(data)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch RFP data:', err)
        setError('Failed to load RFP data')
        setLoading(false)
      }
    }

    fetchRFPData()
  }, [id])

  // Added function to check if PDF exists before showing dialog
  const handleShowRfpDialog = async () => {
    if (!rfpData?.pdfFileName) {
      setPdfError("No PDF file associated with this RFP")
      setShowRfpDialog(true)
      return
    }

    try {
      // Verify PDF exists before showing dialog
      const response = await fetch(`/api/pdf/${rfpData.pdfFileName}`)
      if (!response.ok) {
        setPdfError("PDF not found or cannot be accessed")
      } else {
        setPdfError(null)
      }
      setShowRfpDialog(true)
    } catch (err) {
      console.error('Error checking PDF:', err)
      setPdfError("Error loading PDF file")
      setShowRfpDialog(true)
    }
  }

  const handleExportReport = () => {
    if (!rfpData) return

    const doc = new jsPDF();
    
    // Set font size and styles
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("RFP ANALYSIS REPORT", 20, 20);
    
    // Reset font for regular text
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    // Add basic information
    let yPos = 40;
    doc.text(`RFP Name: ${rfpData.name}`, 20, yPos);
    doc.text(`Company: ${rfpData.company}`, 20, yPos + 10);
    doc.text(`Status: ${rfpData.status}`, 20, yPos + 20);
    doc.text(`Date: ${rfpData.date}`, 20, yPos + 30);
    
    // Add Eligibility Assessment
    yPos = 90;
    doc.setFont("helvetica", "bold");
    doc.text("ELIGIBILITY ASSESSMENT", 20, yPos);
    doc.setFont("helvetica", "normal");
    
    yPos += 10;
    doc.text("Matched Requirements:", 20, yPos);
    rfpData.eligibility.matches.forEach((item) => {
      yPos += 10;
      if (yPos > 270) { // Check if we need a new page
        doc.addPage();
        yPos = 20;
      }
      doc.text(`• ${item.requirement}`, 30, yPos);
    });
    
    yPos += 20;
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.text("Unmatched Requirements:", 20, yPos);
    rfpData.eligibility.mismatches.forEach((item) => {
      yPos += 10;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`• ${item.requirement}`, 30, yPos);
    });
    
    // Add Checklist
    yPos += 20;
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text("SUBMISSION CHECKLIST", 20, yPos);
    doc.setFont("helvetica", "normal");
    
    rfpData.checklist.forEach((item) => {
      yPos += 10;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`• ${item.item}: ${item.status.toUpperCase()}`, 30, yPos);
    });
    
    // Add Risk Analysis
    yPos += 20;
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFont("helvetica", "bold");
    doc.text("RISK ANALYSIS", 20, yPos);
    doc.setFont("helvetica", "normal");
    
    rfpData.risks.forEach((item) => {
      yPos += 15;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`• ${item.clause} (${item.risk} Risk)`, 30, yPos);
      yPos += 10;
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`  Suggestion: ${item.suggestion}`, 30, yPos);
    });

    // Save the PDF
    const fileName = `${rfpData.name.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").toLowerCase()}-report.pdf`;
    doc.save(fileName);
  }

  if (loading) {
    return <div className="container mx-auto py-6">Loading...</div>
  }

  if (error || !rfpData) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
              <p>Error: {error || 'Failed to load RFP data'}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShowRfpDialog}>
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
      <Dialog open={showRfpDialog} onOpenChange={setShowRfpDialog}>
        <DialogContent className="max-w-4xl h-[90vh] p-4">
          <DialogHeader className="pb-2">
            <DialogTitle>Original RFP Document</DialogTitle>
            <DialogDescription className="text-sm">
              Preview of the uploaded RFP file.
            </DialogDescription>
          </DialogHeader>
          
          {pdfError ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
              <p className="text-lg font-medium mb-2">PDF Viewer Error</p>
              <p className="text-sm text-muted-foreground mb-6">{pdfError}</p>
              <Button 
                variant="outline" 
                onClick={() => handleShowRfpDialog()}
              >
                Try Again
              </Button>
            </div>
          ) : rfpData.pdfFileName ? (
            <div className="flex-1 h-[calc(90vh-80px)]">
              <iframe
                src={`/api/pdf/${rfpData.pdfFileName}`}
                title="RFP PDF Preview"
                className="w-full h-full border rounded"
                onError={() => setPdfError("Failed to load PDF file")}
              />
            </div>
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
  )
}
