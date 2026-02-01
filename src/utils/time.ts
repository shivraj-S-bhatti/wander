export function formatRelative(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return mins <= 1 ? 'just now' : `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}
