import { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, type Node, type Edge, type NodeChange, type EdgeChange, type Connection, type NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BuildingMenu } from './components/BuildingMenu';
import { BuildingNode } from './components/BuildingNode';
import { ResourceNode } from './components/ResourceNode';
import { MapBorderNode } from './components/MapBorderNode';
import { TerrainOverlay } from './components/TerrainOverlay';
import { BuildingPlacementHandler } from './components/BuildingPlacementHandler';
import { ResourcePanel } from './components/ResourcePanel';
import { Toast } from './components/Toast';
import { useResourceFields } from './hooks/useResourceFields';
import { useBuildingPlacement } from './hooks/useBuildingPlacement';
import { COLORS, BUILDING_WIDTH, BUILDING_HEIGHT } from './constants/game.constants';
import { GAME_CONFIG } from './config/game.config';
import { snapToGrid, getBuildingCenter, doRectanglesOverlap } from './utils/position.utils';
import { ResourceType } from './types/terrain';
import { ResourceInventoryService } from './services/ResourceInventoryService';
import { BuildingOperationService } from './services/BuildingOperationService';

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

  // Use custom hooks for separation of concerns
  const { resourceNodes, resourceFields } = useResourceFields();
  const {
    selectedBuildingType,
    handleBuildingSelect,
    clearSelection,
  } = useBuildingPlacement();

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
      if (node.type === 'building' && node.data.inventory) {
        Object.entries(node.data.inventory).forEach(([key, value]) => {
          totals[key] = (totals[key] || 0) + value;
        });
      }
    });
    return totals;
  }, [nodes, resourceInventory]);

  // Handle ESC key to cancel building placement
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && selectedBuildingType) {
        clearSelection();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedBuildingType, clearSelection]);

  // Building operations ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prevNodes) => BuildingOperationService.processBuildings(prevNodes, edges, resourceFields));
    }, 1000);
    return () => clearInterval(interval);
  }, [edges, resourceFields]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  const hideToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const onNodesChangeWrapper = useCallback(
    (changes: NodeChange[]) => {
      // Filter out changes to resource nodes and map border since they shouldn't be modified
      const filteredChanges = changes.filter((change) => {
        if ('id' in change) {
          // Skip resource nodes and map border
          if (resourceFields.some(field => field.id === change.id) || change.id === 'map-border') {
            return false;
          }

          // For position changes, snap to grid and validate that building stays within map borders
          if (change.type === 'position' && change.position) {
            // Get the center of the building from the new position
            const center = getBuildingCenter(change.position);
            // Snap the center to grid
            const snappedCenter = snapToGrid(center);
            // Calculate new top-left position from snapped center
            change.position = {
              x: snappedCenter.x - BUILDING_WIDTH / 2,
              y: snappedCenter.y - BUILDING_HEIGHT / 2,
            };

            const { mapWidth, mapHeight } = GAME_CONFIG;
            const newX = change.position.x;
            const newY = change.position.y;

            if (
              newX < 0 ||
              newY < 0 ||
              newX + BUILDING_WIDTH > mapWidth ||
              newY + BUILDING_HEIGHT > mapHeight
            ) {
              return false; // Reject position change that moves building outside border
            }

            // Check for collision with other buildings
            const proposedRect = {
              x: newX,
              y: newY,
              width: BUILDING_WIDTH,
              height: BUILDING_HEIGHT,
            };

            //console.log(change.id, proposedRect);
            const hasCollision = allNodes.some((node) => {
              //console.log(node.id);
              if (node.id === (change as any).id) return false; // Don't check against itself
              if (node.type !== 'building') return false;
              const existingRect = {
                x: node.position.x,
                y: node.position.y,
                width: BUILDING_WIDTH,
                height: BUILDING_HEIGHT,
              };
              //console.log(node.id, existingRect);
              return doRectanglesOverlap(proposedRect, existingRect);
            });

            console.log(change.id, hasCollision);

            if (hasCollision) {
              return false; // Reject position change that would cause collision
            }
          }
        }
        return true;
      });

      // Call the hook's onNodesChange with filtered changes
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

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', zIndex: 10, display: 'flex', gap: '20px', alignItems: 'flex-start', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <BuildingMenu
            onBuildingSelect={handleBuildingSelect}
            selectedBuildingType={selectedBuildingType}
            resourceInventory={resourceInventory}
          />
        </div>
        <div style={{ pointerEvents: 'auto' }}>
          <ResourcePanel resources={totalResources} storageCapacity={resourceInventory.getStorageCapacity()} />
        </div>
      </div>
      <div style={{ position: 'relative', height: '100vh' }}>
        <ReactFlow
          nodes={allNodes}
          edges={edges}
          onNodesChange={onNodesChangeWrapper}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes as NodeTypes}
          fitView
          defaultEdgeOptions={{
            style: {
              stroke: '#00FFFF',
              strokeWidth: 2,
            },
          }}
          style={{ backgroundColor: COLORS.TERRAIN_PRIMARY }}
        >
          <TerrainOverlay />
          <BuildingPlacementHandler
            selectedBuildingType={selectedBuildingType}
            onBuildingPlaced={handleBuildingPlaced}
            resourceFields={resourceFields}
            existingNodes={allNodes}
            onShowToast={showToast}
            resourceInventory={resourceInventory}
          />
        </ReactFlow>
      </div>
      {toastMessage && <Toast message={toastMessage} onClose={hideToast} />}
    </div>
  );
}
