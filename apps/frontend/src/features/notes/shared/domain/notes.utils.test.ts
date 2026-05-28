import { describe, expect, it } from 'vitest';

import { buildDuplicateNotePayload } from './notes.utils';

describe('buildDuplicateNotePayload', () => {
  it('appends copy suffix for the first duplicate', () => {
    expect(
      buildDuplicateNotePayload({
        title: 'Project ideas',
        content: '<p>Body</p>',
        tags: ['work'],
      }),
    ).toEqual({
      title: 'Project ideas (Copy)',
      content: '<p>Body</p>',
      tags: ['work'],
      isFavorite: false,
    });
  });

  it('increments an existing copy suffix', () => {
    expect(
      buildDuplicateNotePayload({
        title: 'Project ideas (Copy 2)',
        content: '<p>Body</p>',
        tags: [],
      }).title,
    ).toBe('Project ideas (Copy 3)');
  });
});