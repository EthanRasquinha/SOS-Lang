import * as React from "react";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const NoteDashboard: React.FC = () => {
  const [note, setNote] = useState({ title: "", content: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNote((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!note.title || !note.content) {
      toast.error("Please fill in both title and content.");
      return;
    }
    // TODO: Call your AI model API here
    toast.success("Note uploaded to AI model!");
    setNote({ title: "", content: "" });
  };

  return (
    <div className="min-h-screen w-full bg-[#ebe9e8] flex flex-col">
      {/* Top Bar */}
      <header className="w-full bg-[#004d73] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">SOS-Lang Notes Dashboard</h1>
        <Button
          onClick={handleSubmit}
          className="bg-[#dc6505] hover:bg-[#efb486] transition-all duration-300 hover:scale-105"
        >
          Submit to AI
        </Button>
      </header>

      {/* Main Workspace */}
      <main className="flex-grow p-8 flex justify-center items-start animate-fade-in">
        <Card className="w-full max-w-5xl bg-white rounded-xl shadow-md p-8 flex flex-col space-y-6">
          <CardHeader>
            <CardTitle className="text-[#004d73] text-3xl">Create a New Note</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col space-y-4">
            {/* Note Title */}
            <div className="flex flex-col">
              <label htmlFor="title" className="mb-1 text-[#7c7f86] font-medium">
                Note Title
              </label>
              <Input
                id="title"
                name="title"
                value={note.title}
                onChange={handleChange}
                placeholder="Enter a descriptive title"
                className="w-full bg-[#ebe9e8] focus:bg-white focus:ring-2 focus:ring-[#dc6505]"
              />
            </div>

            {/* Note Content */}
            <div className="flex flex-col">
              <label htmlFor="content" className="mb-1 text-[#7c7f86] font-medium">
                Note Content
              </label>
              <Textarea
                id="content"
                name="content"
                value={note.content}
                onChange={handleChange}
                placeholder="Write your note here..."
                rows={15}
                className="w-full bg-[#ebe9e8] focus:bg-white focus:ring-2 focus:ring-[#dc6505]"
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button
              onClick={handleSubmit}
              className="bg-[#004d73] hover:bg-[#36718f] text-white px-6 py-3 rounded-md transition-all duration-300 hover:scale-105"
            >
              Submit Note
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default NoteDashboard;