"use client"
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from 'next/link'

const Palletes = () => {
  const [colors, setColors] = useState([])
  const [colorCount, setColorCount] = useState(5)
  const [paletteName, setPaletteName] = useState('')

  const generateColors = async () => {
    try {
      const response = await fetch(`/api/generate-colors?count=${colorCount}`)
      const data = await response.json()
      setColors(data.colors)
    } catch (error) {
      console.error('Error generating colors:', error)
      toast.error('Failed to generate colors')
    }
  }

  const savePalette = async () => {
    if (colors.length === 0) {
      toast.error('Generate a palette first!')
      return
    }

    try {
      const response = await fetch('/api/save-palette', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          colors,
          name: paletteName || undefined
        }),
      })

      const data = await response.json()
      if (data.success) {
        toast.success('Palette saved successfully!')
        setPaletteName('')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error saving palette:', error)
      toast.error('Failed to save palette')
    }
  }

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color)
    toast.success('Color copied to clipboard!')
  }

  return (
    <div className='flex flex-col gap-4 w-full justify-start items-center pt-8'>
      <div className="flex justify-between items-center w-full max-w-4xl px-4">
        <h1 className="text-4xl font-bold">Color Palette Generator</h1>
        <Link href="/saved">
          <Button variant="outline">View Saved Palettes</Button>
        </Link>
      </div>
      
      <div className="flex flex-col gap-4 items-center w-full max-w-4xl">
        <div className="flex gap-4 items-center">
          <Input 
            className='w-40' 
            type='number' 
            min="1"
            max="10"
            value={colorCount}
            onChange={(e) => setColorCount(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
            placeholder='Number of colors'
          />
          <Button 
            variant="outline" 
            className='cursor-pointer'
            onClick={generateColors}
          >
            Generate Palette
          </Button>
        </div>

        {colors.length > 0 && (
          <div className="flex gap-4 items-center w-full max-w-md">
            <Input
              className='flex-1'
              placeholder='Name your palette (optional)'
              value={paletteName}
              onChange={(e) => setPaletteName(e.target.value)}
            />
            <Button onClick={savePalette}>Save Palette</Button>
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center mt-8">
          {colors.map((color, index) => (
            <div 
              key={index}
              className="flex flex-col items-center gap-2 cursor-pointer"
              onClick={() => copyToClipboard(color)}
            >
              <div 
                className="w-24 h-24 rounded-lg shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-mono">{color}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Palletes