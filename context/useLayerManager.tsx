'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of a layer
export type LayerType = 'full' | 'text' | 'subject';

interface BaseLayer {
    id: string;
    name: string;
    type: LayerType;
    visible: boolean;
    locked: boolean;
    order: number;
}

export interface TextLayer extends BaseLayer {
    type: 'text';
    text: string;
    fontFamily: string;
    top: number;
    left: number;
    color: string;
    fontSize: number;
    fontWeight: number;
    opacity: number;
    shadowColor: string;
    shadowSize: number;
    rotation: number;
    tiltX: number;
    tiltY: number;
    letterSpacing: number;
}

export interface FullLayer extends BaseLayer {
    type: 'full';
}

export interface SubjectLayer extends BaseLayer {
    type: 'subject';
}

export type Layer = TextLayer | FullLayer | SubjectLayer;


// Define the context type
interface LayerManagerContextType {
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  activeLayer: string | null;
  setActiveLayer: (id: string | null) => void;
  activeTextLayer: TextLayer | undefined;
  addNewTextSet: () => void;
  handleAttributeChange: (id: string, attribute: string, value: any) => void;
  updateLayer: (id: string, data: Partial<Layer>) => void;
  duplicateTextSet: (textSet: any) => void;
  removeTextSet: (id: string) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
}

// Create the context
const LayerManagerContext = createContext<LayerManagerContextType | undefined>(undefined);

// Create the provider component
export const LayerManagerProvider = ({ children }: { children: ReactNode }) => {
  const [layers, setLayers] = useState<Layer[]>([
    {
        id: 'full-layer',
        name: 'Full Image',
        type: 'full',
        visible: true,
        locked: false,
        order: 0,
    },
    {
        id: 'text-layer-1',
        name: 'New Text',
        type: 'text',
        visible: true,
        locked: false,
        order: 1,
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
    },
    {
        id: 'subject-layer',
        name: 'Subject Only',
        type: 'subject',
        visible: true,
        locked: false,
        order: 2,
    }
  ]);
  const [activeLayer, setActiveLayer] = useState<string | null>('text-layer-1');

  const activeTextLayer = layers.find(l => l.id === activeLayer && l.type === 'text') as TextLayer | undefined;

  const addNewTextSet = () => {
    const newId = `text-layer-${Math.random().toString(36).substr(2, 9)}`;
    setLayers(prev => {
      const newTextLayer: TextLayer = {
          id: newId,
          name: 'New Text',
          type: 'text',
          visible: true,
          locked: false,
          order: prev.length,
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
      };
      return [...prev, newTextLayer];
    });
  };

  const handleAttributeChange = (id: string, attribute: string, value: any) => {
    setLayers(prev => prev.map(layer => 
        layer.id === id ? { ...layer, [attribute]: value } : layer
    ) as Layer[]);
  };

  const updateLayer = (id: string, data: Partial<Layer>) => {
    setLayers(prev =>
      prev.map(layer => (layer.id === id ? { ...layer, ...data } : layer)) as Layer[]
    );
  };

  const duplicateTextSet = (textSet: TextLayer) => {
    const newId = `text-layer-${Math.random().toString(36).substr(2, 9)}`;
    const newLayer: TextLayer = { ...textSet, id: newId, order: layers.length };
    setLayers(prev => [...prev, newLayer]);
  };

  const removeTextSet = (id: string) => {
    setLayers(prev => prev.filter(set => set.id !== id));
  };

  const toggleVisibility = (id: string) => {
    setLayers(prev => prev.map(l => (l.id === id ? { ...l, visible: !l.visible } : l)) as Layer[]);
  };

  const toggleLock = (id: string) => {
    setLayers(prev => prev.map(l => (l.id === id ? { ...l, locked: !l.locked } : l)) as Layer[]);
  };

  return (
    <LayerManagerContext.Provider value={{ layers, setLayers, activeLayer, setActiveLayer, activeTextLayer, addNewTextSet, handleAttributeChange, updateLayer, duplicateTextSet, removeTextSet, toggleVisibility, toggleLock }}>
      {children}
    </LayerManagerContext.Provider>
  );
};

// Create the custom hook
export const useLayerManager = () => {
  const context = useContext(LayerManagerContext);
  if (context === undefined) {
    throw new Error('useLayerManager must be used within a LayerManagerProvider');
  }
  return context;
};
