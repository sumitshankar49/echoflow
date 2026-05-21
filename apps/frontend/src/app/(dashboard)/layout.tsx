import { AppShell } from '@/shared/components/app-shell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
