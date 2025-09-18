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
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-card shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Constructor de CV
                </h1>
                <p className="text-muted-foreground">
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
                <TabsList className="grid w-full grid-cols-3 bg-transparent h-auto p-0">
                  <TabsTrigger 
                    value="profile" 
                    className="flex items-center space-x-2 py-4 px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <User className="h-4 w-4" />
                    <span>Información Personal</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="templates" 
                    className="flex items-center space-x-2 py-4 px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Plantillas de CV</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="letters" 
                    className="flex items-center space-x-2 py-4 px-6 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Cartas de Presentación</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="p-6">
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
