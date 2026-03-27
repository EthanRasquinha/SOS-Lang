import * as React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export const AIStudyMaterial: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [aiContent, setAiContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt!");
      return;
    }

    setLoading(true);
    setAiContent(null);

    try {
      // Call your backend endpoint for Gemini API
      const response = await fetch("/api/generate-study-material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("AI request failed");

      const data = await response.json();
      // Assume your backend returns { content: "AI-generated text" }
      setAiContent(data.content);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate AI study material");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen font-['Poppins'] bg-[#ebe9e8] p-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold font-['Poppins'] text-[#004d73]">AI Study Material Generator</h1>

      {/* Prompt input */}
      <Card className="bg-white rounded-xl shadow-md p-6 flex flex-col space-y-4">
        <CardHeader>
          <CardTitle className="text-[#004d73] text-lg font-['Poppins'] font-semibold">Enter your study topic or question</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col space-y-4">
          <Textarea
            placeholder="Type a topic or question..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="bg-[#ebe9e8] focus:bg-white focus:ring-2 focus:ring-[#dc6505]"
          />
          <Button
            onClick={handleSubmit}
            className="bg-[#004d73] hover:bg-[#36718f] text-white px-6 py-3 rounded-md transition-all duration-300 hover:scale-105"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Study Material"}
          </Button>
        </CardContent>
      </Card>

      {/* AI-generated content */}
      {aiContent && (
        <Card className="bg-white rounded-xl shadow-md p-6">
          <CardHeader>
            <CardTitle className="text-[#004d73] text-lg font-['Poppins'] font-semibold">AI-Generated Study Material</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#7c7f86] whitespace-pre-line">{aiContent}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIStudyMaterial;