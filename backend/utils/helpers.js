const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const deptRegex = (d) => new RegExp('^' + esc(String(d).trim()) + '$', 'i');
const todayUTC = () => new Date(new Date().toISOString().slice(0, 10));

module.exports = { esc, deptRegex, todayUTC };