import { Card } from "@/components/ui/card";

const PostCardSkeleton = () => {
  return (
    <Card className="overflow-hidden shadow-sm bg-white py-4 gap-6">
      <div className="flex items-center gap-3 px-4">
        <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-32 rounded bg-slate-200 animate-pulse" />
          <div className="h-3 w-20 rounded bg-slate-200 animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4">
        <div className="h-5 w-3/4 rounded bg-slate-200 animate-pulse" />
        <div className="h-4 w-full rounded bg-slate-200 animate-pulse" />
        <div className="h-4 w-5/6 rounded bg-slate-200 animate-pulse" />
      </div>

      <div className="w-full h-48 bg-slate-200 animate-pulse" />

      <div className="flex items-center gap-4 px-4">
        <div className="h-8 w-16 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-8 w-16 rounded-full bg-slate-200 animate-pulse" />
        <div className="h-8 w-20 rounded-full bg-slate-200 animate-pulse" />
      </div>
    </Card>
  );
};

export default PostCardSkeleton;
