import { BusinessPlanTemplate, BusinessPlanField, BusinessPlanSection, BusinessPlanFieldDefaultValue } from "./businessPlanTemplates";

export interface ExportOptions {
  format: "pdf" | "docx" | "html" | "json";
  includeCharts: boolean;
  includeExamples: boolean;
  includeTips: boolean;
  language: "es" | "en";
}

export interface BusinessPlanData {
  [fieldId: string]: BusinessPlanFieldDefaultValue;
}

interface TableData {
  headers: string[];
  rows: Record<string, string>[];
}

export class BusinessPlanExportService {
  /**
   * Export business plan to PDF
   */
  static async exportToPDF(
    template: BusinessPlanTemplate,
    data: BusinessPlanData,
    options: ExportOptions = {
      format: "pdf",
      includeCharts: true,
      includeExamples: false,
      includeTips: true,
      language: "es"
    }
  ): Promise<Blob> {
    const html = this.generateHTML(template, data, options);
    
    // In a real implementation, you would use a library like jsPDF or Puppeteer
    // For now, we'll return a mock blob
    const blob = new Blob([html], { type: "text/html" });
    return blob;
  }

  /**
   * Export business plan to DOCX
   */
  static async exportToDOCX(
    template: BusinessPlanTemplate,
    data: BusinessPlanData,
    options: ExportOptions = {
      format: "docx",
      includeCharts: true,
      includeExamples: false,
      includeTips: true,
      language: "es"
    }
  ): Promise<Blob> {
    // In a real implementation, you would use a library like docx
    // For now, we'll return a mock blob
    const content = this.generateTextContent(template, data, options);
    const blob = new Blob([content], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
    return blob;
  }

  /**
   * Export business plan to HTML
   */
  static async exportToHTML(
    template: BusinessPlanTemplate,
    data: BusinessPlanData,
    options: ExportOptions = {
      format: "html",
      includeCharts: true,
      includeExamples: false,
      includeTips: true,
      language: "es"
    }
  ): Promise<Blob> {
    const html = this.generateHTML(template, data, options);
    const blob = new Blob([html], { type: "text/html" });
    return blob;
  }

  /**
   * Export business plan to JSON
   */
  static async exportToJSON(
    template: BusinessPlanTemplate,
    data: BusinessPlanData,
    options: ExportOptions = {
      format: "json",
      includeCharts: false,
      includeExamples: false,
      includeTips: false,
      language: "es"
    }
  ): Promise<Blob> {
    const exportData = {
      template: {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        difficulty: template.difficulty,
        estimatedTime: template.estimatedTime
      },
      data,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: "1.0",
        language: options.language
      }
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    return blob;
  }

  /**
   * Generate HTML content
   */
  private static generateHTML(
    template: BusinessPlanTemplate,
    data: BusinessPlanData,
    options: ExportOptions
  ): string {
    const sections = template.sections
      .sort((a, b) => a.order - b.order)
      .map(section => this.generateSectionHTML(section, data, options))
      .join("");

    return `
<!DOCTYPE html>
<html lang="${options.language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${template.name} - Plan de Negocios</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 2.5em;
        }
        .header .subtitle {
            color: #6b7280;
            font-size: 1.2em;
            margin: 10px 0;
        }
        .section {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        .section-title {
            color: #2563eb;
            font-size: 1.8em;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #e5e7eb;
        }
        .field {
            margin-bottom: 20px;
        }
        .field-label {
            font-weight: bold;
            color: #374151;
            margin-bottom: 5px;
            display: block;
        }
        .field-value {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #2563eb;
            white-space: pre-wrap;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .table th,
        .table td {
            border: 1px solid #d1d5db;
            padding: 12px;
            text-align: left;
        }
        .table th {
            background: #f3f4f6;
            font-weight: bold;
        }
        .tips {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        .tips h4 {
            color: #1d4ed8;
            margin: 0 0 10px 0;
        }
        .tips ul {
            margin: 0;
            padding-left: 20px;
        }
        .examples {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        .examples h4 {
            color: #166534;
            margin: 0 0 10px 0;
        }
        .examples ul {
            margin: 0;
            padding-left: 20px;
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 0.9em;
        }
        @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${template.name}</h1>
        <div class="subtitle">${template.description}</div>
        <div style="color: #6b7280; font-size: 0.9em;">
            Categoría: ${template.category} | Dificultad: ${template.difficulty} | Tiempo estimado: ${template.estimatedTime} minutos
        </div>
    </div>

    ${sections}

    <div class="footer">
        <p>Generado el ${new Date().toLocaleDateString('es-ES')} - Plan de Negocios CEMSE</p>
    </div>
</body>
</html>`;
  }

  /**
   * Generate section HTML
   */
  private static generateSectionHTML(
    section: BusinessPlanSection,
    data: BusinessPlanData,
    options: ExportOptions
  ): string {
    const fields = section.fields
      .map((field: BusinessPlanField) => this.generateFieldHTML(field, data))
      .join("");

    let tips = "";
    if (options.includeTips && section.tips && section.tips.length > 0) {
      tips = `
        <div class="tips">
            <h4>💡 Consejos</h4>
            <ul>
                ${section.tips.map((tip: string) => `<li>${tip}</li>`).join("")}
            </ul>
        </div>
      `;
    }

    // Note: Examples are not available in BusinessPlanSection interface
    const examples = "";

    return `
      <div class="section">
        <h2 class="section-title">${section.title}</h2>
        <p style="color: #6b7280; margin-bottom: 20px;">${section.description}</p>
        ${fields}
        ${tips}
        ${examples}
      </div>
    `;
  }

  /**
   * Generate field HTML
   */
  private static generateFieldHTML(
    field: BusinessPlanField,
    data: BusinessPlanData
  ): string {
    const value = data[field.id];
    
    if (!value || value === "") {
      return "";
    }

    let fieldContent = "";

    switch (field.type) {
      case "table":
        fieldContent = this.generateTableHTML(value as TableData);
        break;
      case "multiselect":
        fieldContent = Array.isArray(value) ? value.join(", ") : String(value);
        break;
      default:
        fieldContent = String(value);
    }

    return `
      <div class="field">
        <label class="field-label">${field.label}</label>
        <div class="field-value">${fieldContent}</div>
      </div>
    `;
  }

  /**
   * Generate table HTML
   */
  private static generateTableHTML(tableData: TableData): string {
    if (!tableData || !tableData.headers || !tableData.rows) {
      return "No hay datos en la tabla";
    }

    const headers = tableData.headers.map((header: string) => `<th>${header}</th>`).join("");
    const rows = tableData.rows.map((row: Record<string, string>) => 
      `<tr>${tableData.headers.map((header: string) => `<td>${row[header] || ""}</td>`).join("")}</tr>`
    ).join("");

    return `
      <table class="table">
        <thead>
          <tr>${headers}</tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  }

  /**
   * Generate text content for DOCX
   */
  private static generateTextContent(
    template: BusinessPlanTemplate,
    data: BusinessPlanData,
    options: ExportOptions
  ): string {
    const sections = template.sections
      .sort((a, b) => a.order - b.order)
      .map(section => this.generateSectionText(section, data, options))
      .join("\n\n");

    return `
${template.name.toUpperCase()}
${template.description}

Categoría: ${template.category}
Dificultad: ${template.difficulty}
Tiempo estimado: ${template.estimatedTime} minutos

${"=".repeat(50)}

${sections}

${"=".repeat(50)}

Generado el ${new Date().toLocaleDateString('es-ES')} - Plan de Negocios CEMSE
    `;
  }

  /**
   * Generate section text
   */
  private static generateSectionText(
    section: BusinessPlanSection,
    data: BusinessPlanData,
    options: ExportOptions
  ): string {
    const fields = section.fields
      .map((field: BusinessPlanField) => this.generateFieldText(field, data))
      .filter(Boolean)
      .join("\n\n");

    let tips = "";
    if (options.includeTips && section.tips && section.tips.length > 0) {
      tips = `\n\nCONSEJOS:\n${section.tips.map((tip: string) => `• ${tip}`).join("\n")}`;
    }

    // Note: Examples are not available in BusinessPlanSection interface
    const examples = "";

    return `
${section.title.toUpperCase()}
${section.description}

${fields}${tips}${examples}
    `;
  }

  /**
   * Generate field text
   */
  private static generateFieldText(
    field: BusinessPlanField,
    data: BusinessPlanData
  ): string {
    const value = data[field.id];
    
    if (!value || value === "") {
      return "";
    }

    let fieldContent = "";

    switch (field.type) {
      case "table":
        fieldContent = this.generateTableText(value as TableData);
        break;
      case "multiselect":
        fieldContent = Array.isArray(value) ? value.join(", ") : String(value);
        break;
      default:
        fieldContent = String(value);
    }

    return `${field.label}:\n${fieldContent}`;
  }

  /**
   * Generate table text
   */
  private static generateTableText(tableData: TableData): string {
    if (!tableData || !tableData.headers || !tableData.rows) {
      return "No hay datos en la tabla";
    }

    const headers = tableData.headers.join(" | ");
    const separator = tableData.headers.map(() => "---").join(" | ");
    const rows = tableData.rows.map((row: Record<string, string>) => 
      tableData.headers.map((header: string) => row[header] || "").join(" | ")
    ).join("\n");

    return `${headers}\n${separator}\n${rows}`;
  }

  /**
   * Download file
   */
  static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get filename for export
   */
  static getFilename(template: BusinessPlanTemplate, format: string): string {
    const timestamp = new Date().toISOString().split('T')[0];
    const templateName = template.name.toLowerCase().replace(/\s+/g, '-');
    return `plan-negocios-${templateName}-${timestamp}.${format}`;
  }
}
