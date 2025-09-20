"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck, User, FileText, Mail } from "lucide-react";
import { ProfileInformationTab } from "@/components/cv-builder/ProfileInformationTab";
import { CVTemplatesTab } from "@/components/cv-builder/CVTemplatesTab";
import { PresentationLettersTab } from "@/components/cv-builder/PresentationLettersTab";
import { CVBuilderProvider } from "@/components/cv-builder/CVBuilderContext";

export default function CVBuilderPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("profile");

  if (!session?.user) {
    return <div>Cargando...</div>;
  }

  return (
    <CVBuilderProvider>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-card shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex justify-center sm:justify-start">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileCheck className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  Constructor de CV
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Crea tu CV profesional y cartas de presentación
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 bg-transparent h-auto p-0">
                  <TabsTrigger 
                    value="profile" 
                    className="flex items-center justify-center sm:justify-start space-x-2 py-3 sm:py-4 px-4 sm:px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-sm sm:text-base"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Información Personal</span>
                    <span className="sm:hidden">Personal</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="templates" 
                    className="flex items-center justify-center sm:justify-start space-x-2 py-3 sm:py-4 px-4 sm:px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-sm sm:text-base"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="hidden sm:inline">Plantillas de CV</span>
                    <span className="sm:hidden">Plantillas</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="letters" 
                    className="flex items-center justify-center sm:justify-start space-x-2 py-3 sm:py-4 px-4 sm:px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-sm sm:text-base"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="hidden sm:inline">Cartas de Presentación</span>
                    <span className="sm:hidden">Cartas</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-4 sm:p-6">
                <TabsContent value="profile" className="mt-0">
                  <ProfileInformationTab />
                </TabsContent>

                <TabsContent value="templates" className="mt-0">
                  <CVTemplatesTab />
                </TabsContent>

                <TabsContent value="letters" className="mt-0">
                  <PresentationLettersTab />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </CVBuilderProvider>
  );
}
