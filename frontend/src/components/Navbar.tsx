import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserInfo } from "../services/userService";

type UserProfile = {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
};

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);

  const linkStyle = "block px-4 py-2 rounded-lg transition";
  const activeStyle = "bg-blue-600 text-white";
  const inactiveStyle = "text-slate-700 hover:bg-slate-200";

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getUserInfo();
        setUser(data);
      } catch {
        setUser(null);
      }
    }

    loadUser();
  }, []);

  function handleLogout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("isAdmin");
    navigate("/login");
  }
  return (
    <aside className="w-60 bg-white shadow-md p-6 flex flex-col">
      <div className="mb-8 flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold text-blue-600">PeerPrep</h1>

        <button
          onClick={handleLogout}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
        >
          Logout
        </button>
      </div>

      <nav className="flex flex-col gap-3">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `${linkStyle} ${isActive ? activeStyle : inactiveStyle}`
          }
        >
          Home
        </NavLink>

        <NavLink
          to="/collab"
          className={({ isActive }) =>
            `${linkStyle} ${isActive ? activeStyle : inactiveStyle}`
          }
        >
          Collab
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${linkStyle} ${isActive ? activeStyle : inactiveStyle}`
          }
        >
          Profile
        </NavLink>

        {user?.isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeStyle : inactiveStyle}`
            }
          >
            Admin
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
