import Card from "../common/Card";
import { Hospital, MapPin, Stethoscope } from "lucide-react";

export default function HCPCard({ doctor }) {
  return (
    <Card className="hover:shadow-lg transition">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            {doctor.name}
          </h2>

          <p className="text-gray-500">
            {doctor.specialization}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex gap-2 items-center">
            <Hospital size={16} />
            {doctor.hospital}
          </div>

          <div className="flex gap-2 items-center">
            <MapPin size={16} />
            {doctor.city}
          </div>

          <div className="flex gap-2 items-center">
            <Stethoscope size={16} />
            Last Visit : {doctor.lastVisit}
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            doctor.status === "Active"
              ? "bg-green-100 text-green-700"
              : doctor.status === "Follow-up"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {doctor.status}
        </span>
      </div>
    </Card>
  );
}