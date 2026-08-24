import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DiagramElement, Scene, AppState } from './types';

interface DiagramStore extends AppState {
  // Scene management
  addScene: (name: string) => void;
  deleteScene: (id: string) => void;
  updateScene: (id: string, updates: Partial<Scene>) => void;
  setCurrentScene: (id: string) => void;
  duplicateScene: (id: string) => void;

  // Element management
  addElement: (element: Omit<DiagramElement, 'id'>) => void;
  updateElement: (id: string, updates: Partial<DiagramElement>) => void;
  deleteElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  duplicateElement: (id: string) => void;

  // Canvas settings
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
  setCanvasSize: (width: number, height: number) => void;
  setDrawingMode: (mode: 'select' | 'cad-rectangle' | 'cad-line' | 'measurement') => void;
  setMeasurementUnit: (unit: 'ft' | 'm' | 'in') => void;
  toggleDarkMode: () => void;
  setCanvasBackground: (color: string) => void;
  setCanvasBackgroundImage: (image: string | undefined) => void;

  // Utility
  getCurrentScene: () => Scene | null;
  exportScene: () => string;
  importScene: (data: string) => void;
}

const createDefaultScene = (): Scene => ({
  id: crypto.randomUUID(),
  name: 'Scene 1',
  elements: [],
  notes: '',
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

export const useDiagramStore = create<DiagramStore>()(
  persist(
    (set, get) => ({
      // Initial state
      scenes: [createDefaultScene()],
      currentSceneId: null,
      selectedElementId: null,
      gridEnabled: true,
      snapToGrid: true,
      gridSize: 20,
      canvasWidth: 1200,
      canvasHeight: 800,
      drawingMode: 'select',
      measurementUnit: 'ft',
      darkMode: false,
      canvasBackground: '#ffffff',
      canvasBackgroundImage: undefined,

      // Scene management
      addScene: (name: string) => {
        const newScene: Scene = {
          id: crypto.randomUUID(),
          name,
          elements: [],
          notes: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          scenes: [...state.scenes, newScene],
          currentSceneId: newScene.id,
        }));
      },

      deleteScene: (id: string) => {
        set((state) => {
          const filtered = state.scenes.filter((s) => s.id !== id);
          const newCurrentId =
            state.currentSceneId === id
              ? filtered[0]?.id || null
              : state.currentSceneId;
          return {
            scenes: filtered.length > 0 ? filtered : [createDefaultScene()],
            currentSceneId: newCurrentId,
          };
        });
      },

      updateScene: (id: string, updates: Partial<Scene>) => {
        set((state) => ({
          scenes: state.scenes.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s
          ),
        }));
      },

      setCurrentScene: (id: string) => {
        set({ currentSceneId: id, selectedElementId: null });
      },

      duplicateScene: (id: string) => {
        const scene = get().scenes.find((s) => s.id === id);
        if (!scene) return;

        const newScene: Scene = {
          ...scene,
          id: crypto.randomUUID(),
          name: `${scene.name} (Copy)`,
          elements: scene.elements.map((el) => ({
            ...el,
            id: crypto.randomUUID(),
          })),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          scenes: [...state.scenes, newScene],
          currentSceneId: newScene.id,
        }));
      },

      // Element management
      addElement: (element: Omit<DiagramElement, 'id'>) => {
        const currentSceneId = get().currentSceneId;
        if (!currentSceneId) return;

        const newElement: DiagramElement = {
          ...element,
          id: crypto.randomUUID(),
        };

        set((state) => ({
          scenes: state.scenes.map((s) =>
            s.id === currentSceneId
              ? {
                  ...s,
                  elements: [...s.elements, newElement],
                  updatedAt: Date.now(),
                }
              : s
          ),
          selectedElementId: newElement.id,
        }));
      },

      updateElement: (id: string, updates: Partial<DiagramElement>) => {
        const currentSceneId = get().currentSceneId;
        if (!currentSceneId) return;

        set((state) => ({
          scenes: state.scenes.map((s) =>
            s.id === currentSceneId
              ? {
                  ...s,
                  elements: s.elements.map((el) =>
                    el.id === id ? { ...el, ...updates } : el
                  ),
                  updatedAt: Date.now(),
                }
              : s
          ),
        }));
      },

      deleteElement: (id: string) => {
        const currentSceneId = get().currentSceneId;
        if (!currentSceneId) return;

        set((state) => ({
          scenes: state.scenes.map((s) =>
            s.id === currentSceneId
              ? {
                  ...s,
                  elements: s.elements.filter((el) => el.id !== id),
                  updatedAt: Date.now(),
                }
              : s
          ),
          selectedElementId:
            state.selectedElementId === id ? null : state.selectedElementId,
        }));
      },

      selectElement: (id: string | null) => {
        set({ selectedElementId: id });
      },

      duplicateElement: (id: string) => {
        const currentSceneId = get().currentSceneId;
        if (!currentSceneId) return;

        const scene = get().scenes.find((s) => s.id === currentSceneId);
        const element = scene?.elements.find((el) => el.id === id);
        if (!element) return;

        const newElement: DiagramElement = {
          ...element,
          id: crypto.randomUUID(),
          x: element.x + 20,
          y: element.y + 20,
        };

        set((state) => ({
          scenes: state.scenes.map((s) =>
            s.id === currentSceneId
              ? {
                  ...s,
                  elements: [...s.elements, newElement],
                  updatedAt: Date.now(),
                }
              : s
          ),
          selectedElementId: newElement.id,
        }));
      },

      // Canvas settings
      toggleGrid: () => {
        set((state) => ({ gridEnabled: !state.gridEnabled }));
      },

      toggleSnapToGrid: () => {
        set((state) => ({ snapToGrid: !state.snapToGrid }));
      },

      setGridSize: (size: number) => {
        set({ gridSize: size });
      },

      setCanvasSize: (width: number, height: number) => {
        set({ canvasWidth: width, canvasHeight: height });
      },

      setDrawingMode: (mode: 'select' | 'cad-rectangle' | 'cad-line' | 'measurement') => {
        set({ drawingMode: mode, selectedElementId: null });
      },

      setMeasurementUnit: (unit: 'ft' | 'm' | 'in') => {
        set({ measurementUnit: unit });
      },

      toggleDarkMode: () => {
        set((state) => ({ darkMode: !state.darkMode }));
      },

      setCanvasBackground: (color: string) => {
        set({ canvasBackground: color });
      },

      setCanvasBackgroundImage: (image: string | undefined) => {
        set({ canvasBackgroundImage: image });
      },

      // Utility
      getCurrentScene: () => {
        const state = get();
        return (
          state.scenes.find((s) => s.id === state.currentSceneId) || null
        );
      },

      exportScene: () => {
        const scene = get().getCurrentScene();
        if (!scene) return '';
        return JSON.stringify(scene, null, 2);
      },

      importScene: (data: string) => {
        try {
          const scene: Scene = JSON.parse(data);
          scene.id = crypto.randomUUID();
          scene.elements = scene.elements.map((el) => ({
            ...el,
            id: crypto.randomUUID(),
          }));
          set((state) => ({
            scenes: [...state.scenes, scene],
            currentSceneId: scene.id,
          }));
        } catch (error) {
          console.error('Failed to import scene:', error);
        }
      },
    }),
    {
      name: 'film-diagram-storage',
    }
  )
);
