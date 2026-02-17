import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";

const EmptyPostsState = () => {
  return (
    <Card className="bg-white flex justify-center">
      <div className="flex flex-col items-center justify-center text-center space-y-3">
        <div className="rounded-full bg-slate-100 p-4">
          <FileText className="h-8 w-8 text-slate-400" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-slate-900">No posts yet</h3>
          <p className="text-sm text-slate-500">
            Be the first to create a post and share your thoughts!
          </p>
        </div>
      </div>
    </Card>
  );
};

export default EmptyPostsState;
