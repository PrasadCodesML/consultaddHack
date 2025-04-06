import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const analysisDir = join(process.cwd(), 'data', 'analysis')
    
    // Create analysis directory if it doesn't exist
    await mkdir(analysisDir, { recursive: true })

    const filename = `analysis_${data.rfpId}_${Date.now()}.json`
    await writeFile(
      join(analysisDir, filename),
      JSON.stringify({
        rfpId: data.rfpId,
        analysis: data.analysis,
        timestamp: data.timestamp,
        checklist: data.analysis.checklist || [],
        eligibility: data.analysis.eligibility || { matches: [], mismatches: [] }
      }, null, 2)
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
