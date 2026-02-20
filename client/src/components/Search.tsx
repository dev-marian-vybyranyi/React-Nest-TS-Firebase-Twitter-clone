import { liteClient as algoliasearch } from "algoliasearch/lite";
import {
  InstantSearch,
  SearchBox,
  Hits,
  Highlight,
  useSearchBox,
} from "react-instantsearch";
import { useState } from "react";
import { Link } from "react-router-dom";

const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID || "",
  import.meta.env.VITE_ALGOLIA_SEARCH_KEY || "",
);

const Hit = ({ hit }: { hit: any }) => {
  return (
    <Link
      to={`/post/${hit.objectID}`}
      className="flex items-center gap-3 p-3 hover:bg-slate-100 cursor-pointer transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {hit.user?.photo ? (
            <img
              src={hit.user.photo}
              alt="avatar"
              className="w-5 h-5 rounded-full object-cover"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-500">
              {hit.user?.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <span className="font-bold text-sm text-slate-900">
            {hit.user?.name} {hit.user?.surname}
          </span>
        </div>
        <div className="text-sm text-slate-700">
          <Highlight attribute="text" hit={hit} />
        </div>
      </div>

      {hit.photo && (
        <img
          src={hit.photo}
          alt="Post content"
          className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-100"
        />
      )}
    </Link>
  );
};

export const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative w-full max-w-sm ml-4">
      <InstantSearch searchClient={searchClient} indexName="posts">
        <GlobalSearchContent isOpen={isOpen} setIsOpen={setIsOpen} />
      </InstantSearch>
    </div>
  );
};

const GlobalSearchContent = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}) => {
  const { query } = useSearchBox();

  return (
    <>
      <div
        className="relative"
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
      >
        <SearchBox
          classNames={{
            root: "w-full",
            form: "relative flex items-center",
            input:
              "w-full h-9 px-4 rounded-full border border-slate-200 bg-slate-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none",
            submitIcon: "hidden",
            resetIcon: "hidden",
          }}
          placeholder="Search posts..."
        />
      </div>

      {isOpen && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden z-50 max-h-96 overflow-y-auto w-[400px]">
          <Hits
            hitComponent={Hit}
            classNames={{
              root: "w-full",
              list: "flex flex-col",
              item: "w-full",
            }}
          />
        </div>
      )}
    </>
  );
};
