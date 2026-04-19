import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useDNAStore } from '../../store/useDNAStore';
import { BasePair } from './BasePair';
import { DNA_CONFIG } from '../../constants/dnaConfig';
import * as THREE from 'three';

export const Helix: React.FC = () => {
    const helix = useDNAStore(state => state.helix);
    const groupRef = useRef<THREE.Group>(null);

    // Slow continuous Y-axis rotation
    useFrame((_, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.25; // ~14 deg/sec = full turn in ~25s
        }
    });

    return (
        <group ref={groupRef} position={[0, -(helix.length * DNA_CONFIG.heightPerBase) / 2, 0]}>
            {helix.map((basePair, i) => (
                <BasePair
                    key={basePair.id}
                    data={basePair}
                    position={[0, i * DNA_CONFIG.heightPerBase, 0]}
                    rotation={[0, i * DNA_CONFIG.twistPerBase, 0]}
                />
            ))}
        </group>
    );
};
