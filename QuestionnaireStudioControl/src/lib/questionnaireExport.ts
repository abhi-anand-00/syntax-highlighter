import { Questionnaire } from "../types/questionnaire";

export interface ExportedQuestionnaire {
  version: "1.0";
  exportedAt: string;
  questionnaire: Questionnaire;
}

export const buildExportData = (questionnaire: Questionnaire): ExportedQuestionnaire => {
  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    questionnaire,
  };
};

export const exportQuestionnaire = (questionnaire: Questionnaire): void => {
  const exportData = buildExportData(questionnaire);

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: "application/json",
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${questionnaire.name || "questionnaire"}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const parseQuestionnaireFile = async (file: File): Promise<ExportedQuestionnaire> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content) as ExportedQuestionnaire;
        
        // Validate structure
        if (!parsed.questionnaire || !parsed.questionnaire.pages) {
          throw new Error("Invalid questionnaire format");
        }
        
        resolve(parsed);
      } catch (error) {
        reject(new Error("Failed to parse questionnaire file"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};
