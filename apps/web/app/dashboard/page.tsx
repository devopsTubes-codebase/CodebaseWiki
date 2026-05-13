import { DashboardClient } from '@/components/dashboard/DashboardClient';

type DashboardPageProps = {
  searchParams?: {
    source?: 'github-actions' | 'git-url' | 'zip-file';
  };
};

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  return <DashboardClient source={searchParams?.source} />;
}
