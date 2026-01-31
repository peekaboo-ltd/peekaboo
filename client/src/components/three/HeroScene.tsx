import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

interface BoxProps {
  position: [number, number, number];
  scale?: number;
  speed?: number;
  rotationIntensity?: number;
}

const DeliveryBox = ({ position, scale = 1, speed = 1, rotationIntensity = 0.3 }: BoxProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed * 0.5) * rotationIntensity;
      meshRef.current.rotation.y += 0.002 * speed;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={rotationIntensity} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#1e293b"
          transparent
          opacity={0.15}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
    </Float>
  );
};

const GridLines = () => {
  const linesRef = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const points: THREE.Vector3[][] = [];
    const spacing = 2;
    const count = 8;
    const offset = (count * spacing) / 2;

    for (let i = 0; i <= count; i++) {
      const x = i * spacing - offset;
      points.push([new THREE.Vector3(x, -offset, 0), new THREE.Vector3(x, offset, 0)]);
      points.push([new THREE.Vector3(-offset, x, 0), new THREE.Vector3(offset, x, 0)]);
    }
    return points;
  }, []);

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05 + 0.3;
      linesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={linesRef} position={[0, 0, -5]}>
      {lines.map((line, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...line[0].toArray(), ...line[1].toArray()])}
              itemSize={3} args={[]} />
          </bufferGeometry>
          <lineBasicMaterial color="#94a3b8" transparent opacity={0.08} />
        </line>
      ))}
    </group>
  );
};

const ConnectionNodes = () => {
  const groupRef = useRef<THREE.Group>(null);

  const nodes = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 3 + Math.random() * 2;
      positions.push([
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        -2 + Math.random() * 4,
      ]);
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#475569" transparent opacity={0.4} />
        </mesh>
      ))}
    </group>
  );
};

const HeroScene = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 45 }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.4} />
      <pointLight position={[-10, -10, -5]} intensity={0.2} color="#64748b" />

      <GridLines />
      <ConnectionNodes />

      <DeliveryBox position={[-4, 2, -1]} scale={0.8} speed={0.8} />
      <DeliveryBox position={[4, -1.5, -2]} scale={0.6} speed={1.2} />
      <DeliveryBox position={[-2, -2, 0]} scale={0.5} speed={1} />
      <DeliveryBox position={[3, 2.5, -1.5]} scale={0.7} speed={0.9} />
      <DeliveryBox position={[0, 3, -3]} scale={0.4} speed={1.1} />
    </Canvas>
  );
};

export default HeroScene;
