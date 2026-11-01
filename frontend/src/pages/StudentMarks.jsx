import { useEffect, useState } from 'react';
import api from '../api';

export const grade = (p) =>
  p >= 90 ? 'A+' : p >= 80 ? 'A' : p >= 70 ? 'B' : p >= 60 ? 'C' : p >= 50 ? 'D' : 'F';

export default function StudentMarks() {
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get('/marks/my').then((r) => setList(r.data));
  }, []);

  const avg = list.length
    ? Math.round(list.reduce((s, m) => s + (m.marks / m.total) * 100, 0) / list.length)
    : 0;

  return (
    <>
      <header className="topbar">
        <div>
          <h1>🏆 My Marks</h1>
          <p className="sub">Results of all exams</p>
        </div>
        <span className="badge">Average: {avg}%</span>
      </header>

      <div className="panel">
        {list.length === 0 && <div className="empty">No results published yet</div>}
        {list.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Exam</th>
                  <th>Marks</th>
                  <th>%</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {list.map((m) => {
                  const p = Math.round((m.marks / m.total) * 100);
                  return (
                    <tr key={m._id}>
                      <td>{m.subject}</td>
                      <td>{m.exam}</td>
                      <td>
                        {m.marks} / {m.total}
                      </td>
                      <td>{p}%</td>
                      <td>
                        <span className={p >= 50 ? 'pill green' : 'pill red'}>{grade(p)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}