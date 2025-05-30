"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  UploadIcon as FileUpload,
  BarChart3,
  PieChart,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useEffect, useState } from 'react'

interface RFP {
  id: string
  rfpName: string
  companyName: string
  status: "Eligible" | "Not Eligible"
  uploadDate: string
}

export default function Dashboard() {
  const [rfps, setRfps] = useState<RFP[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRFPs = async () => {
      try {
        const response = await fetch('/api/rfps')
        if (!response.ok) {
          throw new Error('Failed to fetch RFPs')
        }
        const data = await response.json()
        
        const formattedData = Array.isArray(data) ? data.map((rfp, index) => ({
          id: rfp.id || `rfp-${index}`, // Fallback ID if none exists
          rfpName: rfp.name || rfp.rfpName || 'Untitled RFP',
          companyName: rfp.company || rfp.companyName || 'Unknown Company',
          status: rfp.status || 'Not Eligible',
          uploadDate: rfp.date || rfp.uploadDate || new Date().toISOString()
        })) : []
        
        setRfps(formattedData)
      } catch (error) {
        console.error('Failed to fetch RFPs:', error)
        setRfps([])
      }
      setLoading(false)
    }

    fetchRFPs()
  }, [])

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage and analyze your RFP submissions</p>
        </div>
        <Link href="/upload">
          <Button size="lg">
            <FileUpload className="mr-2 h-4 w-4" />
            Upload RFP
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent RFP Submissions</CardTitle>
          <CardDescription>View and manage your recently uploaded RFP documents</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : rfps.length === 0 ? (
            <div className="text-center py-4">No RFPs found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow key="header">
                  <TableHead>RFP Name</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Uploaded</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfps.map((rfp, index) => (
                  <TableRow key={`${rfp.id}-${index}`}>
                    <TableCell className="font-medium">{rfp.rfpName}</TableCell>
                    <TableCell>{rfp.companyName}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          rfp.status === "Eligible"
                            ? "success"
                            : rfp.status === "Not Eligible"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {rfp.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{rfp.uploadDate}</TableCell>
                    <TableCell>
                      <Link href={`/rfp/${rfp.id}`}>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


