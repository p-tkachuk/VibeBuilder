import { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, type Node, type Edge, type NodeChange, type Connection, type NodeTypes, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BuildingMenu } from './components/BuildingMenu/BuildingMenu';
import { BuildingInfoPanel } from './components/BuildingInfoPanel/BuildingInfoPanel';
import { BuildingNode } from './components/BuildingNode/BuildingNode';
import { ResourceNode } from './components/ResourceNode/ResourceNode';
import { MapBorderNode } from './components/MapBorderNode/MapBorderNode';
import { TerrainOverlay } from './components/TerrainOverlay/TerrainOverlay';
import { BuildingPlacementHandler } from './components/BuildingPlacementHandler/BuildingPlacementHandler';
import { ResourcePanel } from './components/ResourcePanel/ResourcePanel';
import { Minimap } from './components/Minimap/Minimap';
import { GameMenu } from './components/GameMenu/GameMenu';
import { SaveMenu } from './components/SaveMenu/SaveMenu';
import { LoadMenu } from './components/LoadMenu/LoadMenu';
import { PauseModal } from './components/PauseModal/PauseModal';
import { BuildingType } from './types/buildings';
import { Toast } from './components/Toast/Toast';
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
import { GameStateManager } from './managers/GameStateManager';
import { BuildingRegistry } from './managers/BuildingRegistry';
import { StateSyncService } from './services/StateSyncService';
import { ServiceLocator } from './services/ServiceLocator';
import type { IEventBus } from './services/interfaces/IEventBus';

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
  const [selectedBuildingNode, setSelectedBuildingNode] = useState<string | null>(null);

  // Initialize new state management system
  const [gameStateManager] = useState(() => new GameStateManager());
  const [eventBus] = useState(() => ServiceLocator.get<IEventBus>('IEventBus'));
  const [buildingRegistry] = useState(() => new BuildingRegistry(gameStateManager, eventBus));
  const [stateSyncService] = useState(() => new StateSyncService(gameStateManager));

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

      // Unregister deleted buildings from building registry (this also removes them from game state manager)
      deletedNodeIds.forEach(nodeId => {
        buildingRegistry.unregister(nodeId);
      });

      setEdges((eds) => eds.filter((e) => !e.selected && !deletedNodeIds.includes(e.source) && !deletedNodeIds.includes(e.target)));
      return nds.filter((n) => !n.selected);
    });
  }, [setNodes, setEdges, resourceInventory, buildingRegistry]);

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
        ? { ...node, data: { ...node.data, id: node.id, edges, selected: selectedBuildingNode === node.id } }
        : node
    ),
  ], [resourceNodes, nodes, edges, selectedBuildingNode]);

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
        TickProcessor.processTick(buildingRegistry, edges, allNodes);
        // Update only building nodes, preserve resource nodes and map border
        setNodes(currentNodes => {
          const updatedBuildingNodes = stateSyncService.gameStateToNodes();
          const nonBuildingNodes = currentNodes.filter(node => node.type !== 'building');
          return [...nonBuildingNodes, ...updatedBuildingNodes];
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [buildingRegistry, edges, allNodes, stateSyncService, isPaused]);

  const onNodesChangeWrapper = useCallback(
    (changes: NodeChange[]) => {
      const filteredChanges = NodeValidationService.processNodeChanges(
        changes,
        resourceFields,
        allNodes
      );
      onNodesChange(filteredChanges);

      // Sync position changes back to game state
      const hasPositionChanges = changes.some(change =>
        change.type === 'position' && change.dragging
      );
      if (hasPositionChanges) {
        // Get the updated nodes after the change
        setNodes(currentNodes => {
          stateSyncService.updateFromNodes(currentNodes);
          return currentNodes;
        });
      }
    },
    [resourceFields, allNodes, onNodesChange, stateSyncService],
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const handleBuildingPlaced = useCallback(async (newNode: Node) => {
    // Create building instance and register it
    const buildingInstance = await buildingRegistry.createBuildingInstance(
      newNode,
      edges,
      allNodes,
      edges, // Use the edges state directly
      resourceFields,
      resourceInventory
    );

    if (buildingInstance) {
      buildingRegistry.register(buildingInstance);

      // Update the building state with the correct position
      gameStateManager.updateBuilding(newNode.id, {
        position: newNode.position
      });
    }

    setNodes((nds) => [...nds, newNode]);
    clearSelection(); // Clear selection after placement
  }, [buildingRegistry, edges, allNodes, resourceFields, gameStateManager, clearSelection]);

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

  const handleLoadGame = useCallback(async (slotIndex: number) => {
    const gameState = SaveLoadService.loadGame(slotIndex);
    if (gameState) {
      // Clear existing building registry and game state manager
      buildingRegistry.getAll().forEach(building => {
        buildingRegistry.unregister(building.id);
      });

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

      // Recreate and register building instances from loaded nodes
      const buildingNodes = gameState.nodes.filter(node => node.type === 'building');
      for (const node of buildingNodes) {
        const buildingInstance = await buildingRegistry.createBuildingInstance(
          node,
          gameState.edges,
          gameState.nodes,
          gameState.edges,
          gameState.resourceFields,
          resourceInventory
        );

        if (buildingInstance) {
          buildingRegistry.register(buildingInstance);

          // Update the building state with the correct position
          gameStateManager.updateBuilding(node.id, {
            position: node.position,
            inventory: node.data.inventory || Object.create(null)
          });
        }
      }

      // Trigger a manual tick to ensure production works immediately after loading
      setTimeout(() => {
        TickProcessor.processTick(buildingRegistry, gameState.edges, gameState.nodes);
        setNodes(stateSyncService.gameStateToNodes());
      }, 100);

      showToast(`Game loaded from slot ${slotIndex + 1}`);
      setMenuState('closed');
    } else {
      showToast('Failed to load game');
    }
  }, [setLoadedResourceFields, setViewport, setNodes, setEdges, resourceInventory, setInventoryChangeCount, buildingRegistry, gameStateManager, stateSyncService, showToast]);

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
            } else if (node.type === 'building') {
              // Select building for info panel
              setSelectedBuildingNode(node.id);
            }
          }}
          onPaneClick={() => {
            // Clear building selection when clicking on empty space
            setSelectedBuildingNode(null);
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
          <Minimap resourceFields={resourceFields} buildings={gameStateManager.getState().buildings} />
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

      {/* Building Info Panel */}
      {selectedBuildingNode && (
        <BuildingInfoPanel
          selectedBuildingId={selectedBuildingNode}
          gameStateManager={gameStateManager}
          buildingRegistry={buildingRegistry}
          onClose={() => setSelectedBuildingNode(null)}
        />
      )}
    </div>
  );
}
