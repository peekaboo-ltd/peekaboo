import { useAppDispatch, useAppSelector } from "@/states/hooks";
import { setLogout } from "@/states/slices/auth.slice"
import { UserRole } from "@/types/user.type";
import { Link } from "react-router-dom"

const Dashboard = () => {

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <main className="w-full h-screen flex items-center justify-center text-black">Remy {user?.userRoles?.map((role: UserRole) => role.role.name).join(', ')} <Link to="/logout" onClick={(e) => {
      e.preventDefault();
      dispatch(setLogout());
    }}>Logout</Link></main>
  )
}

export default Dashboard