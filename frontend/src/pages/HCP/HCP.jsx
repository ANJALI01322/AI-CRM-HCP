const doctors = [
  {
    id: 1,
    name: "Dr. Rahul Sharma",
    specialty: "Cardiologist",
    hospital: "Apollo Hospital",
    city: "Delhi",
    lastVisit: "Today",
    priority: "High",
  },
  {
    id: 2,
    name: "Dr. Priya Mehta",
    specialty: "Neurologist",
    hospital: "Fortis Hospital",
    city: "Mumbai",
    lastVisit: "Yesterday",
    priority: "Medium",
  },
  {
    id: 3,
    name: "Dr. Amit Verma",
    specialty: "Orthopedic",
    hospital: "Medanta",
    city: "Gurugram",
    lastVisit: "3 days ago",
    priority: "High",
  },
  {
    id: 4,
    name: "Dr. Sneha Kapoor",
    specialty: "Pediatrician",
    hospital: "Max Hospital",
    city: "Noida",
    lastVisit: "1 week ago",
    priority: "Low",
  },
];

const HCP = () => {
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Healthcare Professionals</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition"
          >
            <h2 className="text-xl font-bold">{doctor.name}</h2>

            <p className="text-gray-600">{doctor.specialty}</p>

            <p className="mt-3">
              <strong>Hospital:</strong> {doctor.hospital}
            </p>

            <p>
              <strong>City:</strong> {doctor.city}
            </p>

            <p>
              <strong>Last Visit:</strong> {doctor.lastVisit}
            </p>

            <span
              className={`inline-block mt-4 px-3 py-1 rounded-full text-white ${
                doctor.priority === "High"
                  ? "bg-red-500"
                  : doctor.priority === "Medium"
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
            >
              {doctor.priority} Priority
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HCP;