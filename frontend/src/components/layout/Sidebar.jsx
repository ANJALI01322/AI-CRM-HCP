import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  MessageSquare,
} from "lucide-react";

const menu = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    name: "HCP Directory",
    icon: Users,
    path: "/hcp",
  },
  {
    name: "Log Interaction",
    icon: ClipboardList,
    path: "/interaction",
  },
  {
    name: "AI Chat",
    icon: MessageSquare,
    path: "/chat",
  },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r shadow-sm min-h-screen">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold text-blue-600">
          AI CRM
        </h1>
        <p className="text-sm text-gray-500">
          HCP Management
        </p>
      </div>

      <nav className="p-4 space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-100"
              }`
            }
          >
            <item.icon size={20} />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}