"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from 'next/link'
import Image from 'next/image'
import Loader from './Loader'
import { ClipboardCopy, ChevronUp, ChevronDown, Palette, Copy, Sun, Moon } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useTheme } from 'next-themes'

const Palletes = () => {
  const [colors, setColors] = useState([])
  const [colorCount, setColorCount] = useState(3)
  const [paletteName, setPaletteName] = useState('')
  const [colorFormat, setColorFormat] = useState('hex')
  const [relatedImages, setRelatedImages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loadingState, setLoadingState] = useState('idle')
  const { theme, setTheme } = useTheme()

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

  const generateColors = async () => {
    try {
      setIsLoading(true)
      setLoadingState('loader')
      
      // Show loader for 1 second
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLoadingState('skeleton')

      const response = await fetch(`/api/generate-colors?count=${colorCount}`)
      const data = await response.json()
      console.log('Generated colors:', data.colors)
      setColors(data.colors)
      
      // Fetch related images from Pexels
      const colorsParam = encodeURIComponent(data.colors.join(','))
      console.log('Fetching images from Pexels with colors:', colorsParam)
      const pexelsResponse = await fetch(`/api/pexels?colors=${colorsParam}`)
      const pexelsData = await pexelsResponse.json()
      console.log('Pexels API response:', pexelsData)
      setRelatedImages(pexelsData.photos || [])

      // Show skeleton for at least 1 second
      const startTime = Date.now()
      await new Promise(resolve => setTimeout(resolve, 1000))
      const elapsedTime = Date.now() - startTime
      if (elapsedTime < 1000) {
        await new Promise(resolve => setTimeout(resolve, 1000 - elapsedTime))
      }

      setLoadingState('content')
    } catch (error) {
      console.error('Error generating colors:', error)
      toast.error('Failed to generate colors')
      setLoadingState('content')
    } finally {
      setIsLoading(false)
    }
  }

  const savePalette = async () => {
    if (colors.length === 0) {
      toast.error('Generate a palette first!')
      return
    }

    try {
      setIsSaving(true)
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
    } finally {
      setIsSaving(false)
    }
  }

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color)
    toast.success('Color copied to clipboard!')
  }


  const handleNumberChange = (increment) => {
    const newValue = Math.min(5, Math.max(1, colorCount + increment))
    setColorCount(newValue)
  }

  const copyAllColors = () => {
    const allColors = colors.map(color => convertColorFormat(color)).join('\n')
    navigator.clipboard.writeText(allColors)
    toast.success('All colors copied to clipboard!')
  }

  return (
    <div className='flex flex-col gap-8 w-full justify-start items-center pt-8 px-4'>
      <div className="flex justify-between items-center w-full max-w-4xl">
        <div className="flex items-center gap-3">
          <Palette className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Color Palette Generator</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            className='cursor-pointer'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Link href="/saved">
            <Button variant="outline" className='cursor-pointer'>View Saved Palettes</Button>
          </Link>
        </div>
      </div>
      
      <div className="flex flex-col gap-8 items-center w-full max-w-4xl min-h-[60vh]">
        {/* Controls Card */}
        <div className="w-full max-w-2xl p-6 rounded-xl bg-background/80 backdrop-blur-sm border shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 items-center md:items-start justify-center">
            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                <Input 
                  className='w-40 pr-8' 
                  type='number' 
                  min="1"
                  max="5"
                  value={colorCount}
                  onChange={(e) => setColorCount(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                  placeholder='Number of colors'
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col h-[calc(100%-8px)]">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-1/2 w-6 p-0 hover:bg-transparent"
                    onClick={() => handleNumberChange(1)}
                    disabled={colorCount >= 5}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-1/2 w-6 p-0 hover:bg-transparent"
                    onClick={() => handleNumberChange(-1)}
                    disabled={colorCount <= 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
             
                </div>
                <span className="text-xs text-muted-foreground">Min: 1, Max: 5</span>

            </div>

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
              variant="default" 
              className='cursor-pointer'
              onClick={generateColors}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate Palette'}
            </Button>
            
          </div>
        
        </div>

        {loadingState === 'loader' && (
          <div className="flex-1 w-full flex items-center justify-center">
            <Loader />
          </div>
        )}

        {loadingState === 'skeleton' && (
          <div className="w-full space-y-8">
            <div className="flex flex-wrap gap-4 justify-center">
              {Array.from({ length: colorCount }).map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <Skeleton className="w-24 h-24 rounded-lg" />
                  <Skeleton className="w-20 h-4" />
                </div>
              ))}
            </div>
          </div>
        )}

        {loadingState === 'content' && colors.length > 0 && (
          <>
            {/* Palette Display */}
            <div className="w-full p-6 rounded-xl bg-background/80 backdrop-blur-sm border shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Generated Palette</h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyAllColors}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                  Copy All
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                {colors.map((color, index) => (
                  <div 
                    key={index}
                    className="flex flex-col items-center gap-2 cursor-pointer group relative"
                    onClick={() => copyToClipboard(convertColorFormat(color))}
                  >
                    <div 
                      className="w-24 h-24 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl relative"
                      style={{ backgroundColor: color }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                        <ClipboardCopy className="w-6 h-6 text-white"/>
                      </div>
                    </div>
                    <span className="text-sm font-mono">{convertColorFormat(color)}</span>
                  </div>
                ))}
              </div>
              <div className="w-full max-w-md p-6 rounded-xl bg-background/80 mx-auto backdrop-blur-sm  shadow-lg">
              <div className="flex gap-4 items-center">
                <Input
                  className='flex-1'
                  placeholder='Name your palette (optional)'
                  value={paletteName}
                  onChange={(e) => setPaletteName(e.target.value)}
                />
                <Button onClick={savePalette} disabled={isSaving} className='cursor-pointer'>
                  {isSaving ? 'Saving...' : 'Save Palette'}
                </Button>
              </div>
            </div>
            </div>

            {/* Save Palette Card */}
          

            {/* Related Images */}
            {relatedImages.length > 0 && (
              <div className="w-full p-6 rounded-xl bg-background/80 backdrop-blur-sm border shadow-lg">
                <h2 className="text-2xl font-semibold mb-6">Related Images</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedImages.map((photo) => (
                    <div 
                      key={photo.id} 
                      className="relative aspect-video rounded-lg overflow-hidden group"
                    >
                      <Image
                        src={photo.src.medium}
                        alt={photo.alt}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Palletes