import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import toast from 'react-hot-toast';
import React from 'react';

export function Header() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Déconnexion réussie');
    navigate('/');
  };

  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div 
          onClick={() => navigate('/')}
          className="cursor-pointer hover:opacity-80 transition"
        >
          <Logo />
        </div>

        <div className="hidden md:flex gap-8 items-center">
          <button 
            onClick={() => navigate('/products')}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            Produits
          </button>
          <button 
            onClick={() => navigate('/cart')}
            className="text-gray-600 hover:text-gray-900 transition"
          >
            Panier
          </button>
          {!isAuthenticated && (
            <>
              <button 
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Connexion
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
              >
                S'inscrire
              </button>
            </>
          )}
          {isAuthenticated && (
            <>
              <button 
                onClick={() => navigate('/my-orders')}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Commandes
              </button>
              {isAdmin && (
                <button 
                  onClick={() => navigate('/admin/dashboard')}
                  className="text-gray-600 hover:text-gray-900 transition"
                >
                  Admin
                </button>
              )}
              <div className="relative">
                <button 
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-gray-600 hover:text-gray-900 transition"
                >
                  {user?.full_name}
                </button>
                {isOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg">
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 transition"
                    >
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}