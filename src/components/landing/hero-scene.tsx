"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Points, PointMaterial } from "@react-three/drei";
import { mulberry32 } from "@/lib/utils";

function Bars() {
  const countX = 16;
  const countZ = 9;
  const spacing = 0.34;
  const ref = useRef<THREE.InstancedMesh>(null);

  const { baseHeights, positions, colors } = useMemo(() => {
    const rng = mulberry32(1337);
    const baseHeights: number[] = [];
    const positions: [number, number, number][] = [];
    const colors: THREE.Color[] = [];
    const colorA = new THREE.Color("#10b981");
    const colorB = new THREE.Color("#8b5cf6");
    for (let x = 0; x < countX; x++) {
      for (let z = 0; z < countZ; z++) {
        const cx = (x - (countX - 1) / 2) * spacing;
        const cz = (z - (countZ - 1) / 2) * spacing;
        const wave = 0.5 + 0.5 * Math.sin(x * 0.55 + z * 0.4);
        const h = 0.25 + wave * 1.05 + rng() * 0.18;
        baseHeights.push(h);
        positions.push([cx, 0, cz]);
        colors.push(colorA.clone().lerp(colorB, z / (countZ - 1)));
      }
    }
    return { baseHeights, positions, colors };
  }, [countX, countZ, spacing]);

  useEffect(() => {
    const inst = ref.current;
    if (!inst) return;
    colors.forEach((c, i) => inst.setColorAt(i, c));
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  }, [colors]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    const inst = ref.current;
    if (!inst) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < positions.length; i++) {
      const [px, , pz] = positions[i];
      const breath = Math.sin(px * 0.9 + t * 0.7) * 0.06 + Math.sin(pz * 0.7 - t * 0.5) * 0.04;
      const h = Math.max(0.04, baseHeights[i] + breath);
      dummy.position.set(px, h / 2, pz);
      dummy.scale.set(0.72, h, 0.72);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, positions.length]} frustumCulled={false}>
      <boxGeometry />
      <meshStandardMaterial roughness={0.3} metalness={0.15} transparent opacity={0.92} />
    </instancedMesh>
  );
}

function ParticleField({ count = 220 }: { count?: number }) {
  const positions = useMemo(() => {
    const rng = mulberry32(4242);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rng() * 2 - 1) * 9;
      arr[i * 3 + 1] = (rng() * 2 - 1) * 5.5;
      arr[i * 3 + 2] = (rng() * 2 - 1) * 6;
    }
    return arr;
  }, [count]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#34d399"
        size={0.035}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function Coin() {
  return (
    <Float speed={1.4} rotationIntensity={0.8} floatIntensity={1.6}>
      <mesh position={[3.1, 0.9, -1.4]} rotation={[0.6, 0.4, 0]}>
        <torusGeometry args={[0.62, 0.26, 24, 64]} />
        <meshStandardMaterial color="#10b981" metalness={0.7} roughness={0.25} emissive="#065f46" emissiveIntensity={0.5} />
      </mesh>
    </Float>
  );
}

export function HeroScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 2.1, 7.4], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0 }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 4]} intensity={1.1} color="#e6fff4" />
      <pointLight position={[-5, 2, -3]} intensity={0.8} color="#8b5cf6" />
      <Bars />
      <Coin />
      <ParticleField />
    </Canvas>
  );
}