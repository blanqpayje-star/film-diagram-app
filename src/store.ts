import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DiagramElement, Scene, AppState } from './types';

const MAX_HISTORY = 50;

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

  // Copy/Paste
  copyElement: (id: string) => void;
  pasteElement: () => void;
  copiedElement: DiagramElement | null;
  setCopiedElement: (element: DiagramElement | null) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  history: { scenes: Scene[]; currentSceneId: string | null; selectedElementId: string | null }[];
  historyIndex: number;
  saveToHistory: () => void;

  // Canvas settings
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;
  setGridColor: (color: string) => void;
  setGridOpacity: (opacity: number) => void;
  setCanvasSize: (width: number, height: number) => void;
  setDrawingMode: (mode: 'select' | 'cad-rectangle' | 'cad-line' | 'measurement' | 'text') => void;
  setMeasurementUnit: (unit: 'ft' | 'm' | 'in') => void;
  toggleDarkMode: () => void;
  setCanvasBackground: (color: string) => void;
  setCanvasBackgroundImage: (image: string | undefined) => void;

  // Panel settings
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  leftPanelCollapsed: boolean;
  rightPanelCollapsed: boolean;

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

const cloneState = (state: DiagramStore) => ({
  scenes: JSON.parse(JSON.stringify(state.scenes)),
  currentSceneId: state.currentSceneId,
  selectedElementId: state.selectedElementId,
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
      gridColor: undefined, // falls back to theme default
      gridOpacity: 1,
      canvasWidth: 1200,
      canvasHeight: 800,
      drawingMode: 'select',
      measurementUnit: 'ft',
      darkMode: false,
      canvasBackground: '#F5F1E7',
      canvasBackgroundImage: undefined,

      // Panel state
      leftPanelCollapsed: false,
      rightPanelCollapsed: false,

      // Copy/Paste
      copiedElement: null,

      // Undo/Redo
      history: [],
      historyIndex: -1,
      canUndo: false,
      canRedo: false,

      // Scene management
      addScene: (name: string) => {
        get().saveToHistory();
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
        get().saveToHistory();
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
        get().saveToHistory();
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
        get().saveToHistory();
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
        get().saveToHistory();
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
        get().saveToHistory();
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
        get().saveToHistory();
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

      // Copy/Paste
      copyElement: (id: string) => {
        const scene = get().getCurrentScene();
        const element = scene?.elements.find((el) => el.id === id);
        if (element) {
          set({ copiedElement: { ...element, id: crypto.randomUUID() } });
        }
      },

      pasteElement: () => {
        const { copiedElement, currentSceneId } = get();
        if (!copiedElement || !currentSceneId) return;

        get().saveToHistory();

        const newElement: DiagramElement = {
          ...copiedElement,
          id: crypto.randomUUID(),
          x: copiedElement.x + 20,
          y: copiedElement.y + 20,
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

      setCopiedElement: (element: DiagramElement | null) => {
        set({ copiedElement: element });
      },

      // Undo/Redo
      saveToHistory: () => {
        const { scenes, currentSceneId, selectedElementId, history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(cloneState({ scenes, currentSceneId, selectedElementId } as DiagramStore));
        if (newHistory.length > MAX_HISTORY) {
          newHistory.shift();
        }
        set({
          history: newHistory,
          historyIndex: newHistory.length - 1,
          canUndo: newHistory.length > 1,
          canRedo: false,
        });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex <= 0) return;

        const newIndex = historyIndex - 1;
        const prevState = history[newIndex];
        set({
          scenes: prevState.scenes,
          currentSceneId: prevState.currentSceneId,
          selectedElementId: prevState.selectedElementId,
          historyIndex: newIndex,
          canUndo: newIndex > 0,
          canRedo: true,
        });
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) return;

        const newIndex = historyIndex + 1;
        const nextState = history[newIndex];
        set({
          scenes: nextState.scenes,
          currentSceneId: nextState.currentSceneId,
          selectedElementId: nextState.selectedElementId,
          historyIndex: newIndex,
          canUndo: true,
          canRedo: newIndex < history.length - 1,
        });
      },

      // Canvas settings
      toggleGrid: () => {
        get().saveToHistory();
        set((state) => ({ gridEnabled: !state.gridEnabled }));
      },

      toggleSnapToGrid: () => {
        get().saveToHistory();
        set((state) => ({ snapToGrid: !state.snapToGrid }));
      },

      setGridSize: (size: number) => {
        get().saveToHistory();
        set({ gridSize: size });
      },

      setGridColor: (color: string) => {
        get().saveToHistory();
        set({ gridColor: color });
      },

      setGridOpacity: (opacity: number) => {
        get().saveToHistory();
        set({ gridOpacity: Math.min(1, Math.max(0, opacity)) });
      },

      setCanvasSize: (width: number, height: number) => {
        get().saveToHistory();
        set({ canvasWidth: width, canvasHeight: height });
      },

      setDrawingMode: (mode: 'select' | 'cad-rectangle' | 'cad-line' | 'measurement' | 'text') => {
        set({ drawingMode: mode, selectedElementId: null });
      },

      setMeasurementUnit: (unit: 'ft' | 'm' | 'in') => {
        get().saveToHistory();
        set({ measurementUnit: unit });
      },

      toggleDarkMode: () => {
        set((state) => ({ darkMode: !state.darkMode }));
      },

      setCanvasBackground: (color: string) => {
        get().saveToHistory();
        set({ canvasBackground: color });
      },

      setCanvasBackgroundImage: (image: string | undefined) => {
        get().saveToHistory();
        set({ canvasBackgroundImage: image });
      },

      // Panel settings
      toggleLeftPanel: () => {
        set((state) => ({ leftPanelCollapsed: !state.leftPanelCollapsed }));
      },

      toggleRightPanel: () => {
        set((state) => ({ rightPanelCollapsed: !state.rightPanelCollapsed }));
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
        get().saveToHistory();
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
      // Don't persist history to localStorage
      partialize: (state) => ({
        scenes: state.scenes,
        currentSceneId: state.currentSceneId,
        selectedElementId: state.selectedElementId,
        gridEnabled: state.gridEnabled,
        snapToGrid: state.snapToGrid,
        gridSize: state.gridSize,
        gridColor: state.gridColor,
        gridOpacity: state.gridOpacity,
        canvasWidth: state.canvasWidth,
        canvasHeight: state.canvasHeight,
        drawingMode: state.drawingMode,
        measurementUnit: state.measurementUnit,
        darkMode: state.darkMode,
        canvasBackground: state.canvasBackground,
        canvasBackgroundImage: state.canvasBackgroundImage,
        copiedElement: state.copiedElement,
      }),
    }
  )
);
