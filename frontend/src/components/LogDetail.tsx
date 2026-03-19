import type { TrafficLog } from '../api/client';

interface Props {
  log: TrafficLog;
  onBack: () => void;
  onReplay: () => void;
}

function formatJson(s?: string): string {
  if (!s) return '(empty)';
  try { return JSON.stringify(JSON.parse(s), null, 2); } catch { return s; }
}

export default function LogDetail({ log, onBack, onReplay }: Props) {
  return (
    <div>
      <div className="toolbar">
        <button className="secondary" onClick={onBack}>Back to Logs</button>
        <button className="small" onClick={onReplay}>Replay This Request</button>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Request</h3>
        <div style={{ display: 'flex', gap: 12, marginBottom: 8, fontSize: '0.85rem' }}>
          <span className="badge method">{log.request.method}</span>
          <span style={{ fontFamily: 'monospace' }}>/{log.request.path}</span>
          {log.request.queryString && (
            <span style={{ color: 'var(--text2)' }}>?{log.request.queryString}</span>
          )}
        </div>
        {log.request.body && (
          <div className="response-panel">
            <h4>Body</h4>
            <pre>{formatJson(log.request.body)}</pre>
          </div>
        )}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Comparison Summary</h3>
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <span className={`badge ${log.comparison.statusMatch ? 'match' : 'diff'}`}>
            Status: {log.comparison.statusMatch ? 'Match' : 'Different'}
          </span>
          <span className={`badge ${log.comparison.bodyMatch ? 'match' : 'diff'}`}>
            Body: {log.comparison.bodyMatch ? 'Match' : 'Different'}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>
            Latency diff: {log.comparison.latencyDifferenceMs}ms
          </span>
        </div>
        {log.comparison.differences.length > 0 && (
          <div className="response-panel">
            <h4>Differences</h4>
            {log.comparison.differences.map((d, i) => (
              <div key={i} className="diff-line removed">{d}</div>
            ))}
          </div>
        )}
      </div>

      <div className="side-by-side">
        <div className="card">
          <h3>
            Main Response
            <span style={{ fontSize: '0.8rem', color: 'var(--text2)', marginLeft: 8 }}>
              {log.mainResponse.statusCode} - {log.mainResponse.latencyMs}ms
            </span>
          </h3>
          <div className="response-panel" style={{ marginTop: 8 }}>
            <pre>{formatJson(log.mainResponse.body)}</pre>
          </div>
        </div>
        <div className="card">
          <h3>
            Dev Response
            <span style={{ fontSize: '0.8rem', color: 'var(--text2)', marginLeft: 8 }}>
              {log.devResponse.statusCode} - {log.devResponse.latencyMs}ms
            </span>
          </h3>
          <div className="response-panel" style={{ marginTop: 8 }}>
            <pre>{formatJson(log.devResponse.body)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
