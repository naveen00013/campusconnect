import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const menus = {
  student: [
    ['', 'Dashboard', '🏠'],
    ['timetable', 'Timetable', '🗓️'],
    ['attendance', 'Attendance', '📅'],
    ['assignments', 'Assignments', '📝'],
    ['materials', 'Study Material', '📚'],
    ['marks', 'Results', '🏆'],
    ['leave', 'Leave', '🏖️'],
    ['events', 'Events', '🎉'],
    ['notices', 'Notices', '🔔'],
    ['profile', 'My Profile', '⚙️'],
  ],
  teacher: [
    ['', 'Dashboard', '🏠'],
    ['timetable', 'Timetable', '🗓️'],
    ['attendance', 'Mark Attendance', '✅'],
    ['assignments', 'Assignments', '📝'],
    ['marks', 'Marks', '🏆'],
    ['materials', 'Study Material', '📚'],
    ['leave', 'Leave Requests', '🏖️'],
    ['events', 'Events', '🎉'],
    ['notices', 'Notices', '🔔'],
    ['students', 'Students', '👨‍🎓'],
    ['profile', 'My Profile', '⚙️'],
  ],
  admin: [
    ['', 'Dashboard', '🏠'],
    ['users', 'Manage Users', '👥'],
    ['timetable', 'Timetable', '🗓️'],
    ['events', 'Events', '🎉'],
    ['leave', 'Leave Requests', '🏖️'],
    ['notices', 'Notices', '🔔'],
    ['profile', 'My Profile', '⚙️'],
  ],
};

const roleName = { student: 'Student', teacher: 'Faculty', admin: 'Administrator' };

export default function Layout() {
  const { user, logout } = useAuth();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>🎓 CampusConnect</h2>
        <nav>
          {menus[user.role].map(([path, label, icon]) => (
            <NavLink
              key={label}
              to={path ? `/${user.role}/${path}` : `/${user.role}`}
              end={path === ''}
              className={({ isActive }) => (isActive ? 'nav active' : 'nav')}
            >
              <span>{icon}</span> {label}
            </NavLink>
          ))}
        </nav>

        <button
          className="btn theme-btn"
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        >
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>

        <div className="me">
          <b>{user.name}</b>
          <span>{roleName[user.role]}</span>
        </div>
        <button className="btn logout" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}