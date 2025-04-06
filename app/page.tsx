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
        const data = await response.json()
        // Ensure data is an array before setting it
        setRfps(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch RFPs:', error)
        setRfps([]) // Set to empty array on error
      }
      setLoading(false)
    }

    fetchRFPs()
  }, [])

  // Calculate statistics with null checks
  const totalRfps = Array.isArray(rfps) ? rfps.length : 0
  const eligibleRfps = Array.isArray(rfps) ? rfps.filter(rfp => rfp?.status === "Eligible").length : 0
  const notEligibleRfps = Array.isArray(rfps) ? rfps.filter(rfp => rfp?.status === "Not Eligible").length : 0

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

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RFPs</CardTitle>
            <FileUpload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRfps}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligible</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eligibleRfps}</div>
            <p className="text-xs text-muted-foreground">
              {totalRfps > 0 ? `${Math.round((eligibleRfps / totalRfps) * 100)}% success rate` : '0% success rate'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Eligible</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notEligibleRfps}</div>
            <p className="text-xs text-muted-foreground">
              {totalRfps > 0 ? `${Math.round((notEligibleRfps / totalRfps) * 100)}% rejection rate` : '0% rejection rate'}
            </p>
          </CardContent>
        </Card>
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
                <TableRow>
                  <TableHead>RFP Name</TableHead>
                  <TableHead>Company Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Uploaded</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfps.map((rfp) => (
                  <TableRow key={rfp.id}>
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







