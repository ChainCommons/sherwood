export type {
  AnalysisSnapshot,
  BuildMeta,
  BuildOptions,
  Capacity,
  CertaintyLevel,
  EngineDiff,
  Finding,
  FindingCalculation,
  FindingCapacity,
  FindingCertainty,
  FindingPosture,
  FindingStatus,
  LotMethod,
  RoundingMode,
  SnapshotMeta,
  SnapshotRuleVersion,
  TraceContext,
  TraceStep,
  TraceStepKind
} from './types.ts'
export { ROUNDING_MODES, TRACE_STEPS } from './types.ts'

export {
  buildExplainabilityTrace,
  isMaterialFinding
} from './trace.ts'

export {
  buildFindings,
  checkProvenance,
  finalizeFinding
} from './builder.ts'
export type { BuildFindingsInput, ProvenanceIssue } from './builder.ts'

export {
  buildSnapshot,
  deriveSnapshotId,
  deserializeSnapshot,
  serializeSnapshot,
  SNAPSHOT_SCHEMA_VERSION,
  snapshotsEqual
} from './snapshot.ts'

export {
  ANALYZE_ENGINE_VERSION,
  analyze,
  deserializeAnalysis,
  reproduce,
  serializeAnalysis
} from './analyze.ts'
export type {
  AnalyzeInput,
  AnalyzeResult,
  ReproduceResult,
  SerializedAnalysis
} from './analyze.ts'
