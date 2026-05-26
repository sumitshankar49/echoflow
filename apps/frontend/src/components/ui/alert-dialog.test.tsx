import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';

vi.mock('@radix-ui/react-alert-dialog', () => {
  const Root = ({ children }: any) => <div>{children}</div>;
  const Trigger = ({ children, ...props }: any) => <button {...props}>{children}</button>;
  const Portal = ({ children }: any) => <div>{children}</div>;
  const Overlay = (props: any) => <div {...props} />;
  const Content = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  const Title = ({ children, ...props }: any) => <h2 {...props}>{children}</h2>;
  const Description = ({ children, ...props }: any) => <p {...props}>{children}</p>;
  const Action = ({ children, ...props }: any) => <button {...props}>{children}</button>;
  const Cancel = ({ children, ...props }: any) => <button {...props}>{children}</button>;

  return { Root, Trigger, Portal, Overlay, Content, Title, Description, Action, Cancel };
});

describe('AlertDialog wrappers', () => {
  it('renders alert dialog composition', () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Title</AlertDialogTitle>
            <AlertDialogDescription>Description</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>,
    );

    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });
});
