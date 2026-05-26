export function extractElapsedSeconds(payload: unknown): number | null {
  if (typeof payload === 'number' && Number.isFinite(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const value = payload as {
      playedSeconds?: number;
      currentTime?: number;
      currentTarget?: { currentTime?: number };
      target?: { currentTime?: number };
    };

    if (typeof value.playedSeconds === 'number' && Number.isFinite(value.playedSeconds)) {
      return value.playedSeconds;
    }

    if (typeof value.currentTime === 'number' && Number.isFinite(value.currentTime)) {
      return value.currentTime;
    }

    if (typeof value.currentTarget?.currentTime === 'number' && Number.isFinite(value.currentTarget.currentTime)) {
      return value.currentTarget.currentTime;
    }

    if (typeof value.target?.currentTime === 'number' && Number.isFinite(value.target.currentTime)) {
      return value.target.currentTime;
    }
  }

  return null;
}

export function extractDurationSeconds(payload: unknown): number | null {
  if (typeof payload === 'number' && Number.isFinite(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const value = payload as {
      duration?: number;
      currentTarget?: { duration?: number };
      target?: { duration?: number };
    };

    if (typeof value.duration === 'number' && Number.isFinite(value.duration)) {
      return value.duration;
    }

    if (typeof value.currentTarget?.duration === 'number' && Number.isFinite(value.currentTarget.duration)) {
      return value.currentTarget.duration;
    }

    if (typeof value.target?.duration === 'number' && Number.isFinite(value.target.duration)) {
      return value.target.duration;
    }
  }

  return null;
}

export function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
  });
}

export function formatLongDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function relativeFromNow(value: string) {
  const now = Date.now();
  const target = new Date(value).getTime();
  const diffMs = target - now;
  const absMinutes = Math.round(Math.abs(diffMs) / 60000);

  if (absMinutes < 60) {
    return diffMs >= 0 ? `in ${absMinutes}m` : `${absMinutes}m ago`;
  }

  const absHours = Math.round(absMinutes / 60);
  if (absHours < 24) {
    return diffMs >= 0 ? `in ${absHours}h` : `${absHours}h ago`;
  }

  const absDays = Math.round(absHours / 24);
  return diffMs >= 0 ? `in ${absDays}d` : `${absDays}d ago`;
}

export function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return 'EF';
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function guessTrackName(url: string, index: number) {
  const parsed = url.split('/').pop() ?? '';
  const cleaned = decodeURIComponent(parsed)
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[-_]+/g, ' ')
    .trim();

  if (!cleaned) {
    return `Track ${index + 1}`;
  }

  return cleaned.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

