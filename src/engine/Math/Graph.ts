import { Vector } from './vector';

type G_UUID = string & { readonly __brand: unique symbol };

interface EdgeOptions {
  weight?: number;
  directed?: boolean;
}

export class Graph<T> {
  private _nodes: Map<G_UUID, Node<T>>;
  private _edges: Set<Edge<T>>;
  adjacencyList: Map<G_UUID, Set<G_UUID>>;
  edgeList: Map<G_UUID, Set<Edge<T>>>;
  id: G_UUID = GraphUUId.generateUUID();

  constructor() {
    this._nodes = new Map();
    this._edges = new Set();
    this.adjacencyList = new Map();
    this.edgeList = new Map();
  }

  addNode(data: T): Map<G_UUID, Node<T>> {
    const newNode = new Node(data);
    this._nodes.set(newNode.id, newNode);
    this.adjacencyList.set(newNode.id, new Set());
    return this._nodes;
  }

  addNodes(nodes: T[]): Map<G_UUID, Node<T>> {
    for (const node of nodes) {
      const thisNewNode = new Node(node);
      this._nodes.set(thisNewNode.id, thisNewNode);
      this.adjacencyList.set(thisNewNode.id, new Set());
    }
    return this._nodes;
  }

  deleteNode(node: Node<T>): Map<G_UUID, Node<T>> {
    //delete any edges tied to node
    const nodeEdges = node.edges;
    for (const edge of nodeEdges) {
      this.deleteEdge(edge);
    }

    this._nodes.delete(node.id);
    this.adjacencyList.delete(node.id);
    return this._nodes;
  }

  addVertex(data: T): Map<G_UUID, Node<T>> {
    this.addNode(data);
    return this._nodes;
  }

  deleteVertex(node: Node<T>): Map<G_UUID, Node<T>> {
    this.deleteNode(node);
    return this._nodes;
  }

  addVertices(nodes: T[]): Map<G_UUID, Node<T>> {
    this.addNodes(nodes);
    return this._nodes;
  }

  addEdge(from: Node<T>, to: Node<T>, options?: EdgeOptions): Set<Edge<T>> {
    //gaurd clauses
    const existingEdges = Array.from(this._edges).find((edge) => edge.source.id === from.id && edge.target.id === to.id);
    if (existingEdges) {
      return this._edges;
    }

    const weight = options?.weight ?? 0;
    const directed = options?.directed ?? true;

    const newEdge = new Edge(from, to, weight);
    this._edges.add(newEdge);
    from.registerNewEdge(newEdge);
    to.registerNewEdge(newEdge);
    this.adjacencyList.get(from.id)?.add(to.id);
    this.edgeList.get(from.id)?.add(newEdge);

    if (!directed) {
      const duplicateEdge = new Edge(to, from, weight);
      this.adjacencyList.get(to.id)?.add(from.id);
      this._edges.add(duplicateEdge);
      to.registerNewEdge(duplicateEdge);
      from.registerNewEdge(duplicateEdge);
      this.edgeList.get(to.id)?.add(duplicateEdge);
      //link the two edges together
      newEdge.linkWithPartner(duplicateEdge);
      duplicateEdge.linkWithPartner(newEdge);
    }
    return this._edges;
  }

  deleteEdge(edge: Edge<T>) {
    edge.source.breakEdge(edge);
    edge.target.breakEdge(edge);
    this._edges.delete(edge);
    this.edgeList.get(edge.source.id)?.delete(edge);

    const partnerEdge = edge.partnerEdge;
    if (partnerEdge) {
      partnerEdge.source.breakEdge(partnerEdge);
      partnerEdge.target.breakEdge(partnerEdge);
      this._edges.delete(partnerEdge);
      this.edgeList.get(partnerEdge.source.id)?.delete(partnerEdge);
    }
  }

  get nodes(): Map<G_UUID, Node<T>> {
    return this._nodes;
  }

  getNode(id: G_UUID): Node<T> {
    return this._nodes.get(id)!;
  }

  getVertex(id: G_UUID): Node<T> {
    return this._nodes.get(id)!;
  }

  get edges(): Set<Edge<T>> {
    return this._edges;
  }

  get vertices(): Map<G_UUID, Node<T>> {
    return this._nodes;
  }

  getNeighbors(node: Node<T>): Node<T>[] {
    return Array.from(this.adjacencyList.get(node.id) ?? []).map((nid) => this.nodes.get(nid)!);
  }

  areNodesConnected(node1: Node<T>, node2: Node<T>): boolean {
    return this.adjacencyList.get(node1.id)?.has(node2.id) ?? false;
  }

  areVerticesConnected(node1: Node<T>, node2: Node<T>): boolean {
    return this.adjacencyList.get(node1.id)?.has(node2.id) ?? false;
  }

  bfs(startNode: Node<T>): G_UUID[] {
    // Verify the start node exists in the graph
    if (!this._nodes.has(startNode.id)) {
      return [];
    }

    const queue: G_UUID[] = [startNode.id];
    const visited: Set<G_UUID> = new Set([startNode.id]);

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const neighbors = this.adjacencyList.get(nodeId) || new Set();
      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
        }
      }
    }
    return Array.from(visited);
  }

  dfs(startNode: Node<T>, visited: Set<string> = new Set()): G_UUID[] {
    const startId: G_UUID = startNode.id;
    if (!this._nodes.has(startId)) {
      return [];
    } // Invalid start node

    visited.add(startId);
    let result: G_UUID[] = [startId];

    for (const neighbor of this.adjacencyList.get(startId) ?? []) {
      if (!visited.has(neighbor)) {
        result = result.concat(this.dfs(this._nodes.get(neighbor)!, visited));
      }
    }
    return result;
  }

  static createGraphFromNodes<T>(nodes: T[]): Graph<T> {
    const graph = new Graph<T>();
    graph.addNodes(nodes);
    return graph;
  }

  static createGraphFromVertices<T>(vertices: T[]): Graph<T> {
    const graph = new Graph<T>();
    graph.addNodes(vertices);
    return graph;
  }

  dijkstra(
    startNode: Node<T>,
    endNode: Node<T>
  ): {
    path: Node<T>[] | null;
    distance: number;
  } {
    // Initialize data structures
    const distances: Map<G_UUID, number> = new Map();
    const previous: Map<G_UUID, G_UUID | null> = new Map();
    const unvisited: Set<G_UUID> = new Set();

    // Set initial distances
    for (const [nodeId] of this._nodes) {
      distances.set(nodeId, nodeId === startNode.id ? 0 : Infinity);
      previous.set(nodeId, null);
      unvisited.add(nodeId);
    }

    // Continue until we've visited all nodes or found the target
    while (unvisited.size > 0) {
      // Find closest unvisited node
      let currentId: G_UUID | null = null;
      let shortestDistance = Infinity;

      for (const nodeId of unvisited) {
        const distance = distances.get(nodeId) || Infinity;
        if (distance < shortestDistance) {
          shortestDistance = distance;
          currentId = nodeId;
        }
      }

      // If we can't find a node, there's no path
      if (currentId === null || shortestDistance === Infinity) {
        break;
      }

      // If we found the target, we're done
      if (currentId === endNode.id) {
        break;
      }

      // Remove from unvisited
      unvisited.delete(currentId);

      // Get all edges from this node
      const currentNode = this._nodes.get(currentId)!;
      const outgoingEdges = Array.from(currentNode.edges).filter((edge) => edge.source.id === currentId);

      // Update distances to neighbors
      for (const edge of outgoingEdges) {
        const neighborId = edge.target.id;

        // Skip if neighbor has been visited
        if (!unvisited.has(neighborId)) {
          continue;
        }

        const newDistance = (distances.get(currentId) || 0) + edge.weight;
        const currentDistance = distances.get(neighborId) || Infinity;

        if (newDistance < currentDistance) {
          distances.set(neighborId, newDistance);
          previous.set(neighborId, currentId);
        }
      }
    }

    // Reconstruct path
    const path: Node<T>[] = [];
    let current: G_UUID | null = endNode.id;

    // No path found
    if (previous.get(endNode.id) === null && startNode.id !== endNode.id) {
      return { path: null, distance: Infinity };
    }

    // Build the path
    while (current !== null) {
      //get currentNode

      const nextNode: Node<T> = this._nodes.get(current)!;
      path.unshift(nextNode);
      current = previous.get(current)!;
    }

    return {
      path,
      distance: distances.get(endNode.id) || Infinity
    };
  }

  aStar(
    startNode: PositionNode<T>,
    endNode: PositionNode<T>
  ): {
    path: PositionNode<T>[] | null;
    distance: number;
    skippedNodes: Set<G_UUID>;
  } {
    // Make sure we're working with PositionNodes
    if (!('pos' in startNode) || !('pos' in endNode)) {
      throw new Error('A* algorithm requires PositionNode with position vectors');
    }

    // Initialize data structures
    const openSet: Set<G_UUID> = new Set([startNode.id]);
    const closedSet: Set<G_UUID> = new Set();
    const skippedNodes: Set<G_UUID> = new Set();

    // Track g scores (distance from start) and f scores (estimated total cost)
    const gScore: Map<G_UUID, number> = new Map();
    const fScore: Map<G_UUID, number> = new Map();

    // Track the path
    const cameFrom: Map<G_UUID, G_UUID | null> = new Map();

    // Initialize scores

    //remap positionNodes from this._nodes where node is type of PositionNode
    const positionNodes: Map<G_UUID, PositionNode<T>> = new Map();
    for (const [nodeId, node] of this._nodes) {
      if ('pos' in node) {
        positionNodes.set(nodeId, node as PositionNode<T>);
      } else {
        skippedNodes.add(nodeId);
      }
    }

    for (const [nodeId] of positionNodes) {
      gScore.set(nodeId, nodeId === startNode.id ? 0 : Infinity);
      fScore.set(nodeId, nodeId === startNode.id ? this._heuristic(startNode, endNode) : Infinity);
      cameFrom.set(nodeId, null);
    }

    // Continue until we've visited all nodes or found the target
    while (openSet.size > 0) {
      // Find node with lowest fScore
      let currentId: G_UUID | null = null;
      let lowestFScore = Infinity;

      for (const nodeId of openSet) {
        const score = fScore.get(nodeId) || Infinity;
        if (score < lowestFScore) {
          lowestFScore = score;
          currentId = nodeId;
        }
      }

      // If we can't find a node, there's no path
      if (currentId === null) {
        break;
      }

      // If we found the target, we're done
      if (currentId === endNode.id) {
        // Reconstruct path
        const path: PositionNode<T>[] = [];
        let current: G_UUID | null = endNode.id;

        while (current !== null) {
          const node = this._nodes.get(current)! as PositionNode<T>;
          path.unshift(node);
          current = cameFrom.get(current)!;
        }

        return {
          path,
          distance: gScore.get(endNode.id) || Infinity,
          skippedNodes
        };
      }

      // Move from open to closed set
      openSet.delete(currentId);
      closedSet.add(currentId);

      // Get current node
      const currentNode = this._nodes.get(currentId)! as PositionNode<T>;

      // Check all neighbors
      const neighbors = this.getNeighbors(currentNode);

      for (const neighbor of neighbors) {
        const neighborId = neighbor.id;

        // Skip if neighbor has been processed
        if (closedSet.has(neighborId)) {
          continue;
        }

        // Ensure neighbor is a PositionNode
        const positionNeighbor = neighbor as PositionNode<T>;
        if (!('pos' in positionNeighbor)) {
          continue;
        }

        // Find the edge connecting current to neighbor
        const edge = Array.from(currentNode.edges).find((e) => e.source.id === currentId && e.target.id === neighborId);

        if (!edge) {
          continue;
        }

        // Calculate tentative gScore
        const tentativeGScore = (gScore.get(currentId) || 0) + edge.weight;

        // If this path is better than previous, record it
        if (tentativeGScore < (gScore.get(neighborId) || Infinity)) {
          cameFrom.set(neighborId, currentId);
          gScore.set(neighborId, tentativeGScore);
          fScore.set(neighborId, tentativeGScore + this._heuristic(positionNeighbor, endNode));

          // Add to open set if not already there
          if (!openSet.has(neighborId)) {
            openSet.add(neighborId);
          }
        }
      }
    }

    // No path found
    return { path: null, distance: Infinity, skippedNodes };
  }

  private _heuristic(node1: PositionNode<T>, node2: PositionNode<T>): number {
    // Euclidean distance between positions
    const dx = node2.pos.x - node1.pos.x;
    const dy = node2.pos.y - node1.pos.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

export class Edge<T> {
  private _id: G_UUID = GraphUUId.generateUUID();
  private _source: Node<T>;
  private _target: Node<T>;
  private _weight: number = 0;
  private _partnerEdge: Edge<T> | null = null; // Reference to the opposite direction edge

  constructor(source: Node<T>, target: Node<T>, weight: number = 0) {
    this._source = source;
    this._target = target;
    this._weight = weight;
  }

  linkWithPartner(partnerEdge: Edge<T>): void {
    this._partnerEdge = partnerEdge;
  }

  get id() {
    return this._id;
  }

  get source() {
    return this._source;
  }

  get target() {
    return this._target;
  }

  get weight() {
    return this._weight;
  }

  get partnerEdge() {
    return this._partnerEdge;
  }
}

export class Node<T> {
  private _id: G_UUID = GraphUUId.generateUUID();
  private _data: T;
  private _edges: Set<Edge<T>>;

  constructor(data: T) {
    this._data = data;
    this._edges = new Set();
  }

  get id(): G_UUID {
    return this._id;
  }

  get data() {
    return this._data;
  }

  get edges() {
    return this._edges;
  }

  registerNewEdge(newEdge: Edge<T>) {
    this._edges.add(newEdge);
  }

  breakEdge(edge: Edge<T>) {
    this._edges.delete(edge);
  }

  getConnectedNodes(): Node<T>[] {
    return Array.from(this._edges).map((edge) => edge.target);
  }
}

export class PositionNode<T> extends Node<T> {
  pos: Vector;

  constructor(data: T, pos: ex.Vector) {
    super(data);
    this.pos = pos;
  }
}

export type Vertex<T> = Node<T>;

class GraphUUId {
  static generateUUID(): G_UUID {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    const generatedUuid = uuid.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

    // Type assertion to convert string to branded type
    return generatedUuid as G_UUID;
  }
}
