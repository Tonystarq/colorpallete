"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ClipboardCopy, X } from 'lucide-react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const PaletteDialog = ({ palette, isOpen, onClose }) => {
  const [relatedImages, setRelatedImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen && palette) {
      fetchRelatedImages()
    }
  }, [isOpen, palette])

  const fetchRelatedImages = async () => {
    try {
      setLoading(true)
      const colorsParam = encodeURIComponent(palette.colors.join(','))
      const response = await fetch(`/api/pexels?colors=${colorsParam}`)
      const data = await response.json()
      setRelatedImages(data.photos || [])
    } catch (error) {
      console.error('Error fetching images:', error)
      toast.error('Failed to load related images')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color)
    toast.success('Color copied to clipboard!')
  }

  if (!palette) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-fit overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl">{palette.name || 'Untitled Palette'}</DialogTitle>
          
          </div>
        </DialogHeader>
        
        <div className="space-y-8">
          {/* Colors Section */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {palette.colors.map((color, index) => (
              <div
                key={index}
                className="flex flex-col items-center cursor-pointer group relative"
                onClick={() => copyToClipboard(color)}
              >
                <div
                  className="w-full aspect-square rounded-lg shadow-md transition-transform hover:scale-105 relative"
                  style={{ backgroundColor: color }}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                    <ClipboardCopy className="w-6 h-6 text-white"/>
                  </div>
                </div>
                <span className="text-sm font-mono mt-2">{color}</span>
              </div>
            ))}
          </div>

          {/* Images Section */}
          <div 
            className="p-6 rounded-lg"
          >
            <div className="backdrop-blur-xl bg-white/10 p-4 rounded-lg">
              <h2 className="text-2xl font-bold mb-4  drop-shadow-lg">Related Images</h2>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="aspect-video bg-gray-200 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedImages.map((photo) => (
                    <div 
                      key={photo.id} 
                      className="relative aspect-video rounded-lg overflow-hidden backdrop-blur-sm bg-white/10"
                    >
                      <Image
                        src={photo.src.medium}
                        alt={photo.alt}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PaletteDialog 