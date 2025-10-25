import { useState, useCallback, useMemo } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, type Node, type Edge, type NodeChange, type EdgeChange, type Connection, type NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BuildingMenu } from './components/BuildingMenu';
import { BuildingNode } from './components/BuildingNode';
import { ResourceNode } from './components/ResourceNode';
import { TerrainOverlay } from './components/TerrainOverlay';
import { BuildingPlacementHandler } from './components/BuildingPlacementHandler';
import { Toast } from './components/Toast';
import { useResourceFields } from './hooks/useResourceFields';
import { useBuildingPlacement } from './hooks/useBuildingPlacement';
import { COLORS } from './constants/game.constants';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const nodeTypes = {
  building: BuildingNode,
  resource: ResourceNode,
};

/**
 * Main App component - orchestrates the entire game
 * Follows Single Responsibility Principle - only handles top-level state and coordination
 * Dependency Inversion Principle - depends on abstractions (hooks and services) not concretions
 */
export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Use custom hooks for separation of concerns
  const { resourceNodes, resourceFields } = useResourceFields();
  const {
    selectedBuildingType,
    handleBuildingSelect,
    clearSelection,
  } = useBuildingPlacement();

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  const hideToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Filter out changes to resource nodes since they shouldn't be modified
      const filteredChanges = changes.filter((change) => {
        if ('id' in change) {
          return !resourceFields.some(field => field.id === change.id);
        }
        return true;
      });
      setNodes((nodesSnapshot) => applyNodeChanges(filteredChanges, nodesSnapshot));
    },
    [resourceFields],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const handleBuildingPlaced = useCallback((newNode: Node) => {
    setNodes((nds) => [...nds, newNode]);
    clearSelection(); // Clear selection after placement
  }, [clearSelection]);

  const allNodes = useMemo(() => [...resourceNodes, ...nodes], [resourceNodes, nodes]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <BuildingMenu
        onBuildingSelect={handleBuildingSelect}
        selectedBuildingType={selectedBuildingType}
      />
      <ReactFlow
        nodes={allNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes as NodeTypes}
        fitView
        style={{ backgroundColor: COLORS.TERRAIN_PRIMARY }}
      >
        <TerrainOverlay />
        <BuildingPlacementHandler
          selectedBuildingType={selectedBuildingType}
          onBuildingPlaced={handleBuildingPlaced}
          resourceFields={resourceFields}
          existingNodes={allNodes}
          onShowToast={showToast}
        />
      </ReactFlow>
      {toastMessage && <Toast message={toastMessage} onClose={hideToast} />}
    </div>
  );
}
