import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dataDir = path.join(process.cwd(), 'data', 'rfps')
    const filePath = path.join(dataDir, `${params.id}.json`)
    
    try {
      const fileContent = await readFile(filePath, 'utf-8')
      const rfpData = JSON.parse(fileContent)
      return NextResponse.json(rfpData)
    } catch (error) {
      console.error('File read error:', error)
      return NextResponse.json(
        { error: 'RFP not found' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Failed to fetch RFP:', error)
    return NextResponse.json(
      { error: 'Failed to fetch RFP data' },
      { status: 500 }
    )
  }
}

