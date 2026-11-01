import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DAYS, to12, errMsg } from '../utils';

const ORDER = [1, 2, 3, 4, 5, 6];
const empty = { department: '', day: 1, startTime: '', endTime: '', subject: '', room: '', teacher: '' };

export default function Timetable() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user.role === 'admin';
  const [list, setList] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(empty);
  const [dept, setDept] = useState('all');

  const load = () => api.get('/timetable').then((r) => setList(r.data));
  useEffect(() => {
    load();
    if (isAdmin) api.get('/users?role=teacher').then((r) => setTeachers(r.data));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const depts = [...new Set(list.map((x) => x.department))].sort();
  const shown = dept === 'all' ? list : list.filter((x) => x.department === dept);
  const todayNo = new Date().getDay();

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post('/timetable', { ...form, teacher: form.teacher || undefined });
      toast.success('Class added to the timetable');
      setForm({ ...empty, department: form.department, day: form.day });
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const del = async (id) => {
    if (!window.confirm('Remove this class from the timetable?')) return;
    try {
      await api.delete(`/timetable/${id}`);
      toast.success('Class removed');
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <>
      <header className="topbar">
        <div>
          <h1>🗓️ Timetable</h1>
          <p className="sub">
            {isAdmin
              ? 'Create and manage weekly class schedules'
              : user.role === 'teacher'
              ? 'Your weekly teaching schedule'
              : 'Your weekly class schedule'}
          </p>
        </div>
      </header>

      {isAdmin && (
        <form className="panel" onSubmit={add}>
          <h3>Add a Class</h3>
          <div className="form-grid">
            <div className="field">
              <label>Department / Class (e.g. IT)</label>
              <input value={form.department} onChange={set('department')} required />
            </div>
            <div className="field">
              <label>Day</label>
              <select value={form.day} onChange={set('day')}>
                {ORDER.map((d) => (
                  <option key={d} value={d}>{DAYS[d]}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Start Time</label>
              <input type="time" value={form.startTime} onChange={set('startTime')} required />
            </div>
            <div className="field">
              <label>End Time</label>
              <input type="time" value={form.endTime} onChange={set('endTime')} required />
            </div>
            <div className="field">
              <label>Subject</label>
              <input value={form.subject} onChange={set('subject')} required />
            </div>
            <div className="field">
              <label>Room</label>
              <input value={form.room} onChange={set('room')} />
            </div>
            <div className="field">
              <label>Faculty</label>
              <select value={form.teacher} onChange={set('teacher')}>
                <option value="">-- Not assigned --</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="row-actions">
            <button className="btn sm">Add to Timetable</button>
          </div>
        </form>
      )}

      {(isAdmin || depts.length > 1) && (
        <div className="filters">
          <select value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="all">All departments</option>
            {depts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      )}

      <div className="tt-grid">
        {ORDER.map((d) => {
          const entries = shown.filter((x) => x.day === d);
          return (
            <div key={d} className={d === todayNo ? 'tt-col today' : 'tt-col'}>
              <h4>
                {DAYS[d]}
                {d === todayNo && <span className="pill blue">Today</span>}
              </h4>
              {entries.length === 0 && <div className="meta">No classes</div>}
              {entries.map((c) => (
                <div className="tt-card" key={c._id}>
                  <b>{c.subject}</b>
                  <span>
                    {to12(c.startTime)} – {to12(c.endTime)}
                  </span>
                  <span>
                    {[c.room && `Room ${c.room}`, c.teacher?.name].filter(Boolean).join(' • ')}
                  </span>
                  {user.role !== 'student' && <span>{c.department}</span>}
                  {isAdmin && <button onClick={() => del(c._id)}>Remove</button>}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}