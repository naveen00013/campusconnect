import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Layout from './components/Layout';
import Home from './pages/Home';
import Notices from './pages/Notices';
import MyAttendance from './pages/MyAttendance';
import MarkAttendance from './pages/MarkAttendance';
import StudentAssignments from './pages/StudentAssignments';
import TeacherAssignments from './pages/TeacherAssignments';
import StudentMarks from './pages/StudentMarks';
import TeacherMarks from './pages/TeacherMarks';
import Users from './pages/Users';
import Profile from './pages/Profile';
import Timetable from './pages/Timetable';
import Materials from './pages/Materials';
import Leave from './pages/Leave';
import Events from './pages/Events';
import ForgotPassword from './pages/ForgotPassword';

document.documentElement.dataset.theme = localStorage.getItem('theme') || 'light';

function Guard({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={role === 'admin' ? '/' : `/login?role=${role}`} replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

function LoginGate() {
  const { user } = useAuth();
  return user ? <Navigate to={`/${user.role}`} replace /> : <Login />;
}

function AdminGate() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <Navigate to="/admin" replace /> : <AdminLogin />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginGate />} />
            <Route path="/admin-access" element={<AdminGate />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/student" element={<Guard role="student"><Layout /></Guard>}>
              <Route index element={<Home />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="attendance" element={<MyAttendance />} />
              <Route path="assignments" element={<StudentAssignments />} />
              <Route path="materials" element={<Materials />} />
              <Route path="marks" element={<StudentMarks />} />
              <Route path="leave" element={<Leave />} />
              <Route path="events" element={<Events />} />
              <Route path="notices" element={<Notices />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="/teacher" element={<Guard role="teacher"><Layout /></Guard>}>
              <Route index element={<Home />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="attendance" element={<MarkAttendance />} />
              <Route path="assignments" element={<TeacherAssignments />} />
              <Route path="marks" element={<TeacherMarks />} />
              <Route path="materials" element={<Materials />} />
              <Route path="leave" element={<Leave />} />
              <Route path="events" element={<Events />} />
              <Route path="notices" element={<Notices />} />
              <Route path="students" element={<Users />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="/admin" element={<Guard role="admin"><Layout /></Guard>}>
              <Route index element={<Home />} />
              <Route path="users" element={<Users />} />
              <Route path="timetable" element={<Timetable />} />
              <Route path="events" element={<Events />} />
              <Route path="leave" element={<Leave />} />
              <Route path="notices" element={<Notices />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}