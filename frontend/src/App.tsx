import { useState } from 'react';
import MissionList from './components/MissionList';
import MissionDashboard from './components/MissionDashboard';
import CreateMission from './components/CreateMission';
import './styles.css';

type View = { page: 'list' } | { page: 'create' } | { page: 'dashboard'; missionId: string };

export default function App() {
  const [view, setView] = useState<View>({ page: 'list' });

  return (
    <div className="app">
      <header>
        <h1 onClick={() => setView({ page: 'list' })} style={{ cursor: 'pointer' }}>
          KittyParty
        </h1>
        <span className="subtitle">API Proxy Comparison Platform</span>
      </header>
      <main>
        {view.page === 'list' && (
          <MissionList
            onCreate={() => setView({ page: 'create' })}
            onSelect={(id) => setView({ page: 'dashboard', missionId: id })}
          />
        )}
        {view.page === 'create' && (
          <CreateMission onBack={() => setView({ page: 'list' })} />
        )}
        {view.page === 'dashboard' && (
          <MissionDashboard
            missionId={view.missionId}
            onBack={() => setView({ page: 'list' })}
          />
        )}
      </main>
    </div>
  );
}
