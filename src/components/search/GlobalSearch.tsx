"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  X, 
  Briefcase, 
  Building, 
  User, 
  GraduationCap, 
  School,
  MapPin,
  DollarSign,
  Clock,
  Star,
  TrendingUp
} from "lucide-react";
import { useSearch, SearchResult } from "@/hooks/useSearch";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  className?: string;
  placeholder?: string;
}

export function GlobalSearch({ 
  className, 
  placeholder = "Buscar trabajos, empresas, personas..."
}: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const {
    results,
    suggestions,
    popularSearches,
    isLoading,
    error,
    search,
    getSuggestions,
    clearResults
  } = useSearch();

  // Handle search
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    await search(searchQuery);
    setIsOpen(true);
    setShowSuggestions(false);
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    
    if (value.trim().length > 0) {
      getSuggestions(value);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      clearResults();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    setIsOpen(false);
    setQuery("");
    clearResults();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(query);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setShowSuggestions(false);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getResultIcon = (type: string) => {
    switch (type) {
      case "job":
        return <Briefcase className="h-4 w-4 text-blue-600" />;
      case "company":
        return <Building className="h-4 w-4 text-green-600" />;
      case "youth":
        return <User className="h-4 w-4 text-purple-600" />;
      case "course":
        return <GraduationCap className="h-4 w-4 text-orange-600" />;
      case "institution":
        return <School className="h-4 w-4 text-indigo-600" />;
      default:
        return <Search className="h-4 w-4 text-gray-600" />;
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case "job":
        return "Trabajo";
      case "company":
        return "Empresa";
      case "youth":
        return "Perfil";
      case "course":
        return "Curso";
      case "institution":
        return "Institución";
      default:
        return type;
    }
  };

  return (
    <div ref={searchRef} className={cn("relative", className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => {
            if (query.trim()) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              clearResults();
              setShowSuggestions(false);
            }}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search Results / Suggestions */}
      {(isOpen || showSuggestions) && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
          <CardContent className="p-0">
            {showSuggestions && !isOpen ? (
              // Suggestions
              <div className="p-4">
                {suggestions.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Sugerencias
                    </h4>
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full justify-start h-auto p-2"
                      >
                        <Search className="h-4 w-4 mr-2" />
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                ) : popularSearches.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Búsquedas populares
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {popularSearches.map((search, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestionClick(search)}
                          className="h-8"
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {search}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              // Search Results
              <div className="max-h-96">
                {isLoading ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Buscando...
                    </p>
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-destructive">
                    <p className="text-sm">{error}</p>
                  </div>
                ) : results.length > 0 ? (
                  <ScrollArea className="h-96">
                    <div className="p-2">
                      {results.map((result, index) => (
                        <div
                          key={`${result.type}-${result.id}-${index}`}
                          onClick={() => handleResultClick(result)}
                          className="p-3 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {getResultIcon(result.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium truncate">
                                  {result.title}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {getResultTypeLabel(result.type)}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {result.description}
                              </p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                                {result.metadata.location && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{String(result.metadata.location)}</span>
                                  </div>
                                )}
                                {result.metadata.salary && (
                                  <div className="flex items-center space-x-1">
                                    <DollarSign className="h-3 w-3" />
                                    <span>{String(result.metadata.salary)}</span>
                                  </div>
                                )}
                                {result.metadata.createdAt && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {(() => {
                                        const dateValue = result.metadata.createdAt;
                                        if (dateValue instanceof Date) {
                                          return dateValue.toLocaleDateString();
                                        } else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
                                          return new Date(dateValue).toLocaleDateString();
                                        }
                                        return String(dateValue);
                                      })()}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Star className="h-3 w-3" />
                                <span>{Math.round(result.score)}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="p-4 text-center">
                    <Search className="mx-auto h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      No se encontraron resultados
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
