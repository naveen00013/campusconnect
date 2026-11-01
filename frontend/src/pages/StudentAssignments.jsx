import { useEffect, useState } from 'react';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { errMsg, fmtDay, openFile, FILE_TYPES, MAX_MB } from '../utils';

export default function StudentAssignments() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [text, setText] = useState({});
  const [files, setFiles] = useState({});

  const load = () => api.get('/assignments').then((r) => setList(r.data));
  useEffect(() => {
    load();
  }, []);

  const pick = (id, f) => {
    if (f && f.size > MAX_MB * 1024 * 1024) {
      toast.error(`File is too large (maximum ${MAX_MB} MB)`);
      return;
    }
    setFiles({ ...files, [id]: f });
  };

  const submit = async (id) => {
    const fd = new FormData();
    fd.append('text', text[id] || '');
    if (files[id]) fd.append('file', files[id]);
    try {
      const { data } = await api.post(`/assignments/${id}/submit`, fd);
      toast.success(data.message);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const dl = (f) => openFile(f.file, f.name).catch(() => toast.error('Unable to download the file'));

  return (
    <>
      <header className="topbar">
        <div>
          <h1>📝 Assignments</h1>
          <p className="sub">View your assignments and submit your work</p>
        </div>
      </header>

      <div className="panel">
        {list.length === 0 && <div className="empty">No assignments yet</div>}
        {list.map((a) => {
          const overdue = !a.submitted && new Date(a.dueDate) < new Date();
          return (
            <div className="item" key={a._id}>
              <div className="item-head">
                <div>
                  <h4>{a.title}</h4>
                  <div className="meta">
                    {a.subject} • Due: {fmtDay(a.dueDate)} • {a.createdBy?.name}
                  </div>
                </div>
                {a.submitted ? (
                  <span className="pill green">Submitted</span>
                ) : overdue ? (
                  <span className="pill red">Overdue</span>
                ) : (
                  <span className="pill amber">Pending</span>
                )}
              </div>
              {a.description && <p>{a.description}</p>}
              {a.attachment && (
                <div className="row-actions">
                  <button className="btn sm ghost" onClick={() => dl(a.attachment)}>
                    📎 {a.attachment.name}
                  </button>
                </div>
              )}

              {a.submitted ? (
                <div className="meta" style={{ marginTop: 10 }}>
                  {a.mySubmission?.file && (
                    <button className="btn sm ghost" onClick={() => dl(a.mySubmission.file)}>
                      📎 Your file: {a.mySubmission.file.name}
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="field">
                    <textarea
                      rows="3"
                      placeholder="Write your answer or paste a link (optional if you attach a file)"
                      value={text[a._id] || ''}
                      onChange={(e) => setText({ ...text, [a._id]: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <input type="file" accept={FILE_TYPES} onChange={(e) => pick(a._id, e.target.files[0])} />
                  </div>
                  <div className="row-actions">
                    <button className="btn sm" onClick={() => submit(a._id)}>
                      Submit
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}