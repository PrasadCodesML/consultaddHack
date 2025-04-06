import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dataDir = path.join(process.cwd(), 'data', 'rfps')
    const filePath = path.join(dataDir, `${params.id}.json`)
    
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const rfpData = JSON.parse(fileContent)
    
    return NextResponse.json(rfpData)
  } catch (error) {
    console.error('Failed to fetch RFP:', error)
    return NextResponse.json(
      { error: 'RFP not found' },
      { status: 404 }
    )
  }
}