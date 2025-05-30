"use client"

import type React from "react"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadIcon as FileUpload, Upload } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"

export default function UploadPage() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [rfpFile, setRfpFile] = useState<File | null>(null)
  const [companyFile, setCompanyFile] = useState<File | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'rfp' | 'company') => {
    if (e.target.files && e.target.files[0]) {
      if (type === 'rfp') {
        setRfpFile(e.target.files[0])
      } else {
        setCompanyFile(e.target.files[0])
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!rfpFile || !companyFile) {
      toast({
        title: "Error",
        description: "Please select both RFP and company files",
        variant: "destructive",
      })
      return
    }

    try {
      const rfpId = crypto.randomUUID()
      setProgress(10)
      setIsUploading(true)
      
      // Upload files first
      const formData = new FormData()
      formData.append('rfpFile', rfpFile)
      formData.append('companyFile', companyFile)
      formData.append('rfpId', rfpId)
      
      const uploadResponse = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload files')
      }

      const uploadResult = await uploadResponse.json()
      console.log('Upload result:', uploadResult)

      setProgress(30)

      // Save initial RFP data with file names
      const initialData = {
        id: rfpId,
        name: formRef.current?.['rfp-name'].value || 'Untitled RFP',
        company: formRef.current?.['company-name'].value || 'Unknown Company',
        status: "Analyzing",
        date: new Date().toISOString(),
        pdfFileName: uploadResult.rfpFilename,
        companyFileName: uploadResult.companyFilename,
        eligibility: {
          matches: [],
          mismatches: [],
        },
        checklist: [],
        risks: []
      }

      const saveResponse = await fetch('/api/save-rfp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(initialData),
      })

      if (!saveResponse.ok) {
        throw new Error('Failed to save initial RFP data')
      }

      setProgress(50)

      // Start Hugging Face analysis in the background
      const analyzeInBackground = async () => {
        try {
          const huggingFaceFormData = new FormData()
          huggingFaceFormData.append('file', rfpFile)
          
          const huggingFaceResponse = await fetch('https://prasad8379-gradio-parase.hf.space/analyze-rfp/', {
            method: 'POST',
            body: huggingFaceFormData,
          })

          if (!huggingFaceResponse.ok) {
            const errorData = await huggingFaceResponse.json()
            throw new Error(`Hugging Face analysis failed: ${JSON.stringify(errorData)}`)
          }

          const huggingFaceResult = await huggingFaceResponse.json()
          
          // Save the Hugging Face analysis result
          await fetch('/api/save-analysis', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              rfpId,
              analysis: huggingFaceResult,
              timestamp: new Date().toISOString()
            }),
          })

          // Update RFP with analysis results
          await fetch('/api/save-rfp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: rfpId,
              status: "Complete",
              pdfFileName: uploadResult.rfpFilename,
              companyFileName: uploadResult.companyFilename,
              aiAnalysis: huggingFaceResult,
              checklist: formatChecklistFromAnalysis(huggingFaceResult),
              eligibility: formatEligibilityFromAnalysis(huggingFaceResult)
            }),
          })

        } catch (error) {
          console.error('Background analysis failed:', error)
          // Update RFP status to indicate failure
          await fetch('/api/save-rfp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id: rfpId,
              status: "Analysis Failed",
            }),
          })
        }
      }

      // Start background analysis without waiting for it
      analyzeInBackground()

      // Navigate to RFP page immediately after initial save
      setProgress(100)
      router.push(`/rfp/${rfpId}`)

    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to upload and process files",
        variant: "destructive",
      })
      setIsUploading(false)
    }
  }

  // Helper functions to format the analysis data
  const formatChecklistFromAnalysis = (analysis: any) => {
    // Convert the analysis into a hierarchical checklist format
    return Object.entries(analysis).map(([category, items]: [string, any]) => ({
      category,
      items: Array.isArray(items) ? items.map(item => ({
        item: item.requirement || item.toString(),
        status: item.status || 'pending',
        required: item.required || false
      })) : []
    }))
  }

  const formatEligibilityFromAnalysis = (analysis: any) => {
    // Extract eligibility criteria from the analysis
    return {
      matches: analysis.matches || [],
      mismatches: analysis.mismatches || []
    }
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
          <form ref={formRef} onSubmit={handleSubmit}>
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
                <div className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 ${rfpFile ? 'border-green-500' : ''}`}>
                  <FileUpload className={`h-8 w-8 ${rfpFile ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <p className="text-sm text-muted-foreground">
                    {rfpFile ? rfpFile.name : 'Drag and drop your RFP document here or click to browse'}
                  </p>
                  <Input 
                    id="rfp-document" 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx" 
                    required
                    onChange={(e) => handleFileChange(e, 'rfp')}
                  />
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
                <Label htmlFor="company-document">Company Data Document (Optional)</Label>
                <div className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 ${companyFile ? 'border-green-500' : ''}`}>
                  <FileUpload className={`h-8 w-8 ${companyFile ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <p className="text-sm text-muted-foreground">
                    {companyFile ? companyFile.name : 'Drag and drop your company data document here or click to browse'}
                  </p>
                  <Input 
                    id="company-document" 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, 'company')}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("company-document")?.click()}
                  >
                    Select File
                  </Button>
                </div>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-center text-muted-foreground">
                    {progress < 30 && "Uploading files..."}
                    {progress >= 30 && progress < 70 && "Analyzing RFP..."}
                    {progress >= 70 && progress < 100 && "Saving results..."}
                    {progress === 100 && "Complete!"}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
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





















