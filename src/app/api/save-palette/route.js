import fs from 'fs'
import path from 'path'

const PALETTES_FILE = path.join(process.cwd(), 'data', 'palettes.json')

// Ensure the data directory exists
if (!fs.existsSync(path.dirname(PALETTES_FILE))) {
  fs.mkdirSync(path.dirname(PALETTES_FILE), { recursive: true })
}

// Initialize the file if it doesn't exist
if (!fs.existsSync(PALETTES_FILE)) {
  fs.writeFileSync(PALETTES_FILE, JSON.stringify({ palettes: [] }))
}

export async function POST(request) {
  try {
    const { colors, name } = await request.json()
    
    if (!colors || !Array.isArray(colors)) {
      return Response.json({ 
        success: false, 
        error: 'Invalid colors data' 
      }, { status: 400 })
    }

    let data
    try {
      const fileContent = fs.readFileSync(PALETTES_FILE, 'utf8')
      data = JSON.parse(fileContent)
    } catch (error) {
      console.error('Error reading palettes file:', error)
      data = { palettes: [] }
    }
    
    const newPalette = {
      id: Date.now().toString(),
      name: name || `Palette ${data.palettes.length + 1}`,
      colors,
      createdAt: new Date().toISOString(),
      tags: []
    }
    
    data.palettes.push(newPalette)
    fs.writeFileSync(PALETTES_FILE, JSON.stringify(data, null, 2))
    
    return Response.json({ success: true, palette: newPalette })
  } catch (error) {
    console.error('Error saving palette:', error)
    return Response.json({ 
      success: false, 
      error: 'Failed to save palette' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    if (!fs.existsSync(PALETTES_FILE)) {
      return Response.json({ palettes: [] })
    }

    const fileContent = fs.readFileSync(PALETTES_FILE, 'utf8')
    if (!fileContent) {
      return Response.json({ palettes: [] })
    }

    const data = JSON.parse(fileContent)
    return Response.json(data)
  } catch (error) {
    console.error('Error reading palettes:', error)
    return Response.json({ palettes: [] })
  }
}

export async function PUT(request) {
  try {
    const { id, name, tags } = await request.json()
    
    if (!id) {
      return Response.json({ 
        success: false, 
        error: 'Palette ID is required' 
      }, { status: 400 })
    }

    let data
    try {
      const fileContent = fs.readFileSync(PALETTES_FILE, 'utf8')
      data = JSON.parse(fileContent)
    } catch (error) {
      console.error('Error reading palettes file:', error)
      return Response.json({ 
        success: false, 
        error: 'Failed to read palettes' 
      }, { status: 500 })
    }

    const paletteIndex = data.palettes.findIndex(p => p.id === id)
    if (paletteIndex === -1) {
      return Response.json({ 
        success: false, 
        error: 'Palette not found' 
      }, { status: 404 })
    }

    if (name !== undefined) {
      data.palettes[paletteIndex].name = name
    }
    
    if (tags !== undefined) {
      data.palettes[paletteIndex].tags = tags
    }

    fs.writeFileSync(PALETTES_FILE, JSON.stringify(data, null, 2))
    return Response.json({ 
      success: true, 
      palette: data.palettes[paletteIndex] 
    })
  } catch (error) {
    console.error('Error updating palette:', error)
    return Response.json({ 
      success: false, 
      error: 'Failed to update palette' 
    }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return Response.json({ 
        success: false, 
        error: 'Palette ID is required' 
      }, { status: 400 })
    }

    let data
    try {
      const fileContent = fs.readFileSync(PALETTES_FILE, 'utf8')
      data = JSON.parse(fileContent)
    } catch (error) {
      console.error('Error reading palettes file:', error)
      return Response.json({ 
        success: false, 
        error: 'Failed to read palettes' 
      }, { status: 500 })
    }

    const initialLength = data.palettes.length
    data.palettes = data.palettes.filter(p => p.id !== id)
    
    if (data.palettes.length === initialLength) {
      return Response.json({ 
        success: false, 
        error: 'Palette not found' 
      }, { status: 404 })
    }

    fs.writeFileSync(PALETTES_FILE, JSON.stringify(data, null, 2))
    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting palette:', error)
    return Response.json({ 
      success: false, 
      error: 'Failed to delete palette' 
    }, { status: 500 })
  }
} 