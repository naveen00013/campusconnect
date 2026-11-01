import { useEffect, useState } from 'react';
import api from '../api';

export default function MyAttendance() {
  const [d, setD] = useState(null);

  useEffect(() => {
    api.get('/attendance/my').then((r) => setD(r.data));
  }, []);

  if (!d) return <p className="sub">Loading...</p>;

  return (
    <>
      <header className="topbar">
        <div>
          <h1>📅 My Attendance</h1>
          <p className="sub">Subject-wise record</p>
        </div>
      </header>

      <div className="grid2">
        <div className="panel center">
          <div
            className="ring"
            style={{
              background: `conic-gradient(#4f46e5 ${d.percentage * 3.6}deg, #e2e8f0 0)`,
            }}
          >
            <div className="ring-in">{d.percentage}%</div>
          </div>
          <p className="sub">
            {d.present} / {d.total} classes attended
          </p>
          {d.total > 0 && d.percentage < 75 && (
            <div className="error">⚠️ Your attendance is below 75%!</div>
          )}
        </div>

        <div className="panel">
          <h3>Subject-wise</h3>
          {Object.keys(d.bySubject).length === 0 && (
            <div className="empty">No records yet</div>
          )}
          {Object.entries(d.bySubject).map(([s, v]) => {
            const p = Math.round((v.present / v.total) * 100);
            return (
              <div className="bar-row" key={s}>
                <div className="bar-top">
                  <span>{s}</span>
                  <span>
                    {p}% ({v.present}/{v.total})
                  </span>
                </div>
                <div className="bar">
                  <div
                    className="fill"
                    style={{ width: `${p}%`, background: p < 75 ? '#ef4444' : '#22c55e' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="panel">
        <h3>Recent Records</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {d.records.slice(0, 15).map((r) => (
                <tr key={r._id}>
                  <td>{r.date}</td>
                  <td>{r.subject}</td>
                  <td>
                    <span className={r.status === 'present' ? 'pill green' : 'pill red'}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {d.records.length === 0 && <div className="empty">No records found</div>}
        </div>
      </div>
    </>
  );
}