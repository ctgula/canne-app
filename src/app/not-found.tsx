import Header from '@/components/Header';
import EmptyState from '@/components/EmptyState';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/20 to-indigo-100/30">
      <Header />
      <EmptyState 
        type="notFound"
        title="Oops! Page Not Found"
        description="The page you're looking for might have been moved, deleted, or doesn't exist. Let's get you back on track!"
      />
    </div>
  );
} 