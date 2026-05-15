"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import retrieveUsers from "@/modules/users/services/extraction/users";
import { UserType } from "@/modules/users/types/users";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

interface Props {
  value: string;
  onChange: (userId: string, name: string) => void;
  placeholder?: string;
}

export default function UserSearchInput({ value, onChange, placeholder = "Search users..." }: Props) {
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["users-search", search],
    queryFn: async () => {
      const result = await retrieveUsers({ 
        page: 1, 
        limit: 10, 
        search: search || undefined, 
        searchBy: search ? "name" : undefined 
      });
      if (!result) throw new Error("Failed to fetch users");
      return result;
    },
    enabled: open,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const users: UserType[] = data?.data ?? [];

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (user: UserType) => {
    setSearch(user.name);
    setOpen(false);
    onChange(user.id, user.name);
  };

  const handleClear = () => {
    setSearch("");
    onChange("", "");
    setOpen(true);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative group">
        <Input
          value={search}
          onChange={(e) => { 
            setSearch(e.target.value); 
            onChange("", ""); 
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            "h-11 pl-10 pr-10 transition-all focus-visible:ring-primary/20",
            open && "rounded-b-none border-b-transparent"
          )}
        />
        <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        {search && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {isFetching && !data && (
        <div className="absolute right-3 top-3.5">
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {open && (
        <div className="absolute z-50 w-full rounded-b-xl border border-t-0 bg-popover shadow-xl animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="max-h-[280px] overflow-y-auto p-1.5 custom-scrollbar">
            {isFetching && !data ? (
              <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                <span className="text-sm font-medium">Searching people...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                <div className="size-10 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Search className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold">No results found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  We couldn't find anyone matching "{search}"
                </p>
              </div>
            ) : (
              <ul className="space-y-1">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className={cn(
                      "flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-all",
                      "hover:bg-accent hover:shadow-sm",
                      value === user.id && "bg-primary/5 ring-1 ring-primary/20"
                    )}
                    onMouseDown={(e) => { 
                      e.preventDefault(); 
                      handleSelect(user); 
                    }}
                  >
                    <Avatar className="size-9 border-2 border-background shadow-sm">
                      <AvatarImage src={user.image} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0 flex flex-col">
                      <span className="text-sm font-bold truncate leading-tight">
                        {user.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate uppercase tracking-tight">
                        {user.email}
                      </span>
                    </div>

                    {value === user.id && (
                      <div className="size-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check className="size-3 text-primary-foreground" />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {users.length > 0 && (
            <div className="p-2 border-t bg-muted/20 rounded-b-xl">
              <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-widest">
                Showing top {users.length} results
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
