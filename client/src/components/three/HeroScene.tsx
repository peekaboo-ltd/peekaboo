import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Corporate isometric city grid — tilted map with subtle street lines
const CityGrid = () => {
  const groupRef = useRef<THREE.Group>(null);

  const spacing = 1.6;

  const { streetLines, blocks } = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const blockData: { pos: [number, number, number]; h: number }[] = [];
    const size = 12;
    const half = (size * spacing) / 2;

    for (let i = 0; i <= size; i++) {
      const v = i * spacing - half;
      lines.push([new THREE.Vector3(v, -half, 0), new THREE.Vector3(v, half, 0)]);
      lines.push([new THREE.Vector3(-half, v, 0), new THREE.Vector3(half, v, 0)]);
    }

    // Scattered city blocks (buildings)
    const seed = [
      [1, 2], [3, 1], [5, 4], [2, 7], [7, 3], [4, 6], [8, 2], [6, 8],
      [9, 5], [1, 9], [10, 7], [3, 10], [8, 9], [5, 1], [11, 4],
    ];
    for (const [gx, gy] of seed) {
      const x = gx * spacing - half + spacing * 0.5;
      const y = gy * spacing - half + spacing * 0.5;
      const h = 0.15 + Math.random() * 0.35;
      blockData.push({ pos: [x, y, h / 2], h });
    }

    return { streetLines: lines, blocks: blockData };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.008;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, -6]} rotation={[0.75, 0, 0.4]}>
      {streetLines.map((line, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...line[0].toArray(), ...line[1].toArray()])}
              itemSize={3}
              args={[]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#94a3b8" transparent opacity={0.06} />
        </line>
      ))}
      {blocks.map((block, i) => (
        <mesh key={`b-${i}`} position={block.pos}>
          <boxGeometry args={[spacing * 0.6, spacing * 0.6, block.h]} />
          <meshStandardMaterial color="#cbd5e1" transparent opacity={0.08} />
        </mesh>
      ))}
    </group>
  );
};

// Animated delivery route with flowing particles
const DeliveryRoute = ({
  points,
  color = '#5f9598',
  speed = 1,
  delay = 0,
}: {
  points: THREE.Vector3[];
  color?: string;
  speed?: number;
  delay?: number;
}) => {
  const particleRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);

  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);

  const tubeGeo = useMemo(
    () => new THREE.TubeGeometry(curve, 64, 0.015, 8, false),
    [curve]
  );

  useFrame((state) => {
    const t = ((state.clock.elapsedTime * speed * 0.15 + delay) % 1);
    const pos = curve.getPointAt(t);
    const trailT = ((t - 0.04) + 1) % 1;
    const trailPos = curve.getPointAt(trailT);

    if (particleRef.current) {
      particleRef.current.position.copy(pos);
      particleRef.current.scale.setScalar(0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.2);
    }
    if (trailRef.current) {
      trailRef.current.position.copy(trailPos);
    }
  });

  return (
    <group>
      <mesh geometry={tubeGeo}>
        <meshBasicMaterial color={color} transparent opacity={0.12} />
      </mesh>
      {/* Leading particle (rider) */}
      <mesh ref={particleRef}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      {/* Trail particle */}
      <mesh ref={trailRef}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

// Pulsing delivery hub nodes
const DeliveryHub = ({
  position,
  size = 0.1,
  color = '#5f9598',
  pulseSpeed = 2,
}: {
  position: [number, number, number];
  size?: number;
  color?: string;
  pulseSpeed?: number;
}) => {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.3;
      ringRef.current.scale.setScalar(pulse);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.15 + Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Core dot */}
      <mesh>
        <circleGeometry args={[size, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      {/* Pulse ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[size * 1.5, size * 2, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

// 3D bar chart — logistics KPIs
const DataBars = () => {
  const groupRef = useRef<THREE.Group>(null);
  const barsRef = useRef<THREE.Mesh[]>([]);

  const bars = useMemo(
    () => [
      { x: -1.2, target: 1.8, color: '#5f9598', label: 'del' },
      { x: -0.6, target: 1.2, color: '#7fb3b5', label: 'pick' },
      { x: 0.0, target: 2.1, color: '#5f9598', label: 'act' },
      { x: 0.6, target: 0.9, color: '#7fb3b5', label: 'ret' },
      { x: 1.2, target: 1.5, color: '#5f9598', label: 'comp' },
    ],
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    barsRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const bar = bars[i];
      const animH = bar.target * (0.85 + Math.sin(t * 0.8 + i * 0.7) * 0.15);
      mesh.scale.y = animH;
      mesh.position.y = animH / 2;
    });
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.3) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={[4.5, -1.5, -2]} rotation={[0, -0.3, 0]}>
      {/* Base line */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 0.01]} />
        <meshBasicMaterial color="#94a3b8" transparent opacity={0.15} />
      </mesh>
      {bars.map((bar, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) barsRef.current[i] = el; }}
          position={[bar.x, 0, 0]}
        >
          <boxGeometry args={[0.35, 1, 0.35]} />
          <meshStandardMaterial
            color={bar.color}
            transparent
            opacity={0.2}
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>
      ))}
      {/* Axis labels (thin bars) */}
      {[-0.5, 0.5, 1.0, 1.5].map((y, i) => (
        <mesh key={`ax-${i}`} position={[0, y, -0.2]}>
          <planeGeometry args={[3.2, 0.003]} />
          <meshBasicMaterial color="#94a3b8" transparent opacity={0.06} />
        </mesh>
      ))}
    </group>
  );
};

// Circular progress ring — on-time delivery rate
const ProgressRing = ({
  position,
  progress = 0.98,
  radius = 0.7,
  color = '#5f9598',
}: {
  position: [number, number, number];
  progress?: number;
  radius?: number;
  color?: string;
}) => {
  const ringRef = useRef<THREE.Mesh>(null);

  const { bgGeo, fgGeo } = useMemo(() => {
    const bg = new THREE.RingGeometry(radius - 0.06, radius, 64, 1, 0, Math.PI * 2);
    const fg = new THREE.RingGeometry(
      radius - 0.06,
      radius,
      64,
      1,
      -Math.PI / 2,
      Math.PI * 2 * progress
    );
    return { bgGeo: bg, fgGeo: fg };
  }, [radius, progress]);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <group position={position} ref={ringRef}>
      <mesh geometry={bgGeo}>
        <meshBasicMaterial color="#e2e8f0" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={fgGeo}>
        <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
      </mesh>
      {/* Center dot */}
      <mesh>
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

// Simplified motorbike silhouette that moves along a path
const MotorbikeRider = ({ curve, speed = 0.12 }: { curve: THREE.CatmullRomCurve3; speed?: number }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = (state.clock.elapsedTime * speed * 0.15) % 1;
    const pos = curve.getPointAt(t);
    const lookAt = curve.getPointAt((t + 0.01) % 1);

    groupRef.current.position.copy(pos);
    // Align to direction of travel
    const dir = new THREE.Vector3().subVectors(lookAt, pos).normalize();
    const angle = Math.atan2(dir.y, dir.x);
    groupRef.current.rotation.z = angle;
  });

  return (
    <group ref={groupRef} scale={0.12}>
      {/* Body frame */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[1.2, 0.3, 0.4]} />
        <meshStandardMaterial color="#1e293b" transparent opacity={0.35} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Seat */}
      <mesh position={[-0.15, 0.35, 0]}>
        <boxGeometry args={[0.5, 0.15, 0.35]} />
        <meshStandardMaterial color="#334155" transparent opacity={0.3} />
      </mesh>
      {/* Front wheel */}
      <mesh position={[0.5, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.05, 8, 16]} />
        <meshStandardMaterial color="#475569" transparent opacity={0.3} />
      </mesh>
      {/* Rear wheel */}
      <mesh position={[-0.5, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.05, 8, 16]} />
        <meshStandardMaterial color="#475569" transparent opacity={0.3} />
      </mesh>
      {/* Rider torso */}
      <mesh position={[-0.1, 0.6, 0]}>
        <capsuleGeometry args={[0.12, 0.25, 4, 8]} />
        <meshStandardMaterial color="#5f9598" transparent opacity={0.3} />
      </mesh>
      {/* Rider head */}
      <mesh position={[-0.05, 0.95, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#5f9598" transparent opacity={0.3} />
      </mesh>
      {/* Package on back */}
      <mesh position={[-0.45, 0.45, 0]}>
        <boxGeometry args={[0.35, 0.3, 0.3]} />
        <meshStandardMaterial color="#f59e0b" transparent opacity={0.25} />
      </mesh>
    </group>
  );
};

// Floating data particles representing live deliveries
const DataParticles = () => {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const count = 40;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = -3 + Math.random() * 6;
      vel[i * 3] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 2] = 0;
    }
    return { positions: pos, velocities: vel };
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;
    const posArr = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < posArr.length / 3; i++) {
      posArr[i * 3] += velocities[i * 3];
      posArr[i * 3 + 1] += velocities[i * 3 + 1];
      // Wrap around
      if (posArr[i * 3] > 7) posArr[i * 3] = -7;
      if (posArr[i * 3] < -7) posArr[i * 3] = 7;
      if (posArr[i * 3 + 1] > 5) posArr[i * 3 + 1] = -5;
      if (posArr[i * 3 + 1] < -5) posArr[i * 3 + 1] = 5;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
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
      <pointsMaterial color="#5f9598" size={0.04} transparent opacity={0.25} sizeAttenuation />
    </points>
  );
};

// Network connection lines between hubs
const NetworkLines = ({
  hubs,
}: {
  hubs: [number, number, number][];
}) => {
  const connections = useMemo(() => {
    const lines: { from: THREE.Vector3; to: THREE.Vector3 }[] = [];
    for (let i = 0; i < hubs.length; i++) {
      for (let j = i + 1; j < hubs.length; j++) {
        const dist = new THREE.Vector3(...hubs[i]).distanceTo(new THREE.Vector3(...hubs[j]));
        if (dist < 5) {
          lines.push({
            from: new THREE.Vector3(...hubs[i]),
            to: new THREE.Vector3(...hubs[j]),
          });
        }
      }
    }
    return lines;
  }, [hubs]);

  return (
    <group>
      {connections.map((conn, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                ...conn.from.toArray(),
                ...conn.to.toArray(),
              ])}
              itemSize={3}
              args={[]}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#5f9598" transparent opacity={0.06} />
        </line>
      ))}
    </group>
  );
};

const HeroScene = () => {
  // Delivery hub positions
  const hubs: [number, number, number][] = useMemo(
    () => [
      [-3, 2, -1],
      [2, 3, -1],
      [4, 0, -1],
      [1, -2.5, -1],
      [-4, -1, -1],
      [-1, 0.5, -1],
      [3, -3, -1],
      [-2.5, -3, -1],
    ],
    []
  );

  // Delivery route curves
  const routes = useMemo(
    () => [
      {
        points: [
          new THREE.Vector3(-3, 2, -1),
          new THREE.Vector3(-1.5, 2.5, -0.5),
          new THREE.Vector3(0, 1.5, -0.8),
          new THREE.Vector3(2, 3, -1),
        ],
        color: '#5f9598',
        speed: 1,
        delay: 0,
      },
      {
        points: [
          new THREE.Vector3(2, 3, -1),
          new THREE.Vector3(3, 1.5, -0.6),
          new THREE.Vector3(4, 0, -1),
        ],
        color: '#7fb3b5',
        speed: 1.3,
        delay: 0.3,
      },
      {
        points: [
          new THREE.Vector3(-4, -1, -1),
          new THREE.Vector3(-2, 0, -0.5),
          new THREE.Vector3(-1, 0.5, -1),
          new THREE.Vector3(1, -0.5, -0.7),
          new THREE.Vector3(1, -2.5, -1),
        ],
        color: '#5f9598',
        speed: 0.9,
        delay: 0.6,
      },
      {
        points: [
          new THREE.Vector3(-1, 0.5, -1),
          new THREE.Vector3(0.5, 1, -0.5),
          new THREE.Vector3(2, 2, -0.7),
          new THREE.Vector3(4, 0, -1),
        ],
        color: '#7fb3b5',
        speed: 1.1,
        delay: 0.15,
      },
      {
        points: [
          new THREE.Vector3(1, -2.5, -1),
          new THREE.Vector3(2, -3, -0.6),
          new THREE.Vector3(3, -3, -1),
        ],
        color: '#5f9598',
        speed: 1.4,
        delay: 0.5,
      },
      {
        points: [
          new THREE.Vector3(-2.5, -3, -1),
          new THREE.Vector3(-3.5, -2, -0.5),
          new THREE.Vector3(-4, -1, -1),
          new THREE.Vector3(-3, 0.5, -0.7),
          new THREE.Vector3(-3, 2, -1),
        ],
        color: '#7fb3b5',
        speed: 0.8,
        delay: 0.4,
      },
    ],
    []
  );

  // Main motorbike route
  const mainRoute = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-4, -1, -0.8),
        new THREE.Vector3(-2, 0.5, -0.5),
        new THREE.Vector3(-0.5, 1.5, -0.6),
        new THREE.Vector3(1.5, 2.5, -0.8),
        new THREE.Vector3(3.5, 1, -0.6),
        new THREE.Vector3(4, -0.5, -0.8),
        new THREE.Vector3(2.5, -2, -0.6),
        new THREE.Vector3(0, -2.5, -0.8),
        new THREE.Vector3(-2.5, -2.5, -0.6),
        new THREE.Vector3(-4, -1, -0.8),
      ]),
    []
  );

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

      {/* City map grid */}
      <CityGrid />

      {/* Network connections between hubs */}
      <NetworkLines hubs={hubs} />

      {/* Delivery hub nodes */}
      {hubs.map((pos, i) => (
        <DeliveryHub
          key={i}
          position={pos}
          size={i === 5 ? 0.15 : 0.1}
          pulseSpeed={1.5 + i * 0.2}
          color={i % 2 === 0 ? '#5f9598' : '#7fb3b5'}
        />
      ))}

      {/* Animated delivery routes */}
      {routes.map((route, i) => (
        <DeliveryRoute
          key={i}
          points={route.points}
          color={route.color}
          speed={route.speed}
          delay={route.delay}
        />
      ))}

      {/* Motorbike rider traversing the network */}
      <MotorbikeRider curve={mainRoute} speed={0.12} />

      {/* Data visualization: bar chart */}
      <DataBars />

      {/* Progress ring: on-time rate */}
      <ProgressRing position={[-4.5, 2.8, -1.5]} progress={0.98} radius={0.55} />

      {/* Smaller progress ring: completion rate */}
      <ProgressRing position={[4.8, 3, -1.5]} progress={0.87} radius={0.4} color="#7fb3b5" />

      {/* Ambient data particles */}
      <DataParticles />
    </Canvas>
  );
};

export default HeroScene;
