import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Flame, CheckCircle2, Copy } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import PageLoader from '../components/PageLoader';

export default function SubscribePage() {
  const { user, reloadUser } = useAuth();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    api.get('/subscription/plan').then(({ data }) => setPlan(data.plan)).catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.subscription?.status === 'active') {
      toast.success('Assinatura ativa! Aproveite os desafios.');
      navigate('/');
    }
  }, [user]);

  if (!plan) return <PageLoader />;

  const copyPixKey = () => {
    navigator.clipboard.writeText('pix@thechallenge.app');
    toast.success('Chave Pix copiada');
  };

  return (
    <div className="page container page-enter" style={{ maxWidth: 640 }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div className="empty-state-icon" style={{ margin: '0 auto 14px', width: 60, height: 60 }}>
          <Flame size={26} />
        </div>
        <h1 style={{ fontSize: '1.7rem' }}>Assine o TheChallenge</h1>
        <p>Uma assinatura única dá acesso a <strong>todos</strong> os desafios da plataforma, em qualquer nível.</p>
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>À vista</div>
            <div style={{ fontSize: '2rem', fontWeight: 900 }}>R$ {plan.priceOneTime}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Parcelado</div>
            <div style={{ fontSize: '2rem', fontWeight: 900 }}>{plan.installments.count}x R$ {plan.installments.value}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {['Acesso a todos os desafios (100 dias, 30 dias, força, pedal...)', 'Todos os níveis: básico, intermediário e avançado', 'Validação automática via Strava', 'Medalha + certificado a cada desafio concluído'].map((t) => (
            <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <CheckCircle2 size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.92rem' }}>{t}</span>
            </div>
          ))}
        </div>

        <div className="card" style={{ background: 'var(--gradient-soft)', boxShadow: 'none', padding: 18 }}>
          <p style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>Como assinar</p>
          <p style={{ fontSize: '0.88rem', marginBottom: 12 }}>
            Faça o Pix (à vista ou combine o parcelamento) para a chave abaixo e envie o comprovante para nossa equipe.
            Sua assinatura é ativada manualmente em até algumas horas.
          </p>
          <button className="btn btn-outline btn-sm" onClick={copyPixKey}>
            <Copy size={14} /> pix@thechallenge.app
          </button>
        </div>
      </div>

      {user?.subscription?.status !== 'active' && (
        <p style={{ textAlign: 'center', fontSize: '0.85rem' }}>
          Já pagou? Assim que confirmarmos, sua conta libera automaticamente — sem precisar fazer nada aqui.
        </p>
      )}
    </div>
  );
}
