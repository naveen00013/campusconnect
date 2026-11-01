import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

/* ====== Edit the text below to match your college ====== */
const COLLEGE = {
  name: 'CampusConnect',
  address: 'Rawatbhata Road, Akelgarh, Kota, Rajasthan - 324010',
  email: 'info@campusconnect.edu',
  phone: '+91 9352575651',
  about:
    'CampusConnect is a modern campus where classroom learning, practical training and innovation come together to prepare students for the industry.',
  vision: 'To develop skilled and responsible professionals through quality education.',
  mission: 'To combine innovative teaching, strong industry connect and technology-driven campus management.',
  values: 'Integrity, discipline, innovation and inclusiveness in everything we do.',
};

const DEPARTMENTS = [
  ['💻', 'Computer Science & Engineering', 'linear-gradient(135deg,#4f46e5,#7c3aed)'],
  ['🌐', 'Information Technology', 'linear-gradient(135deg,#0ea5e9,#2563eb)'],
  ['📡', 'Electronics & Communication', 'linear-gradient(135deg,#ec4899,#be185d)'],
  ['⚙️', 'Mechanical Engineering', 'linear-gradient(135deg,#f59e0b,#d97706)'],
  ['🏗️', 'Civil Engineering', 'linear-gradient(135deg,#10b981,#047857)'],
  ['📊', 'Management Studies', 'linear-gradient(135deg,#8b5cf6,#6d28d9)'],
];

const PROGRAMS = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA', 'B.Sc', 'Diploma'];

const SERVICES = [
  ['📝', 'Admissions', 'Simple application process with guidance and counselling for every program.'],
  ['🧪', 'Examinations & Results', 'Transparent internal assessment and fast, accurate result publishing.'],
  ['📚', 'Central Library', 'A wide collection of books, journals and digital resources with study spaces.'],
  ['🏠', 'Hostel', 'Safe and comfortable accommodation with mess facility and round-the-clock support.'],
  ['🚌', 'Transport', 'Convenient bus routes covering the city and nearby areas.'],
  ['💼', 'Training & Placement', 'Skill training, mock interviews and campus recruitment drives.'],
  ['🔬', 'Research & Innovation', 'Labs, projects and mentorship to turn ideas into real solutions.'],
  ['🏅', 'Sports & Fitness', 'Playgrounds, indoor games and a gym to keep students active.'],
  ['🎭', 'Clubs & Societies', 'Technical, cultural and literary clubs to build skills beyond the classroom.'],
  ['🎓', 'Scholarships', 'Merit-based and need-based scholarships to support deserving students.'],
  ['🩺', 'Health Centre', 'First-aid, regular check-ups and tie-ups with nearby hospitals.'],
  ['📶', 'Wi-Fi Campus', 'High-speed internet across classrooms, labs and the library.'],
];

const FEATURES = [
  ['📅', 'Smart Attendance', 'Faculty marks the whole class in one click and students track their percentage live.'],
  ['📝', 'Online Assignments', 'Create assignments, set deadlines and collect submissions online.'],
  ['🏆', 'Instant Results', 'Marks are published as soon as they are entered, with grades and performance charts.'],
  ['🔔', 'Live Notices', 'One notice reaches everyone instantly, with separate audiences for students and faculty.'],
  ['📊', 'Analytics Dashboard', 'Attendance trends and subject-wise performance in clear charts.'],
  ['🔒', 'Secure Access', 'Encrypted passwords, token-based login and role-based access control.'],
];

const FAQS = [
  ['How do I log in?', 'Click the Login button at the top and choose Student Login or Faculty Login. Use the email and password provided by your college.'],
  ['I forgot my password. What should I do?', 'Use the "Forgot password?" link on the login page. An OTP will be sent to your registered email and mobile number.'],
  ['When is my attendance updated?', 'Faculty marks attendance after each class and it appears in your dashboard immediately.'],
  ['How do I submit an assignment?', 'Open Assignments in your dashboard, write your answer or paste a link, and click Submit before the due date.'],
  ['Who can post notices?', 'Only faculty and administration can post notices. Students can read the notices meant for them.'],
];

const NAV = [
  ['home', 'Home'],
  ['about', 'About'],
  ['academics', 'Academics'],
  ['services', 'Services'],
  ['notices', 'Notices'],
  ['faq', 'FAQ'],
  ['contact', 'Contact'],
];
/* ================================================================ */

const PORTALS = [
  {
    key: 'student', cls: 's', icon: '🎓', title: 'Student Corner',
    desc: 'Your personal space for everything academic.',
    points: ['Subject-wise attendance report', 'Submit assignments online', 'View marks and grades', 'Notices and updates'],
    btn: 'Student Login',
  },
  {
    key: 'teacher', cls: 't', icon: '👩‍🏫', title: 'Faculty Portal',
    desc: 'Smart tools for faculty to manage their classes.',
    points: ['Mark attendance in one click', 'Create assignments and review submissions', 'Enter and manage marks', 'Post notices to students'],
    btn: 'Faculty Login',
  },
];

function useCount(target, ms = 1200) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf;
    let start;
    const step = (t) => {
      start = start ?? t;
      const p = Math.min((t - start) / ms, 1);
      setN(Math.round(target * p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

function Stat({ value, label }) {
  const n = useCount(value);
  return (
    <div className="lp-stat">
      <b>{n}</b>
      <span>{label}</span>
    </div>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [dd, setDd] = useState(false);
  const ddRef = useRef(null);
  const [data, setData] = useState({ students: 0, teachers: 0, noticeCount: 0, notices: [] });

  useEffect(() => {
    api.get('/public/overview').then((r) => setData(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setDd(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const ticker = data.notices.length
    ? data.notices.map((n) => n.title)
    : ['Welcome to CampusConnect', 'One portal for students, faculty and administration'];
  const loop = [...ticker, ...ticker, ...ticker, ...ticker];

  return (
    <div className="lp">
      {/* NAVBAR */}
      <header className="lp-nav">
        <div className="lp-container lp-nav-in">
          <a href="#home" className="lp-brand">
            <span className="lp-logo">🎓</span>
            {COLLEGE.name}
          </a>
          <button className="lp-burger" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? '✕' : '☰'}
          </button>
          <nav className={`lp-links ${open ? 'open' : ''}`}>
            {NAV.map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
                {label}
              </a>
            ))}
            {user ? (
              <Link to={`/${user.role}`} className="lp-btn lp-btn-primary sm">
                Dashboard →
              </Link>
            ) : (
              <div className="lp-dd" ref={ddRef}>
                <button className="lp-btn lp-btn-primary sm" onClick={() => setDd(!dd)}>
                  Login ▾
                </button>
                {dd && (
                  <div className="lp-dd-menu">
                    <Link to="/login?role=student">🎓 Student Login</Link>
                    <Link to="/login?role=teacher">👩‍🏫 Faculty Login</Link>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* TICKER */}
      <div className="lp-ticker">
        <span className="lp-ticker-label">📢 LATEST</span>
        <div className="lp-ticker-track">
          <div className="lp-ticker-move">
            {loop.map((t, i) => (
              <span key={i}>• {t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* HERO */}
      <section id="home" className="lp-hero">
        <div className="lp-container lp-hero-grid">
          <div>
            <span className="lp-pill">🎓 Smart Campus Management</span>
            <h1>
              Your Campus,
              <br />
              <em>One Connected Portal</em>
            </h1>
            <p>
              Attendance, assignments, results and notices, everything in one place. A modern,
              secure and easy-to-use portal for students, faculty and administration.
            </p>
            <div className="lp-hero-actions">
              <a className="lp-btn lp-btn-white" href="#about">
                Explore Campus
              </a>
              <a className="lp-btn lp-btn-ghost" href="#notices">
                Latest Notices
              </a>
            </div>
            <div className="lp-trust">
              <span>✔ Secure Login</span>
              <span>✔ Role-based Access</span>
              <span>✔ Real-time Updates</span>
            </div>
          </div>

          <div className="lp-art">
            <div className="lp-float a">✅ Attendance marked</div>
            <div className="lp-window">
              <div className="lp-dots">
                <i style={{ background: '#f87171' }} />
                <i style={{ background: '#fbbf24' }} />
                <i style={{ background: '#4ade80' }} />
              </div>
              <div className="lp-mini-grid">
                <div className="lp-mini"><b>92%</b><span>Attendance</span></div>
                <div className="lp-mini"><b>2</b><span>Pending</span></div>
                <div className="lp-mini"><b>85%</b><span>Result</span></div>
              </div>
              <div className="lp-bars">
                {[55, 80, 65, 95, 72, 88, 60].map((h, i) => (
                  <i key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            <div className="lp-float b">🔔 New notice posted</div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="lp-stats">
        <div className="lp-container">
          <div className="lp-stats-grid">
            <Stat value={data.students} label="Students" />
            <Stat value={data.teachers} label="Faculty" />
            <Stat value={data.noticeCount} label="Notices Published" />
            <Stat value={DEPARTMENTS.length} label="Departments" />
          </div>
        </div>
      </div>

      {/* PORTAL ACCESS */}
      <section id="portals" className="lp-sec">
        <div className="lp-container">
          <div className="lp-head">
            <span className="lp-eyebrow">Portal Access</span>
            <h2>Sign in to Your Portal</h2>
            <p>A dedicated, secure dashboard for students and faculty.</p>
          </div>
          <div className="lp-portals two">
            {PORTALS.map((p) => (
              <div className="lp-portal" key={p.key}>
                <div className={`ico ${p.cls}`}>{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <ul>
                  {p.points.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
                <Link className="lp-btn lp-btn-primary" to={`/login?role=${p.key}`}>
                  {p.btn} →
                </Link>
              </div>
            ))}
          </div>
          <p className="lp-note">
            Login credentials are issued by the college administration.
          </p>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="lp-sec alt">
        <div className="lp-container">
          <div className="lp-head">
            <span className="lp-eyebrow">About Us</span>
            <h2>Learning That Prepares You for Tomorrow</h2>
            <p>{COLLEGE.about}</p>
          </div>
          <div className="lp-values">
            {[
              ['🎯', 'Our Vision', COLLEGE.vision],
              ['🚀', 'Our Mission', COLLEGE.mission],
              ['💎', 'Our Values', COLLEGE.values],
            ].map(([icon, title, text]) => (
              <div className="lp-value" key={title}>
                <div className="vi">{icon}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACADEMICS */}
      <section id="academics" className="lp-sec">
        <div className="lp-container">
          <div className="lp-head">
            <span className="lp-eyebrow">Academics</span>
            <h2>Departments & Programs</h2>
            <p>Diverse streams, one connected campus.</p>
          </div>
          <div className="lp-depts">
            {DEPARTMENTS.map(([icon, name, bg]) => (
              <div className="lp-dept" key={name} style={{ background: bg }}>
                <span className="e">{icon}</span>
                {name}
              </div>
            ))}
          </div>
          <div className="lp-chips-wrap">
            <h3>Programs Offered</h3>
            <div className="lp-chips">
              {PROGRAMS.map((p) => (
                <span className="lp-chip" key={p}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="lp-sec alt">
        <div className="lp-container">
          <div className="lp-head">
            <span className="lp-eyebrow">Campus Life</span>
            <h2>Facilities & Services</h2>
            <p>Everything a student needs, right on campus.</p>
          </div>
          <div className="lp-services">
            {SERVICES.map(([icon, title, text]) => (
              <div className="lp-svc" key={title}>
                <div className="si">{icon}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="lp-sec">
        <div className="lp-container">
          <div className="lp-head">
            <span className="lp-eyebrow">Smart Portal</span>
            <h2>Everything in One Place</h2>
            <p>Built with modern technology to simplify every college task.</p>
          </div>
          <div className="lp-feats">
            {FEATURES.map(([icon, title, text]) => (
              <div className="lp-feat" key={title}>
                <div className="fi">{icon}</div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NOTICES */}
      <section id="notices" className="lp-sec alt">
        <div className="lp-container">
          <div className="lp-head">
            <span className="lp-eyebrow">Announcements</span>
            <h2>Notice Board</h2>
            <p>Latest news and important updates from the college.</p>
          </div>
          <div className="lp-notice-grid">
            <div className="lp-board">
              <div className="lp-board-head">📢 Latest Notices</div>
              {data.notices.length === 0 && (
                <div className="lp-empty">No notices at the moment</div>
              )}
              {data.notices.map((n) => {
                const d = new Date(n.createdAt);
                return (
                  <div className="lp-notice" key={n._id}>
                    <div className="lp-date">
                      <b>{d.getDate()}</b>
                      <span>{d.toLocaleString('en-IN', { month: 'short' })}</span>
                    </div>
                    <div>
                      <h4>{n.title}</h4>
                      <p>{n.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lp-side">
              <div className="lp-side-card lp-quick">
                <h3>🔗 Quick Links</h3>
                <a href="#academics">Academics <span>→</span></a>
                <a href="#services">Facilities & Services <span>→</span></a>
                <a href="#faq">FAQ <span>→</span></a>
                <a href="#contact">Contact Us <span>→</span></a>
              </div>
              <div className="lp-side-card lp-help">
                <h3>💬 Help Desk</h3>
                <p>📧 {COLLEGE.email}</p>
                <p>📞 {COLLEGE.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EVENTS */}
      {(data.events || []).length > 0 && (
        <section id="events" className="lp-sec ev">
          <div className="lp-container">
            <div className="lp-head">
              <span className="lp-eyebrow">What&apos;s Happening</span>
              <h2>Upcoming Events</h2>
              <p>Stay updated with academic, cultural and sports activities on campus.</p>
            </div>
            <div className="lp-events">
              {data.events.map((e) => {
                const d = new Date(e.date);
                return (
                  <div className="lp-event" key={e._id}>
                    <div className="lp-date">
                      <b>{d.getUTCDate()}</b>
                      <span>{d.toLocaleString('en-IN', { month: 'short', timeZone: 'UTC' })}</span>
                    </div>
                    <div>
                      <span className="lp-cat">{e.category}</span>
                      <h4>{e.title}</h4>
                      <p>{[e.time, e.venue].filter(Boolean).join(' • ')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" className="lp-sec">
        <div className="lp-container">
          <div className="lp-head">
            <span className="lp-eyebrow">Help</span>
            <h2>Frequently Asked Questions</h2>
          </div>
          <div className="lp-faq">
            {FAQS.map(([q, a]) => (
              <details className="lp-q" key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-cta">
        <div className="lp-container">
          <h2>Have a Question?</h2>
          <p>Reach out to the college office for admissions, support or general queries.</p>
          <a className="lp-btn lp-btn-white" href="#contact">
            Contact Us →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="lp-foot">
        <div className="lp-container">
          <div className="lp-foot-grid">
            <div>
              <a href="#home" className="lp-brand">
                <span className="lp-logo">🎓</span>
                {COLLEGE.name}
              </a>
              <p>A modern campus management portal connecting students, faculty and administration.</p>
            </div>
            <div>
              <h4>Explore</h4>
              <a href="#about">About</a>
              <a href="#academics">Academics</a>
              <a href="#services">Services</a>
              <a href="#notices">Notices</a>
            </div>
            <div>
              <h4>Resources</h4>
              <a href="#portals">Student Corner</a>
              <a href="#portals">Faculty Portal</a>
              <a href="#features">Portal Features</a>
              <a href="#faq">FAQ</a>
            </div>
            <div>
              <h4>Contact</h4>
              <span style={{ display: 'block', padding: '5px 0' }}>📍 {COLLEGE.address}</span>
              <span style={{ display: 'block', padding: '5px 0' }}>📧 {COLLEGE.email}</span>
              <span style={{ display: 'block', padding: '5px 0' }}>📞 {COLLEGE.phone}</span>
            </div>
          </div>
          <div className="lp-copy">
            © {new Date().getFullYear()} {COLLEGE.name}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}