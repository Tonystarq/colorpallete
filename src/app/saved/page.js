"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ClipboardCopy, Maximize2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import PaletteDialog from '@/components/custom/PaletteDialog'

const SavedPalettes = () => {
  const [palettes, setPalettes] = useState([])
  const [loading, setLoading] = useState(true)
  const [colorFormat, setColorFormat] = useState('hex')
  const [selectedPalette, setSelectedPalette] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchPalettes()
  }, [])

  const fetchPalettes = async () => {
    try {
      const response = await fetch('/api/save-palette')
      const data = await response.json()
      setPalettes(data.palettes)
    } catch (error) {
      console.error('Error fetching palettes:', error)
      toast.error('Failed to load saved palettes')
    } finally {
      setLoading(false)
    }
  }

  const convertColorFormat = (color) => {
    // Remove # if present
    const hex = color.replace('#', '')
    
    // Convert hex to RGB
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    
    switch(colorFormat) {
      case 'hex':
        return color
      case 'rgb':
        return `rgb(${r}, ${g}, ${b})`
      case 'hsl':
        // Convert RGB to HSL
        const r1 = r / 255
        const g1 = g / 255
        const b1 = b / 255
        const max = Math.max(r1, g1, b1)
        const min = Math.min(r1, g1, b1)
        let h, s, l = (max + min) / 2

        if (max === min) {
          h = s = 0
        } else {
          const d = max - min
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
          switch (max) {
            case r1: h = (g1 - b1) / d + (g1 < b1 ? 6 : 0); break
            case g1: h = (b1 - r1) / d + 2; break
            case b1: h = (r1 - g1) / d + 4; break
          }
          h /= 6
        }
        return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
      default:
        return color
    }
  }

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(convertColorFormat(color))
    toast.success('Color copied to clipboard!')
  }

  const handleFullScreen = (palette) => {
    setSelectedPalette(palette)
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Saved Palettes</h1>
        <div className="flex items-center gap-4">
          <Select value={colorFormat} onValueChange={setColorFormat}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Color format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hex">HEX</SelectItem>
              <SelectItem value="rgb">RGB</SelectItem>
              <SelectItem value="hsl">HSL</SelectItem>
            </SelectContent>
          </Select>
          <Link href="/">
            <Button variant="outline">Back to Generator</Button>
          </Link>
        </div>
      </div>

      {palettes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">No saved palettes yet</p>
          <Link href="/">
            <Button className="mt-4">Generate Your First Palette</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {palettes.map((palette) => (
            <div key={palette.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{palette.name}</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleFullScreen(palette)}
                  className="hover:bg-gray-100"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {palette.colors.map((color, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center cursor-pointer group relative"
                    onClick={() => copyToClipboard(color)}
                  >
                    <div
                      className="w-16 h-16 rounded-lg shadow-md transition-transform hover:scale-105 relative"
                      style={{ backgroundColor: color }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                        <ClipboardCopy className="w-4 h-4 text-white"/>
                      </div>
                    </div>
                    <span className="text-xs font-mono mt-1">{convertColorFormat(color)}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Created: {new Date(palette.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <PaletteDialog 
        palette={selectedPalette}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  )
}

export default SavedPalettes 