import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errMsg, to12, todayISO } from '../utils';

const CATS = {
  academic: 'Academic',
  cultural: 'Cultural',
  sports: 'Sports',
  workshop: 'Workshop',
  holiday: 'Holiday',
  other: 'Other',
};
const empty = { title: '', date: '', time: '', venue: '', category: 'academic', description: '' };

function EventCard({ e, canDelete, onDelete, past }) {
  const d = new Date(e.date);
  return (
    <div className={past ? 'ev-card past' : 'ev-card'}>
      <div className="ev-date">
        <b>{d.getUTCDate()}</b>
        <span>{d.toLocaleString('en-IN', { month: 'short', timeZone: 'UTC' })}</span>
      </div>
      <div style={{ flex: 1 }}>
        <div className="item-head">
          <h4>{e.title}</h4>
          <span className="pill blue">{CATS[e.category]}</span>
        </div>
        <div className="meta">
          {[e.time && to12(e.time), e.venue].filter(Boolean).join(' • ') || 'Details to be announced'}
        </div>
        {e.description && <p style={{ marginTop: 8, fontSize: 14 }}>{e.description}</p>}
        {canDelete && (
          <div className="row-actions">
            <button className="btn sm danger" onClick={() => onDelete(e._id)}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Events() {
  const { user } = useAuth();
  const toast = useToast();
  const staff = user.role !== 'student';
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);

  const load = () => api.get('/events').then((r) => setList(r.data));
  useEffect(() => {
    load();
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const upcoming = list.filter((e) => e.date.slice(0, 10) >= todayISO());
  const past = list.filter((e) => e.date.slice(0, 10) < todayISO()).reverse();

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', form);
      toast.success('Event created');
      setForm(empty);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      toast.success('Event deleted');
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const canDelete = (e) => user.role === 'admin' || e.createdBy?._id === user.id;

  return (
    <>
      <header className="topbar">
        <div>
          <h1>🎉 Events</h1>
          <p className="sub">Academic, cultural and sports activities on campus</p>
        </div>
      </header>

      {staff && (
        <form className="panel" onSubmit={add}>
          <h3>Create Event</h3>
          <div className="form-grid">
            <div className="field">
              <label>Title</label>
              <input value={form.title} onChange={set('title')} required />
            </div>
            <div className="field">
              <label>Category</label>
              <select value={form.category} onChange={set('category')}>
                {Object.entries(CATS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Date</label>
              <input type="date" value={form.date} onChange={set('date')} required />
            </div>
            <div className="field">
              <label>Time</label>
              <input type="time" value={form.time} onChange={set('time')} />
            </div>
            <div className="field">
              <label>Venue</label>
              <input value={form.venue} onChange={set('venue')} />
            </div>
            <div className="field full">
              <label>Description</label>
              <textarea rows="2" value={form.description} onChange={set('description')} />
            </div>
          </div>
          <div className="row-actions">
            <button className="btn sm">Create Event</button>
          </div>
        </form>
      )}

      <div className="panel">
        <h3>Upcoming Events</h3>
        {upcoming.length === 0 && <div className="empty">No upcoming events</div>}
        <div className="ev-list">
          {upcoming.map((e) => (
            <EventCard key={e._id} e={e} canDelete={staff && canDelete(e)} onDelete={del} />
          ))}
        </div>
      </div>

      {past.length > 0 && (
        <div className="panel">
          <h3>Past Events</h3>
          <div className="ev-list">
            {past.map((e) => (
              <EventCard key={e._id} e={e} past canDelete={staff && canDelete(e)} onDelete={del} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}