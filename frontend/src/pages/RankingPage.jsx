import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Trophy, Medal } from 'lucide-react';
import api from '../api/axios';
import PageLoader from '../components/PageLoader';

const LEVELS = [
  { value: '', label: 'Todos' },
  { value: 'basico', label: 'Básico' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'avancado', label: 'Avançado' },
];

export default function RankingPage() {
  const { slug } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [level, setLevel] = useState('');

  useEffect(() => {
    api.get(`/challenges/${slug}`).then(({ data }) => setChallenge(data.challenge)).catch(() => {});
  }, [slug]);

  useEffect(() => {
    if (!challenge) return;
    setRanking(null);
    api.get(`/rankings/${challenge._id}`, { params: level ? { level } : {} })
      .then(({ data }) => setRanking(data.ranking)).catch(() => setRanking([]));
  }, [challenge, level]);

  if (!challenge) return <PageLoader />;

  const podium = ranking?.slice(0, 3) || [];
  const rest = ranking?.slice(3) || [];

  return (
    <div className="page container page-enter">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <Trophy size={24} color="var(--gold)" />
        <h1 style={{ fontSize: '1.6rem' }}>Ranking</h1>
      </div>
      <p className="section-subtitle">{challenge.title}</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {LEVELS.map((l) => (
          <button key={l.value} className={`btn btn-sm ${level === l.value ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setLevel(l.value)}>
            {l.label}
          </button>
        ))}
      </div>

      {ranking === null && <PageLoader />}

      {ranking && ranking.length === 0 && (
        <div className="empty-state card">
          <div className="empty-state-icon"><Medal size={26} /></div>
          <p>Ninguém no ranking ainda. Seja o primeiro!</p>
        </div>
      )}

      {podium.length > 0 && (
        <div className="podium">
          {[podium[1], podium[0], podium[2]].map((r, idx) => {
            if (!r) return <div key={idx} />;
            const place = idx === 1 ? 1 : idx === 0 ? 2 : 3;
            const height = place === 1 ? 150 : place === 2 ? 116 : 96;
            const podiumClass = place === 1 ? 'gold' : place === 2 ? 'silver' : 'bronze';
            return (
              <div key={r._id} className="podium-item">
                <div className="avatar-circle" style={{ width: 52, height: 52, fontSize: 18, marginBottom: 8 }}>
                  {r.user?.name?.[0]?.toUpperCase()}
                </div>
                <strong style={{ fontSize: '0.9rem', textAlign: 'center' }}>{r.user?.name}</strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>{r.completedDays} dias</span>
                <div className={`podium-bar ${podiumClass}`} style={{ height }}>{place}º</div>
              </div>
            );
          })}
        </div>
      )}

      {rest.length > 0 && (
        <div className="card card-pad" style={{ marginTop: 28 }}>
          {rest.map((r, i) => (
            <div className="rank-row" key={r._id}>
              <div className="rank-pos">{i + 4}º</div>
              <div className="avatar-circle">{r.user?.name?.[0]?.toUpperCase()}</div>
              <span style={{ flex: 1, fontWeight: 600 }}>{r.user?.name}</span>
              <span className={`badge badge-${r.level}`}>{r.level}</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem' }}>{r.completedDays} dias</span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .podium { display: flex; align-items: flex-end; justify-content: center; gap: 20px; margin-top: 20px; }
        .podium-item { display: flex; flex-direction: column; align-items: center; width: 110px; }
        .podium-bar {
          width: 100%; border-radius: 12px 12px 0 0; display: flex; align-items: flex-start;
          justify-content: center; padding-top: 10px; color: white; font-weight: 900; font-size: 1.1rem;
        }
        .podium-bar.gold { background: linear-gradient(180deg, #FDE68A, #F59E0B); color: #78350F; }
        .podium-bar.silver { background: linear-gradient(180deg, #F1F5F9, #94A3B8); color: #1E293B; }
        .podium-bar.bronze { background: linear-gradient(180deg, #FBCFE8, #C2703D); color: white; }
        @media (max-width: 560px) {
          .podium { gap: 8px; }
          .podium-item { width: 80px; }
        }
      `}</style>
    </div>
  );
}
