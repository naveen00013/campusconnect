import { useEffect, useState } from 'react';
import api from './api';

export const errMsg = (e) =>
  e?.response?.data?.message || 'Something went wrong. Please try again.';

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const to12 = (t) => {
  const [h, m] = String(t).split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

export const todayISO = () => new Date().toLocaleDateString('en-CA');

/* date-only fields (stored as UTC midnight) */
export const fmtDay = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

/* timestamps (createdAt etc.) */
export const fmtStamp = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const dayCount = (from, to) =>
  Math.round((new Date(to) - new Date(from)) / 86400000) + 1;
export const openFile = async (name, label) => {
  const r = await api.get(`/files/${name}`, { responseType: 'blob' });
  const url = URL.createObjectURL(r.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = label || name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};

export function useCooldown() {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return [left, () => setLeft(60)];
}

export const FILE_TYPES = '.pdf,.jpg,.jpeg,.png,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip';
export const MAX_MB = 5;