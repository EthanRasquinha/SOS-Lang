import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export const AIStudyMaterial: React.FC = () => {
  const [materials, setMaterials] = useState<Array<{ id: string; title: string; content: string; date: string }>>([]);
  const [loading, setLoading] = useState(false);

  const fetchStoredMaterials = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/study-materials");
      if (!response.ok) throw new Error("Failed to fetch");
      
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load study materials");
    } finally {
      setLoading(false);
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      await fetch(`/api/study-materials/${id}`, { method: "DELETE" });
      setMaterials(materials.filter(m => m.id !== id));
      toast.success("Material deleted");
    } catch (error) {
      toast.error("Failed to delete material");
    }
  };

  return (
    <div className="min-h-screen font-['Poppins'] bg-[#ebe9e8] p-8 flex flex-col gap-6">
      <h1 className="text-2xl font-bold font-['Poppins'] text-[#004d73]">Study Material Storage</h1>

      <Button
        onClick={fetchStoredMaterials}
        className="bg-[#004d73] hover:bg-[#36718f] text-white px-6 py-3 rounded-md"
        disabled={loading}
      >
        {loading ? "Loading..." : "Load Materials"}
      </Button>

      <div className="flex flex-col gap-4">
        {materials.map((material) => (
          <Card key={material.id} className="bg-white rounded-xl shadow-md p-6">
            <CardHeader>
              <CardTitle className="text-[#004d73] text-lg font-['Poppins']">{material.title}</CardTitle>
              <p className="text-sm text-[#7c7f86]">{material.date}</p>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <p className="text-[#7c7f86] whitespace-pre-line">{material.content}</p>
              <Button
                onClick={() => deleteMaterial(material.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md w-fit"
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AIStudyMaterial;
