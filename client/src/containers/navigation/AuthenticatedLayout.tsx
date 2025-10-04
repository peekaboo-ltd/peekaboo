import { Outlet, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { logout } from '@/states/slices/auth.slice';

const AuthenticatedLayout = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  return (
    <main className="min-h-screen">
      <header className="w-full border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/admin" className="font-semibold">Peekaboo Admin</Link>
          <div className="flex items-center gap-3 text-sm">
            <span>{user?.name || user?.email}</span>
            <button className="text-primary underline" onClick={() => dispatch(logout())}>Logout</button>
          </div>
        </div>
      </header>
      <section className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </section>
    </main>
  );
};

export default AuthenticatedLayout;
