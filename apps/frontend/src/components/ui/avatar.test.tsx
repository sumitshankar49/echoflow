import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from './avatar';

vi.mock('@base-ui/react/avatar', () => {
  const Root = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  const Image = (props: any) => <img alt="avatar" {...props} />;
  const Fallback = ({ children, ...props }: any) => <span {...props}>{children}</span>;
  return { Avatar: { Root, Image, Fallback } };
});

describe('Avatar', () => {
  it('renders avatar root and image/fallback', () => {
    render(
      <Avatar>
        <AvatarImage src="/x.png" />
        <AvatarFallback>CS</AvatarFallback>
      </Avatar>,
    );

    expect(screen.getByAltText('avatar')).toBeInTheDocument();
    expect(screen.getByText('CS')).toHaveAttribute('data-slot', 'avatar-fallback');
  });

  it('renders avatar group and count', () => {
    render(
      <AvatarGroup>
        <Avatar />
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>,
    );

    expect(screen.getByText('+3')).toHaveAttribute('data-slot', 'avatar-group-count');
  });
});
