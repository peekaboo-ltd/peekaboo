import { useAppDispatch, useAppSelector } from "@/states/hooks";
import { setLogout } from "@/states/slices/auth.slice"
import { UserRole } from "@/types/user.type";
import { Link } from "react-router-dom"

const Dashboard = () => {

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <main className="w-full h-full flex items-center justify-center text-black px-4">
      <section className="max-w-xl w-full flex flex-col items-center gap-6 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center">
          Welcome, {user?.name}
        </h1>
        <p className="text-base sm:text-lg text-center">
          Roles:&nbsp;
          <span className="font-normal">
            {user?.userRoles?.map((role: UserRole) => role.role.name).join(', ') || user?.userRoles?.map((role: UserRole) => role.role.name).join(', ') || "None"}
          </span>
        </p>
        <nav>
          <Link
            to="/logout"
            onClick={e => {
              e.preventDefault();
              dispatch(setLogout());
            }}
            className="inline-block px-5 py-2 rounded bg-primary/80 text-white font-medium hover:bg-primary/90 transition-colors duration-200 text-center"
          >
            Logout
          </Link>
        </nav>
      </section>
    </main>
  )
}

export default Dashboard