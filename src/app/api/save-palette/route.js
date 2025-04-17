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
    const data = JSON.parse(fs.readFileSync(PALETTES_FILE, 'utf8'))
    
    const newPalette = {
      id: Date.now().toString(),
      name: name || `Palette ${data.palettes.length + 1}`,
      colors,
      createdAt: new Date().toISOString()
    }
    
    data.palettes.push(newPalette)
    fs.writeFileSync(PALETTES_FILE, JSON.stringify(data, null, 2))
    
    return Response.json({ success: true, palette: newPalette })
  } catch (error) {
    console.error('Error saving palette:', error)
    return Response.json({ success: false, error: 'Failed to save palette' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const data = JSON.parse(fs.readFileSync(PALETTES_FILE, 'utf8'))
    return Response.json(data)
  } catch (error) {
    console.error('Error reading palettes:', error)
    return Response.json({ palettes: [] })
  }
} 