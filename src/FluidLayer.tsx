import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { LiquidType } from './liquidData';

interface FluidLayerProps {
  liquid: LiquidType;
  height: number;
  position: [number, number, number];
  containerWidth: number;
  containerDepth: number;
  isPouring: boolean;
  animationSpeed: number;
}

const FluidLayer: React.FC<FluidLayerProps> = ({
  liquid,
  height,
  position,
  containerWidth,
  containerDepth,
  isPouring,
  animationSpeed
}) => {
  const meshRef = useRef<Mesh>(null);
  const wavePhase = useRef(0);

  useFrame((state) => {
    if (meshRef.current && isPouring) {
      wavePhase.current += animationSpeed * 0.02;
      
      // Create subtle wave animation during pouring
      const waveHeight = Math.sin(wavePhase.current) * 0.1;
      meshRef.current.position.y = position[1] + waveHeight * 0.1;
      
      // Add slight rotation for more dynamic effect
      meshRef.current.rotation.y = Math.sin(wavePhase.current * 0.5) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[containerWidth - 0.2, height, containerDepth - 0.2]} />
      <meshPhongMaterial
        color={liquid.color}
        transparent
        opacity={0.8}
        shininess={100}
        specular={liquid.name === 'Mercury' ? '#ffffff' : liquid.color}
      />
    </mesh>
  );
};

export default FluidLayer;