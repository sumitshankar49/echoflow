import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RealTimeClock } from './RealTimeClock';

function mockLocalStorage() {
  const store = new Map<string, string>();
  const localStorageMock = {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
  };

  vi.stubGlobal('localStorage', localStorageMock);
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    configurable: true,
    writable: true,
  });

  return localStorageMock;
}

describe('RealTimeClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-26T10:05:00.000Z'));
    mockLocalStorage();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders date and 12h period by default', () => {
    render(<RealTimeClock />);

    expect(screen.getByText(/26/)).toBeInTheDocument();
    expect(screen.getByText(/AM|PM/)).toBeInTheDocument();
  });

  it('switches to 24H on storage preference change', () => {
    render(<RealTimeClock />);

    localStorage.setItem('profile_clock_pref', '24h');

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'profile_clock_pref' }));
    });

    expect(screen.getByText('24H')).toBeInTheDocument();
  });

  it('ignores storage events for unrelated keys', () => {
    render(<RealTimeClock />);

    localStorage.setItem('profile_clock_pref', '24h');

    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'other_key' }));
    });

    expect(screen.queryByText('24H')).not.toBeInTheDocument();
    expect(screen.getByText(/AM|PM/)).toBeInTheDocument();
  });

  it('falls back when Intl parts are missing and timezone is unknown', () => {
    vi.spyOn(Intl, 'DateTimeFormat').mockImplementation(function (
      this: Intl.DateTimeFormat,
      _locale?: string,
      options?: Intl.DateTimeFormatOptions,
    ) {
      if (options?.weekday) {
        return { format: () => 'Wednesday' } as Intl.DateTimeFormat;
      }
      if (options?.day) {
        return { format: () => '26' } as Intl.DateTimeFormat;
      }
      if (options?.month) {
        return { format: () => 'May' } as Intl.DateTimeFormat;
      }
      if (options?.year) {
        return { format: () => '2026' } as Intl.DateTimeFormat;
      }
      if (options?.timeZoneName === 'short') {
        return {
          formatToParts: () => [],
          resolvedOptions: () => ({ timeZone: 'Mars/Phobos' }),
        } as unknown as Intl.DateTimeFormat;
      }
      if (options?.hour && options?.minute) {
        return {
          formatToParts: () => [{ type: 'dayPeriod', value: 'am' }],
        } as Intl.DateTimeFormat;
      }

      return {
        format: () => '',
        formatToParts: () => [],
        resolvedOptions: () => ({ timeZone: 'Mars/Phobos' }),
      } as unknown as Intl.DateTimeFormat;
    } as unknown as typeof Intl.DateTimeFormat);

    render(<RealTimeClock />);

    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(screen.getByText('AM')).toBeInTheDocument();
  });

  it('updates displayed time as interval advances', () => {
    render(<RealTimeClock />);

    const initialTime = screen.getByText(/\d{2}:\d{2}/).textContent;

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    const updatedTime = screen.getByText(/\d{2}:\d{2}/).textContent;
    expect(updatedTime).not.toBe(initialTime);
  });
});
