export type {
  BuildMeta,
  BuildOptions,
  Capacity,
  CertaintyLevel,
  Finding,
  FindingCalculation,
  FindingCapacity,
  FindingCertainty,
  FindingPosture,
  FindingStatus,
  RoundingMode,
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
