"use client"
import { use } from "react"
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

export default function RFPDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params) // Unwrap the params Promise
  const [activeTab, setActiveTab] = useState("eligibility")
  const [showRfpDialog, setShowRfpDialog] = useState(false)

  // Sample data for demonstration
  const rfpData = {
    id: resolvedParams.id, // Use the unwrapped params
    name: "City Infrastructure Project",
    company: "BuildTech Solutions",
    status: "Eligible",
    date: "2025-04-01",
    eligibility: {
      matches: [
        { requirement: "ISO 9001 Certification", status: "match" },
        { requirement: "Minimum 5 years experience", status: "match" },
        { requirement: "Previous government contracts", status: "match" },
        { requirement: "Liability insurance ($2M)", status: "match" },
      ],
      mismatches: [{ requirement: "Local office presence", status: "mismatch" }],
    },
    checklist: [
      { item: "Technical proposal", required: true, status: "complete" },
      { item: "Financial proposal", required: true, status: "complete" },
      { item: "Company profile", required: true, status: "complete" },
      { item: "References", required: true, status: "incomplete" },
      { item: "Project timeline", required: true, status: "complete" },
      { item: "Risk assessment", required: false, status: "incomplete" },
    ],
    risks: [
      {
        clause: "Section 3.4: Contractor shall be responsible for all unforeseen conditions",
        risk: "High",
        suggestion: "Request modification to limit liability to reasonable unforeseen conditions",
      },
      {
        clause: "Section 5.2: Client may terminate contract at any time with 7 days notice",
        risk: "Medium",
        suggestion: "Negotiate for longer notice period and/or partial compensation",
      },
      {
        clause: "Section 8.1: All intellectual property created during project belongs to client",
        risk: "Low",
        suggestion: "Acceptable standard clause, no action needed",
      },
    ],
  }

  // Function to generate and download PDF report
  const handleExportReport = () => {
    // In a real application, you would use a library like jsPDF or react-pdf
    // For this demo, we'll simulate a PDF download

    // Create a text representation of the report
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

    // Create a Blob with the text content
    const blob = new Blob([reportContent], { type: "text/plain" })

    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${rfpData.name.replace(/\s+/g, "-").toLowerCase()}-report.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    // In a real application, you would generate a proper PDF here
    alert(
      "In a real application, this would download a properly formatted PDF report with all flags and analysis data.",
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
            <span className="text-sm text-muted-foreground">
              Uploaded on {new Date(rfpData.date).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" onClick={() => setShowRfpDialog(true)}>
            <FileText className="mr-2 h-4 w-4" />
            View Original RFP
          </Button>
        </div>
      </div>

      <Tabs defaultValue="eligibility" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="eligibility">Bid Eligibility</TabsTrigger>
          <TabsTrigger value="checklist">Submission Checklist</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="eligibility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Matching</CardTitle>
              <CardDescription>Comparison between RFP requirements and company qualifications</CardDescription>
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
                        We've identified 1 high-risk clause and 1 medium-risk clause that may require negotiation.
                        Consider addressing these before submitting your proposal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Original RFP Document Dialog */}
      <Dialog open={showRfpDialog} onOpenChange={setShowRfpDialog}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Original RFP Document</DialogTitle>
            <DialogDescription>{rfpData.name} - Issued by City of Metropolis</DialogDescription>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>

          <div className="flex-1 overflow-auto border rounded-md p-6 bg-white">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold mb-2">REQUEST FOR PROPOSAL</h1>
                <h2 className="text-xl font-semibold mb-1">City Infrastructure Project</h2>
                <p className="text-sm text-muted-foreground">RFP #: CITY-2025-003</p>
                <p className="text-sm text-muted-foreground">Issue Date: March 15, 2025</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">1. INTRODUCTION</h3>
                <p>
                  The City of Metropolis ("City") is seeking proposals from qualified contractors to provide
                  infrastructure improvement services for the downtown area. This project includes road resurfacing,
                  sidewalk repairs, and utility upgrades.
                </p>

                <h3 className="text-lg font-semibold">2. SCOPE OF WORK</h3>
                <p>The selected contractor will be responsible for the following:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Resurfacing approximately 3.5 miles of city streets</li>
                  <li>Repairing and replacing damaged sidewalks</li>
                  <li>Upgrading water and sewer lines</li>
                  <li>Installing new street lighting</li>
                  <li>Implementing traffic control measures during construction</li>
                </ul>

                <h3 className="text-lg font-semibold">3. QUALIFICATIONS</h3>
                <p>Bidders must meet the following minimum qualifications:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>ISO 9001 Certification</li>
                  <li>Minimum 5 years experience in municipal infrastructure projects</li>
                  <li>Previous government contracts of similar scope and size</li>
                  <li>Liability insurance ($2M minimum coverage)</li>
                  <li>Local office presence within city limits</li>
                </ul>

                <h3 className="text-lg font-semibold">4. SUBMISSION REQUIREMENTS</h3>
                <p>All proposals must include:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Technical proposal</li>
                  <li>Financial proposal</li>
                  <li>Company profile</li>
                  <li>References from similar projects</li>
                  <li>Project timeline</li>
                  <li>Risk assessment (optional)</li>
                </ul>

                <h3 className="text-lg font-semibold">5. TERMS AND CONDITIONS</h3>
                <p>
                  <strong>Section 3.4:</strong> Contractor shall be responsible for all unforeseen conditions
                  encountered during the project execution.
                </p>
                <p>
                  <strong>Section 5.2:</strong> Client may terminate contract at any time with 7 days notice.
                </p>
                <p>
                  <strong>Section 8.1:</strong> All intellectual property created during project belongs to client.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


