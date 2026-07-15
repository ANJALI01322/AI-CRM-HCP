import { useState } from "react";
import { askAI } from "../../services/interactionService";

const Interaction = () => {
  const [doctor, setDoctor] = useState("");
  const [product, setProduct] = useState("");
  const [notes, setNotes] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!doctor || !notes) {
      alert("Please fill required fields");
      return;
    }

    setLoading(true);

    const prompt = `
Doctor: ${doctor}
Product: ${product}

Notes:
${notes}
`;

    try {
      const res = await askAI(prompt);
      setResponse(res.data);
    } catch (err) {
      console.log(err);
      alert("AI Processing Failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl p-8">

        <h1 className="text-3xl font-bold mb-6">
          Log HCP Interaction
        </h1>

        <div className="grid grid-cols-2 gap-6">

          <input
            placeholder="Doctor Name"
            value={doctor}
            onChange={(e)=>setDoctor(e.target.value)}
            className="border rounded-lg p-3"
          />

          <input
            placeholder="Product Discussed"
            value={product}
            onChange={(e)=>setProduct(e.target.value)}
            className="border rounded-lg p-3"
          />

        </div>

        <textarea
          placeholder="Write interaction..."
          value={notes}
          onChange={(e)=>setNotes(e.target.value)}
          className="w-full border rounded-lg p-4 h-48 mt-6"
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg mt-6"
        >
          {loading ? "Generating..." : "Generate AI CRM Summary"}
        </button>

        {response && (
          <div className="mt-8 bg-slate-900 text-green-400 rounded-lg p-5">
            <pre className="whitespace-pre-wrap">
              {response}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
};

export default Interaction;