import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Users, ListChecks, Flame, Award, Video, CheckCircle2, XCircle, ShieldCheck, CreditCard } from 'lucide-react';
import api from '../api/axios';
import PageLoader from '../components/PageLoader';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState(null);
  const [subUsers, setSubUsers] = useState(null);

  const load = () => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).catch(() => {});
    api.get('/submissions/pending').then(({ data }) => setPending(data.submissions)).catch(() => setPending([]));
    api.get('/subscription/users').then(({ data }) => setSubUsers(data.users)).catch(() => setSubUsers([]));
  };

  const toggleSubscription = async (id, current) => {
    const nextStatus = current === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/subscription/users/${id}`, { status: nextStatus, plan: 'avista' });
      toast.success(nextStatus === 'active' ? 'Assinatura ativada' : 'Assinatura desativada');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro');
    }
  };

  useEffect(() => { load(); }, []);

  const review = async (id, status) => {
    let rejectionReason;
    if (status === 'rejected') {
      rejectionReason = window.prompt('Motivo da rejeição:') || '';
    }
    try {
      await api.patch(`/submissions/${id}/review`, { status, rejectionReason });
      toast.success(status === 'approved' ? 'Aprovado' : 'Rejeitado');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro');
    }
  };

  return (
    <div className="page container page-enter">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <ShieldCheck size={24} color="var(--primary)" />
        <h1 style={{ fontSize: '1.6rem' }}>Painel Admin</h1>
      </div>
      <p className="section-subtitle">Visão geral e moderação de conteúdo.</p>

      {!stats ? <PageLoader /> : (
        <div className="grid grid-4" style={{ marginBottom: 40 }}>
          <StatCard icon={Users} label="Usuários" value={stats.totalUsers} />
          <StatCard icon={ListChecks} label="Inscrições" value={stats.totalEnrollments} />
          <StatCard icon={Flame} label="Desafios ativos" value={stats.activeChallenges} />
          <StatCard icon={Award} label="Concluídos" value={stats.completed} />
          <StatCard icon={CreditCard} label="Assinantes ativos" value={stats.activeSubscribers} />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <CreditCard size={19} color="var(--primary)" />
        <h2 className="section-title" style={{ marginBottom: 0 }}>Assinaturas</h2>
      </div>

      {subUsers === null && <PageLoader />}

      {subUsers && subUsers.length > 0 && (
        <div className="card card-pad" style={{ marginBottom: 40 }}>
          {subUsers.map((u) => (
            <div key={u._id} className="rank-row" style={{ flexWrap: 'wrap' }}>
              <div className="avatar-circle">{u.name?.[0]?.toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <strong style={{ fontSize: '0.92rem' }}>{u.name}</strong>
                <p style={{ fontSize: '0.8rem' }}>{u.email}</p>
              </div>
              <span className={`badge badge-status-${u.subscription?.status === 'active' ? 'approved' : 'pending'}`}>
                {u.subscription?.status === 'active' ? 'Ativa' : 'Inativa'}
              </span>
              <button
                className={`btn btn-sm ${u.subscription?.status === 'active' ? 'btn-outline' : 'btn-primary'}`}
                onClick={() => toggleSubscription(u._id, u.subscription?.status)}
              >
                {u.subscription?.status === 'active' ? 'Desativar' : 'Ativar'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Video size={19} color="var(--primary)" />
        <h2 className="section-title" style={{ marginBottom: 0 }}>Vídeos pendentes de aprovação</h2>
        {pending?.length > 0 && <span className="badge badge-status-pending">{pending.length}</span>}
      </div>

      {pending === null && <PageLoader />}

      {pending && pending.length === 0 && (
        <div className="empty-state card">
          <div className="empty-state-icon"><CheckCircle2 size={26} /></div>
          <p>Nada pendente. Tudo em dia 🎉</p>
        </div>
      )}

      {pending && pending.length > 0 && (
        <div className="card card-pad">
          {pending.map((s) => (
            <div key={s._id} className="rank-row" style={{ flexWrap: 'wrap' }}>
              <div className="avatar-circle">{s.user?.name?.[0]?.toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <strong style={{ fontSize: '0.92rem' }}>{s.user?.name}</strong>
                <p style={{ fontSize: '0.8rem' }}>{s.challenge?.title} — Dia {s.day}</p>
              </div>
              {s.videoUrl && (
                <a href={s.videoUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Ver vídeo</a>
              )}
              <button className="btn btn-primary btn-sm" onClick={() => review(s._id, 'approved')}>
                <CheckCircle2 size={14} /> Aprovar
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => review(s._id, 'rejected')}>
                <XCircle size={14} /> Rejeitar
              </button>
            </div>
          ))}
        </div>
      )}
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
