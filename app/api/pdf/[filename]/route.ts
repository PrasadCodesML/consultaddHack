import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'pdfs', params.filename)
    const file = await fs.readFile(filePath)
    
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${params.filename}"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'PDF not found' },
      { status: 404 }
    )
  }
}