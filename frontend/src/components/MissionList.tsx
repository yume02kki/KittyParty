import { useEffect, useState } from 'react';
import type { Mission } from '../api/client';
import { api } from '../api/client';

interface Props {
  onCreate: () => void;
  onSelect: (id: string) => void;
}

export default function MissionList({ onCreate, onSelect }: Props) {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMissions().then(setMissions).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this mission?')) return;
    await api.deleteMission(id);
    setMissions(m => m.filter(x => x.id !== id));
  };

  if (loading) return <div className="empty">Loading...</div>;

  return (
    <div>
      <div className="card-header">
        <h2>Missions</h2>
        <button onClick={onCreate}>+ New Mission</button>
      </div>
      {missions.length === 0 ? (
        <div className="empty">No missions yet. Create one to get started.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Main API</th>
              <th>Dev API</th>
              <th>Rules</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {missions.map(m => (
              <tr key={m.id} onClick={() => onSelect(m.id)}>
                <td><strong>{m.name}</strong></td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{m.mainApiUrl}</td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text2)' }}>{m.devApiUrl}</td>
                <td>{m.ignoreRules.length}</td>
                <td style={{ fontSize: '0.8rem' }}>{new Date(m.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="danger small" onClick={e => handleDelete(e, m.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
