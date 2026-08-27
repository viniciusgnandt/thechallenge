import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Flame, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Bem-vindo de volta!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao entrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell page-enter">
      <div className="auth-panel">
        <div className="auth-panel-content">
          <span className="logo-icon" style={{ marginBottom: 24 }}><Flame size={22} /></span>
          <h1 style={{ fontSize: '2rem', marginBottom: 14 }}>100 dias podem mudar sua rotina.</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.02rem' }}>
            Entre para continuar seu desafio, sincronizar suas atividades e acompanhar seu progresso.
          </p>
        </div>
      </div>

      <div className="auth-form-side">
        <div style={{ maxWidth: 380, width: '100%' }}>
          <h2 style={{ marginBottom: 6 }}>Entrar</h2>
          <p style={{ marginBottom: 28, fontSize: '0.9rem' }}>Acesse sua conta para continuar</p>

          <form onSubmit={handleSubmit}>
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
                <input className="input" style={{ paddingLeft: 40 }} type="password" placeholder="••••••••" required
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>
            <button className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <span className="spinner" /> : <>Entrar <ArrowRight size={17} /></>}
            </button>
          </form>

          <p style={{ marginTop: 22, fontSize: '0.9rem', textAlign: 'center' }}>
            Não tem conta? <Link to="/registro" style={{ color: 'var(--primary)', fontWeight: 700 }}>Criar conta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
