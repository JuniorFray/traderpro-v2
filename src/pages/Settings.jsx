// src/pages/Settings.jsx
import React from 'react';
import ApiKeyManager from '../components/ApiKeyManager';
import './Settings.css';

export default function Settings() {
  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>⚙️ Configurações</h1>
        <p className="settings-description">
          Gerencie suas preferências e integrações do TraderPro
        </p>
      </div>

      <div className="settings-content">
        <section className="settings-section">
          <h2>🔗 Integrações</h2>
          <ApiKeyManager />
        </section>
      </div>
    </div>
  );
}
