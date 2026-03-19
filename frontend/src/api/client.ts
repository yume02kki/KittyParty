const BASE = 'http://localhost:5000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export interface Mission {
  id: string;
  name: string;
  mainApiUrl: string;
  devApiUrl: string;
  createdAt: string;
  ignoreRules: IgnoreRule[];
}

export interface IgnoreRule {
  id: string;
  pattern: string;
  replacement?: string;
  description?: string;
}

export interface TrafficLog {
  id: string;
  missionId: string;
  timestamp: string;
  request: CapturedRequest;
  mainResponse: CapturedResponse;
  devResponse: CapturedResponse;
  comparison: ComparisonResult;
}

export interface CapturedRequest {
  method: string;
  path: string;
  queryString?: string;
  headers: Record<string, string>;
  body?: string;
}

export interface CapturedResponse {
  statusCode: number;
  headers: Record<string, string>;
  body?: string;
  latencyMs: number;
}

export interface ComparisonResult {
  statusMatch: boolean;
  bodyMatch: boolean;
  latencyDifferenceMs: number;
  differences: string[];
}

export const api = {
  getMissions: () => request<Mission[]>('/api/missions/'),
  getMission: (id: string) => request<Mission>(`/api/missions/${id}`),
  createMission: (data: { name: string; mainApiUrl: string; devApiUrl: string }) =>
    request<Mission>('/api/missions/', { method: 'POST', body: JSON.stringify(data) }),
  deleteMission: (id: string) => request<void>(`/api/missions/${id}`, { method: 'DELETE' }),

  getRules: (missionId: string) => request<IgnoreRule[]>(`/api/missions/${missionId}/rules`),
  addRule: (missionId: string, data: { pattern: string; replacement?: string; description?: string }) =>
    request<IgnoreRule>(`/api/missions/${missionId}/rules`, { method: 'POST', body: JSON.stringify(data) }),
  deleteRule: (missionId: string, ruleId: string) =>
    request<void>(`/api/missions/${missionId}/rules/${ruleId}`, { method: 'DELETE' }),
  testRules: (missionId: string, sampleText: string) =>
    request<{ original: string; transformed: string }>(`/api/missions/${missionId}/rules/test`, {
      method: 'POST', body: JSON.stringify({ sampleText }),
    }),

  getLogs: (missionId: string) => request<TrafficLog[]>(`/api/logs/mission/${missionId}`),
  getLog: (id: string) => request<TrafficLog>(`/api/logs/${id}`),
  replay: (logId: string) => request<TrafficLog>(`/api/logs/${logId}/replay`, { method: 'POST' }),

  exportLogs: (missionId: string) => request<TrafficLog[]>(`/api/missions/${missionId}/export`),
  importLogs: (missionId: string, logs: TrafficLog[]) =>
    request<{ imported: number }>(`/api/missions/${missionId}/import`, {
      method: 'POST', body: JSON.stringify(logs),
    }),
};
