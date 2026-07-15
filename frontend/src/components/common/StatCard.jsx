import Card from "./Card";

export default function StatCard({
  title,
  value,
  icon,
  color = "bg-blue-500",
}) {
  return (
    <Card>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>
        </div>

        <div
          className={`w-14 h-14 rounded-xl ${color} flex items-center justify-center text-white`}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}