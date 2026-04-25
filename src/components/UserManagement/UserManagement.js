import './UserManagement.css';
import usersData from '../JSONFiles/users.json';

const users = usersData.users;

function UserManagement() {
  return (
    <section className="users-root">
      <div className="users-header glass-panel-soft">
        <div>
          <h2>User Management</h2>
          <p>Manage members, roles, and learning access from one place.</p>
        </div>
        <button type="button" className="users-add-btn">+ Add User</button>
      </div>

      <div className="users-table-wrap glass-panel-soft">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((item) => (
              <tr key={item.email}>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.role}</td>
                <td>
                  <span className={`users-status ${item.status.toLowerCase()}`}>{item.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default UserManagement;