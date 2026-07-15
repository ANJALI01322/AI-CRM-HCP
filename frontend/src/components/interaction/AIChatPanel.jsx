import Card from "../common/Card";
import { Bot } from "lucide-react";

export default function AIChatPanel() {
  return (
    <Card className="h-full">
      <div className="flex items-center gap-2 mb-5">
        <Bot className="text-blue-600" />

        <h2 className="text-xl font-semibold">
          AI Meeting Assistant
        </h2>
      </div>

      <textarea
        rows="12"
        placeholder="Describe today's interaction with the doctor..."
        className="w-full border rounded-lg p-3"
      />

      <button
        className="w-full mt-5 bg-green-600 text-white py-3 rounded-lg"
      >
        Generate AI Summary
      </button>

      <div className="mt-6 p-4 bg-slate-100 rounded-lg">
        <h3 className="font-semibold">
          AI Output
        </h3>

        <p className="text-gray-500 mt-2">
          AI-generated summary, extracted entities, products,
          follow-up suggestions, and sentiment will appear here.
        </p>
      </div>
    </Card>
  );
}