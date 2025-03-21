declare module 'reactflow' {
  import { ComponentType, CSSProperties, MouseEvent, ReactNode } from 'react';

  export interface Node<T = any> {
    id: string;
    type?: string;
    position: { x: number; y: number };
    data: T;
    style?: CSSProperties;
    className?: string;
    targetPosition?: Position;
    sourcePosition?: Position;
  }

  export interface Edge<T = any> {
    id: string;
    source: string;
    target: string;
    type?: string;
    label?: string;
    data?: T;
    style?: CSSProperties;
    className?: string;
    animated?: boolean;
  }

  export interface Connection {
    source: string | null;
    target: string | null;
    sourceHandle: string | null;
    targetHandle: string | null;
  }

  export enum Position {
    Left = 'left',
    Top = 'top',
    Right = 'right',
    Bottom = 'bottom'
  }

  export type NodeTypes = { [key: string]: ComponentType<any> };
  export type EdgeTypes = { [key: string]: ComponentType<any> };

  export type OnConnect = (connection: Connection) => void;
  export type OnNodeDragStop = (event: MouseEvent, node: Node, nodes: Node[]) => void;
  export type OnSelectionChange = (elements: { nodes: Node[]; edges: Edge[] }) => void;

  export interface ReactFlowProps {
    nodes: Node[];
    edges: Edge[];
    onNodesChange?: (changes: any[]) => void;
    onEdgesChange?: (changes: any[]) => void;
    onConnect?: OnConnect;
    nodeTypes?: NodeTypes;
    edgeTypes?: EdgeTypes;
    children?: ReactNode;
    [key: string]: any;
  }

  const ReactFlow: ComponentType<ReactFlowProps>;
  export default ReactFlow;

  export const Background: ComponentType<any>;
  export const Controls: ComponentType<any>;
  export const MiniMap: ComponentType<any>;
  export const Panel: ComponentType<{ position?: string; children?: ReactNode }>;

  export function useNodesState<T = any>(initialNodes?: Node<T>[]): [Node<T>[], (nodes: Node<T>[] | ((nds: Node<T>[]) => Node<T>[])) => void];
  export function useEdgesState<T = any>(initialEdges?: Edge<T>[]): [Edge<T>[], (edges: Edge<T>[] | ((eds: Edge<T>[]) => Edge<T>[])) => void];

  export const ReactFlowProvider: ComponentType<{ children: ReactNode }>;
  export function addEdge<T = any>(edge: Edge<T>, edges: Edge<T>[]): Edge<T>[];

  // Node components
  export interface NodeProps<T = any> {
    id: string;
    data: T;
    type?: string;
    position: { x: number; y: number };
    style?: CSSProperties;
    className?: string;
    targetPosition?: Position;
    sourcePosition?: Position;
  }

  export interface HandleProps {
    type: 'source' | 'target';
    position: Position;
    style?: CSSProperties;
    className?: string;
    id?: string;
  }

  export const Handle: ComponentType<HandleProps>;

  // Edge components
  export interface EdgeProps {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    style?: CSSProperties;
    className?: string;
    animated?: boolean;
    data?: any;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    sourcePosition: Position;
    targetPosition: Position;
    markerEnd?: string;
  }

  export function getBezierPath(
    sourceX: number,
    sourceY: number,
    sourcePosition: Position,
    targetX: number,
    targetY: number,
    targetPosition: Position,
    sourceHandle?: { x: number; y: number },
    targetHandle?: { x: number; y: number }
  ): [string, number, number, number];
} 