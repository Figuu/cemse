"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Bell, 
  BellOff,
  ExternalLink,
  Filter,
  Clock
} from "lucide-react";

interface SavedSearch {
  id: string;
  name: string;
  description: string;
  searchTerm: string;
  filters: {
    location: string;
    type: string;
    experience: string;
    salary: string;
    remote: string;
    skills: string[];
  };
  isActive: boolean;
  lastRun: Date;
  resultCount: number;
  createdAt: Date;
}

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | null>(null);

  // Mock data - in real app, this would come from an API
  useEffect(() => {
    const mockSearches: SavedSearch[] = [
      {
        id: "1",
        name: "Desarrollador React CDMX",
        description: "Búsqueda de trabajos de desarrollador React en Ciudad de México",
        searchTerm: "desarrollador react",
        filters: {
          location: "Ciudad de México",
          type: "full-time",
          experience: "2-5 años",
          salary: "25000-50000",
          remote: "yes",
          skills: ["React", "JavaScript", "TypeScript"]
        },
        isActive: true,
        lastRun: new Date("2024-01-15"),
        resultCount: 12,
        createdAt: new Date("2024-01-10")
      },
      {
        id: "2",
        name: "Diseño UX/UI Remoto",
        description: "Oportunidades de diseño UX/UI con trabajo remoto",
        searchTerm: "diseñador ux ui",
        filters: {
          location: "",
          type: "full-time",
          experience: "1-3 años",
          salary: "20000-40000",
          remote: "yes",
          skills: ["Figma", "Sketch", "Adobe Creative Suite"]
        },
        isActive: true,
        lastRun: new Date("2024-01-14"),
        resultCount: 8,
        createdAt: new Date("2024-01-08")
      },
      {
        id: "3",
        name: "Marketing Digital",
        description: "Posiciones de marketing digital en cualquier ubicación",
        searchTerm: "marketing digital",
        filters: {
          location: "",
          type: "",
          experience: "0-2 años",
          salary: "15000-30000",
          remote: "",
          skills: ["Google Ads", "Facebook Ads", "Analytics"]
        },
        isActive: false,
        lastRun: new Date("2024-01-12"),
        resultCount: 25,
        createdAt: new Date("2024-01-05")
      }
    ];

    setTimeout(() => {
      setSearches(mockSearches);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleToggleActive = (searchId: string) => {
    setSearches(prev => prev.map(search =>
      search.id === searchId ? { ...search, isActive: !search.isActive } : search
    ));
  };

  const handleDelete = (searchId: string) => {
    setSearches(prev => prev.filter(search => search.id !== searchId));
  };

  const handleEdit = (search: SavedSearch) => {
    setEditingSearch(search);
    setShowCreateForm(true);
  };

  const handleRunSearch = (search: SavedSearch) => {
    // In a real app, this would navigate to the jobs page with the search parameters
    console.log("Running search:", search);
    // For now, just update the last run time
    setSearches(prev => prev.map(s =>
      s.id === search.id ? { ...s, lastRun: new Date() } : s
    ));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  const getFilterSummary = (filters: SavedSearch["filters"]) => {
    const parts = [];
    if (filters.location) parts.push(filters.location);
    if (filters.type) parts.push(filters.type);
    if (filters.experience) parts.push(filters.experience);
    if (filters.remote === "yes") parts.push("Remoto");
    return parts.join(" • ");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Búsquedas Guardadas</h1>
            <p className="text-muted-foreground">Gestiona tus búsquedas de trabajo guardadas</p>
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Búsquedas Guardadas</h1>
          <p className="text-muted-foreground">
            {searches.length} búsquedas guardadas
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Búsqueda
        </Button>
      </div>

      {/* Active Searches Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{searches.length}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {searches.filter(s => s.isActive).length}
            </div>
            <div className="text-sm text-muted-foreground">Activas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {searches.reduce((sum, s) => sum + s.resultCount, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Resultados Totales</div>
          </CardContent>
        </Card>
      </div>

      {/* Searches List */}
      {searches.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No tienes búsquedas guardadas
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Guarda búsquedas de trabajo para recibir notificaciones automáticas
            </p>
            <Button className="mt-4" onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Búsqueda
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {searches.map(search => (
            <Card key={search.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {search.name}
                      </h3>
                      <Badge variant={search.isActive ? "default" : "secondary"}>
                        {search.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {search.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Search className="h-4 w-4 mr-2" />
                        &ldquo;{search.searchTerm}&rdquo;
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Filter className="h-4 w-4 mr-2" />
                        {getFilterSummary(search.filters)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        Última ejecución: {formatDate(search.lastRun)}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {search.resultCount} resultados encontrados
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRunSearch(search)}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(search.id)}
                    >
                      {search.isActive ? (
                        <BellOff className="h-4 w-4" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(search)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(search.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>
                {editingSearch ? "Editar Búsqueda" : "Nueva Búsqueda Guardada"}
              </CardTitle>
              <CardDescription>
                {editingSearch 
                  ? "Modifica los parámetros de tu búsqueda guardada"
                  : "Crea una nueva búsqueda guardada para recibir notificaciones automáticas"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nombre de la búsqueda</label>
                  <Input
                    placeholder="Ej: Desarrollador React CDMX"
                    defaultValue={editingSearch?.name || ""}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descripción</label>
                  <Input
                    placeholder="Describe qué tipo de trabajos buscas"
                    defaultValue={editingSearch?.description || ""}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Término de búsqueda</label>
                  <Input
                    placeholder="Ej: desarrollador react"
                    defaultValue={editingSearch?.searchTerm || ""}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notifications"
                    defaultChecked={editingSearch?.isActive || false}
                  />
                  <label htmlFor="notifications" className="text-sm">
                    Recibir notificaciones cuando haya nuevos resultados
                  </label>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setShowCreateForm(false)}>
                    {editingSearch ? "Actualizar" : "Crear"} Búsqueda
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
