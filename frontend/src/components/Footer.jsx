import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Instagram, Youtube } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', marginTop: 60, padding: '40px 0', background: 'white' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <Link to="/" className="logo">
          <span className="logo-icon"><Flame size={17} strokeWidth={2.5} /></span>
          TheChallenge
        </Link>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
          © {new Date().getFullYear()} TheChallenge — sedentarismo é passado.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <a href="#" className="btn btn-ghost btn-icon"><Instagram size={18} /></a>
          <a href="#" className="btn btn-ghost btn-icon"><Youtube size={18} /></a>
        </div>
      </div>
    </footer>
  );
}
