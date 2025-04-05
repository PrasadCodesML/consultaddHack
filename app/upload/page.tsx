"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadIcon as FileUpload, Upload } from "lucide-react"

export default function UploadPage() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)

    // Simulate upload and processing
    setTimeout(() => {
      setIsUploading(false)
      // Redirect to a new RFP detail page
      router.push("/rfp/6")
    }, 2000)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Upload RFP</h1>

        <Card>
          <CardHeader>
            <CardTitle>RFP Information</CardTitle>
            <CardDescription>Upload your RFP document and company data for analysis</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="rfp-name">RFP Name</Label>
                <Input id="rfp-name" placeholder="Enter RFP name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" placeholder="Enter company name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rfp-document">RFP Document</Label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2">
                  <FileUpload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your RFP document here or click to browse
                  </p>
                  <Input id="rfp-document" type="file" className="hidden" accept=".pdf,.doc,.docx" required />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("rfp-document")?.click()}
                  >
                    Select File
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-document">Company Data Document</Label>
                <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2">
                  <FileUpload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your company data document here or click to browse
                  </p>
                  <Input id="company-document" type="file" className="hidden" accept=".pdf,.doc,.docx" required />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("company-document")?.click()}
                  >
                    Select File
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing RFP...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Analyze RFP
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}

