import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Award, Download, Flame } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PageLoader from '../components/PageLoader';

const LEVEL_LABEL = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' };

export default function CertificatePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [enrollment, setEnrollment] = useState(null);

  useEffect(() => {
    api.get(`/enrollments/${id}/progress`).then(({ data }) => setEnrollment(data.enrollment)).catch(() => {});
  }, [id]);

  if (!enrollment) return <PageLoader />;
  if (enrollment.status !== 'completed') return <Navigate to={`/inscricoes/${id}`} replace />;

  const completedDate = new Date(enrollment.completedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="page container page-enter" style={{ maxWidth: 760 }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <div className="empty-state-icon" style={{ margin: '0 auto 14px', width: 60, height: 60 }}>
          <Award size={28} color="var(--gold)" />
        </div>
        <h1 style={{ fontSize: '1.6rem' }}>Parabéns pela conquista!</h1>
        <p>Você concluiu o desafio de {enrollment.challenge.durationDays} dias. Aqui está seu certificado.</p>
      </div>

      <div className="certificate">
        <div className="certificate-border">
          <span className="logo-icon" style={{ margin: '0 auto 18px' }}><Flame size={20} /></span>
          <p style={{ letterSpacing: 3, textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: 6 }}>
            Certificado de Conclusão
          </p>
          <h2 style={{ fontSize: '1.8rem', margin: '10px 0' }}>{user?.name}</h2>
          <p style={{ maxWidth: 460, margin: '0 auto 18px', fontSize: '0.95rem' }}>
            concluiu com sucesso o <strong>{enrollment.challenge.title}</strong>, nível{' '}
            <strong>{LEVEL_LABEL[enrollment.level]}</strong>, completando {enrollment.challenge.durationDays} dias
            consecutivos de desafios de atividade física.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Concluído em {completedDate}</p>
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px dashed var(--border-strong)', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-light)' }}>
            <span>TheChallenge</span>
            <span>ID: {enrollment._id.slice(-8).toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <Download size={16} /> Baixar / Imprimir
        </button>
      </div>

      <style>{`
        .certificate { background: white; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); padding: 8px; }
        .certificate-border {
          border: 2px solid var(--primary);
          outline: 1px solid var(--border);
          outline-offset: -8px;
          border-radius: var(--radius);
          padding: 56px 40px;
          text-align: center;
          background: var(--gradient-soft);
        }
        @media print {
          .navbar, footer, .empty-state-icon + h1, button { display: none !important; }
        }
      `}</style>
    </div>
  );
}
