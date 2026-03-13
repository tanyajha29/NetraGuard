export type Target = {
  id: number;
  name: string;
  base_url: string;
  environment?: string | null;
  owner?: string | null;
  description?: string | null;
  target_type?: string | null;
  created_at?: string;
};

export type ScanRun = {
  id: number;
  target_id: number;
  initiated_by?: number | null;
  status: string;
  trigger_type: string;
  started_at: string;
  ended_at?: string;
  total_apis: number;
  active_count: number;
  deprecated_count: number;
  orphaned_count: number;
  shadow_count: number;
  zombie_count: number;
  summary_json?: Record<string, unknown>;
};

export type APIAsset = {
  id: number;
  target_id: number;
  path: string;
  method: string;
  version?: string | null;
  source_type?: string | null;
  source_reference?: string | null;
  owner?: string | null;
  auth_required: boolean;
  encryption_enabled: boolean;
  rate_limit_detected: boolean;
  traffic_count: number;
  current_status: string;
  risk_level: string;
  risk_score: number;
  recommendation?: string | null;
  first_seen_at?: string;
  last_seen_at?: string;
};

export type Finding = {
  id: number;
  scan_run_id: number;
  api_asset_id: number;
  finding_type: string;
  severity: string;
  title: string;
  description: string;
  recommendation: string;
};

export type Alert = {
  id: number;
  scan_run_id: number;
  api_asset_id: number;
  alert_type: string;
  severity: string;
  message: string;
  status: string;
};

export type Report = {
  id: number;
  scan_run_id: number;
  target_id: number;
  format: string;
  file_path: string;
  summary: string;
  generated_at: string;
};

export type Workflow = {
  id: number;
  api_asset_id: number;
  scan_run_id: number;
  workflow_status: string;
  mode: string;
  action_taken?: string | null;
  notes?: string | null;
};
