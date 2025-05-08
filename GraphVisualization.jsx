import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
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
        nodes.push({
          id: node.v_id,
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
      directed: edge.directed
    }));
    
    setGraphData({ nodes, links });
  }, [data]);

  useEffect(() => {
    if (fgRef.current && graphData.nodes.length > 0) {
      fgRef.current.d3Force('charge').strength(-400);
      fgRef.current.d3Force('link').distance(150);
      fgRef.current.zoom(1.5);
    }
  }, [graphData]);

  const getNodeColor = (type) => {
    const colorMap = {
      'Farmer': '#4CAF50',
      'Farmer_Group': '#2196F3',
      'Local_Buying_Agent': '#FF9800',
      'Lot': '#9C27B0',
      'Purchase_Order': '#F44336',
      'PMB': '#795548'
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
        nodeRelSize={8}
        nodeLabel={node => `${node.type}: ${node.id}`}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        linkColor={() => '#999'}
        linkWidth={1.5}
        onNodeClick={handleNodeClick}
        onNodeHover={node => {
          document.body.style.cursor = node ? 'pointer' : 'default';
          if (!node) setSelectedNode(null);
        }}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.id;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          
          // Node circle
          ctx.beginPath();
          ctx.arc(node.x, node.y, 6, 0, 2 * Math.PI);
          ctx.fillStyle = node.color;
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          
          // Text label
          const textWidth = ctx.measureText(label).width;
          const bckgDimensions = [textWidth + 8, fontSize + 4].map(n => n + fontSize * 0.2);
          
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(
            node.x - bckgDimensions[0] / 2,
            node.y + 8,
            bckgDimensions[0],
            bckgDimensions[1]
          );
          
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#333';
          ctx.fillText(
            label, 
            node.x, 
            node.y + 8 + bckgDimensions[1] / 2
          );
        }}
      />
      
      {renderNodeTooltip()}
    </div>
  );
};

export default GraphVisualization;