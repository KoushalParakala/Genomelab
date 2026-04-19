/**
 * API Client
 * ===========
 * Centralized HTTP client for the DNA backend API.
 * Handles auth headers, error responses, and base URL configuration.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

interface ApiError {
    detail: string;
    status: number;
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE}${endpoint}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error: ApiError = {
            detail: await response.text(),
            status: response.status,
        };
        throw error;
    }

    return response.json();
}

// ─── Biology Endpoints ──────────────────────────────────────────────

export interface SimulateRequest {
    sequence: string;
    sequence_id?: string;
}

export interface MutateRequest {
    sequence: string;
    mutation_type: string;
    position: number;
    new_nucleotide?: string | null;
    gene_name?: string | null;
    include_structure?: boolean;
    session_id?: string | null;
    baseline_id?: string | null;
}

export interface TranslationResult {
    mrna_sequence: string;
    amino_acid_sequence: string;
    stop_codon_detected: boolean;
    frame_shift_detected: boolean;
}

export interface EvidenceSource {
    source: string;
    verdict: string;
    weight: number;
    detail: string;
}

export interface ESMEmbeddingResult {
    cosine_distance: number;
    euclidean_distance: number;
    per_residue_delta: number[];
    max_residue_shift: number;
    affected_region: number[];
    embedding_risk_score: number;
}

export interface StructureComparisonResult {
    rmsd: number;
    ddg: number;
    h_bonds_broken: number;
    h_bonds_formed: number;
    secondary_structure_diff: Array<Record<string, string>>;
    active_site_proximity: boolean;
    aggregation_delta: number;
    per_residue_displacement: number[];
    max_displacement: number;
    max_displacement_residue: number;
    mean_plddt_wt: number;
    mean_plddt_mut: number;
    stability_assessment: string;
    structural_risk_score: number;
}

export interface ClassifierResult {
    classification: string;
    confidence: number;
    probabilities: Record<string, number>;
    feature_importances: Record<string, number>;
}

export interface ExplainabilityResult {
    summary: string;
    detailed_narrative: string;
    molecular_consequences: string[];
    evidence_sources: EvidenceSource[];
    confidence_level: string;
    confidence_score: number;
    gene_context: Record<string, any> | null;
}

export interface AIPredictions {
    stability_score: number;
    functional_risk: string;
    aggregation_risk: number;
    embedding_analysis: ESMEmbeddingResult | null;
    structure_comparison: StructureComparisonResult | null;
    classifier_result: ClassifierResult | null;
    explainability: ExplainabilityResult | null;
    confidence_score: number;
    biological_narrative: string;
    llr_score?: number;
    attention_map?: number[][];
    shap_values?: Array<{ feature: string; value: number }>;
}

export interface MutationHistoryResponse {
    logs: Array<{
        id: string;
        session_id: string | null;
        mutation_type: string;
        position: number;
        variant_annotation: string;
        verdict: string | null;
        created_at: string;
        stability_score: number | null;
    }>;
    total_count: number;
    status: string;
}

export interface MutationResponse {
    baseline_sequence: string;
    mutated_sequence: string;
    mutation_type: string;
    position: number;
    new_nucleotide: string | null;
    baseline_translation: TranslationResult | null;
    mutated_translation: TranslationResult | null;
    variant_annotation: string;
    ai_predictions: AIPredictions;
    replay_series: Array<{ step: number; type: string; rmsd: number; ddg: number; verdict: string }>;
    fingerprint: number[];
    status: string;
    log_id: string | null;
}

export const api = {
    simulate(data: SimulateRequest) {
        return request<any>('/biology/simulate', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    mutate(data: MutateRequest) {
        return request<MutationResponse>('/biology/mutate', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // ─── Structure Endpoints ──────────────────────────────────────
    predictStructure(proteinSequence: string) {
        return request<{
            pdb_string: string;
            sequence_length: number;
            status: string;
            error: string | null;
        }>('/structure/predict', {
            method: 'POST',
            body: JSON.stringify({ protein_sequence: proteinSequence }),
        });
    },

    compareStructures(wtPdb: string, mutPdb: string) {
        return request<StructureComparisonResult>('/structure/compare', {
            method: 'POST',
            body: JSON.stringify({ wt_pdb: wtPdb, mut_pdb: mutPdb }),
        });
    },

    // ─── What-If Endpoints ────────────────────────────────────────
    whatIfScan(sequence: string, startPosition?: number, endPosition?: number) {
        return request<{
            scan_results: Array<{
                position: number;
                original_base: string;
                mutated_base: string;
                variant_annotation: string;
                functional_risk: string;
                stability_score: number;
                embedding_risk_score: number;
            }>;
            sequence_length: number;
            scan_range: number[];
            status: string;
        }>('/whatif/scan', {
            method: 'POST',
            body: JSON.stringify({
                sequence,
                start_position: startPosition ?? 0,
                end_position: endPosition,
            }),
        });
    },

    whatIfBatch(sequence: string, mutations: Array<{ mutation_type: string; position: number; new_nucleotide?: string }>) {
        return request<{ results: any[]; count: number; status: string }>('/whatif/batch', {
            method: 'POST',
            body: JSON.stringify({ sequence, mutations }),
        });
    },

    getHistory() {
        return request<MutationHistoryResponse>('/biology/history');
    },

    getLog(logId: string) {
        return request<MutationResponse>(`/biology/log/${logId}`);
    },
};
