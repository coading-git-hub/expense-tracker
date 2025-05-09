import React from 'react';
import { useAuth } from '../Context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <img src="https://cdn-icons-png.flaticon.com/512/17208/17208990.png" width={50 } alt="logo" />
            <h1 className='text-3xl font-bold ml-1'>My Expenses</h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {user.profilephoto ? (
                  <img
                    src={user.profilephoto}
                    className="h-8 w-8 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name);
                    }}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </span>
                  </div>
                )}
                <span className="text-gray-700">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 