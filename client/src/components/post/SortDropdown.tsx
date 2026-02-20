import { usePostStore } from "@/store/usePostStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SortDropdown = () => {
  const { sortBy, setSortBy } = usePostStore();

  return (
    <div className="flex justify-end mb-4">
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[200px] bg-white border-gray-200 shadow-sm transition-all hover:bg-gray-50/50">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent
          align="end"
          className="bg-white border-gray-100 shadow-lg"
        >
          <SelectItem
            value="latest"
            className="cursor-pointer transition-colors focus:bg-gray-100/50"
          >
            Latest
          </SelectItem>
          <SelectItem
            value="most_liked"
            className="cursor-pointer transition-colors focus:bg-gray-100/50"
          >
            Most liked
          </SelectItem>
          <SelectItem
            value="most_commented"
            className="cursor-pointer transition-colors focus:bg-gray-100/50"
          >
            Most commented
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SortDropdown;
