import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const OperationsGrid = () => {
  const gridRef = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const segments: THREE.Vector3[][] = [];
    const size = 9;
    const spacing = 1.35;
    const half = (size * spacing) / 2;

    for (let i = 0; i <= size; i += 1) {
      const p = i * spacing - half;
      segments.push([new THREE.Vector3(p, -half, 0), new THREE.Vector3(p, half, 0)]);
      segments.push([new THREE.Vector3(-half, p, 0), new THREE.Vector3(half, p, 0)]);
    }

    return segments;
  }, []);

  useFrame((state) => {
    if (!gridRef.current) return;
    gridRef.current.rotation.z = 0.24 + Math.sin(state.clock.elapsedTime * 0.16) * 0.02;
  });

  return (
    <group ref={gridRef} position={[0.35, -0.6, -2.8]} rotation={[0.88, 0.12, 0.24]}>
      {lines.map((line, index) => (
        <line key={index}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...line[0].toArray(), ...line[1].toArray()])}
              itemSize={3}
              args={[]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#64748b" transparent opacity={0.11} />
        </line>
      ))}
      <mesh position={[0, 0, -0.03]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[13, 13]} />
        <meshBasicMaterial color="#f8fafc" transparent opacity={0.48} />
      </mesh>
    </group>
  );
};

const NodeNetwork = () => {
  const hubs: [number, number, number][] = useMemo(
    () => [
      [-3.2, 1.45, -1],
      [-0.6, 2.05, -0.95],
      [2.45, 1.2, -0.95],
      [3.05, -1.15, -1],
      [0.05, -2.05, -0.95],
      [-2.9, -1.25, -1],
    ],
    []
  );

  const connections = useMemo(
    () => [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
      [1, 4],
    ],
    []
  );

  return (
    <group>
      {connections.map(([from, to], index) => {
        const start = new THREE.Vector3(...hubs[from]);
        const end = new THREE.Vector3(...hubs[to]);
        return (
          <line key={`line-${index}`}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={2}
                array={new Float32Array([...start.toArray(), ...end.toArray()])}
                itemSize={3}
                args={[]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#5f9598" transparent opacity={0.14} />
          </line>
        );
      })}

      {hubs.map((hub, index) => (
        <mesh key={`hub-${index}`} position={hub}>
          <sphereGeometry args={[index === 1 ? 0.13 : 0.1, 16, 16]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? '#5f9598' : '#8aaeb0'}
            transparent
            opacity={0.55}
            metalness={0.35}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
};

const RouteFlow = ({
  points,
  speed,
  color,
  delay,
}: {
  points: THREE.Vector3[];
  speed: number;
  color: string;
  delay: number;
}) => {
  const markerRef = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const tubeGeometry = useMemo(() => new THREE.TubeGeometry(curve, 80, 0.013, 8, false), [curve]);

  useFrame((state) => {
    if (!markerRef.current) return;
    const t = (state.clock.elapsedTime * speed * 0.14 + delay) % 1;
    markerRef.current.position.copy(curve.getPointAt(t));
  });

  return (
    <group>
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      <mesh ref={markerRef}>
        <sphereGeometry args={[0.06, 14, 14]} />
        <meshBasicMaterial color={color} transparent opacity={0.85} />
      </mesh>
    </group>
  );
};

const MetricColumns = () => {
  const groupRef = useRef<THREE.Group>(null);
  const barsRef = useRef<THREE.Mesh[]>([]);

  const bars = useMemo(
    () => [
      { x: -0.58, target: 1.05, color: '#9fbec0' },
      { x: 0, target: 1.55, color: '#5f9598' },
      { x: 0.58, target: 1.25, color: '#86adaf' },
    ],
    []
  );

  useFrame((state) => {
    barsRef.current.forEach((mesh, index) => {
      if (!mesh) return;
      const animated = bars[index].target * (0.9 + Math.sin(state.clock.elapsedTime * 0.7 + index) * 0.1);
      mesh.scale.y = animated;
      mesh.position.y = animated / 2;
    });

    if (groupRef.current) {
      groupRef.current.position.y = -1.6 + Math.sin(state.clock.elapsedTime * 0.4) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={[4.25, -1.6, -1.5]} rotation={[0, -0.4, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 1.3]} />
        <meshBasicMaterial color="#e2e8f0" transparent opacity={0.28} />
      </mesh>

      {bars.map((bar, index) => (
        <mesh
          key={`bar-${index}`}
          ref={(element) => {
            if (element) barsRef.current[index] = element;
          }}
          position={[bar.x, 0, 0]}
        >
          <boxGeometry args={[0.34, 1, 0.34]} />
          <meshStandardMaterial color={bar.color} transparent opacity={0.42} metalness={0.4} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
};

const AmbientSignals = () => {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 20;
    const buffer = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      buffer[i * 3] = (Math.random() - 0.5) * 11;
      buffer[i * 3 + 1] = (Math.random() - 0.5) * 7;
      buffer[i * 3 + 2] = -2.7 + Math.random() * 2;
    }

    return buffer;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.04;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
          args={[]}
        />
      </bufferGeometry>
      <pointsMaterial color="#5f9598" size={0.05} transparent opacity={0.18} sizeAttenuation />
    </points>
  );
};

const HeroScene = () => {
  const routes = useMemo(
    () => [
      {
        points: [
          new THREE.Vector3(-3.2, 1.45, -1),
          new THREE.Vector3(-1.8, 2.15, -0.72),
          new THREE.Vector3(0.9, 1.95, -0.75),
          new THREE.Vector3(2.45, 1.2, -0.95),
        ],
        color: '#5f9598',
        speed: 1,
        delay: 0,
      },
      {
        points: [
          new THREE.Vector3(-2.9, -1.25, -1),
          new THREE.Vector3(-0.9, -2.3, -0.7),
          new THREE.Vector3(1.65, -1.9, -0.75),
          new THREE.Vector3(3.05, -1.15, -1),
        ],
        color: '#84aeb0',
        speed: 1.2,
        delay: 0.35,
      },
      {
        points: [
          new THREE.Vector3(-0.6, 2.05, -0.95),
          new THREE.Vector3(-0.2, 0.1, -0.7),
          new THREE.Vector3(0.05, -2.05, -0.95),
        ],
        color: '#6fa2a5',
        speed: 0.9,
        delay: 0.2,
      },
    ],
    []
  );

  return (
    <Canvas
      camera={{ position: [0, 0.2, 10], fov: 40 }}
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
      <fog attach="fog" args={['#f8fafc', 8, 17]} />
      <ambientLight intensity={0.68} />
      <hemisphereLight color="#e2e8f0" groundColor="#64748b" intensity={0.36} />
      <directionalLight position={[7, 9, 6]} intensity={0.52} />

      <OperationsGrid />
      <NodeNetwork />
      {routes.map((route, index) => (
        <RouteFlow
          key={`route-${index}`}
          points={route.points}
          color={route.color}
          speed={route.speed}
          delay={route.delay}
        />
      ))}
      <MetricColumns />
      <AmbientSignals />
    </Canvas>
  );
};

export default HeroScene;
