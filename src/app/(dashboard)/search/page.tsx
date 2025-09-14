"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { AdvancedSearch } from "@/components/search/AdvancedSearch";

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState("quick");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Búsqueda</h1>
        <p className="text-muted-foreground mt-2">
          Encuentra trabajos, empresas, personas y cursos que te interesen
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quick">Búsqueda Rápida</TabsTrigger>
          <TabsTrigger value="advanced">Búsqueda Avanzada</TabsTrigger>
        </TabsList>

        <TabsContent value="quick">
          <div className="max-w-2xl mx-auto">
            <GlobalSearch 
              placeholder="Buscar trabajos, empresas, personas, cursos..."
              showFilters={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <AdvancedSearch />
        </TabsContent>
      </Tabs>
    </div>
  );
}
