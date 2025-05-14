import React, { useState, useEffect } from 'react';
import GraphVisualization from './GraphVisualization';
import FarmMapGoogle from './FarmMapGoogle';
import FarmMap from './FarmMap';
import './App.css';

const App = () => {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Import the data from data.js
    import('./data.js')
      .then(module => {
        console.log("Data loaded:", module);
        const data = module.default || module.simple;
        console.log("Data processed:", data);
        setGraphData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error loading data:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="app">
      <header>
        <h1>TruTrace Supply Chain Graph</h1>
      </header>
      <main>
        {loading ? (
          <div className="loading">Loading graph data...</div>
        ) : (
          <div className="content-container">
            <GraphVisualization data={graphData} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;