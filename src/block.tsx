import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { LIQUIDS, LiquidType, CONTAINER_HEIGHT, CONTAINER_WIDTH, CONTAINER_DEPTH } from './liquidData';

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

// Simple Container Component
const SimpleContainer = ({ position }: { position: [number, number, number] }) => {
  const thickness = 0.1;
  
  return (
    <group position={position}>
      {/* Bottom */}
      <mesh position={[0, -CONTAINER_HEIGHT/2, 0]}>
        <boxGeometry args={[CONTAINER_WIDTH, thickness, CONTAINER_DEPTH]} />
        <meshStandardMaterial color="#444444" transparent opacity={0.8} />
      </mesh>
      
      {/* Walls */}
      <mesh position={[-CONTAINER_WIDTH/2, 0, 0]}>
        <boxGeometry args={[thickness, CONTAINER_HEIGHT, CONTAINER_DEPTH]} />
        <meshStandardMaterial color="#444444" transparent opacity={0.4} />
      </mesh>
      
      <mesh position={[CONTAINER_WIDTH/2, 0, 0]}>
        <boxGeometry args={[thickness, CONTAINER_HEIGHT, CONTAINER_DEPTH]} />
        <meshStandardMaterial color="#444444" transparent opacity={0.4} />
      </mesh>
      
      <mesh position={[0, 0, -CONTAINER_DEPTH/2]}>
        <boxGeometry args={[CONTAINER_WIDTH, CONTAINER_HEIGHT, thickness]} />
        <meshStandardMaterial color="#444444" transparent opacity={0.4} />
      </mesh>
      
      <mesh position={[0, 0, CONTAINER_DEPTH/2]}>
        <boxGeometry args={[CONTAINER_WIDTH, CONTAINER_HEIGHT, thickness]} />
        <meshStandardMaterial color="#444444" transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

// Simple Fluid Layer Component
const SimpleFluidLayer = ({ 
  liquid, 
  height, 
  position, 
  containerWidth, 
  containerDepth 
}: {
  liquid: LiquidType;
  height: number;
  position: [number, number, number];
  containerWidth: number;
  containerDepth: number;
}) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[containerWidth - 0.2, height, containerDepth - 0.2]} />
      <meshStandardMaterial
        color={liquid.color}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
};

const Block: React.FC<BlockProps> = ({ title, description }) => {
  const [selectedLiquids, setSelectedLiquids] = useState<LiquidType[]>([]);
  const [fluidLayers, setFluidLayers] = useState<FluidState[]>([]);
  const [isPouring, setIsPouring] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [selectedLiquidForInfo, setSelectedLiquidForInfo] = useState<LiquidType | null>(null);

  // Send completion event on first interaction
  useEffect(() => {
    if (selectedLiquids.length > 0) {
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
    }
  }, [selectedLiquids]);

  const calculateFluidLayers = (liquids: LiquidType[]) => {
    if (liquids.length === 0) return [];

    // Sort liquids by density (heaviest at bottom)
    const sortedLiquids = [...liquids].sort((a, b) => b.density - a.density);
    
    const volumePerLiquid = (CONTAINER_WIDTH * CONTAINER_DEPTH * CONTAINER_HEIGHT * 0.7) / liquids.length;
    const layers: FluidState[] = [];
    let currentYPosition = -CONTAINER_HEIGHT / 2 + 0.2; // Start just above bottom

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
    console.log('Adding liquid:', liquid.name); // Debug log
    if (selectedLiquids.length >= 7) return;
    
    const newLiquids = [...selectedLiquids, liquid];
    setSelectedLiquids(newLiquids);
    setIsPouring(true);
    
    // Calculate layers immediately
    const newLayers = calculateFluidLayers(newLiquids);
    console.log('New layers:', newLayers); // Debug log
    setFluidLayers(newLayers);
    
    setTimeout(() => {
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

  console.log('Current fluid layers:', fluidLayers); // Debug log

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
                background: selectedLiquids.some(l => l.name === liquid.name) ? '#e8f5e8' : '#fff'
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
                    disabled={selectedLiquids.some(l => l.name === liquid.name) || selectedLiquids.length >= 7}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      border: 'none',
                      borderRadius: '4px',
                      background: selectedLiquids.some(l => l.name === liquid.name) || selectedLiquids.length >= 7 ? '#ccc' : '#4CAF50',
                      color: 'white',
                      cursor: selectedLiquids.some(l => l.name === liquid.name) || selectedLiquids.length >= 7 ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    {selectedLiquids.some(l => l.name === liquid.name) ? 'Added' : 'Add'}
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
              In Container ({selectedLiquids.length} liquids)
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

        <div style={{ 
          fontSize: '12px', 
          color: '#666', 
          lineHeight: '1.4',
          background: '#f8f9fa',
          padding: '10px',
          borderRadius: '6px'
        }}>
          <strong>Debug Info:</strong><br/>
          Selected: {selectedLiquids.length} liquids<br/>
          Layers: {fluidLayers.length} rendered<br/>
          <strong>How to use:</strong><br/>
          • Click "Add" to pour liquids<br/>
          • Liquids layer by density<br/>
          • Use mouse to rotate 3D view
        </div>
      </div>

      {/* 3D Scene */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas
          camera={{ position: [8, 4, 8], fov: 60 }}
          style={{ 
            width: '100%', 
            height: '100%',
            background: 'linear-gradient(to bottom, #87CEEB, #E0F6FF)' 
          }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          <pointLight position={[5, 5, 5]} intensity={0.4} />
          
          {/* Container - Always visible */}
          <SimpleContainer position={[0, 0, 0]} />
          
          {/* Fluid Layers */}
          {fluidLayers.map((layer, index) => (
            <SimpleFluidLayer
              key={`${layer.liquid.name}-${index}`}
              liquid={layer.liquid}
              height={layer.height}
              position={[0, layer.yPosition, 0]}
              containerWidth={CONTAINER_WIDTH}
              containerDepth={CONTAINER_DEPTH}
            />
          ))}
          
          {/* Labels */}
          {fluidLayers.map((layer, index) => (
            <Text
              key={`label-${layer.liquid.name}-${index}`}
              position={[CONTAINER_WIDTH/2 + 1, layer.yPosition, 0]}
              fontSize={0.4}
              color="#333"
              anchorX="left"
              anchorY="middle"
            >
              {layer.liquid.name}
              {'\n'}{layer.liquid.density} kg/m³
            </Text>
          ))}
          
          {/* Title */}
          <Text
            position={[0, CONTAINER_HEIGHT/2 + 1.5, 0]}
            fontSize={0.6}
            color="#333"
            anchorX="center"
            anchorY="middle"
          >
            3D Fluid Density Simulation
          </Text>
          
          {/* Empty Container Message */}
          {fluidLayers.length === 0 && (
            <Text
              position={[0, 0, 0]}
              fontSize={0.4}
              color="#666"
              anchorX="center"
              anchorY="middle"
            >
              Click "Add" to see density layers!
            </Text>
          )}
          
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={6}
            maxDistance={20}
          />
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
                Denser liquids sink below less dense ones, creating distinct layers.
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