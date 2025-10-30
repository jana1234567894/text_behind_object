'use client';

import React, { useEffect, useRef } from 'react';
import { filters, applyFilter } from '@/lib/filters';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface FilterEditorProps {
  image: HTMLImageElement | null;
  onFilterChange: (filterName: string) => void;
  selectedFilter: string;
  applyToFullImage: boolean;
  onApplyToFullImageChange: (checked: boolean) => void;
}

const FilterEditor: React.FC<FilterEditorProps> = ({
  image,
  onFilterChange,
  selectedFilter,
  applyToFullImage,
  onApplyToFullImageChange,
}) => {
  return (
    <div className="w-full px-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">Select a filter to apply.</p>
        <div className="flex items-center space-x-2">
          <Switch
            id="apply-full-image"
            checked={applyToFullImage}
            onCheckedChange={onApplyToFullImageChange}
          />
          <Label htmlFor="apply-full-image" className="text-sm">
            Apply to Full Image
          </Label>
        </div>
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 pb-4">
          {filters.map((filter) => (
            <FilterPreview
              key={filter.name}
              image={image}
              filterName={filter.name}
              label={filter.label}
              isSelected={selectedFilter === filter.name}
              onClick={() => onFilterChange(filter.name)}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

interface FilterPreviewProps {
  image: HTMLImageElement | null;
  filterName: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

const FilterPreview: React.FC<FilterPreviewProps> = ({
  image,
  filterName,
  label,
  isSelected,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (image && canvasRef.current) {
      applyFilter(canvasRef.current, image, filterName);
    }
  }, [image, filterName]);

  return (
    <div
      className={cn(
        'flex flex-col items-center space-y-2 cursor-pointer group',
        isSelected && 'text-blue-500'
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          'w-24 h-24 rounded-md overflow-hidden border-2 border-transparent group-hover:border-gray-400 transition-all',
          isSelected ? 'border-blue-500' : 'border-gray-200'
        )}
      >
        <canvas ref={canvasRef} className="w-full h-full object-cover" />
      </div>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
};

export default FilterEditor;
