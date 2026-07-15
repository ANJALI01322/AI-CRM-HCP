import {
  Users,
  CalendarCheck,
  MessageSquare,
  Activity,
} from "lucide-react";

import StatCard from "../../components/common/StatCard";
import RecentActivity from "../../components/dashboard/RecentActivity";

export default function Dashboard() {
  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold">
          Welcome Back 👋
        </h1>

        <p className="text-gray-500 mt-2">
          AI CRM for Healthcare Professionals
        </p>
      </div>

      <div className="grid grid-cols-4 gap-6">

        <StatCard
          title="Total HCPs"
          value="248"
          color="bg-blue-600"
          icon={<Users />}
        />

        <StatCard
          title="Today's Visits"
          value="12"
          color="bg-green-600"
          icon={<CalendarCheck />}
        />

        <StatCard
          title="Interactions"
          value="845"
          color="bg-orange-500"
          icon={<MessageSquare />}
        />

        <StatCard
          title="Follow-ups"
          value="31"
          color="bg-purple-600"
          icon={<Activity />}
        />

      </div>

      <RecentActivity />

    </div>
  );
}