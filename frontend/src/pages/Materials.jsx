import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errMsg, fmtStamp } from '../utils';

const TYPES = {
  notes: '📄 Notes',
  video: '🎬 Video',
  book: '📘 Book',
  assignment: '📝 Assignment',
  other: '📎 Other',
};
const empty = { title: '', subject: '', type: 'notes', link: '', department: '', description: '' };

export default function Materials() {
  const { user } = useAuth();
  const toast = useToast();
  const staff = user.role !== 'student';
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [q, setQ] = useState('');
  const [subject, setSubject] = useState('');
  const [type, setType] = useState('');

  const load = () => api.get('/materials').then((r) => setList(r.data));
  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const subjects = useMemo(() => [...new Set(list.map((m) => m.subject))].sort(), [list]);
  const shown = list.filter(
    (m) =>
      (!subject || m.subject === subject) &&
      (!type || m.type === type) &&
      (!q || `${m.title} ${m.subject}`.toLowerCase().includes(q.toLowerCase()))
  );

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post('/materials', form);
      toast.success('Study material published');
      setForm(empty);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this study material?')) return;
    try {
      await api.delete(`/materials/${id}`);
      toast.success('Material deleted');
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <>
      <header className="topbar">
        <div>
          <h1>📚 Study Material</h1>
          <p className="sub">
            {staff ? 'Share notes, videos and books with students' : 'Notes, videos and resources shared by your faculty'}
          </p>
        </div>
      </header>

      {staff && (
        <form className="panel" onSubmit={add}>
          <h3>Share New Material</h3>
          <div className="form-grid">
            <div className="field">
              <label>Title</label>
              <input value={form.title} onChange={set('title')} required />
            </div>
            <div className="field">
              <label>Subject</label>
              <input value={form.subject} onChange={set('subject')} required />
            </div>
            <div className="field">
              <label>Type</label>
              <select value={form.type} onChange={set('type')}>
                {Object.entries(TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Department (leave empty for all)</label>
              <input value={form.department} onChange={set('department')} placeholder="e.g. IT" />
            </div>
            <div className="field full">
              <label>Link (Google Drive, YouTube, website...)</label>
              <input value={form.link} onChange={set('link')} placeholder="https://" required />
            </div>
            <div className="field full">
              <label>Description</label>
              <textarea rows="2" value={form.description} onChange={set('description')} />
            </div>
          </div>
          <div className="row-actions">
            <button className="btn sm">Publish</button>
          </div>
        </form>
      )}

      <div className="filters">
        <input placeholder="🔍 Search by title or subject" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="">All subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          {Object.entries(TYPES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {shown.length === 0 && <div className="panel"><div className="empty">No study material found</div></div>}

      <div className="mat-grid">
        {shown.map((m) => (
          <div className="mat-card" key={m._id}>
            <div>
              <span className="pill blue">{TYPES[m.type]}</span>
            </div>
            <h4>{m.title}</h4>
            <div className="meta">
              {m.subject}
              {m.department ? ` • ${m.department}` : ''}
            </div>
            {m.description && <p>{m.description}</p>}
            <div className="meta">
              By {m.uploadedBy?.name || 'Faculty'} • {fmtStamp(m.createdAt)}
            </div>
            <div className="row-actions">
              <a className="btn sm" href={m.link} target="_blank" rel="noopener noreferrer">
                Open ↗
              </a>
              {(user.role === 'admin' || m.uploadedBy?._id === user.id) && (
                <button className="btn sm danger" onClick={() => del(m._id)}>
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}