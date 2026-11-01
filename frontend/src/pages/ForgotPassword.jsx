import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { errMsg, useCooldown } from '../utils';
import './Login.css';

export default function ForgotPassword() {
  const toast = useToast();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ otp: '', newPassword: '', confirm: '' });
  const [left, start] = useCooldown();

  const sendOtp = async (e) => {
    e?.preventDefault();
    try {
      const { data } = await api.post('/auth/forgot/otp', { email });
      toast.success(data.message);
      setStep(2);
      start();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const reset = async (e) => {
    e.preventDefault();
    if (f.newPassword !== f.confirm) return toast.error('Passwords do not match');
    try {
      const { data } = await api.post('/auth/forgot/reset', {
        email,
        otp: f.otp,
        newPassword: f.newPassword,
      });
      toast.success(data.message);
      nav('/');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <div className="lg-main" style={{ minHeight: '100vh' }}>
      <div className="lg-box">
        <Link to="/" className="lg-back">← Back to Home</Link>
        <h1>Reset Password</h1>
        <p className="lg-sub">
          {step === 1
            ? 'Enter your registered email. We will send an OTP to your email and mobile number.'
            : 'Enter the OTP you received and choose a new password.'}
        </p>

        {step === 1 ? (
          <form onSubmit={sendOtp}>
            <div className="lg-field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button className="lg-submit">Send OTP</button>
          </form>
        ) : (
          <form onSubmit={reset}>
            <div className="lg-field">
              <label>OTP</label>
              <input value={f.otp} maxLength="6" inputMode="numeric" onChange={(e) => setF({ ...f, otp: e.target.value })} required />
            </div>
            <div className="lg-field">
              <label>New Password (min 8 characters)</label>
              <input type="password" value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} required />
            </div>
            <div className="lg-field">
              <label>Confirm New Password</label>
              <input type="password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} required />
            </div>
            <button className="lg-submit">Reset Password</button>
            <button type="button" className="lg-forgot" style={{ marginTop: 12, background: 'none', border: 'none', cursor: left ? 'default' : 'pointer', width: '100%', textAlign: 'center' }} disabled={left > 0} onClick={sendOtp}>
              {left > 0 ? `Resend OTP in ${left}s` : 'Resend OTP'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}