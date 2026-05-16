import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { BookOpenCheck, Code2, LayoutDashboard, MessageSquareQuote, UserCog } from 'lucide-react';
import { fetchSidebarMenuData, selectSidebarMenuData } from '../../store/pythonLearnSlice';
import './Sidebar.css';

const iconMap = {
  LayoutDashboard,
  UserCog,
  BookOpenCheck,
  Code2,
  MessageSquareQuote,
};


function Sidebar() {
  const dispatch = useDispatch();
  const sidebarConfig = useSelector(selectSidebarMenuData);

  useEffect(() => {
    dispatch(fetchSidebarMenuData());
  }, []);

  const menuItems = sidebarConfig?.menuItems || [];

  return (
    <aside className="sidebar-root">
      <div className="sidebar-brand">{sidebarConfig?.brand}</div>
      <nav className="sidebar-nav" aria-label="Main navigation">
        {menuItems?.map((item) => {
          const Icon = iconMap[item.iconKey] || LayoutDashboard;
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
      <div className="sidebar-footer">{sidebarConfig?.footer}</div>
    </aside>
  );
}

export default Sidebar;