import { NavLink } from 'react-router-dom';
import { BookOpenCheck, Code2, LayoutDashboard, MessageSquareQuote, UserCog } from 'lucide-react';
import './Sidebar.css';

const menuItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'User Management',
    path: '/user-management',
    icon: UserCog,
  },
  {
    label: 'Checklist',
    path: '/checklist',
    icon: BookOpenCheck,
  },
  {
    label: 'Practice Code',
    path: '/practiceCode',
    icon: Code2,
  },
  {
    label: 'Interview Q&A',
    path: '/interview-qa',
    icon: MessageSquareQuote,
  },
];

function Sidebar() {
  return (
    <aside className="sidebar-root">
      <div className="sidebar-brand">Learning Hub</div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <span className="sidebar-link-text">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="sidebar-footer">Track your progress daily</div>
    </aside>
  );
}

export default Sidebar;