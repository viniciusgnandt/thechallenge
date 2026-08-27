import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Flame, Trophy, Video, Watch, CheckCircle2, ArrowRight, Lock } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PageLoader from '../components/PageLoader';

const LEVEL_LABEL = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' };
const LEVEL_DESC = {
  basico: 'Ideal para começar do zero, com metas leves e progressivas.',
  intermediario: 'Para quem já se movimenta e quer subir o nível.',
  avancado: 'Alta intensidade para quem já treina com regularidade.',
};
const TASK_ICON = { strava: Watch, video_link: Video, checkin: CheckCircle2 };

export default function ChallengeDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [level, setLevel] = useState('basico');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    api.get(`/challenges/${slug}`).then(({ data }) => setChallenge(data.challenge)).catch(() => {});
  }, [slug]);

  const isSubscribed = user?.subscription?.status === 'active' || user?.role === 'admin';

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    if (!isSubscribed) return navigate('/assinar');
    setEnrolling(true);
    try {
      const { data } = await api.post('/enrollments', { challengeId: challenge._id, level });
      toast.success('Inscrição realizada! Vamos nessa.');
      navigate(`/inscricoes/${data.enrollment._id}`);
    } catch (err) {
      if (err.response?.data?.code === 'SUBSCRIPTION_REQUIRED') return navigate('/assinar');
      toast.error(err.response?.data?.error || 'Erro ao se inscrever');
    } finally {
      setEnrolling(false);
    }
  };

  if (!challenge) return <PageLoader />;

  const levelData = challenge.levels?.find((l) => l.name === level);
  const previewTasks = levelData?.tasks?.slice(0, 5) || [];

  return (
    <div className="page container page-enter">
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
        <span className="badge badge-gradient"><Flame size={12} /> {challenge.durationDays} dias</span>
      </div>
      <h1 style={{ fontSize: '2rem', marginBottom: 10 }}>{challenge.title}</h1>
      <p style={{ maxWidth: 620, marginBottom: 36, fontSize: '1.02rem' }}>{challenge.description}</p>

      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr', alignItems: 'start' }}>
        <div>
          <div className="card card-pad" style={{ marginBottom: 20 }}>
            <h3 style={{ marginBottom: 16, fontSize: '1.05rem' }}>Escolha seu nível</h3>
            <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
              {['basico', 'intermediario', 'avancado'].map((l) => (
                <div key={l} className={`level-pill ${level === l ? 'active' : ''}`} onClick={() => setLevel(l)}>
                  <div className="level-pill-label">{LEVEL_LABEL[l]}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.85rem', marginTop: 12 }}>{LEVEL_DESC[level]}</p>
          </div>

          <div className="card card-pad">
            <h3 style={{ marginBottom: 16, fontSize: '1.05rem' }}>Primeiros dias — nível {LEVEL_LABEL[level]}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {previewTasks.map((task) => {
                const Icon = TASK_ICON[task.validationType] || CheckCircle2;
                return (
                  <div key={task.day} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div className="empty-state-icon" style={{ width: 40, height: 40, margin: 0, flexShrink: 0 }}>
                      <Icon size={17} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{task.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{task.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: '0.8rem', marginTop: 14, textAlign: 'center' }}>
              ... e mais {(levelData?.tasks?.length || challenge.durationDays) - previewTasks.length} dias pela frente.
            </p>
          </div>
        </div>

        <div className="card card-pad" style={{ position: 'sticky', top: 90 }}>
          {isSubscribed ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--green)', fontWeight: 700, fontSize: '0.88rem' }}>
                <CheckCircle2 size={16} /> Sua assinatura está ativa
              </div>
              <button className="btn btn-primary btn-block btn-lg" onClick={handleEnroll} disabled={enrolling}>
                {enrolling ? <span className="spinner" /> : <>Quero me desafiar <ArrowRight size={17} /></>}
              </button>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.88rem' }}>
                <Lock size={16} /> Disponível para assinantes
              </div>
              <button className="btn btn-primary btn-block btn-lg" onClick={() => navigate('/assinar')}>
                Assinar o TheChallenge <ArrowRight size={17} />
              </button>
            </>
          )}
          <p style={{ marginTop: 12, fontSize: '0.78rem', textAlign: 'center' }}>
            Uma assinatura única dá acesso a todos os desafios da plataforma. Medalha + certificado ao concluir.
          </p>

          <div style={{ borderTop: '1px solid var(--border)', marginTop: 20, paddingTop: 16 }}>
            <Link to={`/desafios/${slug}/ranking`} className="btn btn-outline btn-block">
              <Trophy size={16} /> Ver ranking
            </Link>
          </div>

          {challenge.sponsors?.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
              <p style={{ fontSize: '0.78rem', marginBottom: 10, fontWeight: 700, color: 'var(--text-light)' }}>PATROCÍNIO</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {challenge.sponsors.map((s, i) => <span key={i} className="badge badge-category">{s.name}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .page .grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
