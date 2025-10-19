import { useState, useCallback } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BuildingMenu } from './components/BuildingMenu';
import { BuildingNode } from './components/BuildingNode';
import { BuildingType, BUILDING_CONFIGS } from './types/buildings';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const nodeTypes = {
  building: BuildingNode,
};

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: any) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const handleBuildingSelect = useCallback((buildingType: BuildingType) => {
    const config = BUILDING_CONFIGS[buildingType];
    const newNodeId = `building-${nodeIdCounter}`;
    
    const newNode: Node = {
      id: newNodeId,
      type: 'building',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: {
        buildingType,
        label: config.name,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeIdCounter((counter) => counter + 1);
  }, [nodeIdCounter]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <BuildingMenu onBuildingSelect={handleBuildingSelect} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes as any}
        fitView
        style={{ backgroundColor: '#1a1a1a' }}
      />
    </div>
  );
}