"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { EntrepreneurshipGrid } from "@/components/entrepreneurship/EntrepreneurshipGrid";
import { MyEntrepreneurshipsGrid } from "@/components/entrepreneurship/MyEntrepreneurshipsGrid";
import { CreateEntrepreneurshipModal } from "@/components/entrepreneurship/CreateEntrepreneurshipModal";
import { EntrepreneurshipFilters } from "@/components/entrepreneurship/EntrepreneurshipFilters";
import { EntrepreneurshipsFilters } from "@/hooks/useEntrepreneurships";

export default function EntrepreneurshipNetworkPage() {
  const [activeTab, setActiveTab] = useState("emprendimientos");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<EntrepreneurshipsFilters>({});

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Red de Emprendimientos</h1>
        <p className="text-muted-foreground mt-2">
          Descubre emprendimientos innovadores y conecta con otros emprendedores
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="emprendimientos">Emprendimientos</TabsTrigger>
            <TabsTrigger value="mis-emprendimientos">Mis Emprendimientos</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {activeTab === "emprendimientos" && (
              <EntrepreneurshipFilters 
                filters={filters} 
                onFiltersChange={setFilters} 
              />
            )}
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Emprendimiento
            </Button>
          </div>
        </div>

        <TabsContent value="emprendimientos" className="space-y-6">
          <EntrepreneurshipGrid filters={filters} />
        </TabsContent>

        <TabsContent value="mis-emprendimientos" className="space-y-6">
          <MyEntrepreneurshipsGrid />
        </TabsContent>
      </Tabs>

      {showCreateModal && (
        <CreateEntrepreneurshipModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            // Refresh data if needed
          }}
        />
      )}
    </div>
  );
}