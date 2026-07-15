import Card from "../common/Card";
import { doctors } from "../../constants/mockData";

export default function InteractionForm() {
  return (
    <Card>
      <h2 className="text-xl font-semibold mb-6">
        Log Interaction
      </h2>

      <form className="space-y-5">
        <div>
          <label className="block mb-2 font-medium">
            Healthcare Professional
          </label>

          <select className="w-full border rounded-lg p-3">
            <option>Select Doctor</option>

            {doctors.map((doctor) => (
              <option key={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Visit Type
          </label>

          <select className="w-full border rounded-lg p-3">
            <option>In Person</option>
            <option>Virtual</option>
            <option>Phone Call</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">
            Interaction Notes
          </label>

          <textarea
            rows="7"
            className="w-full border rounded-lg p-3"
            placeholder="Enter meeting notes..."
          />
        </div>

        <button
          type="button"
          className="w-full bg-blue-600 text-white rounded-lg py-3"
        >
          Save Interaction
        </button>
      </form>
    </Card>
  );
}