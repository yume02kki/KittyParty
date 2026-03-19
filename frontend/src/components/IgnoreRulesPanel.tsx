import { useState } from 'react';
import type { IgnoreRule } from '../api/client';
import { api } from '../api/client';

interface Props {
  missionId: string;
  rules: IgnoreRule[];
  onUpdate: () => void;
}

export default function IgnoreRulesPanel({ missionId, rules, onUpdate }: Props) {
  const [pattern, setPattern] = useState('');
  const [replacement, setReplacement] = useState('');
  const [description, setDescription] = useState('');
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pattern) return;
    await api.addRule(missionId, {
      pattern,
      replacement: replacement || undefined,
      description: description || undefined,
    });
    setPattern('');
    setReplacement('');
    setDescription('');
    onUpdate();
  };

  const handleDelete = async (ruleId: string) => {
    await api.deleteRule(missionId, ruleId);
    onUpdate();
  };

  const handleTest = async () => {
    if (!testInput) return;
    const result = await api.testRules(missionId, testInput);
    setTestResult(result.transformed);
  };

  return (
    <div>
      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Add Ignore Rule</h3>
        <form onSubmit={handleAdd}>
          <div className="form-group">
            <label>Regex Pattern</label>
            <input
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder='e.g. "id":\s*"\w{8}-\w{4}-\w{4}-\w{4}-\w{12}"'
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>Replacement (optional)</label>
              <input
                value={replacement}
                onChange={e => setReplacement(e.target.value)}
                placeholder="***IGNORED*** (default)"
              />
            </div>
            <div className="form-group">
              <label>Description (optional)</label>
              <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Ignore UUIDs"
              />
            </div>
          </div>
          <button type="submit">Add Rule</button>
        </form>
      </div>

      {rules.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Active Rules</h3>
          <table>
            <thead>
              <tr>
                <th>Pattern</th>
                <th>Replacement</th>
                <th>Description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id} onClick={e => e.stopPropagation()} style={{ cursor: 'default' }}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.pattern}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{r.replacement || '***IGNORED***'}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{r.description || '-'}</td>
                  <td>
                    <button className="danger small" onClick={() => handleDelete(r.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>Test Rules</h3>
        <div className="form-group">
          <label>Sample Response Body</label>
          <textarea
            value={testInput}
            onChange={e => setTestInput(e.target.value)}
            placeholder='Paste a sample response body here to test regex rules...'
            rows={4}
          />
        </div>
        <button className="secondary" onClick={handleTest} style={{ marginBottom: 12 }}>
          Test Rules
        </button>
        {testResult !== null && (
          <div className="response-panel">
            <h4>Transformed Result</h4>
            <pre>{testResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
