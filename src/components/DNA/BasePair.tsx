import React, { useRef, useState } from 'react';
import { type ThreeEvent, useFrame } from '@react-three/fiber';
import type { DNABasePair } from '../../types/dna';
import { DNA_CONFIG, ATGC_COLORS } from '../../constants/dnaConfig';
import { useDNAStore } from '../../store/useDNAStore';
import * as THREE from 'three';

interface BasePairProps {
    data: DNABasePair;
    position: [number, number, number];
    rotation: [number, number, number];
}

// Pick ATGC color — falls back to white if unknown base
const getBaseColors = (base: string, mutState: string) => {
    if (mutState.startsWith('mutated-sub')) return { base: '#ef4444', emissive: '#ef4444', intensity: 3 };
    if (mutState.startsWith('mutated-ins')) return { base: '#eab308', emissive: '#eab308', intensity: 3 };
    const atgc = ATGC_COLORS[base as keyof typeof ATGC_COLORS];
    return atgc ? { base: atgc.base, emissive: atgc.emissive, intensity: 0.6 }
                : { base: '#ffffff', emissive: '#000000', intensity: 0 };
};

export const BasePair: React.FC<BasePairProps> = ({ data, position, rotation }) => {
    const rungRef = useRef<THREE.Mesh>(null);
    const selectBase = useDNAStore(state => state.selectBase);
    const selectedId = useDNAStore(state => state.selectedId);
    const isSelected = selectedId === data.id;
    const [hovered, setHovered] = useState(false);

    const primaryBase = data.type[0]; // e.g. 'A'
    const compBase = data.type[1];    // e.g. 'T'
    const primaryColors = getBaseColors(primaryBase, data.state);
    const compColors    = getBaseColors(compBase,    data.state);

    // Scale targets
    const targetScaleY = isSelected ? 3 : hovered ? 1.8 : 1;

    useFrame((_, delta) => {
        if (rungRef.current) {
            rungRef.current.scale.y = THREE.MathUtils.lerp(rungRef.current.scale.y, targetScaleY, delta * 8);
        }
    });

    const handleClick = (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        selectBase(isSelected ? null : data.id);
    };

    return (
        <group position={position} rotation={rotation}>
            {/* Central rung — cylinder connecting the two halves */}
            <mesh
                ref={rungRef}
                onClick={handleClick}
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
                onPointerOut={() => setHovered(false)}
                rotation={[0, 0, Math.PI / 2]}
            >
                <cylinderGeometry args={[0.06, 0.06, DNA_CONFIG.radius * 2, 8]} />
                <meshStandardMaterial
                    color={isSelected ? '#ffffff' : '#1a3a5c'}
                    emissive={isSelected ? '#00f5ff' : '#000814'}
                    emissiveIntensity={isSelected ? 1.5 : 0.3}
                    roughness={0.3}
                    metalness={0.9}
                />
            </mesh>

            {/* Primary Backbone Node (left side) — colored by base type */}
            <mesh position={[DNA_CONFIG.radius, 0, 0]}>
                <sphereGeometry args={[DNA_CONFIG.backboneRadius, 16, 16]} />
                <meshStandardMaterial
                    color={primaryColors.base}
                    emissive={primaryColors.emissive}
                    emissiveIntensity={primaryColors.intensity}
                    roughness={0.1}
                    metalness={0.6}
                />
            </mesh>

            {/* Complementary Backbone Node (right side) — colored by complementary base */}
            <mesh position={[-DNA_CONFIG.radius, 0, 0]}>
                <sphereGeometry args={[DNA_CONFIG.backboneRadius, 16, 16]} />
                <meshStandardMaterial
                    color={compColors.base}
                    emissive={compColors.emissive}
                    emissiveIntensity={compColors.intensity}
                    roughness={0.1}
                    metalness={0.6}
                />
            </mesh>
        </group>
    );
};
