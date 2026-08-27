import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Award, RefreshCw, X, Video, Watch, CheckCircle2, Trophy } from 'lucide-react';
import api from '../api/axios';
import ProgressRing from '../components/ProgressRing';
import PageLoader from '../components/PageLoader';

const TASK_ICON = { strava: Watch, video_link: Video, checkin: CheckCircle2 };

export default function EnrollmentPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const load = () => api.get(`/enrollments/${id}/progress`).then(({ data }) => setData(data)).catch(() => {});

  useEffect(() => { load(); }, [id]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data: res } = await api.post(`/strava/sync/${id}`);
      if (res.matched.length > 0) toast.success(`${res.matched.length} dia(s) validado(s) via Strava!`);
      else toast('Nenhuma atividade nova encontrada no Strava.');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Conecte sua conta Strava no perfil primeiro.');
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmit = async (day) => {
    setSubmitting(true);
    try {
      await api.post('/submissions', { enrollmentId: id, day, videoUrl });
      toast.success('Enviado!');
      setSelectedDay(null);
      setVideoUrl('');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao enviar');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckin = async (day) => {
    setSubmitting(true);
    try {
      await api.post('/submissions', { enrollmentId: id, day });
      toast.success('Dia concluído!');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao enviar');
    } finally {
      setSubmitting(false);
    }
  };

  if (!data) return <PageLoader />;
  const { enrollment, days } = data;
  const pct = Math.min(100, Math.round((enrollment.completedDays / days.length) * 100));

  return (
    <div className="page container page-enter">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20, marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
          <ProgressRing percent={pct} size={78} stroke={7} />
          <div>
            <h1 style={{ fontSize: '1.5rem', marginBottom: 6 }}>{enrollment.challenge.title}</h1>
            <span className={`badge badge-${enrollment.level}`}>{enrollment.level}</span>
            <p style={{ fontSize: '0.85rem', marginTop: 8 }}>
              {enrollment.completedDays} de {days.length} dias concluídos
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to={`/desafios/${enrollment.challenge.slug}/ranking`} className="btn btn-outline">
            <Trophy size={16} /> Ranking
          </Link>
          <button className="btn btn-primary" onClick={handleSync} disabled={syncing}>
            <RefreshCw size={16} className={syncing ? 'spin-icon' : ''} /> {syncing ? 'Sincronizando...' : 'Sincronizar Strava'}
          </button>
        </div>
      </div>

      {enrollment.status === 'completed' && (
        <div className="card card-pad" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, background: 'var(--gradient-soft)', boxShadow: 'none', border: '1px solid #FFD9C2' }}>
          <Award size={32} color="var(--gold)" />
          <div style={{ flex: 1 }}>
            <strong>Parabéns, você concluiu o desafio! 🎉</strong>
            <p style={{ fontSize: '0.88rem' }}>Sua medalha e certificado já estão disponíveis.</p>
          </div>
          <Link to={`/inscricoes/${enrollment._id}/certificado`} className="btn btn-primary btn-sm">Ver certificado</Link>
        </div>
      )}

      <div className="card card-pad">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1rem' }}>Seus 100 dias</h3>
          <div style={{ display: 'flex', gap: 14, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <LegendDot color="#059669" bg="var(--green-soft)" label="Aprovado" />
            <LegendDot color="#B45309" bg="var(--yellow-soft)" label="Pendente" />
            <LegendDot color="#DC2626" bg="var(--red-soft)" label="Rejeitado" />
          </div>
        </div>
        <div className="grid grid-days">
          {days.map(({ task, submission }) => {
            const status = submission?.status;
            const cls = status === 'approved' ? 'approved' : status === 'pending' ? 'pending' : status === 'rejected' ? 'rejected' : 'locked';
            return (
              <div key={task.day} className={`day-cell ${cls}`} onClick={() => setSelectedDay({ task, submission })} title={task.title}>
                {task.day}
              </div>
            );
          })}
        </div>
      </div>

      {selectedDay && (
        <div className="modal-overlay" onClick={() => setSelectedDay(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="empty-state-icon" style={{ width: 38, height: 38, margin: 0 }}>
                  {(() => { const Icon = TASK_ICON[selectedDay.task.validationType] || CheckCircle2; return <Icon size={17} />; })()}
                </div>
                <h3 style={{ fontSize: '1.1rem' }}>Dia {selectedDay.task.day}</h3>
              </div>
              <button className="btn btn-ghost btn-icon" onClick={() => setSelectedDay(null)}><X size={18} /></button>
            </div>
            <p style={{ marginBottom: 4, fontWeight: 700, color: 'var(--text)' }}>{selectedDay.task.title}</p>
            <p style={{ fontSize: '0.9rem', marginBottom: 20 }}>{selectedDay.task.description}</p>

            {selectedDay.submission ? (
              <div>
                <span className={`badge badge-status-${selectedDay.submission.status}`}>{selectedDay.submission.status}</span>
                {selectedDay.submission.videoUrl && (
                  <p style={{ marginTop: 12 }}>
                    <a href={selectedDay.submission.videoUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                      Ver vídeo enviado →
                    </a>
                  </p>
                )}
                {selectedDay.submission.rejectionReason && (
                  <p style={{ marginTop: 12, color: 'var(--red)', fontSize: '0.88rem' }}>
                    Motivo: {selectedDay.submission.rejectionReason}
                  </p>
                )}
              </div>
            ) : selectedDay.task.validationType === 'strava' ? (
              <p style={{ fontSize: '0.88rem' }}>
                Este dia é validado automaticamente. Faça a atividade no Strava e clique em "Sincronizar Strava".
              </p>
            ) : selectedDay.task.validationType === 'video_link' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <input className="input" placeholder="Cole o link do YouTube"
                  value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                <button className="btn btn-primary btn-block" disabled={submitting || !videoUrl}
                  onClick={() => handleSubmit(selectedDay.task.day)}>
                  {submitting ? <span className="spinner" /> : 'Enviar prova'}
                </button>
              </div>
            ) : (
              <button className="btn btn-primary btn-block" disabled={submitting} onClick={() => handleCheckin(selectedDay.task.day)}>
                {submitting ? <span className="spinner" /> : 'Marcar como concluído'}
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        .spin-icon { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}

function LegendDot({ color, bg, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: bg, border: `1.5px solid ${color}` }} />
      {label}
    </span>
  );
}
