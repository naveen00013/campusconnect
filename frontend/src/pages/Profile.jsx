import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errMsg, useCooldown } from '../utils';

const emptyPw = { otp: '', newPassword: '', confirm: '' };

export default function Profile() {
  const { updateUser } = useAuth();
  const toast = useToast();
  const [p, setP] = useState({});
  const [saved, setSaved] = useState('');
  const [curPw, setCurPw] = useState('');
  const [sent, setSent] = useState(false);
  const [pw, setPw] = useState(emptyPw);
  const [left, start] = useCooldown();

  useEffect(() => {
    api.get('/auth/me').then((r) => {
      setP(r.data);
      setSaved(r.data.mobile || '');
    });
  }, []);

  const mobileChanged = (p.mobile || '') !== saved;

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const body = { name: p.name, department: p.department, mobile: p.mobile || '' };
      if (mobileChanged) body.currentPassword = curPw;
      const { data } = await api.put('/auth/profile', body);
      updateUser({ name: data.name });
      setP(data);
      setSaved(data.mobile || '');
      setCurPw('');
      toast.success('Profile updated');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const sendOtp = async () => {
    try {
      const { data } = await api.post('/auth/password/otp');
      toast.success(data.message);
      setSent(true);
      start();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const changePw = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return toast.error('Passwords do not match');
    try {
      const { data } = await api.put('/auth/password', {
        otp: pw.otp,
        newPassword: pw.newPassword,
      });
      toast.success(data.message);
      setPw(emptyPw);
      setSent(false);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <>
      <header className="topbar">
        <div>
          <h1>⚙️ My Profile</h1>
          <p className="sub">Manage your details and password</p>
        </div>
      </header>

      <form className="panel" onSubmit={saveProfile}>
        <div className="profile-head">
          <div className="avatar">{p.name?.[0] || '?'}</div>
          <div>
            <h3 style={{ margin: 0 }}>{p.name}</h3>
            <span className="pill blue">{p.role}</span>
          </div>
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Name</label>
            <input value={p.name || ''} onChange={(e) => setP({ ...p, name: e.target.value })} required />
          </div>
          <div className="field">
            <label>Email (cannot be changed)</label>
            <input value={p.email || ''} disabled />
          </div>
          <div className="field">
            <label>Department</label>
            <input value={p.department || ''} onChange={(e) => setP({ ...p, department: e.target.value })} />
          </div>
          <div className="field">
            <label>Mobile Number (optional, for SMS OTP)</label>
            <input
              value={p.mobile || ''}
              placeholder="e.g. 9876543210"
              onChange={(e) => setP({ ...p, mobile: e.target.value })}
            />
          </div>
          {mobileChanged && (
            <div className="field">
              <label>Current Password (required to change mobile)</label>
              <input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)} required />
            </div>
          )}
          {p.role === 'student' && (
            <div className="field">
              <label>Roll No</label>
              <input value={p.rollNo || ''} disabled />
            </div>
          )}
        </div>
        <div className="row-actions">
          <button className="btn sm">Save Changes</button>
        </div>
      </form>

      <form className="panel" onSubmit={changePw}>
        <h3>🔒 Change Password</h3>
        <p className="sub" style={{ marginBottom: 14 }}>
          For security, an OTP is sent to your registered email and mobile number.
        </p>
        {!saved && <div className="sub" style={{ marginBottom: 12 }}>Tip: add your mobile number above to receive OTPs by SMS too. OTPs are always sent to your registered email.</div>}
        <div className="row-actions" style={{ marginTop: 0, marginBottom: 14 }}>
          <button type="button" className="btn sm ghost" disabled={left > 0} onClick={sendOtp}>
            {left > 0 ? `Resend OTP in ${left}s` : sent ? 'Resend OTP' : 'Send OTP'}
          </button>
        </div>
        {sent && (
          <>
            <div className="form-grid">
              <div className="field">
                <label>OTP</label>
                <input value={pw.otp} maxLength="6" inputMode="numeric" onChange={(e) => setPw({ ...pw, otp: e.target.value })} required />
              </div>
              <div className="field">
                <label>New Password (min 8 characters)</label>
                <input type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required />
              </div>
              <div className="field">
                <label>Confirm New Password</label>
                <input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
              </div>
            </div>
            <div className="row-actions">
              <button className="btn sm">Change Password</button>
            </div>
          </>
        )}
      </form>
    </>
  );
}