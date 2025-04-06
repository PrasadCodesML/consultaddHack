import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const rfpFile = formData.get('rfpFile') as File
    const companyFile = formData.get('companyFile') as File
    const rfpId = formData.get('rfpId') as string

    if (!rfpFile || !companyFile || !rfpId) {
      return NextResponse.json(
        { error: 'Missing required files or RFP ID' },
        { status: 400 }
      )
    }

    const pdfDir = join(process.cwd(), 'data', 'pdfs')
    await mkdir(pdfDir, { recursive: true })

    // Save RFP file
    const rfpBuffer = Buffer.from(await rfpFile.arrayBuffer())
    const rfpFilename = `rfp_${rfpId}.pdf`
    await writeFile(join(pdfDir, rfpFilename), rfpBuffer)

    // Save company file
    const companyBuffer = Buffer.from(await companyFile.arrayBuffer())
    const companyFilename = `company_${rfpId}.pdf`
    await writeFile(join(pdfDir, companyFilename), companyBuffer)

    console.log('Files saved:', {
      rfpFilename,
      companyFilename,
      rfpId
    })

    return NextResponse.json({
      success: true,
      rfpFilename,
      companyFilename
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload files' },
      { status: 500 }
    )
  }
}


