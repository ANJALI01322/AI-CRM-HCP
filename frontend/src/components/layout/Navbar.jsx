import { Bell, Search, UserCircle2 } from "lucide-react";

export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b px-6 flex items-center justify-between">
      <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg w-96">
        <Search size={18} />
        <input
          className="bg-transparent outline-none w-full"
          placeholder="Search doctors..."
        />
      </div>

      <div className="flex items-center gap-5">
        <Bell size={20} />

        <div className="flex items-center gap-2">
          <UserCircle2 size={32} />
          <div>
            <h3 className="font-semibold">
              Medical Rep
            </h3>
            <p className="text-xs text-gray-500">
              Field Representative
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}