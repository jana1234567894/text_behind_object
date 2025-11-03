"use client";

import React, { useState } from "react";
import InputField from "./input-field";
import SliderField from "./slider-field";
import ColorPicker from "./color-picker";
import FontFamilyPicker from "./font-picker";
import Touchpad from "./touchpad";
import { Button } from "../ui/button";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CopyIcon,
  TrashIcon,
  LayersIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TextCustomizerProps {
  textSet: {
    id: string;
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
  handleAttributeChange: (id: string, attribute: string, value: any) => void;
  removeTextSet: (id: string) => void;
  duplicateTextSet: (textSet: any) => void;
  userId: string;
}

const TextCustomizer: React.FC<TextCustomizerProps> = ({
  textSet,
  handleAttributeChange,
  removeTextSet,
  duplicateTextSet,
  userId,
}) => {
  const [isPaidUser] = useState(true);
  const [isGridEnabled, setIsGridEnabled] = useState(false);
  const [gridSize, setGridSize] = useState(20);

    // Touchpad handler — receives left/top offsets (in -50..50) and updates attributes
    const handleTouchpadChange = (leftOffset: number, topOffset: number) => {
      handleAttributeChange(textSet.id, 'left', leftOffset);
      handleAttributeChange(textSet.id, 'top', topOffset);
    };

    const handleNudge = (direction: 'up' | 'down' | 'left' | 'right') => {
      const step = 2; // percentage points matching left/top units
      let newLeft = textSet.left;
      let newTop = textSet.top;
      if (direction === 'up') newTop = Math.max(-50, Math.min(50, newTop + step));
      if (direction === 'down') newTop = Math.max(-50, Math.min(50, newTop - step));
      if (direction === 'left') newLeft = Math.max(-50, Math.min(50, newLeft - step));
      if (direction === 'right') newLeft = Math.max(-50, Math.min(50, newLeft + step));
      handleAttributeChange(textSet.id, 'left', newLeft);
      handleAttributeChange(textSet.id, 'top', newTop);
    };

    const handleReset = () => {
      handleAttributeChange(textSet.id, 'left', 0);
      handleAttributeChange(textSet.id, 'top', 0);
    };

  const handlePremiumAttributeChange = (attribute: string, value: any) => {
    if (
      isPaidUser ||
      (attribute !== "letterSpacing" &&
        attribute !== "tiltX" &&
        attribute !== "tiltY")
    ) {
      handleAttributeChange(textSet.id, attribute, value);
    }
  };

  return (
    <AccordionItem value={`item-${textSet.id}`} className="border-0 mb-4 bg-slate-100 dark:bg-slate-800 rounded-xl data-[state=open]:rounded-b-none transition-all duration-200">
      <div className="flex items-center justify-between w-full px-4 py-3 group">
        <AccordionTrigger className="hover:no-underline flex-1 text-left p-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
              <LayersIcon className="h-4 w-4 text-white" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium text-slate-900 dark:text-white text-sm">
                {textSet.text || "Text Layer"}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {textSet.fontFamily} • {textSet.fontSize}px
              </span>
            </div>
          </div>
        </AccordionTrigger>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-4">
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

      <AccordionContent className="bg-white dark:bg-slate-900 rounded-b-xl border border-t-0 border-slate-200 dark:border-slate-700 p-4 space-y-4">
        <InputField
          attribute="text"
          label="Text Content"
          currentValue={textSet.text}
          handleAttributeChange={(attribute, value) =>
            handleAttributeChange(textSet.id, attribute, value)
          }
        />

        <Tabs defaultValue="transform" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="transform">Transform</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="color">Color</TabsTrigger>
          </TabsList>

          {/* ---------- Transform Tab ---------- */}
          <TabsContent value="transform" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    size="sm"
                    variant={isGridEnabled ? 'default' : 'outline'}
                    onClick={() => setIsGridEnabled((v) => !v)}
                    className={isGridEnabled ? 'bg-blue-500 text-white' : ''}
                  >
                    Grid
                  </Button>
                  {isGridEnabled && (
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={5}
                        max={100}
                        value={gridSize}
                        onChange={(e) => setGridSize(Number(e.target.value))}
                        className="w-24"
                        aria-label="Grid size"
                      />
                      <span className="text-xs text-slate-500">{gridSize}px</span>
                    </div>
                  )}
                </div>

                <Touchpad
                  id={Number(textSet.id.split('-')[2])}
                  onChangePosition={handleTouchpadChange}
                  onNudge={handleNudge}
                  onReset={handleReset}
                  left={textSet.left}
                  top={textSet.top}
                  isGridEnabled={isGridEnabled}
                  gridSize={gridSize}
                />
              </div>
              <div className="space-y-4">
                <SliderField
                  attribute="left"
                  label="X Position"
                  min={-200}
                  max={200}
                  step={1}
                  currentValue={textSet.left}
                  hasTopPadding={false}
                  handleAttributeChange={(attribute, value) =>
                    handleAttributeChange(textSet.id, attribute, value)
                  }
                />
                <SliderField
                  attribute="top"
                  label="Y Position"
                  min={-100}
                  max={100}
                  step={1}
                  currentValue={textSet.top}
                  handleAttributeChange={(attribute, value) =>
                    handleAttributeChange(textSet.id, attribute, value)
                  }
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
              handleAttributeChange={(attribute, value) =>
                handleAttributeChange(textSet.id, attribute, value)
              }
            />
          </TabsContent>

          {/* ---------- Style Tab ---------- */}
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
              handleAttributeChange={(attribute, value) =>
                handleAttributeChange(textSet.id, attribute, value)
              }
            />
            <SliderField
              attribute="rotation"
              label="Rotation"
              min={-360}
              max={360}
              step={1}
              currentValue={textSet.rotation}
              handleAttributeChange={(attribute, value) =>
                handleAttributeChange(textSet.id, attribute, value)
              }
            />
            <SliderField
              attribute="opacity"
              label="Text Opacity"
              min={0}
              max={1}
              step={0.01}
              currentValue={textSet.opacity}
              handleAttributeChange={(attribute, value) =>
                handleAttributeChange(textSet.id, attribute, value)
              }
            />
            <div className="grid grid-cols-2 gap-4">
              <SliderField
                attribute="tiltX"
                label="Horizontal Tilt (3D)"
                min={-45}
                max={45}
                step={1}
                currentValue={textSet.tiltX}
                handleAttributeChange={(attribute, value) =>
                  handlePremiumAttributeChange(attribute, value)
                }
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
                handleAttributeChange={(attribute, value) =>
                  handlePremiumAttributeChange(attribute, value)
                }
                disabled={!isPaidUser}
                premiumFeature={!isPaidUser}
              />
            </div>
          </TabsContent>

          {/* ---------- Color Tab ---------- */}
          <TabsContent value="color" className="pt-4">
            <ColorPicker
              attribute="color"
              label="Text Color"
              currentColor={textSet.color}
              handleAttributeChange={(attribute, value) =>
                handleAttributeChange(textSet.id, attribute, value)
              }
            />
          </TabsContent>
        </Tabs>
      </AccordionContent>
    </AccordionItem>
  );
};

export default TextCustomizer;
