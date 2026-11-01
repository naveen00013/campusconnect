import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const ROLES = {
  student: {
    title: 'Student Login',
    icon: '🎓',
    text: 'Access your attendance, assignments, results and notices in one place.',
    demo: 'student@campus.com',
  },
  teacher: {
    title: 'Faculty Login',
    icon: '👩‍🏫',
    text: 'Mark attendance, manage assignments and results, and post notices.',
    demo: 'teacher@campus.com',
  },
};

function LoginForm({ role }) {
  const r = ROLES[role];
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const u = await login(email, password, role);
      nav(`/${u.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg-page">
      <div className="lg-side">
        <Link to="/" className="lg-brand">
          <span className="lg-logo">🎓</span> CampusConnect
        </Link>
        <div>
          <h2>Welcome back!</h2>
          <p>{r.text}</p>
          <ul className="lg-points">
            <li>Secure and encrypted login</li>
            <li>Personalised dashboard</li>
            <li>Live notices and updates</li>
          </ul>
        </div>
        <div className="lg-foot">© {new Date().getFullYear()} CampusConnect</div>
      </div>

      <div className="lg-main">
        <div className="lg-box">
          <Link to="/" className="lg-back">← Back to Home</Link>
          <h1>{r.icon} {r.title}</h1>
          <p className="lg-sub">Sign in with the credentials provided by your college</p>

          <form onSubmit={submit}>
            <div className="lg-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="you@campus.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="lg-field">
              <label>Password</label>
              <div className="lg-input">
                <input
                  type={show ? 'text' : 'password'}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button type="button" className="lg-eye" onClick={() => setShow(!show)}>
                  {show ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
                        <Link to="/forgot-password" className="lg-forgot">Forgot password?</Link>
            {error && <div className="lg-error">{error}</div>}
            <button className="lg-submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <div className="lg-demo" style={{ display: import.meta.env.PROD ? 'none' : undefined }}>
            <span>Demo account (password: 123456)</span>
            <button
              type="button"
              onClick={() => {
                setEmail(r.demo);
                setPassword('123456');
              }}
            >
              Fill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const [params] = useSearchParams();
  const role = params.get('role');
  if (!ROLES[role]) return <Navigate to="/" replace />;
  return <LoginForm role={role} />;
}