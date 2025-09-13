"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Minus, 
  DollarSign, 
  Calendar,
  BarChart3,
  Table,
  Trash2
} from "lucide-react";
import { BusinessPlanField } from "@/lib/businessPlanTemplates";

interface BusinessPlanFieldRendererProps {
  field: BusinessPlanField;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function BusinessPlanFieldRenderer({
  field,
  value,
  onChange,
  error,
}: BusinessPlanFieldRendererProps) {
  const [tableData, setTableData] = useState(
    value || field.defaultValue || { headers: [], rows: [] }
  );

  const handleTableChange = (newData: any) => {
    setTableData(newData);
    onChange(newData);
  };

  const addTableRow = () => {
    const newRow: any = {};
    tableData.headers.forEach((header: string) => {
      newRow[header] = "";
    });
    const newData = {
      ...tableData,
      rows: [...tableData.rows, newRow]
    };
    handleTableChange(newData);
  };

  const removeTableRow = (index: number) => {
    const newData = {
      ...tableData,
      rows: tableData.rows.filter((_: any, i: number) => i !== index)
    };
    handleTableChange(newData);
  };

  const updateTableRow = (rowIndex: number, header: string, newValue: any) => {
    const newData = {
      ...tableData,
      rows: tableData.rows.map((row: any, index: number) => 
        index === rowIndex ? { ...row, [header]: newValue } : row
      )
    };
    handleTableChange(newData);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-BO', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const renderField = () => {
    switch (field.type) {
      case "text":
        return (
          <Input
            id={field.id}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={error ? "border-red-500" : ""}
          />
        );

      case "textarea":
        return (
          <Textarea
            id={field.id}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={error ? "border-red-500" : ""}
            rows={4}
          />
        );

      case "number":
        return (
          <Input
            id={field.id}
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder={field.placeholder}
            className={error ? "border-red-500" : ""}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        );

      case "currency":
        return (
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id={field.id}
              type="number"
              value={value || ""}
              onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder={field.placeholder}
              className={`pl-10 ${error ? "border-red-500" : ""}`}
              min={field.validation?.min}
              max={field.validation?.max}
            />
            {value && (
              <div className="mt-1 text-sm text-muted-foreground">
                {formatCurrency(value)}
              </div>
            )}
          </div>
        );

      case "date":
        return (
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id={field.id}
              type="date"
              value={value || ""}
              onChange={(e) => onChange(e.target.value || undefined)}
              className={`pl-10 ${error ? "border-red-500" : ""}`}
            />
          </div>
        );

      case "select":
        return (
          <Select
            value={value || ""}
            onValueChange={(newValue) => onChange(newValue === "none" ? undefined : newValue)}
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={field.placeholder || "Selecciona una opción"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ninguno</SelectItem>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "multiselect":
        const selectedValues = value || [];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {selectedValues.map((selectedValue: string) => (
                <Badge
                  key={selectedValue}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {selectedValue}
                  <button
                    type="button"
                    onClick={() => {
                      const newValues = selectedValues.filter((v: string) => v !== selectedValue);
                      onChange(newValues);
                    }}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <Select
              value=""
              onValueChange={(newValue) => {
                if (newValue && !selectedValues.includes(newValue)) {
                  onChange([...selectedValues, newValue]);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Agregar opción" />
              </SelectTrigger>
              <SelectContent>
                {field.options?.filter(option => !selectedValues.includes(option)).map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "table":
        return (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Table className="h-4 w-4" />
                  {field.label}
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTableRow}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Agregar Fila
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      {tableData.headers.map((header: string, index: number) => (
                        <th
                          key={index}
                          className="text-left p-2 font-medium text-sm text-muted-foreground"
                        >
                          {header}
                        </th>
                      ))}
                      <th className="text-left p-2 font-medium text-sm text-muted-foreground w-12">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row: any, rowIndex: number) => (
                      <tr key={rowIndex} className="border-b">
                        {tableData.headers.map((header: string, colIndex: number) => (
                          <td key={colIndex} className="p-2">
                            <Input
                              value={row[header] || ""}
                              onChange={(e) => updateTableRow(rowIndex, header, e.target.value)}
                              className="w-full"
                              placeholder={`${header} ${rowIndex + 1}`}
                            />
                          </td>
                        ))}
                        <td className="p-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeTableRow(rowIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tableData.rows.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Table className="h-8 w-8 mx-auto mb-2" />
                    <p>No hay filas. Haz clic en "Agregar Fila" para comenzar.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case "chart":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                {field.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                  <p>Vista previa del gráfico</p>
                  <p className="text-sm">Los gráficos se generarán automáticamente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Input
            id={field.id}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            className={error ? "border-red-500" : ""}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id} className="text-sm font-medium">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
      {renderField()}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}
