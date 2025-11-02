// page.tsx - Redesigned UI
'use client'

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Accordion } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ModeToggle } from '@/components/mode-toggle';
import TextCustomizer from '@/components/editor/text-customizer';

import { PlusIcon, ReloadIcon, DownloadIcon, UploadIcon, LayersIcon } from '@radix-ui/react-icons';
import { removeBackground } from "@imgly/background-removal";

import '@/app/fonts.css';

export default function Page() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [removedBgImageUrl, setRemovedBgImageUrl] = useState<string | null>(null);
    const [textSets, setTextSets] = useState<Array<any>>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef<number | null>(null);

    // All your existing functions remain exactly the same
    const handleUploadImage = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setError(null);
            setIsLoading(true);
            setRemovedBgImageUrl(null);
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            await setupImage(imageUrl);
        }
    };

    const setupImage = async (imageUrl: string) => {
        try {
            const imageBlob = await removeBackground(imageUrl);
            const url = URL.createObjectURL(imageBlob);
            setRemovedBgImageUrl(url);
        } catch (err) {
            console.error(err);
            setError("Sorry, we couldn't remove the background from this image.");
        } finally {
            setIsLoading(false);
        }
    };

    const addNewTextSet = () => {
        const newId = Math.max(...textSets.map(set => set.id), 0) + 1;
        setTextSets(prev => [...prev, {
            id: newId,
            text: 'edit',
            fontFamily: 'Inter',
            top: 0,
            left: 0,
            color: 'white',
            fontSize: 200,
            fontWeight: 800,
            opacity: 1,
            shadowColor: 'rgba(0, 0, 0, 0.8)',
            shadowSize: 4,
            rotation: 0,
            tiltX: 0,
            tiltY: 0,
            letterSpacing: 0
        }]);
    };

    // All your existing drag handlers and utility functions remain exactly the same
    const onPointerDown = (e: React.MouseEvent | React.TouchEvent, id: number) => {
        e.preventDefault();
        draggingRef.current = id;
        try {
            document.body.style.userSelect = 'none';
        } catch {}
        window.addEventListener('mousemove', onPointerMove as any);
        window.addEventListener('mouseup', onPointerUp as any);
        window.addEventListener('touchmove', onPointerMove as any, { passive: false } as any);
        window.addEventListener('touchend', onPointerUp as any);
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
        if (draggingRef.current === null) return;
        if (!previewContainerRef.current) return;
        e.preventDefault();
        const rect = previewContainerRef.current.getBoundingClientRect();
        let clientX = 0;
        let clientY = 0;
        if ((e as TouchEvent).touches && (e as TouchEvent).touches.length) {
            clientX = (e as TouchEvent).touches[0].clientX;
            clientY = (e as TouchEvent).touches[0].clientY;
        } else if ((e as MouseEvent).clientX !== undefined) {
            clientX = (e as MouseEvent).clientX;
            clientY = (e as MouseEvent).clientY;
        }

        const leftPct = ((clientX - rect.left) / rect.width) * 100 - 50;
        const topPct = 50 - ((clientY - rect.top) / rect.height) * 100;

        const clampedLeft = Math.max(Math.min(leftPct, 50), -50);
        const clampedTop = Math.max(Math.min(topPct, 50), -50);

        handleAttributeChange(draggingRef.current, 'left', clampedLeft);
        handleAttributeChange(draggingRef.current, 'top', clampedTop);
    };

    const onPointerUp = () => {
        draggingRef.current = null;
        try {
            document.body.style.userSelect = '';
        } catch {}
        window.removeEventListener('mousemove', onPointerMove as any);
        window.removeEventListener('mouseup', onPointerUp as any);
        window.removeEventListener('touchmove', onPointerMove as any);
        window.removeEventListener('touchend', onPointerUp as any);
    };

    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', onPointerMove as any);
            window.removeEventListener('mouseup', onPointerUp as any);
            window.removeEventListener('touchmove', onPointerMove as any);
            window.removeEventListener('touchend', onPointerUp as any);
        };
    }, []);

    const handleAttributeChange = (id: number, attribute: string, value: any) => {
        setTextSets(prev => prev.map(set => 
            set.id === id ? { ...set, [attribute]: value } : set
        ));
    };

    const duplicateTextSet = (textSet: any) => {
        const newId = Math.max(...textSets.map(set => set.id), 0) + 1;
        setTextSets(prev => [...prev, { ...textSet, id: newId }]);
    };

    const removeTextSet = (id: number) => {
        setTextSets(prev => prev.filter(set => set.id !== id));
    };

    const saveCompositeImage = () => {
        // Your existing saveCompositeImage function remains exactly the same
        if (!canvasRef.current || isLoading || !previewContainerRef.current) return;

        const container = previewContainerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
    
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
    
        const bgImg = new (window as any).Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.onload = () => {
            const imageWidth = bgImg.naturalWidth;
            const imageHeight = bgImg.naturalHeight;

            canvas.width = imageWidth;
            canvas.height = imageHeight;

            const ratio = Math.min(containerWidth / imageWidth, containerHeight / imageHeight);
            const fontScale = 1 / ratio;
    
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
    
            textSets.forEach(textSet => {
                ctx.save();
                
                const scaledFontSize = textSet.fontSize * fontScale;
                ctx.font = `${textSet.fontWeight} ${scaledFontSize}px ${textSet.fontFamily}`;
                ctx.fillStyle = textSet.color;
                ctx.globalAlpha = textSet.opacity;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.letterSpacing = `${textSet.letterSpacing}px`;
    
                const x = canvas.width * (textSet.left + 50) / 100;
                const y = canvas.height * (50 - textSet.top) / 100;
    
                ctx.translate(x, y);
                
                const tiltXRad = (-textSet.tiltX * Math.PI) / 180;
                const tiltYRad = (-textSet.tiltY * Math.PI) / 180;
    
                ctx.transform(
                    Math.cos(tiltYRad),
                    Math.sin(0),
                    -Math.sin(0),
                    Math.cos(tiltXRad),
                    0,
                    0
                );
    
                ctx.rotate((textSet.rotation * Math.PI) / 180);
    
                if (textSet.letterSpacing === 0) {
                    ctx.fillText(textSet.text, 0, 0);
                } else {
                    const chars = textSet.text.split('');
                    let currentX = 0;
                    const totalWidth = chars.reduce((width, char, i) => {
                        const charWidth = ctx.measureText(char).width;
                        return width + charWidth + (i < chars.length - 1 ? textSet.letterSpacing : 0);
                    }, 0);
                    
                    currentX = -totalWidth / 2;
                    
                    chars.forEach((char, i) => {
                        const charWidth = ctx.measureText(char).width;
                        ctx.fillText(char, currentX + charWidth / 2, 0);
                        currentX += charWidth + textSet.letterSpacing;
                    });
                }
                ctx.restore();
            });
    
            if (removedBgImageUrl) {
                const removedBgImg = new (window as any).Image();
                removedBgImg.crossOrigin = "anonymous";
                removedBgImg.onload = () => {
                    ctx.drawImage(removedBgImg, 0, 0, canvas.width, canvas.height);
                    triggerDownload();
                };
                removedBgImg.src = removedBgImageUrl;
            } else {
                triggerDownload();
            }
        };
        bgImg.src = selectedImage || '';
    
        function triggerDownload() {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = 'text-behind-image.png';
            link.href = dataUrl;
            link.click();
        }
    };
    
    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950'>
            {/* New Header Design */}
            <header className='sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60'>
                <div className='container flex h-16 items-center justify-between'>
                    <div className="flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                            <span className="text-sm font-bold text-white">T</span>
                        </div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                            TextFX
                        </h2>
                    </div>
                    <div className='flex items-center gap-3'>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".jpg, .jpeg, .png"
                        />
                        {selectedImage && (
                            <Button 
                                onClick={saveCompositeImage} 
                                variant="outline"
                                className='hidden md:flex items-center gap-2 border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-200'
                            >
                                <DownloadIcon className="h-4 w-4" />
                                Export
                            </Button>
                        )}
                        <Button 
                            onClick={handleUploadImage}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-600/25 transition-all duration-200 flex items-center gap-2"
                        >
                            <UploadIcon className="h-4 w-4" />
                            Upload Image
                        </Button>
                        <ModeToggle />
                    </div>
                </div>
            </header>

            <main className='container py-8'>
                {selectedImage ? (
                    <div className='grid grid-cols-1 xl:grid-cols-12 gap-8'>
                        {/* Preview Section - Redesigned */}
                        <div className="xl:col-span-8 space-y-6">
                            <div className='flex items-center justify-between'>
                                <div>
                                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Image Preview</h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Drag text layers to position them behind objects</p>
                                </div>
                                <Button 
                                    onClick={saveCompositeImage} 
                                    className='md:hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                >
                                    <DownloadIcon className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                            <canvas ref={canvasRef} className="hidden" />
                            <div 
                                ref={previewContainerRef} 
                                className="aspect-video w-full rounded-2xl border-2 border-slate-200/50 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 dark:border-slate-700/50 p-6 relative overflow-hidden flex items-center justify-center shadow-2xl backdrop-blur-sm"
                                style={{ touchAction: 'none' }}
                            >
                                {isLoading ? (
                                    <div className='flex items-center gap-3 p-6 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-lg'>
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">Processing image...</span>
                                    </div>
                                ) : error ? (
                                    <div className="text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20">
                                        {error}
                                    </div>
                                ) : selectedImage ? (
                                    <>
                                        <Image
                                            src={selectedImage} 
                                            alt="Uploaded"
                                            layout="fill"
                                            objectFit="contain" 
                                            objectPosition="center"
                                            className="transition-all duration-300"
                                            draggable={false}
                                            onDragStart={(e) => e.preventDefault()}
                                        />
                                        {textSets.map(textSet => (
                                            <div
                                                key={textSet.id}
                                                onMouseDown={(e) => onPointerDown(e, textSet.id)}
                                                onTouchStart={(e) => onPointerDown(e, textSet.id)}
                                                style={{
                                                    position: 'absolute',
                                                    top: `${50 - textSet.top}%`,
                                                    left: `${textSet.left + 50}%`,
                                                    transform: `
                                                        translate(-50%, -50%) 
                                                        rotate(${textSet.rotation}deg)
                                                        perspective(1000px)
                                                        rotateX(${textSet.tiltX}deg)
                                                        rotateY(${textSet.tiltY}deg)
                                                    `,
                                                    color: textSet.color,
                                                    textAlign: 'center',
                                                    fontSize: `${textSet.fontSize}px`,
                                                    fontWeight: textSet.fontWeight,
                                                    fontFamily: textSet.fontFamily,
                                                    opacity: textSet.opacity,
                                                    letterSpacing: `${textSet.letterSpacing}px`,
                                                    transformStyle: 'preserve-3d',
                                                    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                                    cursor: draggingRef.current === textSet.id ? 'grabbing' : 'grab',
                                                    transition: 'all 0.2s ease-out'
                                                }}
                                                className="hover:scale-105 active:scale-95"
                                            >
                                                {textSet.text}
                                            </div>
                                        ))}
                                        {removedBgImageUrl && (
                                            <Image
                                                src={removedBgImageUrl}
                                                alt="Removed background"
                                                layout="fill"
                                                objectFit="contain" 
                                                objectPosition="center" 
                                                className="absolute top-0 left-0 w-full h-full transition-opacity duration-300"
                                                draggable={false}
                                                onDragStart={(e) => e.preventDefault()}
                                            /> 
                                        )}
                                    </>
                                ) : null}
                            </div>
                        </div>

                        {/* Controls Section - Redesigned */}
                        <div className='xl:col-span-4 space-y-6'>
                            <div className='bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg p-6'>
                                <div className='flex items-center justify-between mb-6'>
                                    <div>
                                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                            <LayersIcon className="h-5 w-5 text-blue-600" />
                                            Text Layers
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                            {textSets.length} layer{textSets.length !== 1 ? 's' : ''} active
                                        </p>
                                    </div>
                                    <Button 
                                        onClick={addNewTextSet}
                                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25"
                                    >
                                        <PlusIcon className='h-4 w-4 mr-2'/>
                                        Add Text
                                    </Button>
                                </div>
                                
                                <div className='bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner'>
                                    <ScrollArea className="h-[600px]">
                                        <div className="p-4">
                                            {textSets.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                        <PlusIcon className="h-8 w-8 text-slate-400" />
                                                    </div>
                                                    <p className="text-slate-600 dark:text-slate-400 mb-2">No text layers yet</p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-500">Add your first text layer to get started</p>
                                                </div>
                                            ) : (
                                                <Accordion type="single" collapsible className="w-full space-y-3">
                                                    {textSets.map(textSet => (
                                                        <TextCustomizer 
                                                            key={textSet.id}
                                                            textSet={textSet}
                                                            handleAttributeChange={handleAttributeChange}
                                                            removeTextSet={removeTextSet}
                                                            duplicateTextSet={duplicateTextSet}
                                                            userId={"local"}
                                                        />
                                                    ))}
                                                </Accordion>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // New Landing Design
                    <div className='flex flex-col items-center justify-center min-h-[80vh] space-y-8'>
                        <div className="text-center space-y-4 max-w-2xl">
                            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 mb-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                                    <span className="text-2xl font-bold text-white">T</span>
                                </div>
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
                                Create Stunning Text Effects
                            </h1>
                            <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                                Transform your images with beautiful text layers positioned behind objects. 
                                Upload, customize, and create amazing visual content in seconds.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button 
                                onClick={handleUploadImage}
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl shadow-blue-500/25 hover:shadow-blue-600/25 transition-all duration-200 text-lg px-8 py-6 h-auto"
                            >
                                <UploadIcon className="h-5 w-5 mr-3" />
                                Start Creating Now
                            </Button>
                            <Button 
                                variant="outline"
                                size="lg"
                                className="border-2 border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 text-lg px-8 py-6 h-auto"
                            >
                                View Examples
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
                            <div className="text-center p-6 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <UploadIcon className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Upload Image</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Simply upload your image to get started</p>
                            </div>
                            <div className="text-center p-6 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <LayersIcon className="h-6 w-6 text-purple-600" />
                                </div>
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Add Text Layers</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Customize text with advanced styling options</p>
                            </div>
                            <div className="text-center p-6 rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
                                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <DownloadIcon className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Export & Share</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">Download your creation in high quality</p>
                            </div>
                        </div>
                    </div>
                )} 
            </main>
        </div>
    );
}