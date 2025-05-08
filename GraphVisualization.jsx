import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import * as d3 from 'd3';
import './GraphStyles.css';

const GraphVisualization = ({ data }) => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const fgRef = useRef();

  useEffect(() => {
    if (!data || data.length < 2) return;
    
    // Process nodes from the first object
    const nodes = [];
    const nodeCategories = Object.keys(data[0]);
    
    nodeCategories.forEach(category => {
      data[0][category].forEach(node => {
        // Get display name from appropriate attribute field, or create a short abbreviation
        let shortLabel = '';
        
        // For Farmer nodes - use name if available, or first 2 chars
        if (node.v_type === 'Farmer') {
          shortLabel = node.attributes.name ? 
            node.attributes.name.substring(0, 2).toUpperCase() : 'FM';
        }
        // For Farmer_Group nodes - use name or abbreviation
        else if (node.v_type === 'Farmer_Group') {
          if (node.attributes.name) {
            // Get first letter of each word
            const words = node.attributes.name.split(' ');
            if (words.length > 1) {
              shortLabel = words.map(word => word.charAt(0)).join('').toUpperCase();
            } else {
              shortLabel = node.attributes.name.substring(0, 2).toUpperCase();
            }
          } else {
            shortLabel = 'FG';
          }
        }
        // For Local_Buying_Agent nodes
        else if (node.v_type === 'Local_Buying_Agent') {
          shortLabel = node.attributes.name ? 
            node.attributes.name.substring(0, 2).toUpperCase() : 'BA';
        }
        // For Lot nodes - use first part of ID or fixed value
        else if (node.v_type === 'Lot') {
          const idParts = node.v_id.split('_');
          shortLabel = idParts.length > 1 ? idParts[1].substring(0, 2).toUpperCase() : 'LT';
        }
        // For Purchase_Order nodes - use part of ID
        else if (node.v_type === 'Purchase_Order') {
          shortLabel = node.attributes.id ? 
            node.attributes.id.substring(0, 2) : 'PO';
        }
        // For PMB nodes - use batch number if available
        else if (node.v_type === 'PMB') {
          shortLabel = node.attributes.batch_no ? 
            node.attributes.batch_no.substring(0, 2).toUpperCase() : 'PM';
        }
        // Fallback to first 2 chars of ID
        else {
          shortLabel = node.v_id.substring(0, 2).toUpperCase();
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
    
    // Process edges from the second object
    const links = data[1].edges.map(edge => ({
      source: edge.from_id,
      target: edge.to_id,
      type: edge.e_type,
      // Override the 'directed' property to make all edges directed
      // This ensures graph shows directions despite data saying "directed": false
      directed: true
    }));
    
    setGraphData({ nodes, links });
  }, [data]);

  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      fgRef.current.d3Force('charge').strength(-600);
      fgRef.current.d3Force('link').distance(200);
      fgRef.current.zoom(1.2);
      
      // Spread nodes out more for better visibility
      fgRef.current.d3Force('center').strength(0.05);
      
      // Add collision force to prevent node overlap
      fgRef.current.d3Force('collision', d3.forceCollide(30));
    }
  }, [graphData]);

  const getNodeColor = (type) => {
    const colorMap = {
      'Farmer': '#4CAF50',      // Green
      'Farmer_Group': '#2196F3', // Blue
      'Local_Buying_Agent': '#FFA500', // Orange
      'Lot': '#9C27B0',         // Purple
      'Purchase_Order': '#F44336', // Red
      'PMB': '#795548'          // Brown
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
        {['Farmer', 'Farmer_Group', 'Local_Buying_Agent', 'Lot', 'Purchase_Order', 'PMB'].map(type => (
          <div key={type} className="legend-item">
            <span className="legend-color" style={{ backgroundColor: getNodeColor(type) }}></span>
            <span className="legend-label">{type.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
      
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeRelSize={12}
        nodeLabel={null} // We'll handle this in nodeCanvasObject
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        linkColor={() => '#999'}
        linkWidth={1.5}
        onNodeClick={handleNodeClick}
        onNodeHover={(node) => {
          document.body.style.cursor = node ? 'pointer' : 'default';
          setSelectedNode(node || null);
        }}
        nodeCanvasObject={(node, ctx, globalScale) => {
          // Make nodes slightly bigger than in the screenshot
          const nodeRadius = 20; 
          const fontSize = 12;
          
          // Node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
          ctx.fillStyle = node.color;
          ctx.fill();
          
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
          
          // If node is hovered/selected, highlight it with a white border
          if (node === selectedNode) {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }}
      />
      
      {renderNodeTooltip()}
    </div>
  );
};

export default GraphVisualization;