import { useEffect, useState } from 'react';
import api from '../api';

const today = new Date().toLocaleDateString('en-CA');

export default function MarkAttendance() {
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(today);
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState({});
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get('/users?role=student').then((r) => {
      setStudents(r.data);
      const s = {};
      r.data.forEach((x) => (s[x._id] = 'present'));
      setStatus(s);
    });
  }, []);

  useEffect(() => {
    if (!subject.trim() || !students.length) return;
    api
      .get('/attendance', { params: { date, subject: subject.trim() } })
      .then((r) => {
        if (!r.data.length) return;
        setStatus((prev) => {
          const n = { ...prev };
          r.data.forEach((a) => {
            if (a.student) n[a.student._id] = a.status;
          });
          return n;
        });
      });
  }, [date, subject, students.length]);

  const markAll = () => {
    const s = {};
    students.forEach((x) => (s[x._id] = 'present'));
    setStatus(s);
  };

  const save = async () => {
    if (!subject.trim()) return setMsg('Please enter the subject first');
    try {
      await api.post('/attendance', {
        date,
        subject: subject.trim(),
        records: students.map((s) => ({ student: s._id, status: status[s._id] })),
      });
      setMsg('✅ Attendance saved successfully');
    } catch (e) {
      setMsg(e.response?.data?.message || 'Something went wrong');
    }
  };

  const presentCount = students.filter((s) => status[s._id] === 'present').length;

  return (
    <>
      <header className="topbar">
        <div>
          <h1>✅ Mark Attendance</h1>
          <p className="sub">Select the date and subject, then save</p>
        </div>
      </header>

      <div className="panel">
        <div className="form-grid">
          <div className="field">
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Subject</label>
            <input
              placeholder="e.g. DSA"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div>
            <button className="btn ghost sm" onClick={markAll}>
              Mark All Present
            </button>
          </div>
        </div>
      </div>

      <div className="panel">
        <h3>
          Students ({students.length}) • Present: {presentCount}
        </h3>
        {students.length === 0 && (
          <div className="empty">No students found. Ask the admin to add students.</div>
        )}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s._id}>
                  <td>{s.rollNo || '-'}</td>
                  <td>{s.name}</td>
                  <td>
                    <div className="toggle">
                      <button
                        className={status[s._id] === 'present' ? 'p on' : 'p'}
                        onClick={() => setStatus({ ...status, [s._id]: 'present' })}
                      >
                        Present
                      </button>
                      <button
                        className={status[s._id] === 'absent' ? 'a on' : 'a'}
                        onClick={() => setStatus({ ...status, [s._id]: 'absent' })}
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {msg && <div className={msg.startsWith('✅') ? 'success' : 'error'}>{msg}</div>}
        <div className="row-actions">
          <button className="btn sm" onClick={save}>
            💾 Save Attendance
          </button>
        </div>
      </div>
    </>
  );
}