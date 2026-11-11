import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Smartphone, Video, Award, TrendingUp, ArrowRight, CalendarCheck, Trophy, BarChart3, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import PageLoader from '../components/PageLoader';

const FEATURES = [
  { icon: CalendarCheck, label: 'Desafios diários' },
  { icon: TrendingUp, label: 'Acompanhe sua evolução' },
  { icon: Trophy, label: 'Ganhe medalhas' },
  { icon: BarChart3, label: 'Ranking' },
];

const HOW_IT_WORKS = [
  { icon: TrendingUp, title: 'Escolha seu nível', desc: 'Básico, Intermediário ou Avançado — os 100 dias se adaptam à sua evolução.' },
  { icon: Smartphone, title: 'Conecte o Strava', desc: 'Caminhada, corrida e bike são validadas automaticamente a cada atividade.' },
  { icon: Video, title: 'Grave seus treinos', desc: 'Para os demais exercícios, é só subir um vídeo curto no YouTube e colar o link.' },
  { icon: Award, title: 'Conquiste sua medalha', desc: 'Complete o desafio e receba medalha + certificado digital de conclusão.' },
];

const LEVELS = [
  { label: 'Básico', color: '#4ADE80' },
  { label: 'Intermediário', color: '#FBBF24' },
  { label: 'Avançado', color: '#F87171' },
];

export default function HomePage() {
  const [challenges, setChallenges] = useState(null);

  useEffect(() => {
    api.get('/challenges').then(({ data }) => setChallenges(data.challenges)).catch(() => setChallenges([]));
  }, []);

  return (
    <div className="page-enter">
      <div className="container" style={{ paddingTop: 28 }}>
        {/* POSTER HERO */}
        <div className="poster">
          <div className="poster-content">
            <div className="poster-kicker">THE CHALLENGE · 100 DIAS</div>
            <div className="poster-title">DESAFIO</div>
            <div className="poster-underline" />
            <div className="poster-tagline">
              Faça exercícios físicos, <span className="text-accent">supere</span> seus limites!
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <Link to="/registro" className="btn btn-fire btn-lg">
                Aceite o desafio! <ArrowRight size={20} />
              </Link>
              <a href="#como-funciona" className="btn btn-glass btn-lg" style={{ borderRadius: 8 }}>Como funciona</a>
            </div>

            <div className="feature-row">
              {FEATURES.map((f) => (
                <div key={f.label} className="feature-item">
                  <f.icon size={28} color="#FFB800" />
                  <span>{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COMO FUNCIONA */}
        <div id="como-funciona" style={{ marginBottom: 64, scrollMarginTop: 90 }}>
          <h2 className="section-title" style={{ textAlign: 'center', fontSize: '2.4rem' }}>
            Como <span className="text-accent">funciona</span>
          </h2>
          <p className="section-subtitle" style={{ textAlign: 'center' }}>Simples de começar, difícil de parar.</p>
          <div className="grid grid-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="card card-pad" style={{ border: '1px solid var(--border)', position: 'relative' }}>
                <div className="display" style={{ position: 'absolute', top: 12, right: 16, fontSize: '2.6rem', color: 'rgba(255,107,0,0.18)' }}>0{i + 1}</div>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <step.icon size={24} color="#fff" />
                </div>
                <h3 className="display" style={{ fontSize: '1.4rem', marginBottom: 6 }}>{step.title}</h3>
                <p style={{ fontSize: '0.88rem' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* DESAFIOS */}
        <div style={{ marginBottom: 24 }}>
          <h2 className="section-title" style={{ fontSize: '2.4rem' }}>
            Escolha seu <span className="text-accent">desafio</span>
          </h2>
          <p className="section-subtitle">Escolha o seu e comece hoje mesmo.</p>
        </div>

        {challenges === null && <PageLoader />}

        {challenges && challenges.length === 0 && (
          <div className="empty-state card">
            <div className="empty-state-icon"><Flame size={26} /></div>
            <p>Nenhum desafio publicado ainda. Volte em breve!</p>
          </div>
        )}

        <div className="grid grid-2" style={{ marginBottom: 64 }}>
          {challenges?.map((c) => (
            <Link to={`/desafios/${c.slug}`} key={c._id} className="challenge-card">
              <div className="challenge-stripe" />
              <div className="card-pad" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Flame size={22} color="#fff" />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="display text-accent" style={{ fontSize: '2.2rem' }}>{c.durationDays}</div>
                    <div className="display" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>dias</div>
                  </div>
                </div>
                <h3 className="display" style={{ fontSize: '1.8rem', marginBottom: 8 }}>{c.title}</h3>
                <p style={{ fontSize: '0.9rem', marginBottom: 16 }}>{c.description}</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                  {LEVELS.map((l) => (
                    <span key={l.label} className="level-tag" style={{ color: l.color, borderColor: l.color }}>{l.label.toUpperCase()}</span>
                  ))}
                </div>
                <span className="btn btn-fire btn-block">Aceite o desafio <ArrowRight size={18} /></span>
              </div>
            </Link>
          ))}
        </div>

        {/* BENEFÍCIOS */}
        <div className="card" style={{ background: 'var(--gradient-dark)', marginBottom: 40, border: '1px solid var(--border)' }}>
          <div className="card-pad" style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {[
              'Treinos adaptados ao seu nível',
              'Validação automática via Strava',
              'Ranking geral e por nível',
              'Medalha + certificado ao concluir',
            ].map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 220 }}>
                <CheckCircle2 size={20} color="#FFB800" style={{ flexShrink: 0 }} />
                <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
