const activities = [
  {
    doctor: "Dr. Rahul Sharma",
    action: "Interaction Logged",
    time: "10 mins ago",
  },
  {
    doctor: "Dr. Priya Mehta",
    action: "Follow-up Scheduled",
    time: "1 hour ago",
  },
  {
    doctor: "Dr. Amit Verma",
    action: "AI Summary Generated",
    time: "Today",
  },
  {
    doctor: "Dr. Sneha Kapoor",
    action: "CardioPlus Discussed",
    time: "Yesterday",
  },
];

const RecentActivity = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-5">
        Recent Activities
      </h2>

      {activities.map((item, index) => (
        <div
          key={index}
          className="flex justify-between items-center border-b py-4 last:border-0"
        >
          <div>
            <p className="font-semibold">{item.doctor}</p>
            <p className="text-gray-500">{item.action}</p>
          </div>

          <span className="text-sm text-gray-400">
            {item.time}
          </span>
        </div>
      ))}
    </div>
  );
};

export default RecentActivity;