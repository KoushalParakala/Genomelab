import type { BaseType } from '../types/dna';

export const ATGC_COLORS: Record<BaseType, { base: string; emissive: string }> = {
    'A': { base: '#00f5a0', emissive: '#00f5a0' }, // Adenine — Cyan-Green
    'T': { base: '#ff6b6b', emissive: '#ff6b6b' }, // Thymine  — Coral
    'G': { base: '#4da6ff', emissive: '#4da6ff' }, // Guanine  — Electric Blue
    'C': { base: '#ffd93d', emissive: '#ffd93d' }, // Cytosine — Amber
};

export const DNA_CONFIG = {
    radius: 2.0,          // wider helix
    heightPerBase: 0.7,
    twistPerBase: 0.55,   // ~31 degrees per rung
    baseScale: [3.8, 0.12, 0.12] as [number, number, number],
    backboneRadius: 0.18, // sphere radius for backbone nodes
    color: {
        backbone: '#1a3a5c',
        selected: '#ffffff',
    }
};
