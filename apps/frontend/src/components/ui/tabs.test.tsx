import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

vi.mock('@base-ui/react/tabs', () => {
  const Root = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  const List = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  const Tab = ({ children, ...props }: any) => <button {...props}>{children}</button>;
  const Panel = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  return { Tabs: { Root, List, Tab, Panel } };
});

describe('Tabs', () => {
  it('renders tabs structure', () => {
    render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
        </TabsList>
        <TabsContent value="one">Panel One</TabsContent>
      </Tabs>,
    );

    expect(screen.getByRole('button', { name: 'One' })).toHaveAttribute('data-slot', 'tabs-trigger');
    expect(screen.getByText('Panel One')).toHaveAttribute('data-slot', 'tabs-content');
  });
});
