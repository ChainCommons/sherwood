import type { PositionType } from '../../core/src/index.ts'
import type { AssetRef, SemanticEvent } from '../../event-engine/src/index.ts'

/** The common schema also permits an asset ID without chain metadata. */
export type PositionAssetRef = AssetRef | (Partial<AssetRef> & { asset_id: string })

/** Structural counterpart of schemas/position/position.schema.json. */
export interface Position {
  position_id: string
  participant: string
  protocol?: string
  position_type: PositionType
  assets_deposited?: PositionAssetRef[]
  assets_received?: PositionAssetRef[]
  opened_at: string
  closed_at?: string | null
  source_events: string[]
  support_status?: 'SUPPORTED' | 'PARTIAL' | 'UNSUPPORTED'
  schema_version: string
}

/** A projection of an already normalized, evidence-backed economic event. */
export type PositionEvent = Pick<SemanticEvent,
  'event_id' | 'event_type' | 'participant' | 'occurred_at_utc' | 'source_evidence'>

export interface OpenPositionInput {
  position_id: string
  position_type: PositionType
  protocol?: string
  /** Explicit position assets; grants and rewards do not imply deposits. */
  assets_deposited?: readonly PositionAssetRef[]
  assets_received?: readonly PositionAssetRef[]
}

export interface PositionTransition {
  position: Position
  status: 'APPLIED' | 'UNCHANGED' | 'UNKNOWN' | 'UNSUPPORTED'
  reason?: 'UNSUPPORTED_POSITION' | 'UNSUPPORTED_EVENT' | 'PARTICIPANT_MISMATCH' |
    'BEFORE_OPEN' | 'POSITION_CLOSED' | 'EVENT_ALREADY_RECORDED'
}
