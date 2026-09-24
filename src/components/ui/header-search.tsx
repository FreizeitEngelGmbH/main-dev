import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderSearchProps {
  className?: string;
}

export function HeaderSearch({ className }: HeaderSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  
  return (
    <div className={`relative ${className}`}>
      <div className="bg-gray-100 hover:bg-gray-200 transition-colors rounded-full pl-2.5 pr-1 py-0.5 flex items-center w-[140px]" onClick={() => inputRef.current?.focus()}>
        <Search className="h-2.5 w-2.5 text-gray-500 mr-1.5" />
        <Input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="h-5 px-0 text-[0.65rem] bg-transparent border-0 rounded-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
          placeholder="Suche..."
        />
        <button 
          onClick={handleSearch}
          className="bg-primary hover:bg-primary/90 text-white rounded-full p-1 h-4 w-4 flex items-center justify-center text-[0.65rem]"
        >
          <Search className="h-2 w-2" />
        </button>
      </div>
    </div>
  );
}