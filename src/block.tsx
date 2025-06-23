import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import { LIQUIDS, LiquidType, CONTAINER_HEIGHT, CONTAINER_WIDTH, CONTAINER_DEPTH } from './liquidData';
import FluidLayer from './FluidLayer';
import Container from './Container';

interface BlockProps {
  title?: string;
  description?: string;
}

interface FluidState {
  liquid: LiquidType;
  volume: number;
  height: number;
  yPosition: number;
}

const Block: React.FC<BlockProps> = ({ title, description }) => {
  const [selectedLiquids, setSelectedLiquids] = useState<LiquidType[]>([]);
  const [fluidLayers, setFluidLayers] = useState<FluidState[]>([]);
  const [isPouring, setIsPouring] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showInfo, setShowInfo] = useState(true);
  const [selectedLiquidForInfo, setSelectedLiquidForInfo] = useState<LiquidType | null>(null);

  // Send completion event on first interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      window.postMessage({ 
        type: 'BLOCK_COMPLETION', 
        blockId: 'fluid-density-simulation', 
        completed: true,
        data: { interactionType: 'simulation_started' }
      }, '*');
      window.parent.postMessage({ 
        type: 'BLOCK_COMPLETION', 
        blockId: 'fluid-density-simulation', 
        completed: true,
        data: { interactionType: 'simulation_started' }
      }, '*');
    };

    // Send completion on first liquid selection
    if (selectedLiquids.length > 0) {
      handleFirstInteraction();
    }
  }, [selectedLiquids]);

  const calculateFluidLayers = (liquids: LiquidType[]) => {
    if (liquids.length === 0) return [];

    // Sort liquids by density (heaviest at bottom)
    const sortedLiquids = [...liquids].sort((a, b) => b.density - a.density);
    
    const volumePerLiquid = (CONTAINER_WIDTH * CONTAINER_DEPTH * CONTAINER_HEIGHT * 0.7) / liquids.length;
    const layers: FluidState[] = [];
    let currentYPosition = -CONTAINER_HEIGHT / 2 + 0.1; // Start just above bottom

    sortedLiquids.forEach((liquid) => {
      const height = volumePerLiquid / (CONTAINER_WIDTH * CONTAINER_DEPTH);
      const layerYPosition = currentYPosition + height / 2;
      
      layers.push({
        liquid,
        volume: volumePerLiquid,
        height,
        yPosition: layerYPosition
      });
      
      currentYPosition += height;
    });

    return layers;
  };

  const addLiquid = (liquid: LiquidType) => {
    if (selectedLiquids.length >= 7) return; // Limit to 7 liquids
    
    const newLiquids = [...selectedLiquids, liquid];
    setSelectedLiquids(newLiquids);
    setIsPouring(true);
    
    setTimeout(() => {
      setFluidLayers(calculateFluidLayers(newLiquids));
      setIsPouring(false);
    }, 1000);
  };

  const removeLiquid = (liquidToRemove: LiquidType) => {
    const newLiquids = selectedLiquids.filter(l => l.name !== liquidToRemove.name);
    setSelectedLiquids(newLiquids);
    setFluidLayers(calculateFluidLayers(newLiquids));
  };

  const clearContainer = () => {
    setSelectedLiquids([]);
    setFluidLayers([]);
  };

  const Scene = () => (
    <>
      {/* Enhanced Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
      <directionalLight position={[-10, 5, 5]} intensity={0.4} />
      <pointLight position={[0, 8, 8]} intensity={0.6} />
      
      {/* Container - Always visible */}
      <Container position={[0, 0, 0]} />
      
      {/* Fluid Layers */}
      {fluidLayers.map((layer, index) => (
        <FluidLayer
          key={`${layer.liquid.name}-${index}`}
          liquid={layer.liquid}
          height={layer.height}
          position={[0, layer.yPosition, 0]}
          containerWidth={CONTAINER_WIDTH}
          containerDepth={CONTAINER_DEPTH}
          isPouring={isPouring}
          animationSpeed={animationSpeed}
        />
      ))}
      
      {/* Density Labels - Only show when liquids are present */}
      {fluidLayers.map((layer, index) => (
        <Text
          key={`label-${layer.liquid.name}-${index}`}
          position={[CONTAINER_WIDTH/2 + 1.5, layer.yPosition, 0]}
          fontSize={0.4}
          color="#333"
          anchorX="left"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#fff"
        >
          {layer.liquid.name}
          {'\n'}{layer.liquid.density} kg/m³
        </Text>
      ))}
      
      {/* Title */}
      <Text
        position={[0, CONTAINER_HEIGHT/2 + 2, 0]}
        fontSize={0.8}
        color="#333"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#fff"
      >
        3D Fluid Density Simulation
      </Text>
      
      {/* Empty Container Instruction */}
      {fluidLayers.length === 0 && (
        <Text
          position={[0, 0, 0]}
          fontSize={0.5}
          color="#666"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#fff"
        >
          Add liquids to see density layering!
          {'\n'}⬅ Click "Add" buttons on the left
        </Text>
      )}
      
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={25}
        target={[0, 0, 0]}
      />
    </>
  );

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      display: 'flex',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Control Panel */}
      <div style={{
        width: '350px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '20px',
        overflowY: 'auto',
        borderRight: '1px solid #ddd'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '24px' }}>
          Liquid Density Explorer
        </h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#555', fontSize: '16px' }}>
            Available Liquids
          </h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            {LIQUIDS.map((liquid) => (
              <div key={liquid.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: selectedLiquids.includes(liquid) ? '#e8f5e8' : '#fff'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: liquid.color,
                  borderRadius: '50%',
                  border: '1px solid #ccc'
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    {liquid.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {liquid.density} kg/m³
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={() => addLiquid(liquid)}
                    disabled={selectedLiquids.includes(liquid) || selectedLiquids.length >= 7}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      border: 'none',
                      borderRadius: '4px',
                      background: selectedLiquids.includes(liquid) || selectedLiquids.length >= 7 ? '#ccc' : '#4CAF50',
                      color: 'white',
                      cursor: selectedLiquids.includes(liquid) || selectedLiquids.length >= 7 ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {selectedLiquids.includes(liquid) ? 'Added' : 'Add'}
                  </button>
                  <button
                    onClick={() => setSelectedLiquidForInfo(liquid)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Info
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedLiquids.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#555', fontSize: '16px' }}>
              In Container (by density)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {[...selectedLiquids].sort((a, b) => b.density - a.density).map((liquid, index) => (
                <div key={liquid.name} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px',
                  background: liquid.color + '20',
                  borderRadius: '4px',
                  border: '1px solid ' + liquid.color + '40'
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    #{index + 1}
                  </div>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    background: liquid.color,
                    borderRadius: '50%'
                  }} />
                  <div style={{ flex: 1, fontSize: '14px' }}>
                    {liquid.name}
                  </div>
                  <button
                    onClick={() => removeLiquid(liquid)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      border: 'none',
                      borderRadius: '4px',
                      background: '#f44336',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#555', fontSize: '16px' }}>
            Controls
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '14px' }}>
              Animation Speed: {animationSpeed.toFixed(1)}x
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                style={{ width: '100%', marginTop: '5px' }}
              />
            </label>
            <button
              onClick={clearContainer}
              disabled={selectedLiquids.length === 0}
              style={{
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                background: selectedLiquids.length === 0 ? '#ccc' : '#f44336',
                color: 'white',
                fontSize: '14px',
                cursor: selectedLiquids.length === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              Clear Container
            </button>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
          <strong>How to use:</strong><br/>
          • Click "Add" to pour liquids into the container<br/>
          • Liquids will automatically layer by density<br/>
          • Use mouse to rotate, zoom, and pan the 3D view<br/>
          • Compare densities and observe the layering effect<br/>
          • Heavier liquids sink to the bottom
        </div>
      </div>

      {/* 3D Scene */}
      <div style={{ flex: 1 }}>
        <Canvas
          camera={{ position: [12, 6, 12], fov: 50 }}
          style={{ background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)' }}
        >
          <Scene />
        </Canvas>
      </div>

      {/* Info Modal */}
      {selectedLiquidForInfo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '500px',
            margin: '20px'
          }}>
            <h2 style={{
              margin: '0 0 20px 0',
              color: selectedLiquidForInfo.color,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                background: selectedLiquidForInfo.color,
                borderRadius: '50%'
              }} />
              {selectedLiquidForInfo.name}
            </h2>
            <div style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
              <p><strong>Description:</strong> {selectedLiquidForInfo.description}</p>
              <p><strong>Density:</strong> {selectedLiquidForInfo.density} kg/m³</p>
              <p><strong>Viscosity:</strong> {selectedLiquidForInfo.viscosity}x (relative to water)</p>
              <p style={{ fontSize: '14px', color: '#666', marginTop: '15px' }}>
                <strong>Educational Note:</strong> Density determines how liquids layer. 
                Denser liquids sink below less dense ones, creating distinct layers you can observe in the simulation.
              </p>
            </div>
            <button
              onClick={() => setSelectedLiquidForInfo(null)}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '8px',
                background: '#2196F3',
                color: 'white',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Block;