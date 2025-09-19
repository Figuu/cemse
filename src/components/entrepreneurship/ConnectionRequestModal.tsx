"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEntrepreneurshipConnections } from "@/hooks/useEntrepreneurshipConnections";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface ConnectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  entrepreneurshipName: string;
}

export function ConnectionRequestModal({
  isOpen,
  onClose,
  targetUser,
  entrepreneurshipName,
}: ConnectionRequestModalProps) {
  const [message, setMessage] = useState("");
  const { createConnection, isCreating } = useEntrepreneurshipConnections();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createConnection({
        addresseeId: targetUser.id,
        message: message.trim() || undefined,
      });
      
      toast.success("Solicitud de conexión enviada", {
        description: `Tu solicitud ha sido enviada a ${targetUser.firstName} ${targetUser.lastName}`,
      });
      
      // Reset form and close modal
      setMessage("");
      onClose();
    } catch (error) {
      console.error("Error sending connection request:", error);
      toast.error("Error al enviar solicitud", {
        description: "No se pudo enviar la solicitud de conexión. Intenta nuevamente.",
      });
    }
  };

  const handleClose = () => {
    setMessage("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Enviar Solicitud de Conexión
          </DialogTitle>
          <DialogDescription>
            Conecta con otros emprendedores para expandir tu red
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Target User Info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={targetUser.avatarUrl} />
              <AvatarFallback>
                {targetUser.firstName.charAt(0)}{targetUser.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{targetUser.firstName} {targetUser.lastName}</h3>
              <p className="text-sm text-muted-foreground">
                Propietario de {entrepreneurshipName}
              </p>
            </div>
          </div>

          {/* Connection Request Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">
                Mensaje personalizado (opcional)
              </Label>
              <Textarea
                id="message"
                placeholder={`Hola ${targetUser.firstName}, me interesa conectar contigo para colaborar en el ecosistema emprendedor...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {message.length}/500 caracteres
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="flex items-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Enviar Solicitud
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}


