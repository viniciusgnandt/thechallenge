import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Flame, User, LogOut, ShieldCheck, Menu, X, LayoutGrid } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo" onClick={() => setOpen(false)}>
          <span className="logo-icon"><Flame size={19} strokeWidth={2.5} /></span>
          TheChallenge
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="nav-desktop">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ color: isActive('/dashboard') ? 'var(--primary)' : undefined }}>
                <LayoutGrid size={16} /> Meus Desafios
              </Link>
              {user.subscription?.status !== 'active' && user.role !== 'admin' && (
                <Link to="/assinar" className="btn btn-primary btn-sm">Assinar</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-ghost btn-sm"><ShieldCheck size={16} /> Admin</Link>
              )}
              <Link to="/perfil" className="btn btn-outline btn-sm">
                <span className="avatar-circle" style={{ width: 26, height: 26, fontSize: 12 }}>
                  {user.name?.[0]?.toUpperCase()}
                </span>
                {user.name.split(' ')[0]}
              </Link>
              <button className="btn btn-ghost btn-icon" onClick={async () => { await logout(); navigate('/'); }} title="Sair">
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Entrar</Link>
              <Link to="/registro" className="btn btn-primary btn-sm">Criar conta</Link>
            </>
          )}
        </div>

        <button className="nav-mobile-toggle" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="nav-mobile-menu container">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-outline btn-block" onClick={() => setOpen(false)}>Meus Desafios</Link>
              {user.role === 'admin' && <Link to="/admin" className="btn btn-outline btn-block" onClick={() => setOpen(false)}>Admin</Link>}
              <Link to="/perfil" className="btn btn-outline btn-block" onClick={() => setOpen(false)}>Perfil</Link>
              <button className="btn btn-primary btn-block" onClick={async () => { await logout(); setOpen(false); navigate('/'); }}>Sair</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-block" onClick={() => setOpen(false)}>Entrar</Link>
              <Link to="/registro" className="btn btn-primary btn-block" onClick={() => setOpen(false)}>Criar conta</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        .nav-mobile-toggle { display: none; background: none; border: none; color: var(--text); }
        .nav-mobile-menu { display: flex; flex-direction: column; gap: 8px; padding-bottom: 16px; }
        @media (max-width: 720px) {
          .nav-desktop { display: none; }
          .nav-mobile-toggle { display: flex; }
        }
      `}</style>
    </div>
  );
}
