import { Vector } from './vector';

/**
 * A unique identifier for a graph node or edge.
 */
type G_UUID = string & { readonly __brand: unique symbol };

/**
 * Options for creating a new edge in the graph.
 */
interface EdgeOptions {
  /**
   * The weight of the edge.
   * @default 0
   */
  weight?: number;

  /**
   * Whether the edge is directed.
   * @default true
   */
  directed?: boolean;
}

/**
 * A weighted graph data structure.
 * @template T The type of data stored in each node.
 */
export class Graph<T> {
  private _nodes: Map<G_UUID, Node<T>>;
  private _edges: Set<Edge<T>>;
  adjacencyList: Map<G_UUID, Set<G_UUID>>;
  edgeList: Map<G_UUID, Set<Edge<T>>>;
  id: G_UUID = GraphUUId.generateUUID();

  /**
   * Constructs a new graph data structure.
   *
   * This constructor initializes an empty graph with no nodes or edges.
   */
  constructor() {
    this._nodes = new Map();
    this._edges = new Set();
    this.adjacencyList = new Map();
    this.edgeList = new Map();
  }

  /**
   * Adds a new node to the graph with the given data.
   * @returns The newly created node.
   */
  addNode(data: T): Node<T> {
    const newNode = new Node(data);
    this._nodes.set(newNode.id, newNode);
    this.adjacencyList.set(newNode.id, new Set());
    return newNode;
  }

  /**
   * Adds multiple new nodes to the graph with the given data.
   * @returns A map of all nodes in the graph, including the newly created ones.
   */
  addNodes(nodes: T[]): Map<G_UUID, Node<T>> {
    for (const node of nodes) {
      const thisNewNode = new Node(node);
      this._nodes.set(thisNewNode.id, thisNewNode);
      this.adjacencyList.set(thisNewNode.id, new Set());
    }
    return this._nodes;
  }

  /**
   * Deletes a node from the graph along with all its associated edges.
   * This method removes the specified node and any edges connected to it
   * from the graph. It updates the internal structures to reflect these
   * changes.
   * @param node - The node to be deleted from the graph.
   * @returns A map of all remaining nodes in the graph.
   */

  /**
   * Deletes a node from the graph along with all its associated edges.
   * This method removes the specified node and any edges connected to it
   * from the graph. It updates the internal structures to reflect these
   * changes.
   * @param node - The node to be deleted from the graph.
   * @returns A map of all remaining nodes in the graph.
   */
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

  /**
   * Adds a new node to the graph with the given data and returns the newly
   * created node. This method is just an alias for {@link addNode}.
   * @param data - The data to be stored in the new node.
   * @returns The newly created node.
   */
  addVertex(data: T): Node<T> {
    return this.addNode(data);
  }

  /**
   * Deletes a vertex from the graph.
   *
   * This method removes the specified vertex and all associated edges
   * from the graph by delegating to the `deleteNode` method. It updates
   * the internal structures to reflect these changes.
   * @param node - The vertex to be deleted from the graph.
   * @returns A map of all remaining vertices in the graph.
   */
  deleteVertex(node: Node<T>): Map<G_UUID, Node<T>> {
    this.deleteNode(node);
    return this._nodes;
  }

  /**
   * Adds multiple vertices to the graph with the given data.
   *
   * This method takes an array of data items, creates new nodes for each item,
   * and adds them to the graph. It utilizes the `addNodes` method to perform
   * the addition and updates the adjacency list accordingly.
   * @param nodes - An array of data items to be added as vertices to the graph.
   * @returns A map of all nodes in the graph, including the newly added vertices.
   */

  addVertices(nodes: T[]): Map<G_UUID, Node<T>> {
    return this.addNodes(nodes);
  }

  /**
   * Adds a new edge between two nodes in the graph. If the edge already exists, it does not add a duplicate.
   * The function allows specifying edge options such as weight and directionality. For undirected edges,
   * it creates a duplicate edge in the reverse direction and links both edges as partners.
   * @param from - The source node of the edge.
   * @param to - The target node of the edge.
   * @param options - Optional settings for the edge, including weight and directionality.
   * @returns An array containing the created edge(s). If the edge is directed, the array contains one edge;
   *          if undirected, it contains both the original and the duplicate edge.
   */

  addEdge(from: Node<T>, to: Node<T>, options?: EdgeOptions): Edge<T>[] {
    //gaurd clauses
    const existingEdges = Array.from(this._edges).find((edge) => edge.source.id === from.id && edge.target.id === to.id);
    if (existingEdges) {
      return [];
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
      return [newEdge, duplicateEdge];
    }
    return [newEdge];
  }

  /**
   * Deletes an edge from the graph.
   *
   * This method removes the specified edge and its partner edge (if any) from the graph.
   * It updates the internal edge set and edge list accordingly. The source and target
   * nodes of the edge are also updated to reflect the removal of the edge.
   * @param edge - The edge to be deleted from the graph.
   */

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

  /**
   * The set of nodes in the graph, keyed by their UUID.
   *
   * The map returned by this property is a shallow copy of the internal map.
   * The nodes in this map are not frozen, and may be modified by the caller.
   * @returns A shallow copy of the graph's internal node map.
   */
  get nodes(): Map<G_UUID, Node<T>> {
    return this._nodes;
  }

  /**
   * Gets a node by its UUID.
   * @param id - The UUID of the node to be retrieved.
   * @returns The node with the specified UUID, or undefined if no such node exists.
   */
  getNode(id: G_UUID): Node<T> {
    return this._nodes.get(id)!;
  }

  /**
   * Gets a node by its UUID.
   * @param id - The UUID of the node to be retrieved.
   * @returns The node with the specified UUID, or undefined if no such node exists.
   */
  getVertex(id: G_UUID): Node<T> {
    return this._nodes.get(id)!;
  }

  /**
   * Retrieves the set of edges in the graph.
   *
   * The returned set is a shallow copy of the internal edge set.
   * Modifications to this set do not affect the graph's internal state.
   * @returns A set containing all edges in the graph.
   */
  get edges(): Set<Edge<T>> {
    return this._edges;
  }

  /**
   * The set of vertices in the graph, keyed by their UUID.
   *
   * This property is an alias for the "nodes" property, and is provided
   * for convenience when working with graph algorithms that expect a
   * "vertices" property.
   *
   * The map returned by this property is a shallow copy of the internal map.
   * The nodes in this map are not frozen, and may be modified by the caller.
   * @returns A shallow copy of the graph's internal node map.
   */
  get vertices(): Map<G_UUID, Node<T>> {
    return this._nodes;
  }

  /**
   * Gets the neighbors of the given node.
   *
   * The returned array contains all of the nodes that are directly connected to the given node.
   * @param node - The node whose neighbors should be retrieved.
   * @returns An array of nodes that are directly connected to the given node.
   */
  getNeighbors(node: Node<T>): Node<T>[] {
    return Array.from(this.adjacencyList.get(node.id) ?? []).map((nid) => this.nodes.get(nid)!);
  }

  /**
   * Checks if two nodes are connected by an edge.
   * @param node1 - The first node to check.
   * @param node2 - The second node to check.
   * @returns true if the nodes are connected, false if not.
   */
  areNodesConnected(node1: Node<T>, node2: Node<T>): boolean {
    return this.adjacencyList.get(node1.id)?.has(node2.id) ?? false;
  }

  /**
   * Determines whether two vertices are directly connected by an edge.
   *
   * This method checks if there is a direct connection (edge) between the two
   * specified nodes in the graph by inspecting the adjacency list.
   * @param node1 - The first node to check for a connection.
   * @param node2 - The second node to check for a connection.
   * @returns true if there is a direct edge connecting node1 and node2, false otherwise.
   */

  areVerticesConnected(node1: Node<T>, node2: Node<T>): boolean {
    return this.adjacencyList.get(node1.id)?.has(node2.id) ?? false;
  }

  /**
   * Performs a breadth-first search (BFS) on the graph starting from the given node.
   *
   * This method explores the graph layer by layer, starting from the specified node.
   * It visits all nodes that are directly connected to the start node before moving
   * on to the nodes at the next level of the graph.
   * @param startNode - The node to start the BFS from.
   * @returns An array of UUIDs representing the nodes that were visited during the search.
   *          The order of the nodes in the array corresponds to the order in which they
   *          were visited.
   */
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

  /**
   * Performs a depth-first search (DFS) on the graph starting from the given node.
   *
   * This method explores the graph by traversing as far as possible along each
   * branch before backtracking. It visits all nodes that are reachable from the
   * start node.
   * @param startNode - The node to start the DFS from.
   * @param [visited] - A set of node IDs that have already been visited during
   *                    the search. This parameter is optional, and defaults to an
   *                    empty set.
   * @returns An array of UUIDs representing the nodes that were visited during the
   *          search. The order of the nodes in the array corresponds to the order
   *          in which they were visited.
   */
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

  /**
   * Creates a new graph from an array of nodes, and adds them all to the graph.
   * @param nodes - The array of nodes to add to the graph.
   * @returns The newly created graph.
   */
  static createGraphFromNodes<T>(nodes: T[]): Graph<T> {
    const graph = new Graph<T>();
    graph.addNodes(nodes);
    return graph;
  }

  /**
   * Creates a new graph from an array of vertices, and adds them all to the graph.
   * @param vertices - The array of vertices to add to the graph.
   * @returns The newly created graph.
   */
  static createGraphFromVertices<T>(vertices: T[]): Graph<T> {
    const graph = new Graph<T>();
    graph.addNodes(vertices);
    return graph;
  }

  /**
   * Finds the shortest path between two nodes in the graph using Dijkstra's algorithm.
   *
   * This method calculates the shortest path from the specified start node to the
   * specified end node in the graph. It returns an object containing the path and
   * the total distance of the path.
   * @param startNode - The node from which the search for the shortest path begins.
   * @param endNode - The node where the search for the shortest path ends.
   * @returns An object containing:
   *   - `path`: An array of nodes representing the shortest path from startNode to endNode.
   *     If no path is found, this will be `null`.
   *   - `distance`: The total distance of the shortest path. If no path is found, this will
   *     be `Infinity`.
   */

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

  /**
   * Finds the shortest path between two nodes in the graph using the A* algorithm.
   *
   * This method calculates the shortest path from the specified start node to the
   * specified end node in the graph. It returns an object containing the path and
   * the total distance of the path.
   * @param startNode - The node from which the search for the shortest path begins.
   * @param endNode - The node where the search for the shortest path ends.
   * @returns An object containing:
   *   - `path`: An array of nodes representing the shortest path from startNode to endNode.
   *     If no path is found, this will be `null`.
   *   - `distance`: The total distance of the shortest path. If no path is found, this will
   *     be `Infinity`.
   *   - `skippedNodes`: A set of all nodes that were skipped during the search (because they
   *     were not `PositionNode`s).
   */
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

/**
 * Represents an edge in a graph, connecting two nodes.
 * @template T The type of data stored in the nodes connected by this edge.
 */
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

/**
 * Represents a node in a graph, with a unique identifier and optional data.
 * @template T The type of data stored in this node.
 */
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

/**
 * Represents a node in a graph with a unique identifier, optional data, and a position in space.
 * @template T The type of data stored in this node.
 * @augments {Node<T>}
 */
export class PositionNode<T> extends Node<T> {
  pos: Vector;

  constructor(data: T, pos: ex.Vector) {
    super(data);
    this.pos = pos;
  }
}

/**
 * Alias for a node in a graph, representing a vertex in a geometric context.
 * @template T The type of data stored in this vertex.
 */
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
