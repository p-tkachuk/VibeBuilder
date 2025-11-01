import { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, type Node, type Edge, type NodeChange, type Connection, type NodeTypes, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BuildingMenu } from './components/BuildingMenu';
import { BuildingNode } from './components/BuildingNode';
import { ResourceNode } from './components/ResourceNode';
import { MapBorderNode } from './components/MapBorderNode';
import { TerrainOverlay } from './components/TerrainOverlay';
import { BuildingPlacementHandler } from './components/BuildingPlacementHandler';
import { ResourcePanel } from './components/ResourcePanel';
import { Minimap } from './components/Minimap';
import { GameMenu } from './components/GameMenu';
import { SaveMenu } from './components/SaveMenu';
import { LoadMenu } from './components/LoadMenu';
import { PauseModal } from './components/PauseModal';
import { BuildingType } from './types/buildings';
import { Toast } from './components/Toast';
import { useResourceFields } from './hooks/useResourceFields';
import { useBuildingPlacement } from './hooks/useBuildingPlacement';
import { useKeyboardActions } from './hooks/useKeyboardActions';
import type { MenuState } from './hooks/useKeyboardActions';
import { COLORS, EDGE_OPTIONS } from './constants/game.constants';
import { GAME_CONFIG } from './config/game.config';
import { ResourceInventoryService } from './services/ResourceInventoryService';
import { NodeValidationService } from './services/NodeValidationService';
import { TickProcessor } from './simulation/TickProcessor';
import { SaveLoadService } from './services/SaveLoadService';

/**
 * ViewportInitializer component - sets initial camera position to map center
 */
const ViewportInitializer: React.FC = () => {
  const { setViewport } = useReactFlow();

  useEffect(() => {
    // Center the viewport on the map center
    setViewport({
      x: -GAME_CONFIG.mapWidth / 2 + window.innerWidth / 2,
      y: -GAME_CONFIG.mapHeight / 2 + window.innerHeight / 2,
      zoom: 1,
    });
  }, [setViewport]);

  return null;
};

const initialNodes: Node[] = [
  {
    id: 'map-border',
    type: 'mapBorder',
    position: { x: 0, y: 0 },
    data: {
      mapWidth: GAME_CONFIG.mapWidth,
      mapHeight: GAME_CONFIG.mapHeight,
    },
    draggable: false,
    selectable: false,
    deletable: false,
    style: { pointerEvents: 'none' },
  },
];
const initialEdges: Edge[] = [];

const nodeTypes = {
  building: BuildingNode,
  resource: ResourceNode,
  mapBorder: MapBorderNode,
};

/**
 * Main App component - orchestrates the entire game
 * Follows Single Responsibility Principle - only handles top-level state and coordination
 * Dependency Inversion Principle - depends on abstractions (hooks and services) not concretions
 */
export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [resourceInventory] = useState(() => new ResourceInventoryService());
  const [inventoryChangeCount, setInventoryChangeCount] = useState(0);
  const [menuState, setMenuState] = useState<MenuState>('closed');
  const [loadedResourceFields, setLoadedResourceFields] = useState<any[] | undefined>(undefined);
  const [isPaused, setIsPaused] = useState(false);

  // IMPORTANT: React hooks must be called at the component level, never inside callbacks or conditional blocks
  // This follows the Rules of Hooks - hooks can only be called at the top level of React components
  // We get the viewport functions here and use them in callbacks below
  const { getViewport, setViewport } = useReactFlow();

  // Use custom hooks for separation of concerns
  const { resourceNodes, resourceFields } = useResourceFields(loadedResourceFields);
  const {
    selectedBuildingType,
    handleBuildingSelect,
    clearSelection,
  } = useBuildingPlacement();
  const handleDeleteSelected = useCallback(() => {
    setNodes((nds) => {
      const deletedNodeIds = nds.filter((n) => n.selected).map((n) => n.id);
      // Count storage buildings being deleted
      const deletedStorageBuildings = nds.filter((n) => n.selected && n.type === 'building' && n.data.buildingType === BuildingType.STORAGE);
      if (deletedStorageBuildings.length > 0) {
        // Decrease storage capacity by GAME_CONFIG.storageCapacity per deleted storage building
        resourceInventory.decreaseStorageCapacity(deletedStorageBuildings.length * GAME_CONFIG.storageCapacity);
      }
      setEdges((eds) => eds.filter((e) => !e.selected && !deletedNodeIds.includes(e.source) && !deletedNodeIds.includes(e.target)));
      return nds.filter((n) => !n.selected);
    });
  }, [setNodes, setEdges, resourceInventory]);

  // Handle keyboard actions
  useKeyboardActions(selectedBuildingType, clearSelection, handleDeleteSelected, menuState, setMenuState, isPaused, setIsPaused);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  const hideToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const allNodes = useMemo(() => [
    ...resourceNodes,
    ...nodes.map(node =>
      node.type === 'building'
        ? { ...node, data: { ...node.data, id: node.id, edges } }
        : node
    ),
  ], [resourceNodes, nodes, edges]);

  const totalResources = useMemo(() => {
    const totals: Record<string, number> = { ...resourceInventory.getInventory() };
    nodes.forEach(node => {
      if (node.type === 'building' && node.data.buildingType === BuildingType.STORAGE && node.data.inventory) {
        Object.entries(node.data.inventory).forEach(([key, value]) => {
          totals[key] = (totals[key] || 0) + value;
        });
      }
    });
    return totals;
  }, [nodes, resourceInventory, inventoryChangeCount]);

  // Building operations ticker
  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setNodes((prevNodes) => TickProcessor.processTick(prevNodes, edges, resourceFields, resourceInventory));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [edges, resourceFields, resourceInventory, isPaused]);

  const onNodesChangeWrapper = useCallback(
    (changes: NodeChange[]) => {
      const filteredChanges = NodeValidationService.processNodeChanges(
        changes,
        resourceFields,
        allNodes
      );
      onNodesChange(filteredChanges);
    },
    [resourceFields, allNodes, onNodesChange],
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const handleBuildingPlaced = useCallback((newNode: Node) => {
    setNodes((nds) => [...nds, newNode]);
    clearSelection(); // Clear selection after placement
  }, [clearSelection]);

  // Menu handlers
  const handleSaveGame = useCallback((slotIndex: number) => {
    const viewport = getViewport();
    const success = SaveLoadService.saveGame(slotIndex, nodes, edges, resourceInventory, viewport, resourceFields);
    if (success) {
      showToast(`Game saved to slot ${slotIndex + 1}`);
      setMenuState('closed');
    } else {
      showToast('Failed to save game');
    }
  }, [getViewport, nodes, edges, resourceInventory, resourceFields, showToast]);

  const handleLoadGame = useCallback((slotIndex: number) => {
    const gameState = SaveLoadService.loadGame(slotIndex);
    if (gameState) {
      // Restore resource fields first (this will update the hook)
      setLoadedResourceFields(gameState.resourceFields);

      // Restore game state
      setNodes(gameState.nodes);
      setEdges(gameState.edges);

      // Restore viewport/camera position
      setViewport(gameState.viewport);

      // Restore resource inventory
      // Clear current inventory and set new values
      const currentInventory = resourceInventory.getInventory();
      Object.keys(currentInventory).forEach(resource => {
        // This is a bit hacky, but we need to reset the inventory
        // We'll remove all resources first
        resourceInventory.removeResources({ [resource]: currentInventory[resource] });
      });

      // Add the saved resources
      Object.entries(gameState.resourceInventory.inventory).forEach(([resource, amount]) => {
        resourceInventory.addResource(resource, amount);
      });

      // Set storage capacity
      const currentCapacity = resourceInventory.getStorageCapacity();
      if (gameState.resourceInventory.storageCapacity > currentCapacity) {
        resourceInventory.increaseStorageCapacity(gameState.resourceInventory.storageCapacity - currentCapacity);
      } else if (gameState.resourceInventory.storageCapacity < currentCapacity) {
        resourceInventory.decreaseStorageCapacity(currentCapacity - gameState.resourceInventory.storageCapacity);
      }

      setInventoryChangeCount(prev => prev + 1);

      // Trigger a manual tick to ensure production works immediately after loading
      setTimeout(() => {
        setNodes((currentNodes) => TickProcessor.processTick(currentNodes, gameState.edges, gameState.resourceFields, resourceInventory));
      }, 100);

      showToast(`Game loaded from slot ${slotIndex + 1}`);
      setMenuState('closed');
    } else {
      showToast('Failed to load game');
    }
  }, [setLoadedResourceFields, setViewport, setNodes, setEdges, resourceInventory, setInventoryChangeCount, showToast]);

  // Calculate translate extent to restrict camera movement to map boundaries
  const translateExtent = useMemo(() => {
    // Allow camera center to stay within map boundaries, but permit some edge visibility
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Camera center should stay within [0, mapWidth] and [0, mapHeight]
    // Allow some padding for smooth UX while keeping center constrained
    const padding = Math.min(800, viewportWidth, viewportHeight); // Adaptive padding

    const minX = -padding; // Allow slight pan left of origin
    const minY = -padding; // Allow slight pan up of origin
    const maxX = GAME_CONFIG.mapWidth + padding; // Allow slight pan right of map
    const maxY = GAME_CONFIG.mapHeight + padding; // Allow slight pan down of map

    return [
      [minX, minY],
      [maxX, maxY],
    ] as [[number, number], [number, number]];
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '20px', left: '20px', zIndex: 10, display: 'flex', gap: '20px', alignItems: 'flex-start', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <BuildingMenu
            onBuildingSelect={handleBuildingSelect}
            selectedBuildingType={selectedBuildingType}
            resourceInventory={resourceInventory}
            nodes={allNodes}
          />
        </div>
        <div style={{ pointerEvents: 'auto' }}>
          <ResourcePanel resources={totalResources} storageCapacity={resourceInventory.getStorageCapacity()} />
        </div>
      </div>
      <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <button
            onClick={() => setIsPaused(true)}
            style={{
              padding: '0.5rem 1rem',
              background: 'linear-gradient(135deg, #3498db, #2980b9)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #2980b9, #21618c)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            ⏸️ PAUSE
          </button>
        </div>
      </div>
      <div style={{ position: 'relative', height: '100vh' }}>
        <ReactFlow
          nodes={allNodes}
          edges={edges}
          onNodesChange={onNodesChangeWrapper}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          translateExtent={translateExtent}
          onNodeClick={(_, node) => {
            if (node.type === 'resource' && (node.data.resourceType as string)) {
              const resourceType = node.data.resourceType as string;
              const result = resourceInventory.addResource(resourceType, 1);
              if (result.success) {
                setInventoryChangeCount(prev => prev + 1);
                showToast(`Mined 1 ${resourceType}`);
              } else {
                showToast('Storage capacity reached!');
              }
            }
          }}
          onPaneContextMenu={(event) => {
            event.preventDefault();
            if (selectedBuildingType) {
              clearSelection();
            }
          }}
          nodeTypes={nodeTypes as NodeTypes}
          fitView
          zoomOnDoubleClick={false}
          defaultEdgeOptions={{
            style: {
              stroke: COLORS.EDGE_STROKE,
              strokeWidth: EDGE_OPTIONS.STROKE_WIDTH,
            },
          }}
          style={{ backgroundColor: COLORS.TERRAIN_PRIMARY }}
        >
          <ViewportInitializer />
          <TerrainOverlay />
          <Minimap resourceFields={resourceFields} />
          <BuildingPlacementHandler
            selectedBuildingType={selectedBuildingType}
            onBuildingPlaced={handleBuildingPlaced}
            onNodesUpdate={setNodes}
            resourceFields={resourceFields}
            existingNodes={allNodes}
            onShowToast={showToast}
            resourceInventory={resourceInventory}
          />
        </ReactFlow>
      </div>
      {toastMessage && <Toast message={toastMessage} onClose={hideToast} />}

      {/* Game Menus */}
      {menuState === 'main' && (
        <GameMenu
          onSave={() => setMenuState('save')}
          onLoad={() => setMenuState('load')}
          onClose={() => {
            setMenuState('closed');
            setIsPaused(false);
          }}
        />
      )}
      {menuState === 'save' && (
        <SaveMenu
          onSave={handleSaveGame}
          onBack={() => setMenuState('main')}
        />
      )}
      {menuState === 'load' && (
        <LoadMenu
          onLoad={handleLoadGame}
          onBack={() => setMenuState('main')}
        />
      )}

      {/* Pause Modal */}
      {isPaused && menuState === 'closed' && (
        <PauseModal onResume={() => setIsPaused(false)} />
      )}
    </div>
  );
}
