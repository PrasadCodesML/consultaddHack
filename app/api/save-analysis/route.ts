import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const tempDir = join(process.cwd(), 'temp')
    
    // Create temp directory if it doesn't exist
    try {
      await mkdir(tempDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    const filename = `analysis-${Date.now()}.json`
    await writeFile(
      join(tempDir, filename),
      JSON.stringify(data, null, 2)
    )

    return NextResponse.json({ success: true, filename })
  } catch (error) {
    console.error('Save analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to save analysis' },
      { status: 500 }
    )
  }
}