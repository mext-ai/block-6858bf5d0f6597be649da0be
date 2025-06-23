import React from 'react';
import { CONTAINER_HEIGHT, CONTAINER_WIDTH, CONTAINER_DEPTH } from './liquidData';

interface ContainerProps {
  position: [number, number, number];
}

const Container: React.FC<ContainerProps> = ({ position }) => {
  const thickness = 0.1;
  
  return (
    <group position={position}>
      {/* Bottom */}
      <mesh position={[0, -CONTAINER_HEIGHT/2, 0]}>
        <boxGeometry args={[CONTAINER_WIDTH, thickness, CONTAINER_DEPTH]} />
        <meshPhongMaterial color="#333333" transparent opacity={0.7} />
      </mesh>
      
      {/* Left Wall */}
      <mesh position={[-CONTAINER_WIDTH/2, 0, 0]}>
        <boxGeometry args={[thickness, CONTAINER_HEIGHT, CONTAINER_DEPTH]} />
        <meshPhongMaterial color="#333333" transparent opacity={0.3} />
      </mesh>
      
      {/* Right Wall */}
      <mesh position={[CONTAINER_WIDTH/2, 0, 0]}>
        <boxGeometry args={[thickness, CONTAINER_HEIGHT, CONTAINER_DEPTH]} />
        <meshPhongMaterial color="#333333" transparent opacity={0.3} />
      </mesh>
      
      {/* Back Wall */}
      <mesh position={[0, 0, -CONTAINER_DEPTH/2]}>
        <boxGeometry args={[CONTAINER_WIDTH, CONTAINER_HEIGHT, thickness]} />
        <meshPhongMaterial color="#333333" transparent opacity={0.3} />
      </mesh>
      
      {/* Front Wall (more transparent for better visibility) */}
      <mesh position={[0, 0, CONTAINER_DEPTH/2]}>
        <boxGeometry args={[CONTAINER_WIDTH, CONTAINER_HEIGHT, thickness]} />
        <meshPhongMaterial color="#333333" transparent opacity={0.1} />
      </mesh>
      
      {/* Measurement marks on the side */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[-CONTAINER_WIDTH/2 - 0.05, -CONTAINER_HEIGHT/2 + (i + 1) * CONTAINER_HEIGHT/8, 0]}>
          <boxGeometry args={[0.1, 0.02, 0.02]} />
          <meshPhongMaterial color="#666666" />
        </mesh>
      ))}
    </group>
  );
};

export default Container;