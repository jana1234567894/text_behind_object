import React, { useState, useEffect } from 'react';
import InputField from './input-field';
import SliderField from './slider-field';
import ColorPicker from './color-picker';
import FontFamilyPicker from './font-picker'; 
import Touchpad from './touchpad';
import { Button } from '../ui/button';
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  Move, 
  Text, 
  Bold, 
  RotateCw, 
  Palette, 
  LightbulbIcon, 
  CaseSensitive, 
  TypeOutline, 
  ArrowLeftRight, 
  ArrowUpDown, 
  AlignHorizontalSpaceAround, 
  LockIcon,
  CopyIcon,
  TrashIcon,
  LayersIcon
} from 'lucide-react';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TextCustomizerProps {
    textSet: {
        id: number;
        text: string;
        fontFamily: string;
        top: number;
        left: number;
        color: string;
        fontSize: number;
        fontWeight: number;
        opacity: number;
        rotation: number;
        shadowColor: string;
        shadowSize: number;
        tiltX: number;
        tiltY: number;
        letterSpacing: number;
    };
    handleAttributeChange: (id: number, attribute: string, value: any) => void;
    removeTextSet: (id: number) => void;
    duplicateTextSet: (textSet: any) => void;
    userId: string;
    onPointerDown: (e: React.MouseEvent | React.TouchEvent, id: number) => void;
}

const TextCustomizer: React.FC<TextCustomizerProps> = ({ textSet, handleAttributeChange, removeTextSet, duplicateTextSet, userId, onPointerDown }) => {
    const [isPaidUser, setIsPaidUser] = useState(true);

    const handlePremiumAttributeChange = (attribute: string, value: any) => {
        if (isPaidUser || (attribute !== 'letterSpacing' && attribute !== 'tiltX' && attribute !== 'tiltY')) {
            handleAttributeChange(textSet.id, attribute, value);
        }
    };

    return (
        <AccordionItem value={`item-${textSet.id}`} className="border-0 mb-4">
            <AccordionTrigger className="hover:no-underline bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 data-[state=open]:rounded-b-none transition-all duration-200 group">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                            <LayersIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="font-medium text-slate-900 dark:text-white text-sm">
                                {textSet.text || 'Text Layer'}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                {textSet.fontFamily} • {textSet.fontSize}px
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                duplicateTextSet(textSet);
                            }}
                            className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                            <CopyIcon className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeTextSet(textSet.id);
                            }}
                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <TrashIcon className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </AccordionTrigger>
            
            <AccordionContent className="bg-white dark:bg-slate-900 rounded-b-xl border border-t-0 border-slate-200 dark:border-slate-700 p-4 space-y-4">
                <InputField
                    attribute="text"
                    label="Text Content"
                    currentValue={textSet.text}
                    handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                />
                <Tabs defaultValue="transform" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="transform">Transform</TabsTrigger>
                        <TabsTrigger value="style">Style</TabsTrigger>
                        <TabsTrigger value="color">Color</TabsTrigger>
                    </TabsList>
                    <TabsContent value="transform" className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Touchpad
                                id={textSet.id}
                                onPointerDown={onPointerDown}
                                left={textSet.left}
                                top={textSet.top}
                            />
                            <div className="space-y-4">
                                <SliderField
                                    attribute="left"
                                    label="X Position"
                                    min={-200}
                                    max={200}
                                    step={1}
                                    currentValue={textSet.left}
                                    hasTopPadding={false}
                                    handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                                />
                                <SliderField
                                    attribute="top"
                                    label="Y Position"
                                    min={-100}
                                    max={100}
                                    step={1}
                                    currentValue={textSet.top}
                                    handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                                />
                            </div>
                        </div>
                        <SliderField
                            attribute="fontSize"
                            label="Text Size"
                            min={10}
                            max={800}
                            step={1}
                            currentValue={textSet.fontSize}
                            handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                        />
                    </TabsContent>
                    <TabsContent value="style" className="space-y-4 pt-4">
                        <FontFamilyPicker
                            attribute="fontFamily"
                            currentFont={textSet.fontFamily}
                            handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                            userId={userId}
                        />
                        <SliderField
                            attribute="fontWeight"
                            label="Font Weight"
                            min={100}
                            max={900}
                            step={100}
                            currentValue={textSet.fontWeight}
                            handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                        />
                        <SliderField
                            attribute="rotation"
                            label="Rotation"
                            min={-360}
                            max={360}
                            step={1}
                            currentValue={textSet.rotation}
                            handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                        />
                        <SliderField
                            attribute="opacity"
                            label="Text Opacity"
                            min={0}
                            max={1}
                            step={0.01}
                            currentValue={textSet.opacity}
                            handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <SliderField
                                attribute="tiltX"
                                label="Horizontal Tilt (3D)"
                                min={-45}
                                max={45}
                                step={1}
                                currentValue={textSet.tiltX}
                                handleAttributeChange={(attribute, value) => handlePremiumAttributeChange(attribute, value)}
                                disabled={!isPaidUser}
                                premiumFeature={!isPaidUser}
                            />
                            <SliderField
                                attribute="tiltY"
                                label="Vertical Tilt (3D)"
                                min={-45}
                                max={45}
                                step={1}
                                currentValue={textSet.tiltY}
                                handleAttributeChange={(attribute, value) => handlePremiumAttributeChange(attribute, value)}
                                disabled={!isPaidUser}
                                premiumFeature={!isPaidUser}
                            />
                        </div>
                    </TabsContent>
                    <TabsContent value="color" className="pt-4">
                        <ColorPicker
                            attribute="color"
                            label="Text Color"
                            currentColor={textSet.color}
                            handleAttributeChange={(attribute, value) => handleAttributeChange(textSet.id, attribute, value)}
                        />
                    </TabsContent>
                </Tabs>
            </AccordionContent>
        </AccordionItem>
    );
};

export default TextCustomizer;
