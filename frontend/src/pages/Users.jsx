import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { errMsg } from '../utils';

const empty = { name: '', email: '', mobile: '', password: '', role: 'student', department: '', rollNo: '' };

export default function Users() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user.role === 'admin';
  const [role, setRole] = useState(isAdmin ? '' : 'student');
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);

  const load = () => api.get('/users', { params: role ? { role } : {} }).then((r) => setList(r.data));
  useEffect(() => {
    load();
  }, [role]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      toast.success('User created');
      setForm(empty);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const del = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <>
      <header className="topbar">
        <div>
          <h1>{isAdmin ? '👥 Manage Users' : '👨‍🎓 Students'}</h1>
          <p className="sub">{isAdmin ? 'Add or remove students, faculty and admins' : 'All students'}</p>
        </div>
      </header>

      {isAdmin && (
        <form className="panel" onSubmit={add}>
          <h3>Add New User</h3>
          <div className="form-grid">
            <div className="field"><label>Name</label><input value={form.name} onChange={set('name')} required /></div>
            <div className="field"><label>Email</label><input type="email" value={form.email} onChange={set('email')} required /></div>
            <div className="field"><label>Mobile (for OTP)</label><input value={form.mobile} onChange={set('mobile')} placeholder="9876543210" /></div>
            <div className="field"><label>Password (min 8 characters)</label><input value={form.password} onChange={set('password')} required /></div>
            <div className="field">
              <label>Role</label>
              <select value={form.role} onChange={set('role')}>
                <option value="student">Student</option>
                <option value="teacher">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="field"><label>Department</label><input value={form.department} onChange={set('department')} /></div>
            <div className="field"><label>Roll No (students)</label><input value={form.rollNo} onChange={set('rollNo')} /></div>
          </div>
          <div className="row-actions">
            <button className="btn sm">Create User</button>
          </div>
        </form>
      )}

      <div className="panel">
        {isAdmin && (
          <div className="tabs">
            {[['', 'All'], ['student', 'Students'], ['teacher', 'Faculty'], ['admin', 'Admins']].map(([v, l]) => (
              <button key={l} className={role === v ? 'btn sm' : 'btn sm ghost'} onClick={() => setRole(v)}>
                {l}
              </button>
            ))}
          </div>
        )}

        {list.length === 0 && <div className="empty">No users found</div>}
        {list.length > 0 && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Dept</th>
                  <th>Roll No</th>
                  {isAdmin && <th></th>}
                </tr>
              </thead>
              <tbody>
                {list.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.mobile || '-'}</td>
                    <td><span className="pill blue">{u.role === 'teacher' ? 'faculty' : u.role}</span></td>
                    <td>{u.department || '-'}</td>
                    <td>{u.rollNo || '-'}</td>
                    {isAdmin && (
                      <td>
                        {u._id !== user.id && (
                          <button className="btn sm danger" onClick={() => del(u._id)}>Delete</button>
                        )}
                      </td>
                    )}
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