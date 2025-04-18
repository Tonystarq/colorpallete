"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ClipboardCopy, Maximize2, Palette, Sun, Moon, Trash2, Edit2, Tag, X, Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import PaletteDialog from '@/components/custom/PaletteDialog'
import { useTheme } from 'next-themes'

const SavedPalettes = () => {
  const [palettes, setPalettes] = useState([])
  const [loading, setLoading] = useState(true)
  const [colorFormat, setColorFormat] = useState('hex')
  const [selectedPalette, setSelectedPalette] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPaletteId, setEditingPaletteId] = useState(null)
  const [newPaletteName, setNewPaletteName] = useState('')
  const [newTag, setNewTag] = useState('')
  const { theme, setTheme } = useTheme()
  const [tagInputs, setTagInputs] = useState({})

  useEffect(() => {
    fetchPalettes()
  }, [])

  const fetchPalettes = async () => {
    try {
      const response = await fetch('/api/save-palette')
      const data = await response.json()
      setPalettes(data.palettes)
      // Initialize tag inputs for each palette
      const initialTagInputs = {}
      data.palettes.forEach(palette => {
        initialTagInputs[palette.id] = ''
      })
      setTagInputs(initialTagInputs)
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

  const handleDeletePalette = async (paletteId) => {
    try {
      const response = await fetch(`/api/save-palette?id=${paletteId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (data.success) {
        setPalettes(palettes.filter(p => p.id !== paletteId))
        toast.success('Palette deleted successfully')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error deleting palette:', error)
      toast.error('Failed to delete palette')
    }
  }

  const handleRenamePalette = async (paletteId, newName) => {
    try {
      const response = await fetch('/api/save-palette', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: paletteId,
          name: newName,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setPalettes(palettes.map(p => 
          p.id === paletteId ? { ...p, name: newName } : p
        ))
        setEditingPaletteId(null)
        toast.success('Palette renamed successfully')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error renaming palette:', error)
      toast.error('Failed to rename palette')
    }
  }

  const handleAddTag = async (paletteId) => {
    const newTag = tagInputs[paletteId]?.trim()
    if (!newTag) return

    try {
      const palette = palettes.find(p => p.id === paletteId)
      const updatedTags = [...(palette.tags || []), newTag]
      
      const response = await fetch('/api/save-palette', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: paletteId,
          tags: updatedTags
        }),
      })
      const data = await response.json()
      if (data.success) {
        setPalettes(palettes.map(p => 
          p.id === paletteId ? { ...p, tags: updatedTags } : p
        ))
        // Clear the input field for this specific palette
        setTagInputs(prev => ({ ...prev, [paletteId]: '' }))
        toast.success('Tag added successfully!')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error adding tag:', error)
      toast.error('Failed to add tag')
    }
  }

  const handleRemoveTag = async (paletteId, tagToRemove) => {
    try {
      const response = await fetch('/api/save-palette', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: paletteId,
          tags: palettes.find(p => p.id === paletteId)?.tags?.filter(tag => tag !== tagToRemove) || [],
        }),
      })
      const data = await response.json()
      if (data.success) {
        setPalettes(palettes.map(p => 
          p.id === paletteId ? { ...p, tags: p.tags?.filter(tag => tag !== tagToRemove) } : p
        ))
        toast.success('Tag removed successfully')
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error removing tag:', error)
      toast.error('Failed to remove tag')
    }
  }

  const handleTagInputChange = (paletteId, value) => {
    setTagInputs(prev => ({
      ...prev,
      [paletteId]: value
    }))
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
        <div className="flex items-center gap-3">
          <Palette className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Saved Palettes</h1>
        </div>
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
          <Button 
            variant="ghost" 
            size="icon"
            className='cursor-pointer'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Link href="/">
            <Button variant="outline" className='cursor-pointer'>Back to Generator</Button>
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
            <div 
              key={palette.id} 
              className="p-6 rounded-xl bg-background/80 backdrop-blur-sm border shadow-lg group relative"
            >
              <div className="flex justify-between items-center mb-4">
                {editingPaletteId === palette.id ? (
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={newPaletteName}
                      onChange={(e) => setNewPaletteName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleRenamePalette(palette.id, newPaletteName)
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        handleRenamePalette(palette.id, newPaletteName)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <h2 className="text-xl font-semibold">{palette.name}</h2>
                )}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className='cursor-pointer'
                    onClick={() => {
                      setEditingPaletteId(palette.id)
                      setNewPaletteName(palette.name)
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className='cursor-pointer'
                    onClick={() => handleDeletePalette(palette.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className='cursor-pointer'
                    onClick={() => handleFullScreen(palette)}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {palette.colors.map((color, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center cursor-pointer group/color relative"
                    onClick={() => copyToClipboard(color)}
                  >
                    <div
                      className="w-16 h-16 rounded-lg shadow-md transition-transform hover:scale-105 relative"
                      style={{ backgroundColor: color }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition-opacity bg-black/20 rounded-lg">
                        <ClipboardCopy className="w-4 h-4 text-white"/>
                      </div>
                    </div>
                    <span className="text-xs font-mono mt-1">{convertColorFormat(color)}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 mb-2">
                {palette.tags?.map((tag, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full text-xs"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent cursor-pointer"
                      onClick={() => handleRemoveTag(palette.id, tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={tagInputs[palette.id] || ''}
                  onChange={(e) => handleTagInputChange(palette.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTag(palette.id)
                    }
                  }}
                  placeholder="Add tag..."
                  className="flex-1 h-8"
                />
                <Button 
                  variant="ghost" 
                  size="icon"
                  className='cursor-pointer'
                  onClick={() => {
                    if (tagInputs[palette.id]?.trim()) {
                      handleAddTag(palette.id)
                    }
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
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