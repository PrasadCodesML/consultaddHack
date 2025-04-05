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

export default function Dashboard() {
  // Sample data for demonstration
  const rfps = [
    {
      id: "1",
      name: "City Infrastructure Project",
      company: "BuildTech Solutions",
      status: "Eligible",
      date: "2025-04-01",
    },
    {
      id: "2",
      name: "Healthcare System Upgrade",
      company: "MediTech Innovations",
      status: "Not Eligible",
      date: "2025-03-28",
    },
    {
      id: "3",
      name: "Public School Renovation",
      company: "EduBuild Construction",
      status: "Pending",
      date: "2025-04-05",
    },
    {
      id: "4",
      name: "Municipal Water Treatment",
      company: "AquaPure Systems",
      status: "Eligible",
      date: "2025-03-25",
    },
    {
      id: "5",
      name: "Transportation Network Expansion",
      company: "MobilityWorks Inc.",
      status: "Pending",
      date: "2025-04-03",
    },
  ]

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
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligible</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">58% success rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Eligible</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">42% rejection rate</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent RFP Submissions</CardTitle>
          <CardDescription>View and manage your recently uploaded RFP documents</CardDescription>
        </CardHeader>
        <CardContent>
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
                  <TableCell className="font-medium">{rfp.name}</TableCell>
                  <TableCell>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="link" className="p-0 h-auto font-normal">
                          {rfp.company} <ChevronDown className="h-3 w-3 ml-1" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0">
                        <div className="p-4 border-b">
                          <h4 className="font-semibold">Company Data</h4>
                          <p className="text-sm text-muted-foreground">Key information and flags</p>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="font-medium">Company Legal Name</div>
                            <div>{rfp.company}</div>

                            <div className="font-medium">Years of Experience</div>
                            <div>7 years</div>

                            <div className="font-medium">Business Structure</div>
                            <div>Limited Liability Company (LLC)</div>

                            <div className="font-medium">State of Incorporation</div>
                            <div>Delaware</div>

                            <div className="font-medium">DUNS Number</div>
                            <div>07-842-1490</div>
                          </div>

                          <div className="space-y-2">
                            <h5 className="font-medium text-sm">Flags</h5>

                            <div className="flex items-center gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/20">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                              <span className="text-sm">Bank Letter of Creditworthiness not available</span>
                            </div>

                            <div className="flex items-center gap-2 p-2 rounded-md bg-red-50 dark:bg-red-950/20">
                              <XCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm">No MBE Certification</span>
                            </div>

                            <div className="flex items-center gap-2 p-2 rounded-md bg-green-50 dark:bg-green-950/20">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">Certificate of Insurance verified</span>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
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
                  <TableCell>{new Date(rfp.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Link href={`/rfp/${rfp.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

