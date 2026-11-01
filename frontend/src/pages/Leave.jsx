import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errMsg, fmtDay, fmtStamp, dayCount, todayISO } from '../utils';

const TYPES = {
  sick: 'Sick Leave',
  casual: 'Casual Leave',
  event: 'Event / Competition',
  other: 'Other',
};
const PILL = { pending: 'pill amber', approved: 'pill green', rejected: 'pill red' };
const emptyForm = { type: 'casual', fromDate: '', toDate: '', reason: '' };

function StudentLeave() {
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);
  const [list, setList] = useState([]);

  const load = () => api.get('/leaves/my').then((r) => setList(r.data));
  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', form);
      toast.success('Leave application submitted');
      setForm(emptyForm);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this leave application?')) return;
    try {
      await api.delete(`/leaves/${id}`);
      toast.success('Application cancelled');
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <>
      <header className="topbar">
        <div>
          <h1>🏖️ Leave</h1>
          <p className="sub">Apply for leave and track your applications</p>
        </div>
      </header>

      <form className="panel" onSubmit={submit}>
        <h3>New Leave Application</h3>
        <div className="form-grid">
          <div className="field">
            <label>Leave Type</label>
            <select value={form.type} onChange={set('type')}>
              {Object.entries(TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>From</label>
            <input type="date" min={todayISO()} value={form.fromDate} onChange={set('fromDate')} required />
          </div>
          <div className="field">
            <label>To</label>
            <input type="date" min={form.fromDate || todayISO()} value={form.toDate} onChange={set('toDate')} required />
          </div>
          <div className="field full">
            <label>Reason</label>
            <textarea rows="3" value={form.reason} onChange={set('reason')} required />
          </div>
        </div>
        <div className="row-actions">
          <button className="btn sm">Submit Application</button>
        </div>
      </form>

      <div className="panel">
        <h3>My Applications</h3>
        {list.length === 0 && <div className="empty">You have not applied for any leave yet</div>}
        {list.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Remark</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((l) => (
                  <tr key={l._id}>
                    <td>{TYPES[l.type]}</td>
                    <td>
                      {fmtDay(l.fromDate)} – {fmtDay(l.toDate)}
                    </td>
                    <td>{dayCount(l.fromDate, l.toDate)}</td>
                    <td><span className={PILL[l.status]}>{l.status}</span></td>
                    <td>{l.remark || '-'}</td>
                    <td>
                      {l.status === 'pending' && (
                        <button className="btn sm danger" onClick={() => cancel(l._id)}>
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function StaffLeave() {
  const toast = useToast();
  const [status, setStatus] = useState('pending');
  const [list, setList] = useState([]);
  const [remarks, setRemarks] = useState({});

  const load = () =>
    api.get('/leaves', { params: status ? { status } : {} }).then((r) => setList(r.data));
  useEffect(() => {
    load();
  }, [status]);

  const review = async (id, decision) => {
    try {
      await api.put(`/leaves/${id}/review`, { status: decision, remark: remarks[id] || '' });
      toast.success(`Application ${decision}`);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <>
      <header className="topbar">
        <div>
          <h1>🏖️ Leave Requests</h1>
          <p className="sub">Review and respond to student leave applications</p>
        </div>
      </header>

      <div className="panel">
        <div className="tabs">
          {[
            ['pending', 'Pending'],
            ['approved', 'Approved'],
            ['rejected', 'Rejected'],
            ['', 'All'],
          ].map(([v, l]) => (
            <button
              key={l}
              className={status === v ? 'btn sm' : 'btn sm ghost'}
              onClick={() => setStatus(v)}
            >
              {l}
            </button>
          ))}
        </div>

        {list.length === 0 && <div className="empty">No applications found</div>}

        {list.map((l) => (
          <div className="item" key={l._id}>
            <div className="item-head">
              <div>
                <h4>
                  {l.student?.name || 'Deleted user'}{' '}
                  <span className="meta">
                    {l.student?.rollNo ? `(${l.student.rollNo}) ` : ''}
                    {l.student?.department || ''}
                  </span>
                </h4>
                <div className="meta">
                  {TYPES[l.type]} • {fmtDay(l.fromDate)} – {fmtDay(l.toDate)} (
                  {dayCount(l.fromDate, l.toDate)} day{dayCount(l.fromDate, l.toDate) > 1 ? 's' : ''}) • Applied{' '}
                  {fmtStamp(l.createdAt)}
                </div>
              </div>
              <span className={PILL[l.status]}>{l.status}</span>
            </div>
            <p>{l.reason}</p>

            {l.status === 'pending' ? (
              <>
                <div className="field">
                  <input
                    placeholder="Remark (optional)"
                    value={remarks[l._id] || ''}
                    onChange={(e) => setRemarks({ ...remarks, [l._id]: e.target.value })}
                  />
                </div>
                <div className="row-actions">
                  <button className="btn sm" onClick={() => review(l._id, 'approved')}>
                    ✓ Approve
                  </button>
                  <button className="btn sm danger" onClick={() => review(l._id, 'rejected')}>
                    ✕ Reject
                  </button>
                </div>
              </>
            ) : (
              <div className="meta">
                Reviewed by {l.reviewedBy?.name || '-'}
                {l.remark ? ` • "${l.remark}"` : ''}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default function Leave() {
  const { user } = useAuth();
  return user.role === 'student' ? <StudentLeave /> : <StaffLeave />;
}