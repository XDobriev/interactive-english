import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, RefreshCw, ChevronDown, Shield } from 'lucide-react';
import { useAuth } from '../../context/authCore';
import { sound } from '../../utils/audio';

interface UserAccountMenuProps {
  onOpenLoginModal: () => void;
}

export const UserAccountMenu: React.FC<UserAccountMenuProps> = ({ onOpenLoginModal }) => {
  const { user, role, switchRole, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        onClick={() => {
          sound.playClick();
          onOpenLoginModal();
        }}
        className="btn btn-secondary"
        style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 600 }}
      >
        <User size={15} />
        <span>Войти</span>
      </button>
    );
  }

  const isTeacher = role === 'teacher';

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        onClick={() => {
          sound.playClick();
          setIsOpen(!isOpen);
        }}
        style={{
          border: '1px solid var(--border-subtle)',
          background: 'var(--surface-white)',
          padding: '4px 10px 4px 6px',
          borderRadius: '30px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-subtle)',
          transition: 'all 0.15s ease',
        }}
      >
        <div
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: isTeacher ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : '#10b981',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '13px',
          }}
        >
          {user.name[0]}
        </div>
        <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
          <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-main)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user.name.split(' ')[0]}
          </div>
          <div style={{ fontSize: '10.5px', color: isTeacher ? 'var(--primary)' : 'var(--success-text)', fontWeight: 600 }}>
            {isTeacher ? 'Учитель' : 'Ученик'}
          </div>
        </div>
        <ChevronDown size={14} color="var(--text-light)" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '240px',
            background: 'var(--surface-white)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-float)',
            padding: '8px',
            zIndex: 150,
          }}
        >
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
            <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-main)' }}>{user.name}</div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user.email}
            </div>
          </div>

          {/* Quick Role Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              switchRole(isTeacher ? 'student' : 'teacher');
              setIsOpen(false);
            }}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: 'var(--text-main)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <RefreshCw size={14} color="var(--primary)" />
            <span>Переключить на {isTeacher ? 'Ученика' : 'Преподавателя'}</span>
          </button>

          {/* Switch Account */}
          <button
            onClick={() => {
              sound.playClick();
              setIsOpen(false);
              onOpenLoginModal();
            }}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: 'var(--text-main)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Shield size={14} color="var(--text-muted)" />
            <span>Сменить профиль / Войти</span>
          </button>

          {/* Logout */}
          <button
            onClick={() => {
              sound.playClick();
              logout();
              setIsOpen(false);
            }}
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: '8px',
              border: 'none',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '12.5px',
              fontWeight: 600,
              color: 'var(--error)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--error-subtle)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={14} color="var(--error)" />
            <span>Выйти</span>
          </button>
        </div>
      )}
    </div>
  );
};
