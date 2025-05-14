import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import * as d3 from 'd3';
import './GraphStyles.css';

// Log for debugging
console.log("GraphVisualization component loaded");

const GraphVisualization = ({ data }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight - 65 // Adjust for header
  });
  const fgRef = useRef();
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 65
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Track if node was dragged to fix its position
  const [draggedNodes, setDraggedNodes] = useState(new Set());

  useEffect(() => {
    console.log("GraphVisualization received data:", data);
    if (!data || !data.length) {
      console.log("No data received or data is not an array");
      return;
    }
    console.log("Data structure type:", typeof data, Array.isArray(data));
    
    const nodes = [];
    let links = [];
    
    // Check which data structure we have
    if (data[0].node && Array.isArray(data[0].node)) {
      // New data structure with node array
      data[0].node.forEach(node => {
        // Process nodes
        let shortLabel = '';
        
        if (node.v_type === 'Farmer') {
          shortLabel = 'nu';
        }
        else if (node.v_type === 'Farmer_Group') {
          shortLabel = 'FG';
        }
        else if (node.v_type === 'Local_Buying_Agent') {
          shortLabel = 'BA';
        }
        else if (node.v_type === 'Lot') {
          shortLabel = '123';
        }
        else if (node.v_type === 'Purchase_Order') {
          shortLabel = '61';
        }
        else if (node.v_type === 'PMB') {
          shortLabel = 'PM';
        }
        else if (node.v_type === 'Process_Order') {
          shortLabel = 'PO';
        }
        else if (node.v_type === 'Transfer_Order') {
          shortLabel = 'TO';
        }
        else {
          shortLabel = 'NA';
        }
        
        // Use specific name attributes based on node type
        const displayName = 
          node.attributes.farmer_name || 
          node.attributes.buying_agent_name || 
          node.attributes.farmer_group_name || 
          node.attributes.name || 
          node.v_id;
        
        nodes.push({
          id: node.v_id,
          name: displayName,
          shortLabel: shortLabel,
          type: node.v_type,
          attributes: node.attributes,
          color: getNodeColor(node.v_type)
        });
      });
      
      // Process edges from new structure and filter out links with non-existent nodes
      if (data[0].edges && Array.isArray(data[0].edges)) {
        // Create a set of valid node IDs for quick lookup
        const nodeIds = new Set(nodes.map(node => node.id));

        // Create a map for edge type colors
        const edgeTypeColors = {
          'Has': '#4CAF50', // Green
          'Has_Farmer_Group': '#2196F3', // Blue
          'Has_Process_Order': '#FF5722', // Deep Orange
          'Has_Order': '#F44336', // Red
          'Has_Buying_Agent': '#9C27B0', // Purple
          'Contains_Lot': '#795548', // Brown
          'Transfer': '#009688' // Teal
        };

        // Only include edges where both source and target nodes exist
        links = data[0].edges
          .filter(edge => nodeIds.has(edge.from_id) && nodeIds.has(edge.to_id))
          .map(edge => ({
            source: edge.from_id,
            target: edge.to_id,
            type: edge.e_type,
            color: edgeTypeColors[edge.e_type] || '#999',
            directed: true
          }));
      }
    } else {
      // Original data structure with separate node categories
      const nodeCategories = Object.keys(data[0]);
      
      nodeCategories.forEach(category => {
        data[0][category].forEach(node => {
          let shortLabel = '';
          
          if (node.v_type === 'Farmer') {
            shortLabel = 'nu';
          }
          else if (node.v_type === 'Farmer_Group') {
            shortLabel = 'FG';
          }
          else if (node.v_type === 'Local_Buying_Agent') {
            shortLabel = 'BA';
          }
          else if (node.v_type === 'Lot') {
            shortLabel = '123';
          }
          else if (node.v_type === 'Purchase_Order') {
            shortLabel = '61';
          }
          else if (node.v_type === 'PMB') {
            shortLabel = 'PM';
          }
          else if (node.v_type === 'Process_Order') {
            shortLabel = 'PO';
          }
          else if (node.v_type === 'Transfer_Order') {
            shortLabel = 'TO';
          }
          else {
            shortLabel = 'NA';
          }
          
          // Use the name attribute if available, otherwise use id
          const displayName = node.attributes.name || node.v_id;
          
          nodes.push({
            id: node.v_id,
            name: displayName,
            shortLabel: shortLabel,
            type: node.v_type,
            category,
            attributes: node.attributes,
            color: getNodeColor(node.v_type)
          });
        });
      });
      
      // Process edges from the second object and filter out links with non-existent nodes
      if (data[1] && data[1].edges) {
        // Create a set of valid node IDs for quick lookup
        const nodeIds = new Set(nodes.map(node => node.id));

        // Create a map for edge type colors
        const edgeTypeColors = {
          'Has': '#4CAF50', // Green
          'Has_Farmer_Group': '#2196F3', // Blue
          'Has_Process_Order': '#FF5722', // Deep Orange
          'Has_Order': '#F44336', // Red
          'Has_Buying_Agent': '#9C27B0', // Purple
          'Contains_Lot': '#795548', // Brown
          'Transfer': '#009688' // Teal
        };

        // Only include edges where both source and target nodes exist
        links = data[1].edges
          .filter(edge => nodeIds.has(edge.from_id) && nodeIds.has(edge.to_id))
          .map(edge => ({
            source: edge.from_id,
            target: edge.to_id,
            type: edge.e_type,
            color: edgeTypeColors[edge.e_type] || '#999',
            directed: true
          }));
      }
    }
    
    const processedData = { nodes, links };
    console.log("Processed graph data:", processedData);
    setGraphData(processedData);
  }, [data]);

  useEffect(() => {
    console.log("Second useEffect - Graph data:", graphData, "fgRef exists:", !!fgRef.current);
    if (fgRef.current && graphData.nodes.length > 0) {
      console.log("Setting up force graph with", graphData.nodes.length, "nodes and", graphData.links.length, "links");
      // Define the order of node types from left to right
      const nodeTypeOrder = [
        'Farmer',
        'Farmer_Group',
        'Local_Buying_Agent',
        'Lot',
        'Purchase_Order',
        'PMB',
        'Process_Order',
        'Transfer_Order'
      ];
      
      // Calculate X positions based on node type order (strict columns)
      const totalWidth = dimensions.width * 0.85; // Use 85% of the width
      const xStep = totalWidth / (nodeTypeOrder.length - 1); // Equal spacing
      const xOffset = -totalWidth / 2; // Center the line
      
      // For a straight line layout, reduce or remove most forces
      
      // Very weak charge force - just enough to prevent complete overlap
      fgRef.current.d3Force('charge').strength(-50);
      
      // Use longer distance for links with low strength
      fgRef.current.d3Force('link')
        .distance(xStep)  // Match the column spacing
        .strength(0.05);  // Very weak link influence
      
      // No center force for a straight line
      fgRef.current.d3Force('center', null);
      
      // Minimal collision detection just to prevent exact overlap
      fgRef.current.d3Force('collision', d3.forceCollide(30));
      
      // Remove any gravity force
      fgRef.current.d3Force('gravity', null);
      
      // Clear any initial velocities for a controlled straight line layout
      graphData.nodes.forEach(node => {
        // Reset velocities
        node.vx = 0;
        node.vy = 0;
      });
      
      // Set exact X positions for nodes
      graphData.nodes.forEach(node => {
        if (node.fx === undefined) { // Don't override manually positioned nodes
          const typeIndex = nodeTypeOrder.indexOf(node.type);
          if (typeIndex >= 0) {
            // Fixed X position for each node type
            node.fx = xOffset + (typeIndex * xStep);
            
            // For Y position, use a small random offset for nodes of the same type
            // to prevent perfect overlap
            const nodeTypeNodes = graphData.nodes.filter(n => n.type === node.type);
            const indexInType = nodeTypeNodes.indexOf(node);
            const totalOfType = nodeTypeNodes.length;
            
            if (totalOfType > 1) {
              // Create a vertical distribution for nodes of the same type
              const yRange = 150; // Maximum vertical range for nodes of the same type
              const yStep = yRange / (totalOfType - 1 || 1);
              const yCenter = 0; // Center Y position
              
              // Position nodes vertically, centered around yCenter
              const yPos = yCenter - (yRange / 2) + (indexInType * yStep);
              node.fy = yPos;
            } else {
              // If only one node of this type, put it in the center
              node.fy = 0;
            }
          }
        }
      });
      
      // Set much stronger positioning forces to maintain the line
      fgRef.current.d3Force('x', d3.forceX(node => node.fx || 0).strength(0.8));
      fgRef.current.d3Force('y', d3.forceY(node => node.fy || 0).strength(0.8));

      // For straight line layout, set zoom directly instead of auto-fitting
      setTimeout(() => {
        // Calculate zoom level based on window width to ensure the entire line is visible
        // Use the same totalWidth that was calculated above
        const idealZoom = (dimensions.width / (totalWidth + 200)) * 0.85;
        
        // Center the view at 0,0
        fgRef.current.centerAt(0, 0, 800);
        
        // Apply custom zoom level
        fgRef.current.zoom(idealZoom, 800);
      }, 500);
    }
  }, [graphData]);

  const getNodeColor = (type) => {
    // Match exact colors from screenshot
    const colorMap = {
      'Farmer': '#4CAF50',       // Green
      'Farmer_Group': '#2196F3', // Blue 
      'Local_Buying_Agent': '#FFA500', // Orange
      'Lot': '#9C27B0',          // Purple
      'Purchase_Order': '#F44336', // Red
      'PMB': '#795548',          // Brown
      'Process_Order': '#FF5722', // Deep Orange
      'Transfer_Order': '#009688' // Teal
    };
    
    return colorMap[type] || '#607D8B';
  };

  const handleNodeClick = (node) => {
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(2, 1000);
    }
    setSelectedNode(node);
  };
  
  // Handle double-click to release a node's fixed position
  const handleNodeDoubleClick = (node) => {
    // Remove fixed positioning
    node.fx = undefined;
    node.fy = undefined;
    
    // Update dragged nodes set
    setDraggedNodes(prev => {
      const newSet = new Set(prev);
      newSet.delete(node.id);
      return newSet;
    });
  };

  const renderNodeTooltip = () => {
    if (!selectedNode) return null;
    
    return (
      <div className="node-tooltip">
        <h3>{selectedNode.type}</h3>
        <p>ID: {selectedNode.id}</p>
        <div className="attributes">
          {Object.entries(selectedNode.attributes).map(([key, value]) => (
            <div key={key} className="attribute-row">
              <span className="attribute-key">{key}:</span>
              <span className="attribute-value">
                {typeof value === 'boolean' 
                  ? value ? '✓' : '✗'
                  : String(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="graph-container">
      <div className="legend">
        <div className="legend-section" style={{marginBottom: '10px'}}>
          <div style={{fontSize: '12px', marginBottom: '5px', fontStyle: 'italic', color: '#666'}}>
            Nodes are in columns by type, from left to right.
            <br />
            You can drag nodes to adjust position. Right-click to reset.
          </div>
        </div>
        <div className="legend-section">
          <h4>Node Types</h4>
          {['Farmer', 'Farmer_Group', 'Local_Buying_Agent', 'Lot', 'Purchase_Order', 'PMB', 'Process_Order', 'Transfer_Order'].map(type => (
            <div key={type} className="legend-item">
              <span className="legend-color" style={{ backgroundColor: getNodeColor(type) }}></span>
              <span className="legend-label">{type.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
        <div className="legend-section">
          <h4>Edge Types</h4>
          {['Has', 'Has_Farmer_Group', 'Has_Process_Order', 'Has_Order', 'Has_Buying_Agent', 'Contains_Lot', 'Transfer'].map(type => (
            <div key={type} className="legend-item">
              <span className="legend-line" style={{ backgroundColor:
                type === 'Has' ? '#4CAF50' :
                type === 'Has_Farmer_Group' ? '#2196F3' :
                type === 'Has_Process_Order' ? '#FF5722' :
                type === 'Has_Order' ? '#F44336' :
                type === 'Has_Buying_Agent' ? '#9C27B0' :
                type === 'Contains_Lot' ? '#795548' :
                type === 'Transfer' ? '#009688' : '#999'
              }}></span>
              <span className="legend-label">{type.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
      </div>
      
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        width={dimensions.width} // Use dynamic width
        height={dimensions.height} // Use dynamic height
        nodeRelSize={16} // Larger nodes
        nodeLabel={null} // We'll handle this in nodeCanvasObject
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        minZoom={0.5}
        maxZoom={5}
        linkDirectionalArrowLength={8} // Larger arrow to match node size
        linkDirectionalArrowRelPos={1} // At the end of the link
        linkDirectionalArrowColor={(link) => link.color || '#555'} // Match link color
        linkWidth={2} // Slightly thinner for cleaner look in straight layout
        linkLineDash={[]} // No dash pattern
        linkDirectionalParticles={0} // No particles
        linkColor={(link) => {
          // Use lighter link colors for better visibility against the structured layout
          const baseColor = link.color || '#555';
          // Convert hex to rgba with some transparency
          return baseColor.startsWith('#') 
            ? `${baseColor}CC` // Add 80% opacity if it's a hex color
            : baseColor;
        }}
        cooldownTicks={200}
        cooldownTime={10000}
        d3AlphaDecay={0.01} // Slower decay for more gradual settling
        d3VelocityDecay={0.08} // Even lower velocity decay for more horizontal movement
        d3AlphaMin={0.001} // Ensure simulation runs longer for better layout
        linkCurvature={0} // Set to 0 for straight lines
        onNodeClick={handleNodeClick}
        onNodeRightClick={handleNodeDoubleClick} // Use right-click as alternative to double-click
        onNodeHover={(node) => {
          document.body.style.cursor = node ? 'pointer' : 'default';
          setSelectedNode(node || null);
        }}
        onNodeDragStart={(node) => {
          // When node drag starts, add it to the fixed nodes
          node.fx = node.x;
          node.fy = node.y;
          setDraggedNodes(prev => {
            const newSet = new Set(prev);
            newSet.add(node.id);
            return newSet;
          });
        }}
        onNodeDrag={(node) => {
          // Update fixed coordinates while dragging
          node.fx = node.x;
          node.fy = node.y;
        }}
        onNodeDragEnd={(node) => {
          // Keep the node fixed where user dropped it
          node.fx = node.x;
          node.fy = node.y;
        }}
        nodeCanvasObject={(node, ctx, globalScale) => {
          // Bigger nodes for better visibility
          const nodeRadius = 20; 
          const fontSize = 12;
          
          // Node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
          ctx.fillStyle = node.color;
          ctx.fill();
          
          // Add subtle border to manually positioned nodes
          if (node.fx !== undefined && node.fy !== undefined) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          
          // Draw the short label inside
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'white';
          ctx.font = `bold ${fontSize}px Sans-Serif`;
          
          // Display the short label
          ctx.fillText(
            node.shortLabel,
            node.x,
            node.y
          );
          
          // Add highlight when hovering
          if (node === selectedNode) {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3; // Thicker highlight border
            ctx.stroke();
            
            // Add outer glow for selected node
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius + 5, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 4;
            ctx.stroke();
          }
        }}
      />
      
      {renderNodeTooltip()}
    </div>
  );
};

export default GraphVisualization;