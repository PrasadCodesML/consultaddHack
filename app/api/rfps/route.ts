import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET() {
  try {
    // Read from your storage (this is just an example - adjust based on your storage solution)
    const dataDir = path.join(process.cwd(), 'data', 'rfps')
    const files = await fs.readdir(dataDir)
    
    const rfps = await Promise.all(
      files.map(async (file) => {
        const content = await fs.readFile(path.join(dataDir, file), 'utf-8')
        return JSON.parse(content)
      })
    )
    
    return NextResponse.json(rfps)
  } catch (error) {
    console.error('Failed to fetch RFPs:', error)
    return NextResponse.json({ error: 'Failed to fetch RFPs' }, { status: 500 })
  }
}