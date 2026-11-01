import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const empty = { title: '', content: '', audience: 'all' };

export default function Notices() {
  const { user } = useAuth();
  const canPost = user.role !== 'student';
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');

  const load = () => api.get('/notices').then((r) => setList(r.data));
  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const post = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notices', form);
      setForm(empty);
      setMsg('✅ Notice posted successfully');
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Something went wrong');
    }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <>
      <header className="topbar">
        <div>
          <h1>🔔 Notices</h1>
          <p className="sub">All college announcements</p>
        </div>
      </header>

      {canPost && (
        <form className="panel" onSubmit={post}>
          <h3>New Notice</h3>
          <div className="form-grid">
            <div className="field">
              <label>Title</label>
              <input value={form.title} onChange={set('title')} required />
            </div>
            <div className="field">
              <label>ience</label>
              <select value={form.audience} onChange={set('audience')}>
                <option value="all">Everyone</option>
                <option value="student">Students only</option>
                <option value="teacher">Faculty only</option>
              </select>
            </div>
            <div className="field full">
              <label>Message</label>
              <textarea rows="3" value={form.content} onChange={set('content')} required />
            </div>
          </div>
          {msg && <div className={msg.startsWith('✅') ? 'success' : 'error'}>{msg}</div>}
          <div className="row-actions">
            <button className="btn sm">Post Notice</button>
          </div>
        </form>
      )}

      <div className="panel">
        {list.length === 0 && <div className="empty">No notices at the moment</div>}
        {list.map((n) => (
          <div className="item" key={n._id}>
            <div className="item-head">
              <h4>{n.title}</h4>
              <span className="pill blue">{n.audience}</span>
            </div>
            <p>{n.content}</p>
            <div className="meta">
              {n.postedBy?.name} • {new Date(n.createdAt).toLocaleDateString('en-IN')}
            </div>
            {(user.role === 'admin' || n.postedBy?._id === user.id) && (
              <div className="row-actions">
                <button className="btn sm danger" onClick={() => del(n._id)}>
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}