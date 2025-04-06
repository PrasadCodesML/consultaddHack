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
    if (!rfpFile || isUploading) return

    setIsUploading(true)
    
    try {
      // Generate unique ID for the RFP
      const rfpId = crypto.randomUUID()
      
      setProgress(10)
      
      // First, save the PDF file
      const pdfFormData = new FormData()
      pdfFormData.append('file', rfpFile)
      pdfFormData.append('rfpId', rfpId)
      
      const pdfResponse = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: pdfFormData,
      })

      if (!pdfResponse.ok) {
        throw new Error('Failed to upload PDF')
      }

      setProgress(30)

      // Now send to analysis API
      const analysisFormData = new FormData()
      analysisFormData.append('file', rfpFile)
      analysisFormData.append('rfpId', rfpId)
      analysisFormData.append('rfpName', formRef.current?.['rfp-name'].value)
      analysisFormData.append('companyName', formRef.current?.['company-name'].value)

      setProgress(40)

      const analysisResponse = await fetch('https://Prasad8379-gradio-parase.hf.space/analyze-rfp/', {
        method: 'POST',
        body: analysisFormData,
      })

      if (!analysisResponse.ok) {
        throw new Error('Analysis failed')
      }

      const analysisResult = await analysisResponse.json()

      setProgress(70)

      // Save complete RFP data
      const saveResponse = await fetch('/api/save-rfp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: rfpId,
          name: formRef.current?.['rfp-name'].value,
          company: formRef.current?.['company-name'].value,
          status: "Pending",
          date: new Date().toISOString(),
          pdfFileName: `rfp_${rfpId}.pdf`,
          analysis: analysisResult,
        }),
      })

      if (!saveResponse.ok) {
        throw new Error('Failed to save RFP data')
      }

      setProgress(100)
      
      // Wait a brief moment to show 100% progress
      await new Promise(resolve => setTimeout(resolve, 500))
      
      router.push(`/rfp/${rfpId}`)
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Error",
        description: "Failed to upload and analyze RFP",
        variant: "destructive",
      })
      setIsUploading(false)
      setProgress(0)
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






