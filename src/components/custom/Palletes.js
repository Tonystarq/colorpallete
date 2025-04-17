"use client"
import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from 'next/link'
import Image from 'next/image'
import Loader from './Loader'
import { ClipboardCopy } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const Palletes = () => {
  const [colors, setColors] = useState([])
  const [colorCount, setColorCount] = useState(5)
  const [paletteName, setPaletteName] = useState('')
  const [colorFormat, setColorFormat] = useState('hex')
  const [relatedImages, setRelatedImages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loadingState, setLoadingState] = useState('idle') // 'idle' | 'loader' | 'skeleton' | 'content'

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

  return (
    <div className='flex flex-col gap-4 w-full justify-start items-center pt-8'>
      <div className="flex justify-between items-center w-full max-w-4xl px-4">
        <h1 className="text-4xl font-bold">Color Palette Generator</h1>
        <Link href="/saved">
          <Button variant="outline">View Saved Palettes</Button>
        </Link>
      </div>
      
      <div className="flex flex-col gap-4 items-center w-full max-w-4xl min-h-[60vh]">
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
            variant="outline" 
            className='cursor-pointer'
            onClick={generateColors}
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate Palette'}
          </Button>
        </div>

        {loadingState === 'loader' && (
          <div className="flex-1 w-full flex items-center justify-center">
            <Loader />
          </div>
        )}

        {loadingState === 'skeleton' && (
          <div className="w-full space-y-8">
            {/* Color Palette Skeleton */}
            <div className="flex flex-wrap gap-4 justify-center">
              {Array.from({ length: colorCount }).map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <Skeleton className="w-24 h-24 rounded-lg" />
                  <Skeleton className="w-20 h-4" />
                </div>
              ))}
            </div>

            {/* Images Skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-8 w-48 mx-auto" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Skeleton key={index} className="aspect-video rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        )}

        {loadingState === 'content' && (
          <>
            {colors.length > 0 && (
              <div className="flex gap-4 items-center w-full max-w-md">
                <Input
                  className='flex-1'
                  placeholder='Name your palette (optional)'
                  value={paletteName}
                  onChange={(e) => setPaletteName(e.target.value)}
                />
                <Button onClick={savePalette} disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Palette'}
                </Button>
              </div>
            )}

            <div className="flex flex-wrap gap-4 justify-center mt-8">
              {colors.map((color, index) => (
                <div 
                  key={index}
                  className="flex flex-col items-center gap-2 cursor-pointer group relative"
                  onClick={() => copyToClipboard(convertColorFormat(color))}
                >
                  <div 
                    className="w-24 h-24 rounded-lg shadow-lg transition-transform hover:scale-105 relative"
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

            {relatedImages.length > 0 && (
              <div className="mt-8 w-full">
                <h2 className="text-2xl font-bold mb-4">Related Images</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedImages.map((photo) => (
                    <div key={photo.id} className="relative aspect-video rounded-lg overflow-hidden">
                      <Image
                        src={photo.src.medium}
                        alt={photo.alt}
                        fill
                        className="object-cover"
                      />
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