import { useEffect, useState } from 'react';
import api from '../api';

const empty = { student: '', subject: '', exam: '', marks: '', total: '' };

export default function TeacherMarks() {
  const [students, setStudents] = useState([]);
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');

  const load = () => api.get('/marks').then((r) => setList(r.data));
  useEffect(() => {
    api.get('/users?role=student').then((r) => setStudents(r.data));
    load();
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post('/marks', form);
      setForm({ ...empty, subject: form.subject, exam: form.exam, total: form.total });
      setMsg('✅ Marks saved successfully');
      load();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Something went wrong');
    }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    await api.delete(`/marks/${id}`);
    load();
  };

  return (
    <>
      <header className="topbar">
        <div>
          <h1>🏆 Marks</h1>
          <p className="sub">Enter marks for students</p>
        </div>
      </header>

      <form className="panel" onSubmit={add}>
        <h3>Enter Marks</h3>
        <div className="form-grid">
          <div className="field">
            <label>Student</label>
            <select value={form.student} onChange={set('student')} required>
              <option value="">-- Select --</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.rollNo ? `${s.rollNo} - ` : ''}
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Subject</label>
            <input value={form.subject} onChange={set('subject')} required />
          </div>
          <div className="field">
            <label>Exam (e.g. Mid Sem)</label>
            <input value={form.exam} onChange={set('exam')} required />
          </div>
          <div className="field">
            <label>Marks obtained</label>
            <input type="number" min="0" value={form.marks} onChange={set('marks')} required />
          </div>
          <div className="field">
            <label>Total marks</label>
            <input type="number" min="1" value={form.total} onChange={set('total')} required />
          </div>
        </div>
        {msg && <div className={msg.startsWith('✅') ? 'success' : 'error'}>{msg}</div>}
        <div className="row-actions">
          <button className="btn sm">Save</button>
        </div>
      </form>

      <div className="panel">
        <h3>All Marks</h3>
        {list.length === 0 && <div className="empty">No entries yet</div>}
        {list.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Exam</th>
                  <th>Marks</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.map((m) => (
                  <tr key={m._id}>
                    <td>{m.student?.name || 'Deleted user'}</td>
                    <td>{m.subject}</td>
                    <td>{m.exam}</td>
                    <td>
                      {m.marks} / {m.total}
                    </td>
                    <td>
                      <button className="btn sm danger" onClick={() => del(m._id)}>
                        Delete
                      </button>
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