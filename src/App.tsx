import { useState, useCallback, useMemo } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { BuildingMenu } from './components/BuildingMenu';
import { BuildingNode } from './components/BuildingNode';
import { ResourceNode } from './components/ResourceNode';
import { TerrainOverlay } from './components/TerrainOverlay';
import { BuildingType, BUILDING_CONFIGS } from './types/buildings';
import type { ResourceField } from './types/terrain';
import { ResourceType } from './types/terrain';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const nodeTypes = {
  building: BuildingNode,
  resource: ResourceNode,
};

// Generate some resource fields
const generateResourceFields = (): ResourceField[] => {
  const fields: ResourceField[] = [];
  
  // Iron ore fields
  fields.push({
    id: 'iron-ore-1',
    type: ResourceType.IRON_ORE,
    x: 200,
    y: 150,
    width: 200,
    height: 120,
    intensity: 0.8
  });
  
  fields.push({
    id: 'iron-ore-2',
    type: ResourceType.IRON_ORE,
    x: 600,
    y: 300,
    width: 150,
    height: 100,
    intensity: 0.6
  });
  
  // Coal fields
  fields.push({
    id: 'coal-1',
    type: ResourceType.COAL,
    x: 100,
    y: 400,
    width: 180,
    height: 140,
    intensity: 0.7
  });
  
  // Copper ore fields
  fields.push({
    id: 'copper-ore-1',
    type: ResourceType.COPPER_ORE,
    x: 500,
    y: 100,
    width: 160,
    height: 80,
    intensity: 0.9
  });
  
  // Stone fields
  fields.push({
    id: 'stone-1',
    type: ResourceType.STONE,
    x: 800,
    y: 200,
    width: 120,
    height: 90,
    intensity: 0.5
  });
  
  return fields;
};

export default function App() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [resourceFields] = useState<ResourceField[]>(generateResourceFields());
  
  // Convert resource fields to React Flow nodes for proper positioning
  const resourceNodes: Node[] = useMemo(() => {
    return resourceFields.map((field) => ({
      id: field.id,
      type: 'resource',
      position: { x: field.x, y: field.y },
      data: {
        resourceType: field.type,
        width: field.width,
        height: field.height,
        intensity: field.intensity
      },
      draggable: false,
      selectable: false,
      deletable: false
    }));
  }, [resourceFields]);

  const onNodesChange = useCallback(
    (changes: any) => {
      // Filter out changes to resource nodes since they shouldn't be modified
      const filteredChanges = changes.filter((change: any) => {
        const nodeId = change.id;
        return !resourceFields.some(field => field.id === nodeId);
      });
      setNodes((nodesSnapshot) => applyNodeChanges(filteredChanges, nodesSnapshot));
    },
    [resourceFields],
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: any) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  // Check if a position is within a resource field
  const isPositionInResourceField = useCallback((x: number, y: number, resourceType?: ResourceType): boolean => {
    return resourceFields.some(field => {
      const isInField = x >= field.x && x <= field.x + field.width && 
                       y >= field.y && y <= field.y + field.height;
      return resourceType ? isInField && field.type === resourceType : isInField;
    });
  }, [resourceFields]);

  const handleBuildingSelect = useCallback((buildingType: BuildingType) => {
    const config = BUILDING_CONFIGS[buildingType];
    const newNodeId = `building-${nodeIdCounter}`;
    
    // Generate random position
    let position = { 
      x: Math.random() * 800 + 100, 
      y: Math.random() * 500 + 100 
    };
    
    // For miners, ensure they're placed on ore fields
    if (buildingType === BuildingType.MINER) {
      let attempts = 0;
      while (!isPositionInResourceField(position.x, position.y, ResourceType.IRON_ORE) && attempts < 50) {
        position = { 
          x: Math.random() * 800 + 100, 
          y: Math.random() * 500 + 100 
        };
        attempts++;
      }
      
      // If we couldn't find a valid position after 50 attempts, place it anyway
      if (attempts >= 50) {
        console.warn('Could not find valid ore field position for miner');
      }
    }
    
    const newNode: Node = {
      id: newNodeId,
      type: 'building',
      position,
      data: {
        buildingType,
        label: config.name,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setNodeIdCounter((counter) => counter + 1);
  }, [nodeIdCounter, isPositionInResourceField]);

  const allNodes = useMemo(() => [...resourceNodes, ...nodes], [resourceNodes, nodes]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <BuildingMenu onBuildingSelect={handleBuildingSelect} />
      <ReactFlow
        nodes={allNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes as any}
        fitView
        style={{ backgroundColor: '#2d5016' }}
      >
        <TerrainOverlay />
      </ReactFlow>
    </div>
  );
}