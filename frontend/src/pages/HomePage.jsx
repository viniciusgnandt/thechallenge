import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Smartphone, Video, Award, TrendingUp, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import PageLoader from '../components/PageLoader';

const HOW_IT_WORKS = [
  { icon: TrendingUp, title: 'Escolha seu nível', desc: 'Básico, Intermediário ou Avançado — os 100 dias se adaptam à sua evolução.' },
  { icon: Smartphone, title: 'Conecte o Strava', desc: 'Caminhada, corrida e bike são validadas automaticamente a cada atividade.' },
  { icon: Video, title: 'Grave seus treinos', desc: 'Para os demais exercícios, é só subir um vídeo curto no YouTube e colar o link.' },
  { icon: Award, title: 'Conquiste sua medalha', desc: 'Complete o desafio e receba medalha + certificado digital de conclusão.' },
];

export default function HomePage() {
  const [challenges, setChallenges] = useState(null);

  useEffect(() => {
    api.get('/challenges').then(({ data }) => setChallenges(data.challenges)).catch(() => setChallenges([]));
  }, []);

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: 32 }}>
        {/* HERO */}
        <div className="hero">
          <div className="hero-content">
            <span className="badge badge-glass" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', marginBottom: 18 }}>
              <Flame size={13} /> Desafio de 100 dias
            </span>
            <h1>Saia do sedentarismo.<br />Desafie-se todos os dias.</h1>
            <p>
              Escolha seu nível, cumpra desafios diários de caminhada, corrida, bike e treinos de força.
              Valide tudo pelo Strava ou por vídeo, acompanhe seu ranking e conquiste medalha e certificado.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/registro" className="btn btn-primary btn-lg">
                Começar meu desafio <ArrowRight size={18} />
              </Link>
              <a href="#como-funciona" className="btn btn-glass btn-lg">Como funciona</a>
            </div>

            <div className="hero-stats">
              <div>
                <div className="hero-stat-num">100</div>
                <div className="hero-stat-label">dias de desafio</div>
              </div>
              <div>
                <div className="hero-stat-num">3</div>
                <div className="hero-stat-label">níveis de intensidade</div>
              </div>
              <div>
                <div className="hero-stat-num">🏅</div>
                <div className="hero-stat-label">medalha + certificado</div>
              </div>
            </div>
          </div>
        </div>

        {/* COMO FUNCIONA */}
        <div id="como-funciona" style={{ marginBottom: 60, scrollMarginTop: 90 }}>
          <h2 className="section-title" style={{ textAlign: 'center' }}>Como funciona</h2>
          <p className="section-subtitle" style={{ textAlign: 'center' }}>Simples de começar, difícil de parar.</p>
          <div className="grid grid-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="card card-pad" style={{ textAlign: 'center' }}>
                <div className="empty-state-icon" style={{ margin: '0 auto 14px' }}>
                  <step.icon size={26} />
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: 6 }}>{step.title}</h3>
                <p style={{ fontSize: '0.86rem' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* DESAFIOS DISPONÍVEIS */}
        <div style={{ marginBottom: 30 }}>
          <h2 className="section-title">Desafios disponíveis</h2>
          <p className="section-subtitle">Escolha o seu e comece hoje mesmo.</p>
        </div>

        {challenges === null && <PageLoader />}

        {challenges && challenges.length === 0 && (
          <div className="empty-state card">
            <div className="empty-state-icon"><Flame size={26} /></div>
            <p>Nenhum desafio publicado ainda. Volte em breve!</p>
          </div>
        )}

        <div className="grid grid-2" style={{ marginBottom: 60 }}>
          {challenges?.map((c) => (
            <Link to={`/desafios/${c.slug}`} key={c._id} className="card card-hover" style={{ display: 'block' }}>
              <div style={{ height: 8, background: 'var(--gradient)' }} />
              <div className="card-pad">
                <h3 style={{ marginBottom: 8, fontSize: '1.2rem' }}>{c.title}</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: 16 }}>{c.description}</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  <span className="badge badge-basico">Básico</span>
                  <span className="badge badge-intermediario">Intermediário</span>
                  <span className="badge badge-avancado">Avançado</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)' }}>
                    Ver desafio <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* BENEFÍCIOS */}
        <div className="card" style={{ background: 'var(--gradient-soft)', marginBottom: 40, boxShadow: 'none' }}>
          <div className="card-pad" style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {[
              'Treinos adaptados ao seu nível',
              'Validação automática via Strava',
              'Ranking geral e por nível',
              'Medalha + certificado ao concluir',
            ].map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 220 }}>
                <CheckCircle2 size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
