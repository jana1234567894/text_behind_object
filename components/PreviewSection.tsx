'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useLayerManager, TextLayer } from '@/context/useLayerManager';
import { Button } from '@/components/ui/button';
import { UploadIcon, DownloadIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { removeBackground, Config } from "@imgly/background-removal";
import { getFontFamily } from "@/lib/fontLoader";
import { useDragToMove } from '@/hooks/use-drag-to-move';
import { usePinchToZoom } from '@/hooks/use-pinch-to-zoom';
import { getFilterCSSStringWithIntensity, applyFilter } from '@/lib/filters';

const TextLayerComponent = ({ textSet, handleAttributeChange, previewContainerRef }: { textSet: TextLayer, handleAttributeChange: (id: string, attribute: string, value: any) => void, previewContainerRef: React.RefObject<HTMLDivElement> }) => {
    const textRef = useRef<HTMLDivElement>(null);

    const handleDrag = useCallback((dx: number, dy: number) => {
        if (!previewContainerRef.current) return;
        const rect = previewContainerRef.current.getBoundingClientRect();
        const newLeft = textSet.left + (dx / rect.width) * 100;
        const newTop = textSet.top - (dy / rect.height) * 100;
        handleAttributeChange(textSet.id, 'left', Math.max(Math.min(newLeft, 50), -50));
        handleAttributeChange(textSet.id, 'top', Math.max(Math.min(newTop, 50), -50));
    }, [textSet.left, textSet.top, handleAttributeChange, textSet.id, previewContainerRef]);

    const handleZoom = useCallback((delta: number) => {
        const newSize = Math.max(10, Math.min(800, textSet.fontSize + delta));
        handleAttributeChange(textSet.id, 'fontSize', newSize);
    }, [textSet.fontSize, handleAttributeChange, textSet.id]);

    useDragToMove({ containerRef: textRef, onDrag: handleDrag });
    usePinchToZoom({ containerRef: textRef, onZoom: handleZoom });

    return (
        <div
            ref={textRef}
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
                fontFamily: getFontFamily(textSet.fontFamily),
                opacity: textSet.opacity,
                letterSpacing: `${textSet.letterSpacing}px`,
                transformStyle: 'preserve-3d',
                textShadow: textSet.shadowSize > 0 ? `0 ${textSet.shadowSize}px ${textSet.shadowSize * 2}px ${textSet.shadowColor}` : 'none',
                cursor: 'grab',
                transition: 'all 0.2s ease-out'
            }}
            className="hover:scale-105 active:scale-95"
        >
            {textSet.text}
        </div>
    );
};

export const PreviewSection = () => {
    const { layers, handleAttributeChange, setLayers, selectedFilter, filterIntensity } = useLayerManager();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [subjectImageUrl, setSubjectImageUrl] = useState<string | null>(null);
    const [processingProgress, setProcessingProgress] = useState<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const imageCache = useRef<Map<string, string>>(new Map());

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
            setSubjectImageUrl(null);
            setProcessingProgress(0);
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            await setupImage(imageUrl, file);
        }
    };

    // Optimize image before processing if it's too large
    const optimizeImage = async (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = document.createElement('img');
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            img.onload = () => {
                const MAX_WIDTH = 1920;
                const MAX_HEIGHT = 1080;
                let width = img.width;
                let height = img.height;

                // Only resize if image is larger than max dimensions
                if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                    width = width * ratio;
                    height = height * ratio;
                }

                canvas.width = width;
                canvas.height = height;
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to optimize image'));
                    }
                }, 'image/jpeg', 0.9);
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = URL.createObjectURL(file);
        });
    };

    const setupImage = async (imageUrl: string, file: File) => {
        try {
            // Check cache first
            const cacheKey = `${file.name}-${file.size}`;
            if (imageCache.current.has(cacheKey)) {
                const cachedUrl = imageCache.current.get(cacheKey)!;
                setSubjectImageUrl(cachedUrl);
                setIsLoading(false);
                return;
            }

            // Optimize image if needed
            setProcessingProgress(10);
            const optimizedBlob = await optimizeImage(file);
            const optimizedUrl = URL.createObjectURL(optimizedBlob);

            setProcessingProgress(20);

            // Configure background removal for better performance
            const config: Config = {
                progress: (key, current, total) => {
                    // Update progress bar (20% to 90%)
                    const percentage = 20 + Math.round((current / total) * 70);
                    setProcessingProgress(percentage);
                },
                model: 'isnet_fp16', // Use fp16 model for better speed while maintaining quality
                output: {
                    format: 'image/png',
                    quality: 0.8,
                }
            };

            const imageBlob = await removeBackground(optimizedUrl, config);
            setProcessingProgress(95);

            const url = URL.createObjectURL(imageBlob);
            setSubjectImageUrl(url);

            // Cache the result
            imageCache.current.set(cacheKey, url);

            setProcessingProgress(100);

            // Clean up optimized URL
            URL.revokeObjectURL(optimizedUrl);
        } catch (err) {
            console.error(err);
            setError("Sorry, we couldn't remove the background from this image.");
        } finally {
            setIsLoading(false);
        }
    };

    const saveCompositeImage = () => {
        if (!canvasRef.current || isLoading || !previewContainerRef.current) return;

        const container = previewContainerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const sortedLayers = [...layers].sort((a, b) => a.order - b.order);

        const bgImg = new (window as any).Image();
        bgImg.crossOrigin = "anonymous";
        bgImg.onload = () => {
            const imageWidth = bgImg.naturalWidth;
            const imageHeight = bgImg.naturalHeight;

            canvas.width = imageWidth;
            canvas.height = imageHeight;

            const ratio = Math.min(containerWidth / imageWidth, containerHeight / imageHeight);
            const fontScale = 1 / ratio;

            const renderLayerOnCanvas = (layer: any) => {
                return new Promise<void>((resolve) => {
                    if (layer.type === 'full') {
                        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
                        resolve();
                    } else if (layer.type === 'subject' && subjectImageUrl) {
                        const subjectImg = new (window as any).Image();
                        subjectImg.crossOrigin = "anonymous";
                        subjectImg.onload = () => {
                            ctx.drawImage(subjectImg, 0, 0, canvas.width, canvas.height);
                            resolve();
                        };
                        subjectImg.src = subjectImageUrl;
                    } else if (layer.type === 'text') {
                        const textSet = layer as TextLayer;
                        ctx.save();

                        const scaledFontSize = textSet.fontSize * fontScale;
                        ctx.font = `${textSet.fontWeight} ${scaledFontSize}px ${getFontFamily(textSet.fontFamily)}`;
                        ctx.fillStyle = textSet.color;
                        ctx.globalAlpha = textSet.opacity;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.letterSpacing = `${textSet.letterSpacing}px`;

                        // Apply shadow if shadowSize > 0
                        if (textSet.shadowSize > 0) {
                            ctx.shadowColor = textSet.shadowColor;
                            ctx.shadowBlur = textSet.shadowSize * 2;
                            ctx.shadowOffsetX = 0;
                            ctx.shadowOffsetY = textSet.shadowSize;
                        }

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
                        resolve();
                    } else {
                        resolve();
                    }
                });
            };

            const processLayers = async () => {
                for (const layer of sortedLayers) {
                    if (layer.visible) {
                        await renderLayerOnCanvas(layer);
                    }
                }

                // Apply filter to final composite before download
                if (selectedFilter && selectedFilter !== 'original') {
                    applyFilter(canvas, canvas, selectedFilter);
                }

                triggerDownload();
            };

            processLayers();
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
        <div className='h-full flex flex-col bg-slate-50 dark:bg-slate-950'>
            <header className='sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60'>
                <div className='container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8'>
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
                    </div>
                </div>
            </header>
            <main className='flex-1 container py-8 px-4 sm:px-6 lg:px-8'>
                {selectedImage ? (
                    <div className='h-full'>
                        <canvas ref={canvasRef} className="hidden" />
                        <div
                            ref={previewContainerRef}
                            className="aspect-video w-full rounded-2xl border-2 border-slate-200/50 bg-slate-100 dark:bg-slate-900/50 dark:border-slate-700/50 p-6 relative overflow-hidden flex items-center justify-center shadow-2xl backdrop-blur-sm"
                            style={{ touchAction: 'none', backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23e2e8f0' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`, filter: getFilterCSSStringWithIntensity(selectedFilter, filterIntensity) }}
                        >
                            {isLoading ? (
                                <div className='flex flex-col items-center gap-4 p-8 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg min-w-[320px]'>
                                    <div className="w-16 h-16 border-4 border-blue-600 border-dashed rounded-full animate-spin"></div>
                                    <span className="text-slate-700 dark:text-slate-300 font-medium text-lg">Processing image...</span>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mt-2">
                                        <div
                                            className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                                            style={{ width: `${processingProgress}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{processingProgress}% complete</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center gap-4 text-center text-red-500 bg-red-500/10 p-8 rounded-2xl border border-red-500/20">
                                    <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
                                    <h3 className="text-xl font-semibold">Oops! Something went wrong.</h3>
                                    <p className="text-sm">{error}</p>
                                    <Button onClick={handleUploadImage} variant="outline" className="mt-4">Try another image</Button>
                                </div>
                            ) : (
                                <>
                                    {[...layers].filter(layer => layer.visible).sort((a, b) => a.order - b.order).map(layer => {
                                        switch (layer.type) {
                                            case 'full':
                                                return (
                                                    <Image
                                                        key={layer.id}
                                                        src={selectedImage}
                                                        alt="Full Image"
                                                        layout="fill"
                                                        objectFit="contain"
                                                        objectPosition="center"
                                                        className="absolute inset-0 object-contain pointer-events-none"
                                                        draggable={false}
                                                    />
                                                );
                                            case 'subject':
                                                return subjectImageUrl && (
                                                    <Image
                                                        key={layer.id}
                                                        src={subjectImageUrl}
                                                        alt="Subject Only"
                                                        layout="fill"
                                                        objectFit="contain"
                                                        objectPosition="center"
                                                        className="absolute inset-0 object-contain pointer-events-none"
                                                        draggable={false}
                                                    />
                                                );
                                            case 'text':
                                                const textSet = layer as TextLayer;
                                                return (
                                                    <TextLayerComponent
                                                        key={textSet.id}
                                                        textSet={textSet}
                                                        handleAttributeChange={handleAttributeChange}
                                                        previewContainerRef={previewContainerRef}
                                                    />
                                                );
                                            default:
                                                return null;
                                        }
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className='flex flex-col items-center justify-center h-full space-y-8 text-center'>
                        <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 mb-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                                <span className="text-2xl font-bold text-white">T</span>
                            </div>
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
                            Bring Your Images to Life
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                            Add stunning text behind any object in your photos. Our AI will automatically handle the background removal, so you can focus on creating.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                onClick={handleUploadImage}
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl shadow-blue-500/25 hover:shadow-blue-600/25 transition-all duration-200 text-lg px-8 py-6 h-auto"
                            >
                                <UploadIcon className="h-5 w-5 mr-3" />
                                Upload Your Image
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-2 border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 text-lg px-8 py-6 h-auto"
                            >
                                See Examples
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
