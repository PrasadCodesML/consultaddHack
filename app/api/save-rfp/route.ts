import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Ensure required fields are present
    if (!data.id || !data.name || !data.company) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create both directories if they don't exist
    const dataDir = path.join(process.cwd(), 'data', 'rfps')
    const pdfDir = path.join(process.cwd(), 'data', 'pdfs')
    
    await mkdir(dataDir, { recursive: true })
    await mkdir(pdfDir, { recursive: true })

    // Save RFP data
    const filePath = path.join(dataDir, `${data.id}.json`)
    await writeFile(
      filePath,
      JSON.stringify({
        id: data.id,
        name: data.name,
        company: data.company,
        status: data.status || "Pending",
        date: data.date || new Date().toISOString(),
        pdfFileName: `rfp_${data.id}.pdf`,
        eligibility: {
          matches: data.analysis?.matches || [],
          mismatches: data.analysis?.mismatches || []
        },
        checklist: data.analysis?.checklist || [],
        risks: data.analysis?.risks || [],
      }, null, 2)
    )

    return NextResponse.json({ 
      success: true, 
      id: data.id 
    })
  } catch (error) {
    console.error('Save error:', error)
    return NextResponse.json(
      { error: 'Failed to save RFP data' },
      { status: 500 }
    )
  }
}
