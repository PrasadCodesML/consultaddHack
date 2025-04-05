"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, PieChart } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Insights and statistics about your RFP submissions
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RFPs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eligible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Eligible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">58%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Eligibility Status</CardTitle>
                <CardDescription>
                  Distribution of RFP eligibility outcomes
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-80 w-80 flex items-center justify-center">
                  <div className="relative h-full w-full">
                    <PieChart className="h-full w-full text-muted-foreground/50" />
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-sm text-muted-foreground">Eligibility Chart</span>
                      <span className="text-xs text-muted-foreground">(Visualization)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Disqualifiers</CardTitle>
                <CardDescription>
                  Most frequent reasons for ineligibility
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="h-80 w-full flex items-center justify-center">
                  <div className="relative h-full w-full">
                    <BarChart className="h-full w-full text-muted-foreground/50" />
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-sm text-muted-foreground">Disqualifiers Chart</span>
                      <span className="text-xs text-muted-foreground">(Visualization)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>RFP Submissions Over Time</CardTitle>
              <CardDescription>
                Number of RFPs submitted by month
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="h-80 w-full flex items-center justify-center">
                <div className="relative h-full w-full">
                  <BarChart className="h-full w-full text-muted-foreground/50" />
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-sm text-muted-foreground">Timeline Chart</span>
                    <span className="text-xs text-muted-foreground">(Visualization)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Trends</CardTitle>
              <CardDescription>
                Changes in eligibility rates over time
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="h-80 w-full flex items-center justify-center">
                <div className="relative h-full w-full">
                  <BarChart className="h-full w-full text-muted-foreground/50" />
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-sm text-muted-foreground">Trends Chart</span>
                    <span className="text-xs text-muted-foreground">(Visualization)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
              <CardDescription>
                Common risk factors identified in RFPs
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="h-80 w-full flex items-center justify-center">
                <div className="relative h-full w-full">
                  <BarChart className="h-full w-full text-muted-foreground/50" />
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-sm text-muted-foreground">Risk Analysis Chart</span>
                    <span className="text-xs text-muted-foreground">(Visualization)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

