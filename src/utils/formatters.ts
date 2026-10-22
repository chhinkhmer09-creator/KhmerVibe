export function formatViews(views: number = 0, lang: string = 'km'): string {
  if (views >= 1_000_000) {
    const val = (views / 1_000_000).toFixed(1).replace(/\.0$/, '');
    return lang === 'km' ? `${val} លាន` : `${val}M`;
  }
  if (views >= 1_000) {
    const val = (views / 1_000).toFixed(1).replace(/\.0$/, '');
    return lang === 'km' ? `${val} ពាន់` : `${val}K`;
  }
  return views.toLocaleString();
}

export function formatDuration(seconds: number = 0): string {
  if (!seconds || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hrs = Math.floor(mins / 60);

  if (hrs > 0) {
    const remMins = mins % 60;
    return `${hrs}:${remMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatTimeAgo(isoString: string, lang: string = 'km'): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.max(1, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (lang === 'km') {
    if (diffSec < 60) return 'មុននេះបន្តិច';
    const mins = Math.floor(diffSec / 60);
    if (mins < 60) return `មុននេះ ${mins} នាទី`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `មុននេះ ${hrs} ម៉ោង`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `មុននេះ ${days} ថ្ងៃ`;
    const months = Math.floor(days / 30);
    if (months < 12) return `មុននេះ ${months} ខែ`;
    return `មុននេះ ${Math.floor(days / 365)} ឆ្នាំ`;
  } else {
    if (diffSec < 60) return 'Just now';
    const mins = Math.floor(diffSec / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  }
}
