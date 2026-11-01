import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { to12 } from '../utils';

const cards = {
  student: [
    ['📅', 'Attendance', 'attendance'],
    ['📝', 'Pending Assignments', 'pending'],
    ['🏆', 'Latest Result', 'latest'],
    ['🎉', 'Upcoming Events', 'events'],
  ],
  teacher: [
    ['👨‍🎓', 'Total Students', 'students'],
    ['📤', 'Assignments Posted', 'assignments'],
    ['🏆', 'Marks Entered', 'marks'],
    ['🏖️', 'Pending Leave Requests', 'pendingLeaves'],
  ],
  admin: [
    ['👨‍🎓', 'Total Students', 'students'],
    ['👩‍🏫', 'Total Faculty', 'teachers'],
    ['🏖️', 'Pending Leave Requests', 'pendingLeaves'],
    ['🎉', 'Upcoming Events', 'events'],
  ],
};

const roleName = { student: 'Student', teacher: 'Faculty', admin: 'Administrator' };

const axis = { tick: { fill: 'var(--muted)', fontSize: 12 }, stroke: 'var(--grid)' };
const tip = {
  background: 'var(--card)',
  border: '1px solid var(--grid)',
  borderRadius: 8,
  color: 'var(--text)',
};

function Chart({ title, data, kind, x, y, color }) {
  return (
    <div className="panel">
      <h3>{title}</h3>
      {data.length === 0 ? (
        <div className="empty">No data available yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          {kind === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" />
              <XAxis dataKey={x} {...axis} />
              <YAxis domain={[0, 100]} {...axis} />
              <Tooltip contentStyle={tip} />
              <Line type="monotone" dataKey={y} stroke={color} strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid stroke="var(--grid)" strokeDasharray="3 3" />
              <XAxis dataKey={x} {...axis} />
              <YAxis domain={[0, 100]} {...axis} />
              <Tooltip contentStyle={tip} />
              <Bar dataKey={y} fill={color} radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [notices, setNotices] = useState([]);
  const [today, setToday] = useState([]);
  const [c1, setC1] = useState([]);
  const [c2, setC2] = useState([]);

  useEffect(() => {
    api.get('/dashboard/stats').then((r) => setStats(r.data)).catch(() => {});
    api.get('/notices').then((r) => setNotices(r.data.slice(0, 3))).catch(() => {});

    if (user.role !== 'admin') {
      api
        .get('/timetable/today', { params: { day: new Date().getDay() } })
        .then((r) => setToday(r.data))
        .catch(() => {});
    }

    if (user.role === 'student') {
      api
        .get('/attendance/my')
        .then((r) =>
          setC1(
            Object.entries(r.data.bySubject).map(([subject, v]) => ({
              subject,
              percentage: Math.round((v.present / v.total) * 100),
            }))
          )
        )
        .catch(() => {});
      api
        .get('/marks/my')
        .then((r) =>
          setC2(
            r.data
              .map((m) => ({
                name: `${m.subject} (${m.exam})`,
                percentage: Math.round((m.marks / m.total) * 100),
              }))
              .reverse()
          )
        )
        .catch(() => {});
    } else {
      api
        .get('/dashboard/analytics')
        .then((r) => {
          setC1(r.data.attendance);
          setC2(r.data.marks);
        })
        .catch(() => {});
    }
  }, [user.role]);

  return (
    <>
      <header className="topbar">
        <div>
          <h1>Welcome back, {user.name} 👋</h1>
          <p className="sub">{roleName[user.role]} Dashboard</p>
        </div>
        <span className="badge">{roleName[user.role].toUpperCase()}</span>
      </header>

      <section className="cards">
        {cards[user.role].map(([icon, label, key]) => (
          <div className="card" key={key}>
            <div className="icon">{icon}</div>
            <div className="value">{stats[key] ?? '--'}</div>
            <div className="label">{label}</div>
          </div>
        ))}
      </section>

      <div className="grid-charts">
        {user.role === 'student' ? (
          <>
            <Chart title="📅 Subject-wise Attendance (%)" data={c1} kind="bar" x="subject" y="percentage" color="#4f46e5" />
            <Chart title="🏆 My Performance (%)" data={c2} kind="bar" x="name" y="percentage" color="#22c55e" />
          </>
        ) : (
          <>
            <Chart title="📈 Attendance Trend (last 7 days, %)" data={c1} kind="line" x="date" y="percentage" color="#4f46e5" />
            <Chart title="📊 Subject-wise Average Marks (%)" data={c2} kind="bar" x="subject" y="average" color="#f59e0b" />
          </>
        )}
      </div>

      <div className="grid-charts">
        {user.role !== 'admin' && (
          <div className="panel">
            <h3>🕒 Today&apos;s Schedule</h3>
            {today.length === 0 && <div className="empty">No classes scheduled for today</div>}
            {today.map((c) => (
              <div className="sched" key={c._id}>
                <div className="sched-time">
                  {to12(c.startTime)}
                  <span>{to12(c.endTime)}</span>
                </div>
                <div>
                  <b>{c.subject}</b>
                  <div className="meta">
                    {[
                      c.room && `Room ${c.room}`,
                      user.role === 'student' ? c.teacher?.name : c.department,
                    ]
                      .filter(Boolean)
                      .join(' • ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="panel">
          <h3>📢 Latest Notices</h3>
          {notices.length === 0 && <div className="empty">No notices at the moment</div>}
          {notices.map((n) => (
            <div className="item" key={n._id}>
              <h4>{n.title}</h4>
              <p>{n.content}</p>
              <div className="meta">
                {n.postedBy?.name} • {new Date(n.createdAt).toLocaleDateString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}