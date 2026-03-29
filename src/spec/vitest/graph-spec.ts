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

    it('should get a node by its id', () => {
      const node = graph.addNode('A');
      const retrievedNode = graph.getNode(node.id);
      expect(retrievedNode).toBe(node);
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

      graph.addEdge(nodeA, nodeB, { directed: true });
      const duplicateEdges = graph.addEdge(nodeA, nodeB, { directed: true });

      expect(duplicateEdges.length).toBe(0);
      expect(graph.edges.size).toBe(1);
    });

    it('should delete an edge from the graph', () => {
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');

      const edges = graph.addEdge(nodeA, nodeB, { directed: true });
      expect(graph.edges.size).toBe(1);

      graph.deleteEdge(edges[0]);
      expect(graph.edges.size).toBe(0);
      expect(nodeA.edges.size).toBe(0);
      expect(nodeB.edges.size).toBe(0);
    });

    it('should delete an undirected edge and its partner', () => {
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');

      const edges = graph.addEdge(nodeA, nodeB, { weight: 5, directed: false });
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

      graph.addEdge(nodeA, nodeB, { directed: true });

      expect(graph.areNodesConnected(nodeA, nodeB)).toBe(true);
      expect(graph.areNodesConnected(nodeA, nodeC)).toBe(false);
      expect(graph.areNodesConnected(nodeB, nodeA)).toBe(false); // Directed edge
    });
  });

  describe('traversal', () => {
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
  });

  describe('Path finding algorithms', () => {
    it('should create a Djikstra analysis of nodeA', () => {
      // Create a weighted graph
      //     5
      //  A --- B
      //  |     |
      // 2|     |1
      //  |     |
      //  C --- D     E (unreachable node)
      //     8
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');
      const nodeC = graph.addNode('C');
      const nodeD = graph.addNode('D');
      const nodeE = graph.addNode('E');

      graph.addEdge(nodeA, nodeB, { weight: 5 });
      graph.addEdge(nodeA, nodeC, { weight: 2 });
      graph.addEdge(nodeB, nodeD, { weight: 1 });
      graph.addEdge(nodeC, nodeD, { weight: 8 });

      const result = graph.dijkstra(nodeA);

      expect(result.length).toBe(5);
      expect(result[0].node).toBe(nodeA);
      expect(result[0].distance).toBe(0);
      expect(result[1].node).toBe(nodeB);
      expect(result[1].distance).toBe(5);
      expect(result[2].node).toBe(nodeC);
      expect(result[2].distance).toBe(2);
      expect(result[3].node).toBe(nodeD);
      expect(result[3].distance).toBe(6);
      expect(result[4].node).toBe(nodeE);
      expect(result[4].distance).toBe(Infinity);
    });

    it('should find shortest path between two nodes', () => {
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');
      const nodeC = graph.addNode('C');
      const nodeD = graph.addNode('D');
      const nodeE = graph.addNode('E');

      //add edges

      graph.addEdge(nodeA, nodeB, { weight: 5 });
      graph.addEdge(nodeA, nodeC, { weight: 2 });
      graph.addEdge(nodeB, nodeD, { weight: 1 });
      graph.addEdge(nodeC, nodeD, { weight: 8 });
      graph.addEdge(nodeD, nodeE, { weight: 3 });

      // Find shortest path between A and E
      const result = graph.shortestPathDijkstra(nodeA, nodeE);

      expect(result.path.length).toBe(4);
      expect(result.path[0]).toBe(nodeA);
      expect(result.path[1]).toBe(nodeB);
      expect(result.path[2]).toBe(nodeD);
      expect(result.path[3]).toBe(nodeE);
      expect(result.distance).toBe(9);
    });

    it('should return graph with Infinity distance', () => {
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');

      // No edge connecting A and B
      const result = graph.dijkstra(nodeA);

      expect(result.length).toBe(2);
      expect(result[0].node).toBe(nodeA);
      expect(result[0].distance).toBe(0);
      expect(result[1].node).toBe(nodeB);
      expect(result[1].distance).toBe(Infinity);
    });

    it('should handle zero-distance path (same node)', () => {
      const nodeA = graph.addNode('A');

      const result = graph.dijkstra(nodeA);

      expect(result.length).toBe(1);
      expect(result[0].node).toBe(nodeA);
      expect(result[0].distance).toBe(0);
    });

    it('should find shortest path between two nodes', () => {
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');
      const nodeC = graph.addNode('C');
      const nodeD = graph.addNode('D');
      const nodeE = graph.addNode('E');

      graph.addEdge(nodeA, nodeB, { weight: 5 });
      graph.addEdge(nodeA, nodeC, { weight: 2 });
      graph.addEdge(nodeB, nodeD, { weight: 1 });
      graph.addEdge(nodeC, nodeD, { weight: 8 });
      graph.addEdge(nodeD, nodeE, { weight: 3 });

      const result = graph.shortestPathDijkstra(nodeA, nodeE);
      expect(result.path.length).toBe(4);
      expect(result.path[0]).toBe(nodeA);
      expect(result.path[1]).toBe(nodeB);
      expect(result.path[2]).toBe(nodeD);
      expect(result.path[3]).toBe(nodeE);
      expect(result.distance).toBe(9);
    });

    it('should return empty path when no path exists', () => {
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');

      const result = graph.shortestPathDijkstra(nodeA, nodeB);
      expect(result.path.length).toBe(0);
      expect(result.distance).toBe(Infinity);
    });
  });

  describe('A* algorithm', () => {
    it('should find shortest path using A* algorithm', () => {
      // Create a graph with positioned nodes
      const nodeA = graph.addNode('A', new ex.Vector(0, 0));
      const nodeB = graph.addNode('B', new ex.Vector(3, 0));
      const nodeC = graph.addNode('C', new ex.Vector(0, 4));
      const nodeD = graph.addNode('D', new ex.Vector(3, 4));

      // Add edges with weights
      graph.addEdge(nodeA, nodeB);
      graph.addEdge(nodeA, nodeC);
      graph.addEdge(nodeB, nodeD);
      graph.addEdge(nodeC, nodeD);

      /*
      A -> B
      |     |
      v     v
      C -> D
      */

      const result = graph.aStar(nodeA as ex.PositionNode<string>, nodeD as ex.PositionNode<string>);

      expect(result.path).toBeDefined();
      expect(result.path?.length).toBe(3);
      expect(result.pathSteps).toBe(2);
      expect(result.path?.[0]).toBe(nodeA as ex.PositionNode<string>);
      expect(result.path?.[1]).toBe(nodeB as ex.PositionNode<string>);
      expect(result.path?.[2]).toBe(nodeD as ex.PositionNode<string>);
      expect(result.distance).toBe(5);
    });

    it('should throw error when A* is used with non-PositionNodes', () => {
      const nodeA = graph.addNode('A');
      const nodeB = graph.addNode('B');

      // Type assertion to test error condition
      expect(() => {
        graph.aStar(nodeA as unknown as ex.PositionNode<string>, nodeB as unknown as ex.PositionNode<string>);
      }).toThrow(new Error('A* algorithm requires PositionNode with position vectors'));
    });

    it('should return null path when no path exists in A*', () => {
      // Create a graph with positioned nodes
      const nodeA = graph.addNode('A', new ex.Vector(0, 0));
      const nodeB = graph.addNode('B', new ex.Vector(1, 1));
      // No edge connecting A and B
      const result = graph.aStar(nodeA as ex.PositionNode<string>, nodeB as ex.PositionNode<string>);

      //path will be empty array and distance will be Infinity
      expect(result.path.length).toBe(0);
      expect(result.pathSteps).toBe(0);
      expect(result.distance).toBe(Infinity);
    });
  });
});
