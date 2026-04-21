import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { DNABasePair, BaseType } from '../types/dna';
import type { AIPredictions, MutationResponse } from '../services/apiClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

// ─── Enhanced Interfaces ────────────────────────────────────────────

interface TranslationResult {
    amino_acid_sequence: string;
    has_stop_codon: boolean;
    structural_warnings: string[];
}

interface MutationImpact {
    variant_annotation: string;
    ai_predictions: AIPredictions;
    baseline_translation?: TranslationResult;
    mutated_translation?: TranslationResult;
    replay_series: Array<{ step: number; type: string; rmsd: number; ddg: number; verdict: string }>;
    fingerprint: number[];
}

export interface WhatIfScanCell {
    position: number;
    original_base: string;
    mutated_base: string;
    variant_annotation: string;
    functional_risk: string;
    stability_score: number;
    embedding_risk_score: number;
}

interface DNAStore {
    helix: DNABasePair[];
    selectedId: string | null;
    impactData: MutationImpact | null;
    isSimulating: boolean;
    sessionId: string | null;
    
    // What-If scan data
    whatIfResults: WhatIfScanCell[];
    isWhatIfScanning: boolean;
    whatIfActive: boolean;

    // Mutation selection
    mutationType: 'substitution' | 'insertion' | 'deletion';
    includeStructure: boolean;
    
    // History
    history: any[];
    isLoadingHistory: boolean;
    
    // Structure prediction
    structurePDBs: { wt: string; mut: string } | null;
    isLoadingStructure: boolean;
    
    // Actions
    selectBase: (id: string | null) => void;
    setMutationType: (type: 'substitution' | 'insertion' | 'deletion') => void;
    setIncludeStructure: (val: boolean) => void;
    performMutation: (targetId: string, customSequence?: string) => Promise<void>;
    fetchHistory: () => Promise<void>;
    loadLog: (logId: string) => Promise<void>;
    runWhatIfScan: (startPos?: number, endPos?: number) => Promise<void>;
    toggleWhatIf: () => void;
    requestStructurePrediction: () => Promise<void>;
    getSequenceText: () => string;
}

const PAIRS: Record<BaseType, BaseType> = {
    'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C'
};

const getRandomBasePair = (): [BaseType, BaseType] => {
    const bases: BaseType[] = ['A', 'T', 'C', 'G'];
    const primary = bases[Math.floor(Math.random() * bases.length)];
    return [primary, PAIRS[primary]];
};

const generateInitialHelix = (length: number): DNABasePair[] => {
    return Array.from({ length }).map((_, i) => ({
        id: uuidv4(),
        index: i,
        sequenceIndex: i,
        type: getRandomBasePair(),
        state: 'normal'
    }));
};

export const useDNAStore = create<DNAStore>((set, get) => ({
    helix: generateInitialHelix(40),
    selectedId: null,
    impactData: null,
    isSimulating: false,
    sessionId: null,
    mutationType: 'substitution',
    includeStructure: false,
    history: [],
    isLoadingHistory: false,
    whatIfResults: [],
    isWhatIfScanning: false,
    whatIfActive: false,
    structurePDBs: null,
    isLoadingStructure: false,

    selectBase: (id) => set({ selectedId: id }),
    setMutationType: (mutationType) => set({ mutationType }),
    setIncludeStructure: (includeStructure) => set({ includeStructure }),

    getSequenceText: () => {
        return get().helix.map(bp => bp.type[0]).join('');
    },

    toggleWhatIf: () => set(s => ({ whatIfActive: !s.whatIfActive, whatIfResults: [] })),

    performMutation: async (targetId, customSequence) => {
        const state = get();
        const targetIndex = state.helix.findIndex(h => h.id === targetId);
        if (targetIndex === -1 && targetId !== 'manual') return;

        let currentSessionId = state.sessionId;
        if (!currentSessionId) {
            currentSessionId = uuidv4();
            set({ sessionId: currentSessionId });
        }

        // Use custom sequence from editor if provided, otherwise use helix bases
        const baselineSequence = customSequence 
            ? customSequence.replace(/\s/g, '')
            : state.helix.map(bp => bp.type[0]).join('');
            
        set({ isSimulating: true, impactData: null });

        let apiMutationType = 'point';
        let newNucleotide = '';
        const newHelix = [...state.helix];

        if (state.mutationType === 'substitution') {
            apiMutationType = 'point';
            if (targetIndex !== -1) {
                const currentPair = newHelix[targetIndex].type;
                const newPair: [BaseType, BaseType] = currentPair[0] === 'A' || currentPair[0] === 'T' ? ['G', 'C'] : ['A', 'T'];
                newNucleotide = newPair[0];
                newHelix[targetIndex] = { ...newHelix[targetIndex], type: newPair, state: 'mutated-sub' };
            }
        }
        else if (state.mutationType === 'deletion') {
            apiMutationType = 'deletion';
            if (targetIndex !== -1) newHelix.splice(targetIndex, 1);
        }
        else if (state.mutationType === 'insertion') {
            apiMutationType = 'insertion';
            const newBase: DNABasePair = {
                id: uuidv4(), index: -1, sequenceIndex: -1, type: getRandomBasePair(), state: 'mutated-ins'
            };
            newNucleotide = newBase.type[0];
            if (targetIndex !== -1) newHelix.splice(targetIndex + 1, 0, newBase);
        }

        try {
            const res = await fetch(`${API_BASE}/biology/mutate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sequence: baselineSequence,
                    mutation_type: apiMutationType,
                    position: targetIndex !== -1 ? targetIndex : 0,
                    new_nucleotide: apiMutationType !== 'deletion' ? newNucleotide : null,
                    session_id: currentSessionId,
                    include_structure: state.includeStructure
                })
            });

            if (res.ok) {
                const data: MutationResponse = await res.json();
                set({
                    helix: newHelix,
                    impactData: {
                        variant_annotation: data.variant_annotation,
                        ai_predictions: data.ai_predictions,
                        replay_series: data.replay_series,
                        fingerprint: data.fingerprint,
                        baseline_translation: data.baseline_translation ? {
                            amino_acid_sequence: data.baseline_translation.amino_acid_sequence,
                            has_stop_codon: data.baseline_translation.stop_codon_detected,
                            structural_warnings: [],
                        } : undefined,
                        mutated_translation: data.mutated_translation ? {
                            amino_acid_sequence: data.mutated_translation.amino_acid_sequence,
                            has_stop_codon: data.mutated_translation.stop_codon_detected,
                            structural_warnings: [],
                        } : undefined,
                    },
                    isSimulating: false
                });
            } else {
                set({ isSimulating: false });
            }
        } catch (error) {
            set({ isSimulating: false });
        }
    },

    runWhatIfScan: async (startPos?: number, endPos?: number) => {
        const state = get();
        const sequence = state.helix.map(bp => bp.type[0]).join('');
        
        set({ isWhatIfScanning: true, whatIfResults: [] });
        
        try {
            const res = await fetch(`${API_BASE}/whatif/scan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sequence,
                    start_position: startPos ?? 0,
                    end_position: endPos ?? Math.min(sequence.length, 60),
                })
            });
            
            if (res.ok) {
                const data = await res.json();
                set({ 
                    whatIfResults: data.scan_results,
                    isWhatIfScanning: false 
                });
            } else {
                console.error('What-If scan failed:', await res.text());
                set({ isWhatIfScanning: false });
            }
        } catch (error) {
            console.error('What-If scan error:', error);
            set({ isWhatIfScanning: false });
        }
    },

    requestStructurePrediction: async () => {
        const state = get();
        if (!state.impactData?.baseline_translation || !state.impactData?.mutated_translation) return;
        
        set({ isLoadingStructure: true });
        
        try {
            const [wtRes, mutRes] = await Promise.all([
                fetch(`${API_BASE}/structure/predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ protein_sequence: state.impactData.baseline_translation.amino_acid_sequence })
                }),
                fetch(`${API_BASE}/structure/predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ protein_sequence: state.impactData.mutated_translation.amino_acid_sequence })
                }),
            ]);
            
            if (wtRes.ok && mutRes.ok) {
                const wtData = await wtRes.json();
                const mutData = await mutRes.json();
                
                if (wtData.status === 'success' && mutData.status === 'success') {
                    set({ 
                        structurePDBs: { wt: wtData.pdb_string, mut: mutData.pdb_string },
                        isLoadingStructure: false 
                    });
                } else {
                    set({ isLoadingStructure: false });
                }
            } else {
                set({ isLoadingStructure: false });
            }
        } catch (error) {
            console.error('Structure prediction error:', error);
            set({ isLoadingStructure: false });
        }
    },

    fetchHistory: async () => {
        set({ isLoadingHistory: true });
        try {
            const res = await fetch(`${API_BASE}/biology/history`);
            if (res.ok) {
                const data = await res.json();
                set({ history: data.logs, isLoadingHistory: false });
            } else {
                set({ isLoadingHistory: false });
            }
        } catch (error) {
            set({ isLoadingHistory: false });
        }
    },

    loadLog: async (logId: string) => {
        set({ isSimulating: true });
        try {
            const res = await fetch(`${API_BASE}/biology/log/${logId}`);
            if (res.ok) {
                const data = await res.json();
                set({ 
                    impactData: {
                        variant_annotation: data.variant_annotation,
                        ai_predictions: data.ai_predictions,
                        replay_series: data.replay_series,
                        fingerprint: data.fingerprint,
                        baseline_translation: data.baseline_translation ? {
                            amino_acid_sequence: data.baseline_translation.amino_acid_sequence,
                            has_stop_codon: data.baseline_translation.stop_codon_detected,
                            structural_warnings: [],
                        } : undefined,
                        mutated_translation: data.mutated_translation ? {
                            amino_acid_sequence: data.mutated_translation.amino_acid_sequence,
                            has_stop_codon: data.mutated_translation.stop_codon_detected,
                            structural_warnings: [],
                        } : undefined,
                    },
                    structurePDBs: data.ai_predictions.structure_comparison?.pdb_string ? {
                        wt: "", // Backend return would need to include WT if we want it, or we assume it's lost
                        mut: data.ai_predictions.structure_comparison.pdb_string
                    } : null,
                    isSimulating: false 
                });
            } else {
                set({ isSimulating: false });
            }
        } catch (error) {
            set({ isSimulating: false });
        }
    }
}));
