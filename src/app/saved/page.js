"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const SavedPalettes = () => {
  const [palettes, setPalettes] = useState([])
  const [loading, setLoading] = useState(true)

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

  const copyToClipboard = (color) => {
    navigator.clipboard.writeText(color)
    toast.success('Color copied to clipboard!')
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
        <Link href="/">
          <Button variant="outline">Back to Generator</Button>
        </Link>
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
              <h2 className="text-xl font-semibold mb-4">{palette.name}</h2>
              <div className="flex flex-wrap gap-2">
                {palette.colors.map((color, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center cursor-pointer"
                    onClick={() => copyToClipboard(color)}
                  >
                    <div
                      className="w-16 h-16 rounded-lg shadow-md transition-transform hover:scale-105"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-mono mt-1">{color}</span>
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
    </div>
  )
}

export default SavedPalettes 