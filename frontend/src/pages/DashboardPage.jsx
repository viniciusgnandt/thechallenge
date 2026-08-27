import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Flame, Calendar, Trophy, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import ProgressRing from '../components/ProgressRing';
import PageLoader from '../components/PageLoader';

export default function DashboardPage() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState(null);

  useEffect(() => {
    api.get('/enrollments/me').then(({ data }) => setEnrollments(data.enrollments)).catch(() => setEnrollments([]));
  }, []);

  if (enrollments === null) return <PageLoader />;

  const totalCompletedDays = enrollments.reduce((sum, e) => sum + e.completedDays, 0);
  const medals = enrollments.filter((e) => e.medalIssued).length;
  const active = enrollments.filter((e) => e.status === 'active').length;

  return (
    <div className="page container page-enter">
      <h1 style={{ fontSize: '1.7rem', marginBottom: 4 }}>Olá, {user?.name?.split(' ')[0]} 👋</h1>
      <p className="section-subtitle">Aqui está o resumo da sua jornada.</p>

      <div className="grid grid-4" style={{ marginBottom: 40 }}>
        <StatCard icon={Flame} label="Desafios ativos" value={active} />
        <StatCard icon={Calendar} label="Dias concluídos" value={totalCompletedDays} />
        <StatCard icon={Award} label="Medalhas" value={medals} />
        <StatCard icon={Trophy} label="Total de desafios" value={enrollments.length} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Meus Desafios</h2>
        {enrollments.length > 0 && <Link to="/" className="btn btn-outline btn-sm">Novo desafio</Link>}
      </div>

      {enrollments.length === 0 && (
        <div className="empty-state card">
          <div className="empty-state-icon"><Flame size={26} /></div>
          <p style={{ marginBottom: 16 }}>Você ainda não está em nenhum desafio.</p>
          <Link to="/" className="btn btn-primary">Ver desafios disponíveis</Link>
        </div>
      )}

      <div className="grid grid-2">
        {enrollments.map((e) => {
          const total = e.challenge?.durationDays || 100;
          const pct = Math.min(100, Math.round((e.completedDays / total) * 100));
          return (
            <Link to={`/inscricoes/${e._id}`} key={e._id} className="card card-hover" style={{ display: 'block' }}>
              <div className="card-pad" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                <ProgressRing percent={pct} size={72} stroke={6} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <h3 style={{ fontSize: '1.05rem' }}>{e.challenge?.title}</h3>
                    {e.status === 'completed' && <Award size={20} color="var(--gold)" style={{ flexShrink: 0 }} />}
                  </div>
                  <span className={`badge badge-${e.level}`} style={{ margin: '6px 0' }}>{e.level}</span>
                  <p style={{ fontSize: '0.82rem' }}>{e.completedDays} / {total} dias concluídos</p>
                </div>
                <ArrowRight size={18} color="var(--text-light)" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="card card-pad">
      <div className="empty-state-icon" style={{ width: 42, height: 42, margin: '0 0 12px' }}>
        <Icon size={19} />
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>{value}</div>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}
