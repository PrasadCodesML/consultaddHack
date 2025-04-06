import { NextResponse } from 'next/server'
import { writeFile, mkdir, readFile } from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // Ensure required fields are present
    if (!data.id) {
      return NextResponse.json(
        { error: 'Missing RFP ID' },
        { status: 400 }
      )
    }

    // Create directories if they don't exist
    const dataDir = path.join(process.cwd(), 'data', 'rfps')
    await mkdir(dataDir, { recursive: true })

    // Get existing data if any
    let existingData = {}
    const filePath = path.join(dataDir, `${data.id}.json`)
    try {
      const fileContent = await readFile(filePath, 'utf-8')
      existingData = JSON.parse(fileContent)
    } catch (e) {
      // File doesn't exist yet, that's ok
    }

    // Merge new data with existing data
    const rfpData = {
      ...existingData,
      ...data,
      pdfFileName: data.pdfFileName || existingData.pdfFileName,
      companyFileName: data.companyFileName || existingData.companyFileName,
      status: data.status || existingData.status || "Pending",
      date: data.date || existingData.date || new Date().toISOString(),
      eligibility: {
        matches: data.eligibility?.matches || existingData.eligibility?.matches || [],
        mismatches: data.eligibility?.mismatches || existingData.eligibility?.mismatches || []
      },
      checklist: data.checklist || existingData.checklist || [],
      risks: data.risks || existingData.risks || []
    }

    // Save merged data
    await writeFile(
      filePath,
      JSON.stringify(rfpData, null, 2)
    )

    return NextResponse.json(rfpData)
  } catch (error) {
    console.error('Failed to save RFP:', error)
    return NextResponse.json(
      { error: 'Failed to save RFP data' },
      { status: 500 }
    )
  }
}


