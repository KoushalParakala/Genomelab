export type BaseType = 'A' | 'T' | 'C' | 'G';

export interface DNABasePair {
    id: string;
    index: number; // The original index or current, depends on logic. Let's use it as current position order.
    sequenceIndex: number; // A persistent tracking index if needed? Or just rely on array order.
    type: [BaseType, BaseType];
    state: 'normal' | 'selected' | 'mutated-sub' | 'mutated-ins'; // distinct states for visual coloring
}

export type MutationType = 'substitution' | 'insertion' | 'deletion';
