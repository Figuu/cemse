"use client";

import React, { useState, useEffect, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import BusinessModelCanvas from './BusinessModelCanvas';

interface BusinessModelCanvasModalProps {
  businessPlan?: any;
  onSave?: (data: any) => void;
  onClose: () => void;
  isOpen: boolean;
}

const BusinessModelCanvasModal: React.FC<BusinessModelCanvasModalProps> = memo(({ 
  businessPlan, 
  onSave, 
  onClose,
  isOpen
}) => {
  const [internalBusinessPlan, setInternalBusinessPlan] = useState(businessPlan);

  // Update internal state when businessPlan prop changes
  useEffect(() => {
    if (businessPlan) {
      setInternalBusinessPlan(businessPlan);
    }
  }, [businessPlan?.id]); // Only update when ID changes

  const handleSave = useCallback((data: any) => {
    onSave?.(data);
  }, [onSave]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Business Model Canvas</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <BusinessModelCanvas
            businessPlan={internalBusinessPlan}
            onSave={handleSave}
          />
        </CardContent>
      </Card>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.businessPlan?.id === nextProps.businessPlan?.id &&
    prevProps.onSave === nextProps.onSave &&
    prevProps.onClose === nextProps.onClose
  );
});

BusinessModelCanvasModal.displayName = 'BusinessModelCanvasModal';

export default BusinessModelCanvasModal;
