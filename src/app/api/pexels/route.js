import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const colors = searchParams.get('colors')
  
  console.log('Pexels API route called with colors:', colors)
  
  if (!colors) {
    console.error('No colors parameter provided')
    return NextResponse.json({ error: 'Colors parameter is required' }, { status: 400 })
  }

  if (!process.env.PEXELS_API_KEY) {
    console.error('PEXELS_API_KEY is not set in environment variables')
    return NextResponse.json({ error: 'Pexels API key is not configured' }, { status: 500 })
  }

  try {
    // Get the most prominent color from the palette
    const colorArray = colors.split(',')
    const mainColor = colorArray[0].replace('#', '')
    
    console.log('Fetching from Pexels with color:', mainColor)
    
    const pexelsUrl = `https://api.pexels.com/v1/search?query=color&color=${mainColor}&per_page=6`
    console.log('Pexels API URL:', pexelsUrl)
    
    const response = await fetch(pexelsUrl, {
      headers: {
        'Authorization': process.env.PEXELS_API_KEY
      }
    })

    console.log('Pexels API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Pexels API error response:', errorText)
      throw new Error(`Failed to fetch from Pexels API: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log('Pexels API success response:', {
      total_results: data.total_results,
      photos_count: data.photos?.length
    })
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Pexels API error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch images',
      details: error.message 
    }, { status: 500 })
  }
} 