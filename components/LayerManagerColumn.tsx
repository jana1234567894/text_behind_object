'use client';

import React from 'react';
import { useLayerManager, Layer, TextLayer } from '@/context/useLayerManager';
import { Button } from '@/components/ui/button';
import {
  PlusIcon,
  TextIcon,
  ImageIcon,
  PersonIcon,
} from '@radix-ui/react-icons';
import { EyeIcon, EyeOffIcon } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TextCustomizer from '@/components/editor/text-customizer';
import { Accordion } from '@/components/ui/accordion';

const LayerIcon = ({ type }: { type: Layer['type'] }) => {
  switch (type) {
    case 'full':
      return <ImageIcon className="h-5 w-5 text-slate-500" />;
    case 'text':
      return <TextIcon className="h-5 w-5 text-slate-500" />;
    case 'subject':
      return <PersonIcon className="h-5 w-5 text-slate-500" />;
    default:
      return null;
  }
};

function SortableLayerItem({ layer }: { layer: Layer }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: layer.id });

  const { activeLayer, setActiveLayer, toggleVisibility } = useLayerManager();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={() => setActiveLayer(layer.id)}
      className={`flex items-center p-3 border-b border-slate-200 dark:border-slate-800
    ${isDragging ? 'bg-blue-100 dark:bg-blue-900/50 shadow-lg' : ''}
    ${activeLayer === layer.id ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
    transition-colors duration-150`}
    >
      {/* Drag handle zone only on the icon */}
      <div
        {...listeners}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center cursor-grab active:cursor-grabbing"
      >
        <LayerIcon type={layer.type} />
      </div>

      {/* The rest of the row (non-draggable) */}
      <span className="flex-1 truncate font-medium text-sm ml-2">
        {layer.name || (layer.type === 'text' ? (layer as TextLayer).text : '') || "New Text"}
      </span>

      {/* Eye button as before */}
      <div
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          toggleVisibility(layer.id);
        }}
        className="ml-auto p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
      >
        {layer.visible ? <EyeIcon /> : <EyeOffIcon className="opacity-50" />}
      </div>
    </div>
  );
}

export const LayerManagerColumn = () => {
  const { layers, setLayers, activeLayer, setActiveLayer, activeTextLayer, addNewTextSet, handleAttributeChange, duplicateTextSet, removeTextSet } = useLayerManager();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // drag starts only after moving 10px
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLayers((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({ ...item, order: index }));
      });
    }
  };

  const sortedLayers = layers.slice().sort((a, b) => b.order - a.order);
  const textLayers = layers.filter(layer => layer.type === 'text') as TextLayer[];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Layers</h3>
        <Button onClick={addNewTextSet} size="sm" variant="outline">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Text
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedLayers.map(l => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div>
              {sortedLayers.map(layer => (
                <SortableLayerItem key={layer.id} layer={layer} />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="mt-4 border-t pt-2 p-4">
          <h3 className="text-sm font-medium mb-1">Text Layers</h3>
          <div className="flex flex-col gap-1">
            {textLayers.map(layer => (
              <Button
                key={layer.id}
                variant={activeLayer === layer.id ? 'secondary' : 'ghost'}
                onClick={() => setActiveLayer(layer.id)}
                className="justify-start text-sm"
              >
                {layer.name || 'Untitled Text'}
              </Button>
            ))}
          </div>
        </div>

        {activeTextLayer && (
          <div className="mt-2 p-4">
            <Accordion type="single" collapsible defaultValue={`item-${activeTextLayer.id}`}>
              <TextCustomizer
                textSet={activeTextLayer}
                handleAttributeChange={(id, attribute, value) => handleAttributeChange(activeTextLayer.id, attribute, value)}
                removeTextSet={() => removeTextSet(activeTextLayer.id)}
                duplicateTextSet={() => duplicateTextSet(activeTextLayer)}
                userId="123"
              />
            </Accordion>
          </div>
        )}
      </div>
    </div>
  );
};
