"use client";

import { ProfileFileUpload } from "@/components/profile/ProfileFileUpload";
import { useProfileFiles } from "@/hooks/useProfileFiles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";

export default function ProfileFilesPage() {
  const { files, isLoading, error, uploadFile, deleteFile, viewFile } = useProfileFiles();

  const handleFileUpload = async (files: File[], category: string) => {
    try {
      for (const file of files) {
        await uploadFile(file, category);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Archivos del Perfil</h1>
        <p className="text-muted-foreground">
          Gestiona tus archivos personales, CV, certificados y foto de perfil
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive/50 text-destructive">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Upload Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Picture Upload */}
        <ProfileFileUpload
          onFileUpload={handleFileUpload}
          onFileDelete={deleteFile}
          onFileView={viewFile}
          files={files}
          category="profile-picture"
          maxFiles={1}
          maxSize={5 * 1024 * 1024} // 5MB for profile pictures
        />

        {/* CV Upload */}
        <ProfileFileUpload
          onFileUpload={handleFileUpload}
          onFileDelete={deleteFile}
          onFileView={viewFile}
          files={files}
          category="cv"
          maxFiles={3}
          maxSize={10 * 1024 * 1024} // 10MB for CVs
        />

        {/* Certificates Upload */}
        <ProfileFileUpload
          onFileUpload={handleFileUpload}
          onFileDelete={deleteFile}
          onFileView={viewFile}
          files={files}
          category="certificate"
          maxFiles={10}
          maxSize={10 * 1024 * 1024} // 10MB for certificates
        />

        {/* Other Files Upload */}
        <ProfileFileUpload
          onFileUpload={handleFileUpload}
          onFileDelete={deleteFile}
          onFileView={viewFile}
          files={files}
          category="other"
          maxFiles={5}
          maxSize={10 * 1024 * 1024} // 10MB for other files
        />
      </div>

      {/* File Statistics */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Archivos</CardTitle>
            <CardDescription>
              Resumen de tus archivos subidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {files.filter(f => f.category === "profile-picture").length}
                </div>
                <div className="text-sm text-muted-foreground">Fotos de Perfil</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {files.filter(f => f.category === "cv").length}
                </div>
                <div className="text-sm text-muted-foreground">CVs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {files.filter(f => f.category === "certificate").length}
                </div>
                <div className="text-sm text-muted-foreground">Certificados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {files.filter(f => f.category === "other").length}
                </div>
                <div className="text-sm text-muted-foreground">Otros Archivos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Ayuda con Archivos</CardTitle>
          <CardDescription>
            Información sobre los tipos de archivos que puedes subir
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Foto de Perfil</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Formatos: PNG, JPG, JPEG, GIF, WebP</li>
                <li>• Tamaño máximo: 5MB</li>
                <li>• Recomendado: 400x400px o mayor</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Currículum Vitae</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Formatos: PDF, DOC, DOCX</li>
                <li>• Tamaño máximo: 10MB</li>
                <li>• Máximo 3 archivos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Certificados</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Formatos: PNG, JPG, JPEG, PDF</li>
                <li>• Tamaño máximo: 10MB</li>
                <li>• Máximo 10 archivos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Otros Archivos</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Formatos: Imágenes, PDF, DOC, DOCX</li>
                <li>• Tamaño máximo: 10MB</li>
                <li>• Máximo 5 archivos</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}