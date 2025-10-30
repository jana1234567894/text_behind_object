'use client'

import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChromePicker } from 'react-color';
import { colors } from '@/constants/colors';
import { PipetteIcon } from 'lucide-react';

interface ColorPickerProps {
  attribute: string;
  label: string;
  currentColor: string;
  handleAttributeChange: (attribute: string, value: any) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  attribute,
  label,
  currentColor,
  handleAttributeChange,
}) => {

  const openEyeDropper = async () => {
    if ('EyeDropper' in window) {
      const eyeDropper = new (window as any).EyeDropper();
      try {
        const { sRGBHex } = await eyeDropper.open();
        handleAttributeChange(attribute, sRGBHex);
      } catch (e) {
        console.log(e)
      }
    }
  }

  return (
    <div className={`flex flex-col gap-2`}>
      <Label htmlFor={attribute}>{label}</Label>

      <div className='flex flex-wrap gap-1 p-1'>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant='outline' className='gap-2'>
              <div
                style={{ background: currentColor }}
                className="rounded-md h-full w-6 cursor-pointer active:scale-105"
              />
              <span>{currentColor}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='flex flex-col items-center justify-center w-[240px]'
            side='left'
            sideOffset={10}
          >
            <Tabs defaultValue='colorPicker'>
              <TabsList className='grid w-full grid-cols-3'>
                <TabsTrigger value='colorPicker'>🎨</TabsTrigger>
                <TabsTrigger value='suggestions'>⚡️</TabsTrigger>
                <TabsTrigger value='eyeDropper'>
                  <PipetteIcon className='h-4 w-4' />
                </TabsTrigger>
              </TabsList>
              <TabsContent value='colorPicker'>
                <ChromePicker
                  color={currentColor}
                  onChange={(color) => handleAttributeChange(attribute, color.hex)}
                />
              </TabsContent>
              <TabsContent value='suggestions'>
                <div className='flex flex-wrap gap-1 mt-2'>
                  {colors.map((color) => (
                    <div
                      key={color}
                      style={{ background: color }}
                      className="rounded-md h-6 w-6 cursor-pointer active-scale-105"
                      onClick={() => handleAttributeChange(attribute, color)}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value='eyeDropper' className='flex items-center justify-center h-48'>
                <Button onClick={openEyeDropper} className='gap-2'>
                  <PipetteIcon className='h-4 w-4' />
                  Pick a color
                </Button>
              </TabsContent>
            </Tabs> 
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ColorPicker;