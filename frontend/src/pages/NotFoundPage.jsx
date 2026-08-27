import React from 'react';
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="container page-enter" style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div className="empty-state-icon" style={{ margin: '0 auto 20px', width: 64, height: 64 }}>
        <Flame size={28} />
      </div>
      <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>404</h1>
      <p style={{ marginBottom: 24 }}>Essa página saiu para treinar e não voltou ainda.</p>
      <Link to="/" className="btn btn-primary">Voltar para o início</Link>
    </div>
  );
}
