import React, { useMemo } from 'react';
import './Header.css';
import { getAuthUser } from '../../utils/authUtils';

function Header({ user, onLogout }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const menuRef = React.useRef(null);

  const profile = useMemo(() => {
    const authUser = getAuthUser();

    if (authUser) {
      return {
        name: authUser.name || authUser.username || 'Learner',
        email: authUser.username || 'user@example.com',
        username: authUser.username,
        mobileNumber: authUser.mobileNumber,
        id: authUser.id,
      };
    }

    return user || null;
  }, [user]);

  const handleMenu = (event) => {
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    if (onLogout) onLogout();
  };

  React.useEffect(() => {
    function onDocumentClick(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleClose();
      }
    }

    if (open) {
      document.addEventListener('mousedown', onDocumentClick);
    }

    return () => {
      document.removeEventListener('mousedown', onDocumentClick);
    };
  }, [open]);

  const initials = profile?.name ? profile.name.charAt(0).toUpperCase() : '?';

  return (
    <header className="header-root">
      <div className="header-title">
        <h1 className="header-title-text">Learning Project</h1>
      </div>
      <div className="header-user" ref={menuRef}>
        <button type="button" onClick={handleMenu} className="header-avatar-btn">
          <span className="header-avatar" aria-hidden="true">{initials}</span>
          <span className="header-username">{profile.name}</span>
          <span className={`header-caret ${open ? 'open' : ''}`}>▼</span>
        </button>
        {open && (
          <div className="header-menu" role="menu" aria-label="User menu">
            <div className="header-menu-email">{profile.email}</div>
            <button type="button" onClick={handleLogout} className="header-menu-item">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;