'use client'

import React, { useState, useCallback } from 'react'
import Cropper, { Area } from 'react-easy-crop'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface ImageCropModalProps {
    image: string | null
    isOpen: boolean
    onClose: () => void
    onCropComplete: (file: Blob) => void
    aspectRatio?: number
    title?: string
}

export default function ImageCropModal({ 
    image, 
    isOpen, 
    onClose, 
    onCropComplete, 
    aspectRatio = 1,
    title = "Crop Image"
}: ImageCropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const onCropChange = useCallback((crop: { x: number, y: number }) => {
        setCrop(crop)
    }, [])

    const onZoomChange = useCallback((zoom: number) => {
        setZoom(zoom)
    }, [])

    const onCropCompleteInternal = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image()
            image.addEventListener('load', () => resolve(image))
            image.addEventListener('error', (error) => reject(error))
            image.setAttribute('crossOrigin', 'anonymous')
            image.src = url
        })

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area
    ): Promise<Blob | null> => {
        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) return null

        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        )

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                resolve(blob)
            }, 'image/png')
        })
    }

    const handleConfirm = async () => {
        if (!image || !croppedAreaPixels) return

        setIsProcessing(true)
        try {
            const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels)
            if (croppedImageBlob) {
                onCropComplete(croppedImageBlob)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setIsProcessing(false)
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] bg-[#080808] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-serif">{title}</DialogTitle>
                </DialogHeader>
                
                <div className="relative h-[400px] w-full mt-4 bg-black rounded-xl overflow-hidden">
                    {image && (
                        <Cropper
                            image={image}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspectRatio}
                            onCropChange={onCropChange}
                            onCropComplete={onCropCompleteInternal}
                            onZoomChange={onZoomChange}
                        />
                    )}
                </div>

                <div className="mt-4 px-2">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2 block">Zoom</label>
                    <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-full accent-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                </div>

                <DialogFooter className="mt-6 flex gap-3">
                    <Button 
                        variant="outline" 
                        onClick={onClose}
                        className="flex-1 bg-transparent border-white/10 text-white hover:bg-white/5 h-11"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="flex-1 bg-white text-black hover:bg-primary h-11 font-bold"
                    >
                        {isProcessing ? <Loader2 className="animate-spin" /> : "Apply Crop"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
