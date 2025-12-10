'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of a layer
export type LayerType = 'full' | 'text' | 'subject';

interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
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
      order: 0,
    },
    {
      id: 'text-layer-1',
      name: 'New Text',
      type: 'text',
      visible: true,
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
      order: 2,
    }
  ]);

  const [activeLayer, setActiveLayer] = useState<string | null>('text-layer-1');
  const activeTextLayer = layers.find(l => l.id === activeLayer && l.type === 'text') as TextLayer | undefined;

  const addNewTextSet = () => {
    const newId = `text-layer-${Math.random().toString(36).substr(2, 9)}`;
    setLayers(prev => {
      // Find the subject layer to determine where to insert the new text
      const subjectLayer = prev.find(l => l.type === 'subject');
      const newOrder = subjectLayer ? subjectLayer.order : prev.length;

      // Create new text layer with the calculated order
      const newTextLayer: TextLayer = {
        id: newId,
        name: 'New Text',
        type: 'text',
        visible: true,
        order: newOrder,
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

      // Increment order of all layers at or after the insertion point
      const updatedLayers = prev.map(layer =>
        layer.order >= newOrder ? { ...layer, order: layer.order + 1 } : layer
      );

      return [...updatedLayers, newTextLayer];
    });
  };

  const handleAttributeChange = (id: string, attribute: string, value: any) => {
    setLayers(prev =>
      prev.map(layer => {
        if (layer.id === id) {
          const newLayer = { ...layer, [attribute]: value };
          if (attribute === 'text') {
            newLayer.name = value || 'New Text';
          }
          return newLayer;
        }
        return layer;
      }) as Layer[]
    );
  };

  const updateLayer = (id: string, data: Partial<Layer>) => {
    setLayers(prev =>
      prev.map(layer => (layer.id === id ? { ...layer, ...data } : layer)) as Layer[]
    );
  };

  const duplicateTextSet = (textSet: TextLayer) => {
    const newId = `text-layer-${Math.random().toString(36).substr(2, 9)}`;
    setLayers(prev => {
      // Find the subject layer to determine where to insert the duplicated text
      const subjectLayer = prev.find(l => l.type === 'subject');
      const newOrder = subjectLayer ? subjectLayer.order : prev.length;

      // Create duplicated text layer with the calculated order
      const newLayer: TextLayer = { ...textSet, id: newId, order: newOrder };

      // Increment order of all layers at or after the insertion point
      const updatedLayers = prev.map(layer =>
        layer.order >= newOrder ? { ...layer, order: layer.order + 1 } : layer
      );

      return [...updatedLayers, newLayer];
    });
  };

  const removeTextSet = (id: string) => {
    setLayers(prev => prev.filter(set => set.id !== id));
  };

  // ✅ Clean new visibility toggle
  const toggleVisibility = (id: string) => {
    setLayers(prev =>
      prev.map(layer =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      ) as Layer[]
    );
  };

  return (
    <LayerManagerContext.Provider
      value={{
        layers,
        setLayers,
        activeLayer,
        setActiveLayer,
        activeTextLayer,
        addNewTextSet,
        handleAttributeChange,
        updateLayer,
        duplicateTextSet,
        removeTextSet,
        toggleVisibility
      }}
    >
      {children}
    </LayerManagerContext.Provider>
  );
};

// Custom hook
export const useLayerManager = () => {
  const context = useContext(LayerManagerContext);
  if (context === undefined) {
    throw new Error('useLayerManager must be used within a LayerManagerProvider');
  }
  return context;
};
