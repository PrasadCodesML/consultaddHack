import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: Request) {
  try {
    const { rfpId } = await request.json()
    console.log('Starting compliance check for:', rfpId)

    // Get RFP data first
    const rfpDataPath = join(process.cwd(), 'data', 'rfps', `${rfpId}.json`)
    const rfpData = JSON.parse(await readFile(rfpDataPath, 'utf-8'))

    const pdfDir = join(process.cwd(), 'data', 'pdfs')
    const rfpPath = join(pdfDir, rfpData.pdfFileName)
    const companyPath = join(pdfDir, rfpData.companyFileName)

    console.log('Checking files:', {
      rfpPath,
      companyPath,
      rfpExists: existsSync(rfpPath),
      companyExists: existsSync(companyPath)
    })

    if (!existsSync(rfpPath) || !existsSync(companyPath)) {
      throw new Error('Required PDF files not found')
    }

    // Read both files
    const rfpPdf = await readFile(rfpPath)
    const companyPdf = await readFile(companyPath)

    // Create form data for local endpoint
    const formData = new FormData()
    formData.append('company_pdf', new Blob([companyPdf], { type: 'application/pdf' }), 'company_data.pdf')
    formData.append('rfp_pdf', new Blob([rfpPdf], { type: 'application/pdf' }), 'rfp.pdf')

    const response = await fetch('http://127.0.0.1:7860/', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Compliance check failed')
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('Compliance check error:', error)
    return NextResponse.json(
      { error: error.message || 'Compliance check failed' },
      { status: 500 }
    )
  }
}

