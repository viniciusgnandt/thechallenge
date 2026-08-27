import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Flame, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Conta criada! Vamos começar.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell page-enter">
      <div className="auth-panel">
        <div className="auth-panel-content">
          <span className="logo-icon" style={{ marginBottom: 24 }}><Flame size={22} /></span>
          <h1 style={{ fontSize: '2rem', marginBottom: 14 }}>Sua melhor versão começa hoje.</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.02rem', marginBottom: 24 }}>
            Crie sua conta gratuita, escolha seu nível e comece o desafio de 100 dias.
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, color: 'rgba(255,255,255,0.85)', fontSize: '0.92rem' }}>
            <li>✓ Validação automática via Strava</li>
            <li>✓ Envio de vídeos para treinos de força</li>
            <li>✓ Ranking, medalha e certificado</li>
          </ul>
        </div>
      </div>

      <div className="auth-form-side">
        <div style={{ maxWidth: 380, width: '100%' }}>
          <h2 style={{ marginBottom: 6 }}>Criar conta</h2>
          <p style={{ marginBottom: 28, fontSize: '0.9rem' }}>Leva menos de um minuto</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Nome</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--text-light)' }} />
                <input className="input" style={{ paddingLeft: 40 }} placeholder="Seu nome" required
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--text-light)' }} />
                <input className="input" style={{ paddingLeft: 40 }} type="email" placeholder="voce@email.com" required
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Senha</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: 15, color: 'var(--text-light)' }} />
                <input className="input" style={{ paddingLeft: 40 }} type="password" placeholder="Mín. 6 caracteres" required minLength={6}
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <span className="spinner" /> : <>Criar conta <ArrowRight size={17} /></>}
            </button>
          </form>

          <p style={{ marginTop: 22, fontSize: '0.9rem', textAlign: 'center' }}>
            Já tem conta? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
