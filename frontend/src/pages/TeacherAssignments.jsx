import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errMsg, fmtDay, fmtStamp, openFile, FILE_TYPES, MAX_MB } from '../utils';

const empty = { title: '', subject: '', description: '', dueDate: '' };

export default function TeacherAssignments() {
  const { user } = useAuth();
  const toast = useToast();
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [subs, setSubs] = useState({});
  const [open, setOpen] = useState(null);

  const load = () => api.get('/assignments').then((r) => setList(r.data));
  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const dl = (f) => openFile(f.file, f.name).catch(() => toast.error('Unable to download the file'));

  const pick = (f) => {
    if (f && f.size > MAX_MB * 1024 * 1024) return toast.error(`File is too large (maximum ${MAX_MB} MB)`);
    setFile(f || null);
  };

  const create = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('file', file);
    try {
      await api.post('/assignments', fd);
      toast.success('Assignment created');
      setForm(empty);
      setFile(null);
      setFileKey(fileKey + 1);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const toggle = async (id) => {
    if (open === id) return setOpen(null);
    const r = await api.get(`/assignments/${id}/submissions`);
    setSubs({ ...subs, [id]: r.data });
    setOpen(id);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this assignment and all its submissions?')) return;
    try {
      await api.delete(`/assignments/${id}`);
      toast.success('Assignment deleted');
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <>
      <header className="topbar">
        <div>
          <h1>📝 Assignments</h1>
          <p className="sub">Create assignments and review student submissions</p>
        </div>
      </header>

      <form className="panel" onSubmit={create}>
        <h3>New Assignment</h3>
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
            <label>Due Date</label>
            <input type="date" value={form.dueDate} onChange={set('dueDate')} required />
          </div>
          <div className="field">
            <label>Attachment (optional, max {MAX_MB} MB)</label>
            <input key={fileKey} type="file" accept={FILE_TYPES} onChange={(e) => pick(e.target.files[0])} />
          </div>
          <div className="field full">
            <label>Description</label>
            <textarea rows="3" value={form.description} onChange={set('description')} />
          </div>
        </div>
        <div className="row-actions">
          <button className="btn sm">Create Assignment</button>
        </div>
      </form>

      <div className="panel">
        <h3>All Assignments</h3>
        {list.length === 0 && <div className="empty">No assignments yet</div>}
        {list.map((a) => (
          <div className="item" key={a._id}>
            <div className="item-head">
              <div>
                <h4>{a.title}</h4>
                <div className="meta">
                  {a.subject} • Due: {fmtDay(a.dueDate)} • {a.createdBy?.name}
                </div>
              </div>
              <span className="pill blue">{a.submissionCount} submissions</span>
            </div>
            {a.description && <p>{a.description}</p>}
            <div className="row-actions">
              {a.attachment && (
                <button className="btn sm ghost" onClick={() => dl(a.attachment)}>
                  📎 {a.attachment.name}
                </button>
              )}
              <button className="btn sm ghost" onClick={() => toggle(a._id)}>
                {open === a._id ? 'Hide submissions' : 'View submissions'}
              </button>
              {(user.role === 'admin' || a.createdBy?._id === user.id) && (
                <button className="btn sm danger" onClick={() => del(a._id)}>
                  Delete
                </button>
              )}
            </div>

            {open === a._id && (
              <div style={{ marginTop: 14 }}>
                {(subs[a._id] || []).length === 0 && <div className="empty">No submissions yet</div>}
                {(subs[a._id] || []).map((s) => (
                  <div className="item" key={s._id}>
                    <b>
                      {s.student?.name} ({s.student?.rollNo || '-'})
                    </b>
                    <div className="meta">{fmtStamp(s.submittedAt)}</div>
                    {s.text && <p>{s.text}</p>}
                    {s.file && (
                      <div className="row-actions">
                        <button className="btn sm ghost" onClick={() => dl(s.file)}>
                          📎 {s.file.name}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}