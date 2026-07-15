import { useState } from "react";
import { askAI } from "../../services/interactionService";

const Chat = () => {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const handleSubmit = async () => {
    if (!notes.trim()) return;

    setLoading(true);

    try {
      const res = await askAI(notes);
      setResponse(res.data);
    } catch (error) {
      console.error(error);
      alert("Failed to generate AI response.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6">

        <h1 className="text-3xl font-bold mb-2">
          AI CRM Assistant
        </h1>

        <p className="text-gray-500 mb-6">
          Chat with AI to automatically log HCP interactions.
        </p>

        <textarea
          className="w-full border rounded-lg p-4 h-52"
          placeholder="Example: Visited Dr Rahul Sharma today. Discussed CardioPlus. Doctor requested samples and follow-up next week."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          {loading ? "Generating..." : "Generate AI Summary"}
        </button>

        {response && (
          <div className="mt-8 bg-gray-100 rounded-lg p-5">
            <h2 className="font-bold text-xl mb-3">
              AI Response
            </h2>

          <div className="bg-slate-900 text-green-400 rounded-lg p-4 overflow-auto">
            <pre className="whitespace-pre-wrap text-sm">
             {response}
            </pre>
          </div>  

            
          </div>
        )}

      </div>
    </div>
  );
};

export default Chat;