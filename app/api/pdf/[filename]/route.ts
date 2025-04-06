import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    // Ensure the filename is safe
    const sanitizedFilename = path.basename(params.filename)
    
    // Create the full path to the PDF file
    const pdfDir = path.join(process.cwd(), 'data', 'pdfs')
    const filePath = path.join(pdfDir, sanitizedFilename)

    // Ensure the directory exists
    try {
      await fs.access(pdfDir)
    } catch {
      await fs.mkdir(pdfDir, { recursive: true })
    }

    // Check if file exists before trying to read it
    try {
      await fs.access(filePath)
    } catch {
      return NextResponse.json(
        { error: 'PDF not found' },
        { status: 404 }
      )
    }

    // Read and return the file
    const file = await fs.readFile(filePath)
    
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${sanitizedFilename}"`,
        // Add cache headers
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error serving PDF:', error)
    return NextResponse.json(
      { error: 'Failed to serve PDF' },
      { status: 500 }
    )
  }
}
