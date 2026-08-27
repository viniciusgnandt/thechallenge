import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Watch, Award, Pencil, Check, CreditCard, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import PageLoader from '../components/PageLoader';

export default function ProfilePage() {
  const { user, reloadUser } = useAuth();
  const [params] = useSearchParams();
  const [connecting, setConnecting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.city || '');
  const [saving, setSaving] = useState(false);
  const [enrollments, setEnrollments] = useState(null);

  useEffect(() => {
    api.get('/enrollments/me').then(({ data }) => setEnrollments(data.enrollments)).catch(() => setEnrollments([]));
  }, []);

  useEffect(() => {
    if (params.get('strava') === 'connected') {
      toast.success('Strava conectado!');
      reloadUser();
    } else if (params.get('strava') === 'error') {
      toast.error('Erro ao conectar Strava');
    }
  }, [params]);

  const connectStrava = async () => {
    setConnecting(true);
    try {
      const { data } = await api.get('/strava/connect-url');
      window.location.href = data.url;
    } catch {
      toast.error('Configure as credenciais do Strava no backend (.env)');
      setConnecting(false);
    }
  };

  const disconnectStrava = async () => {
    await api.post('/strava/disconnect');
    toast.success('Strava desconectado');
    reloadUser();
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/auth/me', { name, city });
      toast.success('Perfil atualizado');
      setEditing(false);
      reloadUser();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <PageLoader />;
  const medals = enrollments?.filter((e) => e.medalIssued) || [];

  return (
    <div className="page container page-enter" style={{ maxWidth: 720 }}>
      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: editing ? 20 : 0 }}>
          <div className="avatar-circle" style={{ width: 64, height: 64, fontSize: 24 }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            {!editing ? (
              <>
                <h2 style={{ fontSize: '1.3rem' }}>{user.name}</h2>
                <p style={{ fontSize: '0.88rem' }}>{user.email}{user.city ? ` · ${user.city}` : ''}</p>
              </>
            ) : (
              <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Editando perfil</span>
            )}
          </div>
          <button className="btn btn-outline btn-icon" onClick={() => editing ? saveProfile() : setEditing(true)} disabled={saving}>
            {editing ? (saving ? <span className="spinner spinner-dark" /> : <Check size={16} />) : <Pencil size={16} />}
          </button>
        </div>

        {editing && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Nome</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Cidade</label>
              <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Sua cidade" />
            </div>
          </div>
        )}
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div className="empty-state-icon" style={{ width: 38, height: 38, margin: 0 }}><CreditCard size={17} /></div>
          <h3 style={{ fontSize: '1rem' }}>Assinatura</h3>
        </div>
        {user.subscription?.status === 'active' ? (
          <p style={{ color: 'var(--green)', margin: '10px 0 0', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={16} /> Ativa {user.subscription.plan ? `(${user.subscription.plan === 'avista' ? 'à vista' : 'parcelado'})` : ''}
          </p>
        ) : (
          <>
            <p style={{ margin: '10px 0 14px', fontSize: '0.88rem' }}>
              Assine para se inscrever em qualquer desafio da plataforma.
            </p>
            <Link to="/assinar" className="btn btn-primary">Assinar agora</Link>
          </>
        )}
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <div className="empty-state-icon" style={{ width: 38, height: 38, margin: 0 }}><Watch size={17} /></div>
          <h3 style={{ fontSize: '1rem' }}>Strava</h3>
        </div>
        {user.strava?.athleteId ? (
          <>
            <p style={{ color: 'var(--green)', margin: '10px 0 14px', fontWeight: 600, fontSize: '0.9rem' }}>Conta conectada ✓</p>
            <button className="btn btn-outline" onClick={disconnectStrava}>Desconectar</button>
          </>
        ) : (
          <>
            <p style={{ margin: '10px 0 14px', fontSize: '0.88rem' }}>
              Conecte para validar automaticamente caminhada, corrida e bike.
            </p>
            <button className="btn btn-primary" onClick={connectStrava} disabled={connecting}>
              {connecting ? <span className="spinner" /> : 'Conectar com Strava'}
            </button>
          </>
        )}
      </div>

      <div className="card card-pad">
        <h3 style={{ fontSize: '1rem', marginBottom: 14 }}>Minhas medalhas</h3>
        {enrollments === null && <p style={{ fontSize: '0.85rem' }}>Carregando...</p>}
        {enrollments && medals.length === 0 && (
          <p style={{ fontSize: '0.88rem' }}>Conclua um desafio para ganhar sua primeira medalha 🏅</p>
        )}
        <div className="grid grid-3">
          {medals.map((e) => (
            <Link to={`/inscricoes/${e._id}/certificado`} key={e._id} className="card card-hover card-pad" style={{ textAlign: 'center' }}>
              <Award size={30} color="var(--gold)" style={{ margin: '0 auto 8px' }} />
              <strong style={{ fontSize: '0.85rem', display: 'block' }}>{e.challenge?.title}</strong>
              <span className={`badge badge-${e.level}`} style={{ marginTop: 6 }}>{e.level}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
