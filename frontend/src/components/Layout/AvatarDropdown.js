import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../../lib/api';
import { useRouter } from 'next/router';

export default function AvatarDropdown({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      router.push('/login');
    } catch (error) {
      console.error('Logout failed', error);
      router.push('/login');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary ring-2 ring-ring">
        <img alt={user.fullName} className="w-full h-full object-cover" src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.employeeId}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-soft z-50 p-4">
          <div className="border-b border-border pb-3 mb-3">
            <p className="font-bold text-card-foreground text-lg">{user.fullName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="text-sm text-muted-foreground space-y-2">
            <p><span className="font-semibold text-card-foreground">ID:</span> {user.employeeId}</p>
            <p><span className="font-semibold text-card-foreground">Role:</span> {user.roles.join(', ')}</p>
            <p><span className="font-semibold text-card-foreground">Department:</span> {user.department}</p>
          </div>
          <div className="mt-4">
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

AvatarDropdown.propTypes = {
  user: PropTypes.shape({
    fullName: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    employeeId: PropTypes.string.isRequired,
    roles: PropTypes.arrayOf(PropTypes.string).isRequired,
    department: PropTypes.string,
    avatarUrl: PropTypes.string,
  }).isRequired,
};
