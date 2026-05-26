import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from './select';

vi.mock('@base-ui/react/select', () => {
  const Root = ({ children }: any) => <div data-slot="select-root">{children}</div>;
  const Group = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  const Value = ({ children, ...props }: any) => <span {...props}>{children}</span>;
  const Trigger = ({ children, ...props }: any) => <button {...props}>{children}</button>;
  const Icon = ({ children }: any) => <span>{children}</span>;
  const Portal = ({ children }: any) => <div>{children}</div>;
  const Positioner = ({
    children,
    sideOffset,
    alignOffset,
    alignItemWithTrigger,
    ...props
  }: any) => (
    <div {...props}>
      {children}
    </div>
  );
  const Popup = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  const List = ({ children }: any) => <div>{children}</div>;
  const GroupLabel = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  const Item = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  const ItemText = ({ children, ...props }: any) => <span {...props}>{children}</span>;
  const ItemIndicator = ({ children }: any) => <span>{children}</span>;
  const Separator = (props: any) => <div {...props} />;
  const ScrollUpArrow = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  const ScrollDownArrow = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  return {
    Select: {
      Root,
      Group,
      Value,
      Trigger,
      Icon,
      Portal,
      Positioner,
      Popup,
      List,
      GroupLabel,
      Item,
      ItemText,
      ItemIndicator,
      Separator,
      ScrollUpArrow,
      ScrollDownArrow,
    },
  };
});

describe('Select', () => {
  it('renders trigger, value, and content/item wrappers', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue>Pick one</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Group A</SelectLabel>
            <SelectItem value="a">Option A</SelectItem>
          </SelectGroup>
          <SelectSeparator />
        </SelectContent>
      </Select>,
    );

    expect(screen.getByText('Group A')).toHaveAttribute('data-slot', 'select-label');
    expect(screen.getByText('Pick one')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'select-trigger');
  });
});
