import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '', code: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Secure Access';
    const m = document.createElement('meta');
    m.name = 'robots';
    m.content = 'noindex,nofollow';
    document.head.appendChild(m);
    return () => {
      document.head.removeChild(m);
      document.title = 'CampusConnect | College Portal';
    };
  }, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await adminLogin(f.email, f.password, f.code);
      nav('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ad-page">
      <form className="ad-card" onSubmit={submit} autoComplete="off">
        <div className="ad-shield">🛡️</div>
        <h1>Administrator Access</h1>
        <p className="lg-sub">Authorized personnel only</p>

        <div className="lg-field">
          <label>Email</label>
          <input type="email" value={f.email} onChange={set('email')} required />
        </div>
        <div className="lg-field">
          <label>Password</label>
          <input type="password" value={f.password} onChange={set('password')} required />
        </div>
        <div className="lg-field">
          <label>Access Code</label>
          <input type="password" value={f.code} onChange={set('code')} required />
        </div>

        {error && <div className="lg-error">{error}</div>}
        <button className="lg-submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Secure Login'}
        </button>
        <p className="ad-warn">All access attempts are monitored and rate-limited.</p>
      </form>
    </div>
  );
}