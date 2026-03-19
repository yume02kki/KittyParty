import { useState } from 'react';
import { api } from '../api/client';

interface Props { onBack: () => void; }

export default function CreateMission({ onBack }: Props) {
  const [name, setName] = useState('');
  const [mainUrl, setMainUrl] = useState('');
  const [devUrl, setDevUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createMission({ name, mainApiUrl: mainUrl, devApiUrl: devUrl });
      onBack();
    } catch (err) {
      alert('Failed to create mission: ' + err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="toolbar">
        <button className="secondary" onClick={onBack}>Back</button>
        <h2>Create Mission</h2>
      </div>
      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: 600 }}>
        <div className="form-group">
          <label>Mission Name</label>
          <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. User Service v2 Migration" />
        </div>
        <div className="form-group">
          <label>Main API URL</label>
          <input value={mainUrl} onChange={e => setMainUrl(e.target.value)} required placeholder="http://localhost:3001" />
        </div>
        <div className="form-group">
          <label>Dev API URL</label>
          <input value={devUrl} onChange={e => setDevUrl(e.target.value)} required placeholder="http://localhost:3002" />
        </div>
        <button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Mission'}</button>
      </form>
    </div>
  );
}
