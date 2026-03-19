import { create } from "zustand";

const defaultRoom = {
    width: 3600,
    height: 2360,
    depth: 600,
};

const defaultEditorData = {
    installType: "both-wall",
    dropType: "none",
    columnCount: 6,

    surroundType: "full",
    leftFrame: 42,
    rightFrame: 42,
    topFrame: 30,

    placementType: "floor",
    baseHeight: 65,
    floorFinish: false,

    doorMode: "remove",
    doorOpenState: "close",
    doorApplyAll: false,
    doorTopGap: 1.5,
    doorBottomGap: 25,

    viewDirection: "front",

    modules: [],
};

export const useProjectEditorStore = create((set, get) => ({
    project: null,
    design: null,
    room: defaultRoom,
    editorData: defaultEditorData,

    viewMode: "2d",
    selectedSlotIndex: null,
    selectedModule: null,
    selectedCategory: "기본장",
    selectedSubType: "전체",
    placementMode: "slot",

    setProject: (project) => set({ project }),

    setDesign: (design) =>
        set({
            design,
            room: {
                width: design?.room?.width ?? 3600,
                height: design?.room?.height ?? 2360,
                depth: design?.room?.depth ?? 600,
            },
            editorData: {
                ...defaultEditorData,
                ...(design?.editorData || {}),
                modules: Array.isArray(design?.editorData?.modules)
                    ? design.editorData.modules
                    : [],
            },
        }),

    setRoomField: (field, value) =>
        set((state) => ({
            room: {
                ...state.room,
                [field]: value,
            },
        })),

    setEditorField: (field, value) =>
        set((state) => ({
            editorData: {
                ...state.editorData,
                [field]: value,
            },
        })),

    setViewMode: (viewMode) => set({ viewMode }),
    setSelectedSlotIndex: (selectedSlotIndex) => set({ selectedSlotIndex }),
    setSelectedModule: (selectedModule) => set({ selectedModule }),
    setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
    setSelectedSubType: (selectedSubType) => set({ selectedSubType }),
    setPlacementMode: (placementMode) => set({ placementMode }),

    placeModuleInSlot: (slotIndex) => {
        const { selectedModule, editorData } = get();
        if (!selectedModule) return;

        const nextModules = [...editorData.modules];
        const existingIndex = nextModules.findIndex((item) => item.slotIndex === slotIndex);

        const placedItem = {
            id: existingIndex >= 0 ? nextModules[existingIndex].id : `placed-${Date.now()}`,
            moduleId: selectedModule.id,
            moduleName: selectedModule.name,
            slotIndex,
            category: selectedModule.category,
            subType: selectedModule.subType,
        };

        if (existingIndex >= 0) {
            nextModules[existingIndex] = placedItem;
        } else {
            nextModules.push(placedItem);
        }

        set((state) => ({
            editorData: {
                ...state.editorData,
                modules: nextModules,
            },
            selectedSlotIndex: slotIndex,
        }));
    },

    removeModuleFromSlot: (slotIndex) =>
        set((state) => ({
            editorData: {
                ...state.editorData,
                modules: state.editorData.modules.filter((item) => item.slotIndex !== slotIndex),
            },
            selectedSlotIndex:
                state.selectedSlotIndex === slotIndex ? null : state.selectedSlotIndex,
        })),
}));