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
  moveLayerUp: (id: string) => void;
  moveLayerDown: (id: string) => void;
  selectedFilter: string;
  setSelectedFilter: (filterName: string) => void;
  applyToFullImage: boolean;
  setApplyToFullImage: (apply: boolean) => void;
  filterIntensity: number;
  setFilterIntensity: (intensity: number) => void;
  uploadedImageElement: HTMLImageElement | null;
  setUploadedImageElement: (img: HTMLImageElement | null) => void;
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

  // Filter state
  const [selectedFilter, setSelectedFilter] = useState<string>('original');
  const [applyToFullImage, setApplyToFullImage] = useState<boolean>(true);
  const [filterIntensity, setFilterIntensity] = useState<number>(100); // 0-100%
  const [uploadedImageElement, setUploadedImageElement] = useState<HTMLImageElement | null>(null);

  const addNewTextSet = () => {
    const newId = `text-layer-${Math.random().toString(36).substr(2, 9)}`;
    setLayers(prev => {
      // Find the subject layer index to insert before it
      const subjectIndex = prev.findIndex(l => l.type === 'subject');
      const subjectLayer = prev.find(l => l.type === 'subject');
      const newOrder = subjectLayer ? subjectLayer.order : prev.length;

      // Create new text layer with the calculated order
      const newTextLayer: TextLayer = {
        id: newId,
        name: 'Edit',
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

      // Insert new layer before Subject Only
      if (subjectIndex !== -1) {
        const result = [...updatedLayers];
        result.splice(subjectIndex, 0, newTextLayer);
        return result;
      }

      // Fallback: append if no subject layer found
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
      // Find the subject layer index to insert before it
      const subjectIndex = prev.findIndex(l => l.type === 'subject');
      const subjectLayer = prev.find(l => l.type === 'subject');
      const newOrder = subjectLayer ? subjectLayer.order : prev.length;

      // Create duplicated text layer with the calculated order
      const newLayer: TextLayer = { ...textSet, id: newId, order: newOrder };

      // Increment order of all layers at or after the insertion point
      const updatedLayers = prev.map(layer =>
        layer.order >= newOrder ? { ...layer, order: layer.order + 1 } : layer
      );

      // Insert new layer before Subject Only
      if (subjectIndex !== -1) {
        const result = [...updatedLayers];
        result.splice(subjectIndex, 0, newLayer);
        return result;
      }

      // Fallback: append if no subject layer found
      return [...updatedLayers, newLayer];
    });
  };

  const removeTextSet = (id: string) => {
    setLayers(prev => prev.filter(set => set.id !== id));
  };

  const toggleVisibility = (id: string) => {
    setLayers(prev => prev.map(layer =>
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  // Move layer up (increase order, move forward in z-index)
  const moveLayerUp = (id: string) => {
    setLayers(prev => {
      const textLayers = prev.filter(l => l.type === 'text').sort((a, b) => a.order - b.order);
      const currentIndex = textLayers.findIndex(l => l.id === id);

      // Can't move up if already at top or not found
      if (currentIndex === -1 || currentIndex === textLayers.length - 1) {
        return prev;
      }

      // Get the two layers to swap
      const currentLayer = textLayers[currentIndex];
      const nextLayer = textLayers[currentIndex + 1];

      // Swap their order values
      return prev.map(layer => {
        if (layer.id === currentLayer.id) {
          return { ...layer, order: nextLayer.order };
        } else if (layer.id === nextLayer.id) {
          return { ...layer, order: currentLayer.order };
        }
        return layer;
      });
    });
  };

  // Move layer down (decrease order, move backward in z-index)
  const moveLayerDown = (id: string) => {
    setLayers(prev => {
      const textLayers = prev.filter(l => l.type === 'text').sort((a, b) => a.order - b.order);
      const currentIndex = textLayers.findIndex(l => l.id === id);

      // Can't move down if already at bottom or not found
      if (currentIndex === -1 || currentIndex === 0) {
        return prev;
      }

      // Get the two layers to swap
      const currentLayer = textLayers[currentIndex];
      const prevLayer = textLayers[currentIndex - 1];

      // Swap their order values
      return prev.map(layer => {
        if (layer.id === currentLayer.id) {
          return { ...layer, order: prevLayer.order };
        } else if (layer.id === prevLayer.id) {
          return { ...layer, order: currentLayer.order };
        }
        return layer;
      });
    });
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
        toggleVisibility,
        moveLayerUp,
        moveLayerDown,
        selectedFilter,
        setSelectedFilter,
        applyToFullImage,
        setApplyToFullImage,
        filterIntensity,
        setFilterIntensity,
        uploadedImageElement,
        setUploadedImageElement
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
