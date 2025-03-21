import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  NodeTypes,
  EdgeTypes,
  Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  Divider
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import RoleNode from './flow/nodes/RoleNode';
import ContentNode from './flow/nodes/ContentNode';
import VariableNode from './flow/nodes/VariableNode';
import ControlNode from './flow/nodes/ControlNode';
import CustomEdge from './flow/edges/CustomEdge';

// Node types
interface BaseNodeData {
  type: string;
}

interface RoleNodeData extends BaseNodeData {
  type: 'role';
  role: string;
  roleType: 'system' | 'user' | 'assistant';
}

interface ContentNodeData extends BaseNodeData {
  type: 'content';
  content: string;
  contentType: 'user' | 'assistant';
}

interface VariableNodeData extends BaseNodeData {
  type: 'variable';
  name: string;
}

interface ControlNodeData extends BaseNodeData {
  type: 'control';
  controlType: string;
  parameters: string;
}

type NodeData = RoleNodeData | ContentNodeData | VariableNodeData | ControlNodeData;
type FlowNode = Node<NodeData>;

// Define custom node types
const nodeTypes: NodeTypes = {
  role: RoleNode,
  content: ContentNode,
  variable: VariableNode,
  control: ControlNode,
};

// Define custom edge types
const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

// Initial nodes setup
const initialNodes: Node<NodeData>[] = [
  {
    id: '1',
    type: 'role',
    position: { x: 250, y: 5 },
    data: { type: 'role', role: 'Assistant', roleType: 'system' }
  },
  {
    id: '2',
    type: 'content',
    position: { x: 100, y: 100 },
    data: { type: 'content', content: 'Hello', contentType: 'user' }
  }
];

// Initial edges setup
const initialEdges: Edge[] = [
  {
    id: 'system-to-user',
    source: 'system-role',
    target: 'user-content',
    type: 'custom',
    animated: true
  }
];

interface FlowEditorProps {
  value: string;
  onChange: (value: string) => void;
  onNodeSelect?: (nodeId: string) => void;
}

/**
 * Visual Flow Constructor for prompts
 */
const FlowEditor: React.FC<FlowEditorProps> = ({
  value,
  onChange,
  onNodeSelect
}) => {
  // Flow state
  const [nodes, setNodes] = useNodesState<NodeData>([]);
  const [edges, setEdges] = useEdgesState([]);
  
  // Refs
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  // Handle new connections
  const onConnect = useCallback((params: Connection) => {
    const newEdge: Edge = {
      id: `e${params.source}-${params.target}`,
      source: params.source || '',
      target: params.target || '',
      type: 'default',
      animated: true
    };
    setEdges((eds: Edge[]) => {
      const updatedEdges = addEdge(newEdge, eds);
      return updatedEdges;
    });
  }, [setEdges]);

  const onNodesChange = useCallback((changes: any[]) => {
    setNodes((nds: Node<NodeData>[]) => {
      return nds.map((node: Node<NodeData>) => {
        const change = changes.find((c) => c.id === node.id);
        if (change && change.type === 'position' && change.position) {
          return { ...node, position: change.position };
        }
        return node;
      });
    });
  }, [setNodes]);

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: FlowNode) => {
    if (onNodeSelect) {
      onNodeSelect(node.id);
    }
  }, [onNodeSelect]);

  // Convert flow to text
  const flowToText = useCallback(() => {
    let promptText = '';
    const nodeMap = new Map(nodes.map((node: FlowNode) => [node.id, node]));
    const visited = new Set<string>();

    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (!node || !('type' in node) || !('data' in node)) return;

      // Add node content to prompt text based on type
      switch (node.type) {
        case 'role': {
          const data = node.data as RoleNodeData;
          promptText += `#${data.type}: ${data.role}\n\n`;
          break;
        }
        case 'content': {
          const data = node.data as ContentNodeData;
          promptText += `#${data.type}: ${data.content}\n\n`;
          break;
        }
        case 'variable': {
          const data = node.data as VariableNodeData;
          promptText += `{{${data.name}}}\n`;
          break;
        }
        case 'control': {
          const data = node.data as ControlNodeData;
          promptText += `#${data.controlType}: ${data.parameters}\n\n`;
          break;
        }
      }

      // Find and traverse connected nodes
      edges
        .filter((edge: Edge) => edge.source === nodeId)
        .forEach((edge: Edge) => traverse(edge.target));
    };

    // Start traversal from root nodes (nodes with no incoming edges)
    const rootNodes = nodes.filter((node: FlowNode) => 
      !edges.some((edge: Edge) => edge.target === node.id)
    );
    rootNodes.forEach((node: FlowNode) => traverse(node.id));

    return promptText.trim();
  }, [nodes, edges]);

  // Update text when flow changes
  useEffect(() => {
    const newText = flowToText();
    if (newText !== value) {
      onChange(newText);
    }
  }, [nodes, edges, onChange, value, flowToText]);

  // Parse text to flow
  const textToFlow = useCallback((text: string) => {
    const lines = text.split('\n');
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    let lastNodeId: string | null = null;
    let y = 0;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      let node: Node | null = null;

      if (trimmedLine.startsWith('#')) {
        // Parse role or content nodes
        const [type, ...content] = trimmedLine.substring(1).split(':');
        const nodeContent = content.join(':').trim();
        
        if (['system', 'user', 'assistant'].includes(type)) {
          node = {
            id: `${type}-${index}`,
            type: type === 'system' ? 'role' : 'content',
            position: { x: 250, y },
            data: {
              label: type === 'system' ? 'System Role' : `${type.charAt(0).toUpperCase()}${type.slice(1)} Message`,
              [type === 'system' ? 'role' : 'content']: nodeContent,
              type
            }
          };
        } else {
          // Control node
          node = {
            id: `control-${index}`,
            type: 'control',
            position: { x: 250, y },
            data: {
              label: 'Control',
              controlType: type,
              parameters: nodeContent
            }
          };
        }
      } else if (trimmedLine.match(/{{.*}}/)) {
        // Parse variable nodes
        const varName = trimmedLine.match(/{{(.*)}}/)?.[1] || '';
        node = {
          id: `var-${index}`,
          type: 'variable',
          position: { x: 250, y },
          data: {
            label: 'Variable',
            name: varName
          }
        };
      }

      if (node) {
        newNodes.push(node);
        if (lastNodeId) {
          newEdges.push({
            id: `edge-${lastNodeId}-${node.id}`,
            source: lastNodeId,
            target: node.id,
            type: 'custom'
          });
        }
        lastNodeId = node.id;
        y += 150;
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [setNodes, setEdges]);

  // Update flow when text changes
  useEffect(() => {
    textToFlow(value);
  }, [value, textToFlow]);

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        height: '100%', 
        width: '100%',
        overflow: 'hidden',
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2">Visual Flow Constructor</Typography>
      </Box>
      
      <Box 
        ref={reactFlowWrapper} 
        sx={{ 
          flexGrow: 1,
          '& .react-flow__node': {
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={setEdges}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onInit={setReactFlowInstance}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Controls />
            <MiniMap />
            <Background />
            
            <Panel position="top-right">
              <Box sx={{ display: 'flex', gap: 1, bgcolor: 'background.paper', p: 0.5, borderRadius: 1 }}>
                <Tooltip title="Zoom In">
                  <IconButton 
                    size="small"
                    onClick={() => reactFlowInstance?.zoomIn()}
                  >
                    <ZoomInIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Zoom Out">
                  <IconButton 
                    size="small"
                    onClick={() => reactFlowInstance?.zoomOut()}
                  >
                    <ZoomOutIcon />
                  </IconButton>
                </Tooltip>
                
                <Divider orientation="vertical" flexItem />
                
                <Tooltip title="Fit View">
                  <IconButton 
                    size="small"
                    onClick={() => reactFlowInstance?.fitView()}
                  >
                    <FitScreenIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Panel>
          </ReactFlow>
        </ReactFlowProvider>
      </Box>
    </Paper>
  );
};

export default FlowEditor; 