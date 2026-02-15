import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PlatformDeck = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.18) * 0.03;
  });

  return (
    <group ref={groupRef} position={[0, -1.1, -2.2]} rotation={[0.85, 0.08, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.5, 5.8]} />
        <meshStandardMaterial color="#f1f5f9" transparent opacity={0.64} metalness={0.2} roughness={0.8} />
      </mesh>
      <gridHelper args={[8.2, 14, '#cbd5e1', '#e2e8f0']} />
    </group>
  );
};

const FloatingCards = () => {
  const refs = useRef<THREE.Mesh[]>([]);

  const cards = useMemo(
    () => [
      { pos: [-2.3, 0.75, -0.95], rot: [0.08, 0.3, -0.04], width: 1.75 },
      { pos: [0.1, 1.2, -0.8], rot: [-0.06, -0.22, 0.05], width: 2.05 },
      { pos: [2.45, 0.3, -1.05], rot: [0.11, -0.3, -0.04], width: 1.6 },
    ],
    []
  );

  useFrame((state) => {
    refs.current.forEach((card, index) => {
      if (!card) return;
      card.position.y = cards[index].pos[1] + Math.sin(state.clock.elapsedTime * 0.9 + index) * 0.1;
      card.rotation.z = cards[index].rot[2] + Math.sin(state.clock.elapsedTime * 0.4 + index) * 0.03;
    });
  });

  return (
    <group>
      {cards.map((card, index) => (
        <mesh
          key={`card-${index}`}
          ref={(element) => {
            if (element) refs.current[index] = element;
          }}
          position={card.pos as [number, number, number]}
          rotation={card.rot as [number, number, number]}
        >
          <boxGeometry args={[card.width, 0.88, 0.16]} />
          <meshStandardMaterial
            color={index === 1 ? '#5f9598' : '#cbd5e1'}
            transparent
            opacity={index === 1 ? 0.34 : 0.42}
            metalness={0.45}
            roughness={0.34}
          />
        </mesh>
      ))}
    </group>
  );
};

const ExecutiveBars = () => {
  const barsRef = useRef<THREE.Mesh[]>([]);
  const barValues = useMemo(() => [1.1, 1.6, 2.2, 1.75], []);

  useFrame((state) => {
    barsRef.current.forEach((bar, index) => {
      if (!bar) return;
      const value = barValues[index] * (0.92 + Math.sin(state.clock.elapsedTime * 0.65 + index * 0.5) * 0.08);
      bar.scale.y = value;
      bar.position.y = value / 2;
    });
  });

  return (
    <group position={[2.6, -1.5, -1.2]} rotation={[0, -0.38, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.3, 1.7]} />
        <meshBasicMaterial color="#e2e8f0" transparent opacity={0.35} />
      </mesh>

      {barValues.map((_, index) => (
        <mesh
          key={`executive-bar-${index}`}
          ref={(element) => {
            if (element) barsRef.current[index] = element;
          }}
          position={[-0.9 + index * 0.6, 0, 0]}
        >
          <boxGeometry args={[0.3, 1, 0.3]} />
          <meshStandardMaterial
            color={index === 2 ? '#5f9598' : '#9dbec0'}
            transparent
            opacity={0.46}
            metalness={0.42}
            roughness={0.32}
          />
        </mesh>
      ))}
    </group>
  );
};

const DataOrbits = () => {
  const orbitRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!orbitRef.current) return;
    orbitRef.current.rotation.z = state.clock.elapsedTime * 0.12;
  });

  return (
    <group ref={orbitRef} position={[-2.8, -0.8, -1.1]}>
      <mesh>
        <ringGeometry args={[0.75, 0.8, 64]} />
        <meshBasicMaterial color="#7aa9ac" transparent opacity={0.16} side={THREE.DoubleSide} />
      </mesh>
      <mesh>
        <ringGeometry args={[0.48, 0.52, 48]} />
        <meshBasicMaterial color="#5f9598" transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.82, 0, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshBasicMaterial color="#5f9598" transparent opacity={0.8} />
      </mesh>
    </group>
  );
};

const BusinessScene = () => (
  <Canvas
    camera={{ position: [0, 0, 8.5], fov: 42 }}
    gl={{ alpha: true, antialias: true }}
    style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
  >
    <fog attach="fog" args={['#ffffff', 8, 16]} />
    <ambientLight intensity={0.7} />
    <hemisphereLight color="#dbeafe" groundColor="#64748b" intensity={0.3} />
    <directionalLight position={[6, 9, 6]} intensity={0.55} />

    <PlatformDeck />
    <FloatingCards />
    <ExecutiveBars />
    <DataOrbits />
  </Canvas>
);

export default BusinessScene;
