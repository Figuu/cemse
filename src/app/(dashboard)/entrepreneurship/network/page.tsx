"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, MessageCircle } from "lucide-react";
import { EntrepreneurshipGrid } from "@/components/entrepreneurship/EntrepreneurshipGrid";
import { MyEntrepreneurshipsGrid } from "@/components/entrepreneurship/MyEntrepreneurshipsGrid";
import { CreateEntrepreneurshipModal } from "@/components/entrepreneurship/CreateEntrepreneurshipModal";
import { EntrepreneurshipFilters } from "@/components/entrepreneurship/EntrepreneurshipFilters";
import { ChatSidebar } from "@/components/entrepreneurship/ChatSidebar";
import { EntrepreneurshipsFilters } from "@/hooks/useEntrepreneurships";

export default function EntrepreneurshipNetworkPage() {
  const [activeTab, setActiveTab] = useState("emprendimientos");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<EntrepreneurshipsFilters>({});
  
  // Chat sidebar state
  const [chatSidebarOpen, setChatSidebarOpen] = useState(false);

  // Chat handlers
  const handleOpenChat = () => {
    setChatSidebarOpen(true);
  };

  const handleCloseChat = () => {
    setChatSidebarOpen(false);
  };

  const handleMinimizeChat = () => {
    setChatSidebarOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Red de Emprendimientos</h1>
        <p className="text-muted-foreground mt-2">
          Descubre emprendimientos innovadores y conecta con otros emprendedores
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger value="emprendimientos" className="flex-1 lg:flex-none">Emprendimientos</TabsTrigger>
            <TabsTrigger value="mis-emprendimientos" className="flex-1 lg:flex-none">Mis Emprendimientos</TabsTrigger>
          </TabsList>

          <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
            {activeTab === "emprendimientos" && (
              <EntrepreneurshipFilters 
                filters={filters} 
                onFiltersChange={setFilters} 
              />
            )}
            <Button variant="outline" onClick={handleOpenChat} className="w-full sm:w-auto">
              <MessageCircle className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Mensajes</span>
              <span className="sm:hidden">Chat</span>
            </Button>
            <Button onClick={() => setShowCreateModal(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Crear Emprendimiento</span>
              <span className="sm:hidden">Crear</span>
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

      {/* Chat Sidebar */}
      <ChatSidebar
        isOpen={chatSidebarOpen}
        onClose={handleCloseChat}
        onMinimize={handleMinimizeChat}
      />
    </div>
  );
}