import * as ex from '@excalibur';

describe('A Graph', () => {
  let graph: ex.Graph<string>;

  beforeEach(() => {
    graph = new ex.Graph<string>();
  });

  it('can exist', () => {
    expect(ex.Graph).toBeDefined();
  });

  describe('Node Operations', () => {
    it('can add a node', () => {
      const node = graph.addNode('test');
      expect(node).toBeInstanceOf(ex.Node);
      expect(node.data).toBe('test');
      expect(graph.nodes.size).toBe(1);
      expect(graph.adjacencyList.has(node.id)).toBe(true);
    });

    it('should add multiple nodes to the graph', () => {
      const nodes = graph.addNodes(['A', 'B', 'C']);
      expect(nodes.size).toBe(3);
      expect(graph.adjacencyList.size).toBe(3);
    });

    it('should delete a node from the graph', () => {
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');
      graph.addEdge(nodeA, nodeB);

      const remainingNodes = graph.deleteNode(nodeA);
      expect(remainingNodes.size).toBe(1);
      expect(graph.nodes.has(nodeA.id)).toBe(false);
      expect(graph.adjacencyList.has(nodeA.id)).toBe(false);
      expect(graph.edges.size).toBe(0);
    });

    it('should add vertices as alias for nodes', () => {
      const vertex = graph.addVertex('A');
      expect(vertex).toBeInstanceOf(ex.Node);
      expect(graph.vertices.size).toBe(1);
    });

    it('should delete a vertex from the graph', () => {
      const vertex = graph.addVertex('A');
      const remainingNodes = graph.deleteVertex(vertex);
      expect(remainingNodes.size).toBe(0);
    });

    it('should add multiple vertices to the graph', () => {
      const vertices = graph.addVertices(['A', 'B', 'C']);
      expect(vertices.size).toBe(3);
    });

    it('should get a node by its id', () => {
      const node = graph.addNode('A');
      const retrievedNode = graph.getNode(node.id);
      expect(retrievedNode).toBe(node);
    });

    it('should get a vertex by its id', () => {
      const vertex = graph.addVertex('A');
      const retrievedVertex = graph.getVertex(vertex.id);
      expect(retrievedVertex).toBe(vertex);
    });
  });

  describe('Edge operations', () => {
    it('should add a directed edge between two nodes', () => {
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');

      const edges = graph.addEdge(nodeA, nodeB, { weight: 5, directed: true });

      expect(edges.length).toBe(1);
      expect(edges[0].source).toBe(nodeA);
      expect(edges[0].target).toBe(nodeB);
      expect(edges[0].weight).toBe(5);
      expect(graph.adjacencyList.get(nodeA.id)?.has(nodeB.id)).toBe(true);
      expect(graph.adjacencyList.get(nodeB.id)?.has(nodeA.id)).toBe(false);
    });

    it('should add an undirected edge between two nodes', () => {
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');

      const edges = graph.addEdge(nodeA, nodeB, { weight: 5, directed: false });

      expect(edges.length).toBe(2);
      expect(graph.adjacencyList.get(nodeA.id)?.has(nodeB.id)).toBe(true);
      expect(graph.adjacencyList.get(nodeB.id)?.has(nodeA.id)).toBe(true);

      // Check partner edges are linked
      expect(edges[0].partnerEdge).toBe(edges[1]);
      expect(edges[1].partnerEdge).toBe(edges[0]);
    });

    it('should not add duplicate edges', () => {
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');

      graph.addEdge(nodeA, nodeB);
      const duplicateEdges = graph.addEdge(nodeA, nodeB);

      expect(duplicateEdges.length).toBe(0);
      expect(graph.edges.size).toBe(1);
    });

    it('should delete an edge from the graph', () => {
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');

      const edges = graph.addEdge(nodeA, nodeB);
      expect(graph.edges.size).toBe(1);

      graph.deleteEdge(edges[0]);
      expect(graph.edges.size).toBe(0);
      expect(nodeA.edges.size).toBe(0);
      expect(nodeB.edges.size).toBe(0);
    });

    it('should delete an undirected edge and its partner', () => {
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');

      const edges = graph.addEdge(nodeA, nodeB, { directed: false });
      expect(graph.edges.size).toBe(2);

      graph.deleteEdge(edges[0]);
      expect(graph.edges.size).toBe(0);
    });
  });

  describe('Graph queries', () => {
    it('should get neighbors of a node', () => {
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');
      const nodeC = graph.addNode('C');

      graph.addEdge(nodeA, nodeB);
      graph.addEdge(nodeA, nodeC);

      const neighbors = graph.getNeighbors(nodeA);
      expect(neighbors.length).toBe(2);
      expect(neighbors).toContain(nodeB);
      expect(neighbors).toContain(nodeC);
    });

    it('should check if nodes are connected', () => {
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');
      const nodeC = graph.addNode('C');

      graph.addEdge(nodeA, nodeB);

      expect(graph.areNodesConnected(nodeA, nodeB)).toBe(true);
      expect(graph.areNodesConnected(nodeA, nodeC)).toBe(false);
      expect(graph.areNodesConnected(nodeB, nodeA)).toBe(false); // Directed edge
    });

    it('should check if vertices are connected', () => {
      const nodeA = graph.addVertex('A');
      const nodeB = graph.addVertex('B');

      graph.addEdge(nodeA, nodeB, { directed: false });

      expect(graph.areVerticesConnected(nodeA, nodeB)).toBe(true);
      expect(graph.areVerticesConnected(nodeB, nodeA)).toBe(true);
    });
  });

  describe('Graph traversal', () => {
    it('should perform breadth-first search (BFS)', () => {
      // Create a simple graph
      // A -> B -> D
      // |    |
      // v    v
      // C -> E
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');
      const nodeC = graph.addNode('C');
      const nodeD = graph.addNode('D');
      const nodeE = graph.addNode('E');

      graph.addEdge(nodeA, nodeB);
      graph.addEdge(nodeA, nodeC);
      graph.addEdge(nodeB, nodeD);
      graph.addEdge(nodeB, nodeE);
      graph.addEdge(nodeC, nodeE);

      const visited = graph.bfs(nodeA);

      // BFS should visit level by level
      // Could be A, B, C, D, E or A, B, C, E, D depending on implementation
      expect(visited.length).toBe(5);
      expect(visited[0]).toBe(nodeA.id);
      // Check that B and C are visited before D and E
      const indexB = visited.indexOf(nodeB.id);
      const indexC = visited.indexOf(nodeC.id);
      const indexD = visited.indexOf(nodeD.id);
      const indexE = visited.indexOf(nodeE.id);

      expect(indexB).toBeLessThan(indexD);
      expect(indexB).toBeLessThan(indexE);
      expect(indexC).toBeLessThan(indexE);
    });

    it('should perform depth-first search (DFS)', () => {
      // Create a simple graph
      // A -> B -> D
      // |    |
      // v    v
      // C -> E
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');
      const nodeC = graph.addNode('C');
      const nodeD = graph.addNode('D');
      const nodeE = graph.addNode('E');

      graph.addEdge(nodeA, nodeB);
      graph.addEdge(nodeA, nodeC);
      graph.addEdge(nodeB, nodeD);
      graph.addEdge(nodeB, nodeE);
      graph.addEdge(nodeC, nodeE);

      const visited = graph.dfs(nodeA);

      expect(visited.length).toBe(5);
      expect(visited[0]).toBe(nodeA.id);

      // Check that one path is fully explored before backtracking
      // The exact ordering depends on the DFS implementation and how neighbors are processed
    });

    it('should return empty array for BFS with invalid start node', () => {
      const nodeA = graph.addNode('A');
      const invalidNode = new ex.Node('Invalid');

      expect(graph.bfs(invalidNode)).toEqual([]);
    });

    it('should return empty array for DFS with invalid start node', () => {
      const nodeA = graph.addNode('A');
      const invalidNode = new ex.Node('Invalid');

      expect(graph.dfs(invalidNode)).toEqual([]);
    });
  });

  describe('Static graph creation', () => {
    it('should create a graph from nodes', () => {
      const newGraph = ex.Graph.createGraphFromNodes(['A', 'B', 'C']);
      expect(newGraph).toBeInstanceOf(ex.Graph);
      expect(newGraph.nodes.size).toBe(3);
    });

    it('should create a graph from vertices', () => {
      const newGraph = ex.Graph.createGraphFromVertices(['A', 'B', 'C']);
      expect(newGraph).toBeInstanceOf(ex.Graph);
      expect(newGraph.vertices.size).toBe(3);
    });
  });

  describe('Path finding algorithms', () => {
    it("should find shortest path using Dijkstra's algorithm", () => {
      // Create a weighted graph
      //     5
      //  A --- B
      //  |     |
      // 2|     |1
      //  |     |
      //  C --- D
      //     8
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');
      const nodeC = graph.addNode('C');
      const nodeD = graph.addNode('D');

      graph.addEdge(nodeA, nodeB, { weight: 5 });
      graph.addEdge(nodeA, nodeC, { weight: 2 });
      graph.addEdge(nodeB, nodeD, { weight: 1 });
      graph.addEdge(nodeC, nodeD, { weight: 8 });

      const result = graph.dijkstra(nodeA, nodeD);

      expect(result.path).toBeDefined();
      expect(result.path?.length).toBe(3);
      expect(result.path?.[0]).toBe(nodeA);
      expect(result.path?.[1]).toBe(nodeB);
      expect(result.path?.[2]).toBe(nodeD);
      expect(result.distance).toBe(6); // 5 + 1 = 6
    });

    it('should return null path and Infinity distance when no path exists', () => {
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');

      // No edge connecting A and B
      const result = graph.dijkstra(nodeA, nodeB);

      expect(result.path).toBeNull();
      expect(result.distance).toBe(Infinity);
    });

    it('should handle zero-distance path (same node)', () => {
      const nodeA = graph.addNode('A');

      const result = graph.dijkstra(nodeA, nodeA);

      expect(result.path?.length).toBe(1);
      expect(result.path?.[0]).toBe(nodeA);
      expect(result.distance).toBe(0);
    });
  });
  describe('A* algorithm', () => {
    it('should find shortest path using A* algorithm', () => {
      // Create a graph with positioned nodes
      const nodeA = graph.addNode('A', new ex.Vector(0, 0));
      const nodeB = graph.addNode('B', new ex.Vector(1, 0));
      const nodeC = graph.addNode('C', new ex.Vector(0, 1));
      const nodeD = graph.addNode('D', new ex.Vector(1, 1));

      // Add edges with weights
      graph.addEdge(nodeA, nodeB, { weight: 5 });
      graph.addEdge(nodeA, nodeC, { weight: 2 });
      graph.addEdge(nodeB, nodeD, { weight: 1 });
      graph.addEdge(nodeC, nodeD, { weight: 8 });

      const result = graph.aStar(nodeA as ex.PositionNode<string>, nodeD as ex.PositionNode<string>);

      expect(result.path).toBeDefined();
      expect(result.path?.length).toBe(3);
      expect(result.path?.[0]).toBe(nodeA as ex.PositionNode<string>);
      expect(result.path?.[1]).toBe(nodeB as ex.PositionNode<string>);
      expect(result.path?.[2]).toBe(nodeD as ex.PositionNode<string>);
      expect(result.distance).toBe(6); // 5 + 1 = 6
    });

    it('should throw error when A* is used with non-PositionNodes', () => {
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');

      // Type assertion to test error condition
      expect(() => {
        graph.aStar(nodeA as unknown as ex.PositionNode<string>, nodeB as unknown as ex.PositionNode<string>);
      }).toThrow(/requires PositionNode/);
    });

    it('should return null path when no path exists in A*', () => {
      // Create a graph with positioned nodes
      const nodeA = graph.addNode('A', new ex.Vector(0, 0));
      const nodeB = graph.addNode('B', new ex.Vector(1, 1));
      // No edge connecting A and B
      const result = graph.aStar(nodeA as ex.PositionNode<string>, nodeB as ex.PositionNode<string>);

      expect(result.path).toBeNull();
      expect(result.distance).toBe(Infinity);
    });
  });
});
