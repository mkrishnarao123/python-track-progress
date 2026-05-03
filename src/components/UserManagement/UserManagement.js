import { useCallback, useEffect, useState } from 'react';
import './UserManagement.css';
import SignupForm from './SignupForm';
import { fetchAllUsers, restartUser } from '../../services/auth_api';

function UserManagement() {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [restartingIds, setRestartingIds] = useState({});

  const loadUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setUsersError('');

    try {
      const response = await fetchAllUsers();
      setUsers(response?.data || []);
    } catch (error) {
      setUsersError(error.message || 'Unable to load users. Please try again.');
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const handleUserCreated = async () => {
    await loadUsers();
    setIsAddUserOpen(false);
  };

  const handleRestart = async (item) => {
    if (!item?.id) return;

    setRestartingIds((prev) => ({ ...prev, [item.id]: true }));
    setUsersError('');

    try {
      await restartUser(item.id);
      await loadUsers();
    } catch (error) {
      setUsersError(error?.message || 'Unable to restart user. Please try again.');
    } finally {
      setRestartingIds((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
    }
  };

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <section className="users-root">
      <div className="users-header glass-panel-soft">
        <div>
          <h2>User Management</h2>
          <p>Manage members, roles, and learning access from one place.</p>
        </div>
        <button type="button" className="users-add-btn" onClick={() => setIsAddUserOpen(true)}>
          + Add User
        </button>
      </div>

      <div className="users-table-wrap glass-panel-soft">
        <table className="users-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Username</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingUsers ? (
              <tr>
                <td colSpan={3} className="users-table-empty">
                  Loading users...
                </td>
              </tr>
            ) : usersError ? (
              <tr>
                <td colSpan={3} className="users-table-empty users-table-empty--error">
                  {usersError}
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={3} className="users-table-empty">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((item) => (
                <tr key={item.id || item.username}>
                  <td>{item.fullName || '-'}</td>
                  <td>{item.username || '-'}</td>
                  <td>
                    <button
                      type="button"
                      className={`restart-btn ${item.restart ? 'restart-btn--enabled' : 'restart-btn--disabled'}`}
                      disabled={!item.restart || Boolean(restartingIds[item.id])}
                      onClick={() => handleRestart(item)}
                    >
                      {restartingIds[item.id] ? 'Restarting...' : 'Restart'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isAddUserOpen && (
        <div className="users-modal-overlay" role="presentation" onClick={() => setIsAddUserOpen(false)}>
          <div
            className="users-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Add user popup"
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="users-modal-close" onClick={() => setIsAddUserOpen(false)} aria-label="Close popup">
              ×
            </button>
            <SignupForm
              submitLabel="Create User"
              showFooter={false}
              showCancelButton
              cancelLabel="Close"
              onCancel={() => setIsAddUserOpen(false)}
              onSuccess={handleUserCreated}
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default UserManagement;