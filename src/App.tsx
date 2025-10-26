import { useState, useCallback, useMemo, useEffect } from 'react';
import { ReactFlow, useNodesState, useEdgesState, addEdge, type Node, type Edge, type NodeChange, type Connection, type NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BuildingMenu } from './components/BuildingMenu';
import { BuildingNode } from './components/BuildingNode';
import { ResourceNode } from './components/ResourceNode';
import { MapBorderNode } from './components/MapBorderNode';
import { TerrainOverlay } from './components/TerrainOverlay';
import { BuildingPlacementHandler } from './components/BuildingPlacementHandler';
import { ResourcePanel } from './components/ResourcePanel';
import { BuildingType } from './types/buildings';
import { Toast } from './components/Toast';
import { useResourceFields } from './hooks/useResourceFields';
import { useBuildingPlacement } from './hooks/useBuildingPlacement';
import { useKeyboardActions } from './hooks/useKeyboardActions';
import { COLORS } from './constants/game.constants';
import { GAME_CONFIG } from './config/game.config';
import { ResourceInventoryService } from './services/ResourceInventoryService';
import { NodeValidationService } from './services/NodeValidationService';
import { TickProcessor } from './simulation/TickProcessor';

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
  const handleDeleteSelected = useCallback(() => {
    setNodes((nds) => {
      const deletedNodeIds = nds.filter((n) => n.selected).map((n) => n.id);
      // Count storage buildings being deleted
      const deletedStorageBuildings = nds.filter((n) => n.selected && n.type === 'building' && n.data.buildingType === BuildingType.STORAGE);
      if (deletedStorageBuildings.length > 0) {
        // Decrease storage capacity by 1000 per deleted storage building
        resourceInventory.decreaseStorageCapacity(deletedStorageBuildings.length * 1000);
      }
      setEdges((eds) => eds.filter((e) => !e.selected && !deletedNodeIds.includes(e.source) && !deletedNodeIds.includes(e.target)));
      return nds.filter((n) => !n.selected);
    });
  }, [setNodes, setEdges, resourceInventory]);

  // Handle keyboard actions
  useKeyboardActions(selectedBuildingType, clearSelection, handleDeleteSelected);

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
  }, [nodes, resourceInventory]);

  // Building operations ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes((prevNodes) => TickProcessor.processTick(prevNodes, edges, resourceFields));
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

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', zIndex: 10, display: 'flex', gap: '20px', alignItems: 'flex-start', pointerEvents: 'none' }}>
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
            onNodesUpdate={setNodes}
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
