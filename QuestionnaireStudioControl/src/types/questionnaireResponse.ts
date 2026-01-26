export interface QuestionResponse {
  questionId: string;
  questionText: string;
  questionType: string;
  value: string | string[] | number | boolean | null;
  displayValue: string;
}

export interface QuestionnaireResponse {
  questionnaireId: string;
  questionnaireName: string;
  submittedAt: string;
  responses: QuestionResponse[];
}

export const exportResponseAsJSON = (response: QuestionnaireResponse): void => {
  const blob = new Blob([JSON.stringify(response, null, 2)], {
    type: "application/json",
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `response-${response.questionnaireName || "questionnaire"}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportResponseAsCSV = (response: QuestionnaireResponse): void => {
  const headers = ["Question", "Type", "Answer"];
  const rows = response.responses.map((r) => [
    `"${r.questionText.replace(/"/g, '""')}"`,
    r.questionType,
    `"${String(r.displayValue).replace(/"/g, '""')}"`,
  ]);
  
  const csv = [
    `# Questionnaire: ${response.questionnaireName}`,
    `# Submitted: ${response.submittedAt}`,
    "",
    headers.join(","),
    ...rows.map((r) => r.join(",")),
  ].join("\n");
  
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `response-${response.questionnaireName || "questionnaire"}-${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
