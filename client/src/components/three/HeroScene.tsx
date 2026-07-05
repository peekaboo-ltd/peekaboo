import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Brand palette (mirrors the tokens in index.css) used across the scene so the
 * background stays cohesive with the rest of the product.
 */
const palette = {
  warm: '#f7f6f1',
  line: '#d9d6cd',
  structure: '#1f1f1f',
  ink: '#0a0a0a',
  muted: '#6b7280',
  yellow: '#edb100',
  yellowBright: '#ffc400',
  yellowDark: '#d49e00',
  panel: '#fbfaf6',
};

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Builds a flat rounded-rectangle geometry centred on the origin. */
const useRoundedRect = (width: number, height: number, radius: number) =>
  useMemo(() => {
    const shape = new THREE.Shape();
    const w = width / 2;
    const h = height / 2;
    const r = Math.min(radius, w, h);

    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.quadraticCurveTo(w, -h, w, -h + r);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.lineTo(-w, -h + r);
    shape.quadraticCurveTo(-w, -h, -w + r, -h);

    return new THREE.ShapeGeometry(shape);
  }, [width, height, radius]);

/**
 * The "map board": a softly tilted surface carrying a fading grid of streets and
 * a few muted district blocks. Reads as an operations map without literal roads.
 */
const MapBoard = () => {
  const boardRef = useRef<THREE.Group>(null);

  const lines = useMemo(() => {
    const segments: number[][] = [];
    const size = 11;
    const spacing = 1.3;
    const half = (size * spacing) / 2;

    for (let i = 0; i <= size; i += 1) {
      const p = i * spacing - half;
      // Fade lines toward the outer edges for a vignette-like falloff.
      const edgeFade = 1 - Math.abs(p) / half;
      segments.push([p, -half, p, half, 0.05 + edgeFade * 0.06]);
      segments.push([-half, p, half, p, 0.05 + edgeFade * 0.06]);
    }

    return segments;
  }, []);

  const districts = useMemo(
    () => [
      { x: -2.1, y: 1.4, w: 2.4, h: 1.9, color: palette.panel, opacity: 0.5 },
      { x: 1.9, y: 2.0, w: 2.0, h: 1.4, color: palette.panel, opacity: 0.4 },
      { x: 2.6, y: -1.6, w: 2.2, h: 2.0, color: palette.panel, opacity: 0.45 },
      { x: -2.4, y: -1.9, w: 1.8, h: 1.6, color: palette.warm, opacity: 0.55 },
    ],
    []
  );

  useFrame((state) => {
    if (!boardRef.current || prefersReducedMotion) return;
    const t = state.clock.elapsedTime;
    boardRef.current.rotation.z = 0.22 + Math.sin(t * 0.14) * 0.015;
  });

  return (
    <group
      ref={boardRef}
      position={[0.3, -0.55, -3]}
      rotation={[0.94, 0.1, 0.22]}
    >
      {/* Board surface */}
      <mesh position={[0, 0, -0.05]}>
        <planeGeometry args={[16, 16]} />
        <meshBasicMaterial color={palette.warm} transparent opacity={0.32} />
      </mesh>

      {/* District blocks */}
      {districts.map((d, index) => (
        <DistrictBlock key={`district-${index}`} {...d} />
      ))}

      {/* Street grid */}
      {lines.map((l, index) => (
        <line key={`grid-${index}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([l[0], l[1], 0, l[2], l[3], 0])}
              itemSize={3}
              args={[]}
            />
          </bufferGeometry>
          <lineBasicMaterial color={palette.structure} transparent opacity={l[4]} />
        </line>
      ))}
    </group>
  );
};

const DistrictBlock = ({
  x,
  y,
  w,
  h,
  color,
  opacity,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  opacity: number;
}) => {
  const geometry = useRoundedRect(w, h, 0.28);
  return (
    <mesh geometry={geometry} position={[x, y, -0.02]}>
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
};

/**
 * Network of dispatch hubs connected by thin routes. Most hubs are ink-dark;
 * a couple pulse yellow to read as "active" pickups/drop-offs.
 */
const NodeNetwork = () => {
  const hubs = useMemo<[number, number, number][]>(
    () => [
      [-3.3, 1.5, -1],
      [-0.5, 2.1, -0.9],
      [2.5, 1.25, -0.9],
      [3.1, -1.2, -1],
      [0.1, -2.1, -0.9],
      [-3.0, -1.3, -1],
      [-0.2, 0.15, -0.75],
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
      [1, 6],
      [6, 4],
      [6, 2],
    ],
    []
  );

  // Hubs that pulse yellow.
  const activeHubs = useMemo(() => new Set([1, 4, 6]), []);
  const hubRefs = useRef<THREE.Group[]>([]);

  useFrame((state) => {
    if (prefersReducedMotion) return;
    const t = state.clock.elapsedTime;
    hubRefs.current.forEach((group, index) => {
      if (!group || !activeHubs.has(index)) return;
      const pulse = 1 + Math.sin(t * 1.6 + index * 1.3) * 0.18;
      group.scale.setScalar(pulse);
    });
  });

  return (
    <group>
      {connections.map(([from, to], index) => (
        <line key={`conn-${index}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...hubs[from], ...hubs[to]])}
              itemSize={3}
              args={[]}
            />
          </bufferGeometry>
          <lineBasicMaterial color={palette.ink} transparent opacity={0.12} />
        </line>
      ))}

      {hubs.map((hub, index) => {
        const active = activeHubs.has(index);
        return (
          <group
            key={`hub-${index}`}
            position={hub}
            ref={(element) => {
              if (element) hubRefs.current[index] = element;
            }}
          >
            <mesh>
              <sphereGeometry args={[active ? 0.11 : 0.08, 18, 18]} />
              <meshStandardMaterial
                color={active ? palette.yellow : palette.ink}
                emissive={active ? palette.yellowDark : palette.ink}
                emissiveIntensity={active ? 0.5 : 0.05}
                metalness={0.3}
                roughness={0.45}
                transparent
                opacity={active ? 0.9 : 0.65}
              />
            </mesh>
            {active && (
              <mesh>
                <ringGeometry args={[0.16, 0.19, 32]} />
                <meshBasicMaterial
                  color={palette.yellow}
                  transparent
                  opacity={0.35}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

/**
 * A courier tracing a route along a curve, leaving a soft tube trail behind and
 * a glowing marker at the head.
 */
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
  const markerRef = useRef<THREE.Group>(null);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, 90, 0.012, 8, false),
    [curve]
  );

  useFrame((state) => {
    if (!markerRef.current) return;
    const base = prefersReducedMotion ? delay : state.clock.elapsedTime * speed * 0.12 + delay;
    const t = base % 1;
    markerRef.current.position.copy(curve.getPointAt(t));
    // Orient a subtle heading (tangent) — reads as directional travel.
    const tangent = curve.getTangentAt(t);
    markerRef.current.lookAt(
      markerRef.current.position.clone().add(tangent)
    );
  });

  return (
    <group>
      <mesh geometry={tubeGeometry}>
        <meshBasicMaterial color={color} transparent opacity={0.22} />
      </mesh>
      <group ref={markerRef}>
        <mesh>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.95} />
        </mesh>
        {/* Soft glow halo */}
        <mesh>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.18} />
        </mesh>
      </group>
    </group>
  );
};

/**
 * Floating status tiles that drift at depth — abstract order cards suggesting a
 * live dispatch board without literal text.
 */
const StatusTile = ({
  position,
  rotation,
  scale,
  accent,
  drift,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  accent: string;
  drift: number;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const card = useRoundedRect(1.5, 0.95, 0.14);

  useFrame((state) => {
    if (!groupRef.current || prefersReducedMotion) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.5 + drift) * 0.08;
    groupRef.current.rotation.z = rotation[2] + Math.sin(t * 0.3 + drift) * 0.03;
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Card body */}
      <mesh geometry={card}>
        <meshStandardMaterial
          color={palette.panel}
          transparent
          opacity={0.42}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>
      {/* Accent status dot */}
      <mesh position={[-0.55, 0.28, 0.01]}>
        <circleGeometry args={[0.07, 20]} />
        <meshBasicMaterial color={accent} transparent opacity={0.85} />
      </mesh>
      {/* Content rows */}
      {[0.28, 0.02, -0.24].map((y, index) => (
        <mesh key={`row-${index}`} position={[0.12, y, 0.01]}>
          <planeGeometry args={[index === 0 ? 0.7 : 0.95, 0.06]} />
          <meshBasicMaterial
            color={palette.structure}
            transparent
            opacity={index === 0 ? 0.28 : 0.16}
          />
        </mesh>
      ))}
    </group>
  );
};

const FloatingBoard = () => {
  const tiles = useMemo(
    () => [
      {
        position: [4.15, 1.35, -1.4] as [number, number, number],
        rotation: [0.05, -0.5, -0.06] as [number, number, number],
        scale: 0.9,
        accent: palette.yellow,
        drift: 0,
      },
      {
        position: [-4.35, 0.35, -1.7] as [number, number, number],
        rotation: [0.04, 0.55, 0.05] as [number, number, number],
        scale: 0.82,
        accent: palette.ink,
        drift: 1.4,
      },
      {
        position: [4.55, -1.35, -1.9] as [number, number, number],
        rotation: [0.06, -0.55, 0.04] as [number, number, number],
        scale: 0.74,
        accent: palette.yellowBright,
        drift: 2.6,
      },
    ],
    []
  );

  return (
    <group>
      {tiles.map((tile, index) => (
        <StatusTile key={`tile-${index}`} {...tile} />
      ))}
    </group>
  );
};

/** Slow ambient particles for depth. */
const AmbientSignals = () => {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 28;
    const buffer = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      buffer[i * 3] = (Math.random() - 0.5) * 12;
      buffer[i * 3 + 1] = (Math.random() - 0.5) * 8;
      buffer[i * 3 + 2] = -2.8 + Math.random() * 2.4;
    }
    return buffer;
  }, []);

  useFrame((state) => {
    if (!pointsRef.current || prefersReducedMotion) return;
    pointsRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.08) * 0.05;
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
      <pointsMaterial
        color={palette.muted}
        size={0.045}
        transparent
        opacity={0.2}
        sizeAttenuation
      />
    </points>
  );
};

/**
 * Gentle camera parallax driven by pointer position. The canvas has
 * pointer-events disabled, so we listen on the window directly.
 */
const CameraParallax = () => {
  const { camera } = useThree();
  const target = useRef({ x: 0, y: 0.2 });

  useEffect(() => {
    if (prefersReducedMotion) return;
    const handleMove = (event: PointerEvent) => {
      const nx = (event.clientX / window.innerWidth - 0.5) * 2;
      const ny = (event.clientY / window.innerHeight - 0.5) * 2;
      target.current.x = nx * 0.35;
      target.current.y = 0.2 - ny * 0.25;
    };
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  useFrame(() => {
    camera.position.x += (target.current.x - camera.position.x) * 0.04;
    camera.position.y += (target.current.y - camera.position.y) * 0.04;
    camera.lookAt(0, 0, -1);
  });

  return null;
};

const HeroScene = () => {
  const routes = useMemo(
    () => [
      {
        points: [
          new THREE.Vector3(-3.3, 1.5, -1),
          new THREE.Vector3(-1.8, 2.2, -0.7),
          new THREE.Vector3(0.9, 2.0, -0.72),
          new THREE.Vector3(2.5, 1.25, -0.9),
        ],
        color: palette.yellow,
        speed: 1,
        delay: 0,
      },
      {
        points: [
          new THREE.Vector3(-3.0, -1.3, -1),
          new THREE.Vector3(-0.9, -2.35, -0.68),
          new THREE.Vector3(1.7, -1.95, -0.72),
          new THREE.Vector3(3.1, -1.2, -1),
        ],
        color: palette.ink,
        speed: 1.25,
        delay: 0.35,
      },
      {
        points: [
          new THREE.Vector3(-0.5, 2.1, -0.9),
          new THREE.Vector3(-0.2, 0.15, -0.72),
          new THREE.Vector3(0.1, -2.1, -0.9),
        ],
        color: palette.yellowBright,
        speed: 0.95,
        delay: 0.2,
      },
    ],
    []
  );

  return (
    <Canvas
      camera={{ position: [0, 0.2, 10], fov: 40 }}
      dpr={[1, 2]}
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
      <fog attach="fog" args={[palette.warm, 8, 18]} />
      <ambientLight intensity={0.72} />
      <hemisphereLight color="#ffffff" groundColor={palette.line} intensity={0.4} />
      <directionalLight position={[6, 8, 6]} intensity={0.55} />

      <CameraParallax />
      <MapBoard />
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
      <FloatingBoard />
      <AmbientSignals />
    </Canvas>
  );
};

export default HeroScene;
