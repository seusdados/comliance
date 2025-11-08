import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="font-semibold">Canal de Denúncias</div>
      {user && (
        <div className="space-x-4 flex items-center">
          <Link to="/" className="hover:underline">Painel</Link>
          <Link to="/novo" className="hover:underline">Nova denúncia</Link>
          {user.role === 'admin' && (
            <Link to="/admin" className="hover:underline">Administração</Link>
          )}
          <button onClick={onLogout} className="bg-white text-blue-600 px-2 py-1 rounded hover:bg-gray-100">
            Sair
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;