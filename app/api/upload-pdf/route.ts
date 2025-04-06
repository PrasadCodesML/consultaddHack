import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const rfpId = formData.get('rfpId') as string
    
    if (!file || !rfpId) {
      return NextResponse.json(
        { error: 'No file or RFP ID received' },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const pdfDir = join(process.cwd(), 'data', 'pdfs')
    
    // Create pdfs directory if it doesn't exist
    try {
      await mkdir(pdfDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Use the specified filename from the upload form
    const filename = `rfp_${rfpId}.pdf`
    await writeFile(join(pdfDir, filename), buffer)

    return NextResponse.json({ success: true, filename })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
