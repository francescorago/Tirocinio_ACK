import React from 'react';
import { Link } from 'react-router-dom';
import '../../css/NotFound.css'
function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404 - Pagina non trovata</h1>
        <p className="not-found-text">La pagina che stai cercando non esiste o è stata rimossa.</p>
        <Link to="/" className="not-found-link">Torna alla Home</Link>
      </div>
    </div>
  );
}

export default NotFound;
