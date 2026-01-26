import * as React from 'react';
import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigation } from "../lib/navigation";
import {
  Button,
  Card,
  CardHeader,
  Badge,
  ProgressBar,
  makeStyles,
  tokens,
  Text,
  Title3,
  Body1,
  Caption1,
} from "@fluentui/react-components";
import {
  ArrowUpload24Regular,
  Document24Regular,
  ArrowLeft24Regular,
  ArrowRight24Regular,
  ArrowDownload24Regular,
  CheckmarkCircle24Regular,
  ErrorCircle24Regular,
  Home24Regular,
} from "@fluentui/react-icons";
import { Questionnaire, Question, ConditionalBranch } from "../types/questionnaire";
import { ExportedQuestionnaire, parseQuestionnaireFile } from "../lib/questionnaireExport";
import {
  QuestionnaireResponse,
  QuestionResponse,
  exportResponseAsJSON,
  exportResponseAsCSV,
} from "../types/questionnaireResponse";
import QuestionRenderer from "../components/executor/QuestionRenderer";
import { useFluentToast } from "../hooks/useFluentToast";
import { isQuestionVisible, isBranchVisible, getActiveAnswerSetForQuestion } from "../lib/conditionEvaluator";

const useStyles = makeStyles({
  container: {
    minHeight: "100vh",
    backgroundColor: tokens.colorNeutralBackground2,
  },
  centerCard: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.spacingVerticalXXL,
  },
  card: {
    maxWidth: "450px",
    width: "100%",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingVerticalXL,
    boxShadow: tokens.shadow8,
  },
  cardContent: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    gap: tokens.spacingVerticalL,
    textAlign: "center" as const,
  },
  iconCircle: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: tokens.spacingVerticalS,
  },
  iconCirclePrimary: {
    backgroundColor: tokens.colorBrandBackground2,
  },
  iconCircleSuccess: {
    backgroundColor: tokens.colorPaletteGreenBackground2,
  },
  header: {
    position: "sticky" as const,
    top: 0,
    zIndex: 10,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXL}`,
  },
  headerContent: {
    maxWidth: "896px",
    margin: "0 auto",
  },
  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: tokens.spacingVerticalM,
  },
  scrollContent: {
    maxWidth: "896px",
    margin: "0 auto",
    padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalXL}`,
  },
  pageHeader: {
    marginBottom: tokens.spacingVerticalL,
  },
  errorCard: {
    backgroundColor: tokens.colorPaletteRedBackground1,
    padding: tokens.spacingVerticalM,
    borderRadius: tokens.borderRadiusMedium,
    marginBottom: tokens.spacingVerticalL,
    display: "flex",
    gap: tokens.spacingHorizontalM,
  },
  sectionCard: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingVerticalL,
    boxShadow: tokens.shadow4,
    marginBottom: tokens.spacingVerticalL,
  },
  sectionHeader: {
    marginBottom: tokens.spacingVerticalM,
  },
  questionsContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: tokens.spacingVerticalL,
  },
  branchContainer: {
    paddingLeft: tokens.spacingHorizontalL,
    borderLeft: `2px solid ${tokens.colorNeutralStroke2}`,
    display: "flex",
    flexDirection: "column" as const,
    gap: tokens.spacingVerticalL,
  },
  footer: {
    position: "sticky" as const,
    bottom: 0,
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXL}`,
  },
  footerContent: {
    maxWidth: "896px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonRow: {
    display: "flex",
    gap: tokens.spacingHorizontalS,
  },
  fullWidth: {
    width: "100%",
  },
  buttonRowCenter: {
    display: "flex",
    gap: tokens.spacingHorizontalS,
    justifyContent: "center",
  },
});

type ResponseValue = string | string[] | number | boolean | null;
type ResponseMap = Record<string, ResponseValue>;

const BackToBuilderButton = () => {
  const { navigate } = useNavigation();
  return (
    <Button appearance="subtle" icon={<Home24Regular />} onClick={() => navigate('home')}>
      Back to Builder
    </Button>
  );
};

const Execute = () => {
  const styles = useStyles();
  const toast = useFluentToast();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [exportedData, setExportedData] = useState<ExportedQuestionnaire | null>(null);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [responses, setResponses] = useState<ResponseMap>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDefaultResponses = (q: Questionnaire): ResponseMap => {
    const defaults: ResponseMap = {};

    const processQuestion = (question: Question) => {
      const defaultAnswerSet = question.answerSets.find((as) => as.isDefault) || question.answerSets[0];
      if (!defaultAnswerSet) return;

      const defaultAnswer = defaultAnswerSet.answers[0];
      if (!defaultAnswer?.value) return;

      switch (question.type) {
        case "Number":
        case "Decimal":
        case "Rating": {
          const numVal = parseFloat(defaultAnswer.value);
          if (!isNaN(numVal)) {
            defaults[question.id] = numVal;
          }
          break;
        }
        case "Boolean":
          defaults[question.id] = defaultAnswer.value === "true";
          break;
        case "MultiSelect":
          if (defaultAnswer.value) {
            defaults[question.id] = [defaultAnswer.value];
          }
          break;
        default:
          defaults[question.id] = defaultAnswer.value;
      }
    };

    const processFromBranch = (branch: ConditionalBranch) => {
      branch.questions.forEach(processQuestion);
      branch.childBranches.forEach(processFromBranch);
    };

    q.pages.forEach((page) => {
      page.sections.forEach((section) => {
        section.questions.forEach(processQuestion);
        section.branches.forEach(processFromBranch);
      });
    });

    return defaults;
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("executor-questionnaire");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ExportedQuestionnaire;
        setExportedData(parsed);
        setQuestionnaire(parsed.questionnaire);
        setActivePageIndex(0);
        setResponses(getDefaultResponses(parsed.questionnaire));
        setIsSubmitted(false);
        setValidationErrors([]);
        sessionStorage.removeItem("executor-questionnaire");
        toast.success("Questionnaire loaded from builder!");
      } catch (error) {
        console.error("Failed to parse stored questionnaire", error);
      }
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseQuestionnaireFile(file);
      setExportedData(parsed);
      setQuestionnaire(parsed.questionnaire);
      setActivePageIndex(0);
      setResponses(getDefaultResponses(parsed.questionnaire));
      setIsSubmitted(false);
      setValidationErrors([]);
      toast.success("Questionnaire loaded successfully!");
    } catch (error) {
      toast.error("Failed to load questionnaire. Please check the file format.");
    }
  };

  const collectAllQuestions = (): Question[] => {
    if (!questionnaire) return [];
    const questions: Question[] = [];

    const collectFromBranch = (branch: ConditionalBranch) => {
      questions.push(...branch.questions);
      branch.childBranches.forEach(collectFromBranch);
    };

    questionnaire.pages.forEach((page) => {
      page.sections.forEach((section) => {
        questions.push(...section.questions);
        section.branches.forEach(collectFromBranch);
      });
    });

    return questions;
  };

  const allQuestions = useMemo(() => collectAllQuestions(), [questionnaire]);

  const collectPageQuestions = (pageIndex: number): Question[] => {
    if (!questionnaire || !questionnaire.pages[pageIndex]) return [];
    const questions: Question[] = [];
    const page = questionnaire.pages[pageIndex];

    const collectFromBranch = (branch: ConditionalBranch) => {
      if (isBranchVisible(branch, responses, allQuestions)) {
        questions.push(...branch.questions.filter((q) => isQuestionVisible(q, responses, allQuestions)));
        branch.childBranches.forEach(collectFromBranch);
      }
    };

    page.sections.forEach((section) => {
      questions.push(...section.questions.filter((q) => isQuestionVisible(q, responses, allQuestions)));
      section.branches.forEach(collectFromBranch);
    });

    return questions;
  };

  const handleResponseChange = (questionId: string, value: ResponseValue) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const validateCurrentPage = (): boolean => {
    const pageQuestions = collectPageQuestions(activePageIndex);
    const errors: string[] = [];

    pageQuestions.forEach((question) => {
      if (question.required) {
        const response = responses[question.id];
        const isEmpty =
          response === null ||
          response === undefined ||
          response === "" ||
          (Array.isArray(response) && response.length === 0);

        if (isEmpty) {
          errors.push(`"${question.text}" is required`);
        }
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleNextPage = () => {
    if (!validateCurrentPage()) {
      toast.error("Please answer all required questions");
      return;
    }

    if (questionnaire && activePageIndex < questionnaire.pages.length - 1) {
      setActivePageIndex((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (activePageIndex > 0) {
      setActivePageIndex((prev) => prev - 1);
      setValidationErrors([]);
    }
  };

  const handleSubmit = () => {
    if (!validateCurrentPage()) {
      toast.error("Please answer all required questions");
      return;
    }

    setIsSubmitted(true);
    toast.success("Questionnaire submitted successfully!");
  };

  const buildQuestionnaireResponse = (): QuestionnaireResponse => {
    const allQuestions = collectAllQuestions();

    const questionResponses: QuestionResponse[] = allQuestions
      .filter((q) => responses[q.id] !== undefined && responses[q.id] !== null)
      .map((question) => {
        const value = responses[question.id];
        let displayValue = "";

        if (Array.isArray(value)) {
          const answerSet = question.answerSets[0];
          if (answerSet) {
            displayValue = value.map((v) => answerSet.answers.find((a) => a.value === v)?.label || v).join(", ");
          } else {
            displayValue = value.join(", ");
          }
        } else if (typeof value === "boolean") {
          displayValue = value ? "Yes" : "No";
        } else if (["Choice", "RadioButton", "Dropdown"].includes(question.type)) {
          const answerSet = question.answerSets[0];
          if (answerSet) {
            displayValue = answerSet.answers.find((a) => a.value === value)?.label || String(value);
          } else {
            displayValue = String(value);
          }
        } else {
          displayValue = String(value);
        }

        return {
          questionId: question.id,
          questionText: question.text,
          questionType: question.type,
          value,
          displayValue,
        };
      });

    return {
      questionnaireId: questionnaire?.name || "unknown",
      questionnaireName: questionnaire?.name || "Untitled Questionnaire",
      submittedAt: new Date().toISOString(),
      responses: questionResponses,
    };
  };

  const handleDownloadJSON = () => {
    const response = buildQuestionnaireResponse();
    exportResponseAsJSON(response);
    toast.success("Response downloaded as JSON");
  };

  const handleDownloadCSV = () => {
    const response = buildQuestionnaireResponse();
    exportResponseAsCSV(response);
    toast.success("Response downloaded as CSV");
  };

  const handleReset = () => {
    setQuestionnaire(null);
    setExportedData(null);
    setResponses({});
    setIsSubmitted(false);
    setActivePageIndex(0);
    setValidationErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const progress = questionnaire ? ((activePageIndex + 1) / questionnaire.pages.length) * 100 : 0;

  // Landing state - no questionnaire loaded
  if (!questionnaire) {
    return (
      <div className={styles.centerCard}>
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <div className={`${styles.iconCircle} ${styles.iconCirclePrimary}`}>
              <Document24Regular style={{ color: tokens.colorBrandForeground1, width: 32, height: 32 }} />
            </div>
            <Title3>Questionnaire Executor</Title3>
            <Caption1>Import a questionnaire JSON file to start filling it out</Caption1>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
            <Button
              appearance="primary"
              size="large"
              icon={<ArrowUpload24Regular />}
              onClick={() => fileInputRef.current?.click()}
              className={styles.fullWidth}
            >
              Import Questionnaire JSON
            </Button>
            <BackToBuilderButton />
          </div>
        </div>
      </div>
    );
  }

  // Submitted state
  if (isSubmitted) {
    return (
      <div className={styles.centerCard}>
        <div className={styles.card}>
          <div className={styles.cardContent}>
            <div className={`${styles.iconCircle} ${styles.iconCircleSuccess}`}>
              <CheckmarkCircle24Regular style={{ color: tokens.colorPaletteGreenForeground1, width: 32, height: 32 }} />
            </div>
            <Title3>Submission Complete!</Title3>
            <Caption1>Your responses have been recorded. Download them below.</Caption1>
            <div className={styles.buttonRowCenter}>
              <Button appearance="primary" icon={<ArrowDownload24Regular />} onClick={handleDownloadJSON}>
                Download JSON
              </Button>
              <Button appearance="outline" icon={<ArrowDownload24Regular />} onClick={handleDownloadCSV}>
                Download CSV
              </Button>
            </div>
            <Button appearance="subtle" onClick={handleReset}>
              Start New Questionnaire
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const activePage = questionnaire.pages[activePageIndex];
  const isLastPage = activePageIndex === questionnaire.pages.length - 1;
  const isFirstPage = activePageIndex === 0;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerRow}>
            <div>
              <Title3>{questionnaire.name || "Untitled Questionnaire"}</Title3>
              {questionnaire.description && <Caption1>{questionnaire.description}</Caption1>}
            </div>
            <Badge appearance="outline">
              Page {activePageIndex + 1} of {questionnaire.pages.length}
            </Badge>
          </div>
          <ProgressBar value={progress / 100} thickness="medium" />
        </div>
      </div>

      {/* Content */}
      <div className={styles.scrollContent}>
        {/* Page Title */}
        <div className={styles.pageHeader}>
          <Title3>{activePage.name}</Title3>
          {activePage.description && <Body1>{activePage.description}</Body1>}
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className={styles.errorCard}>
            <ErrorCircle24Regular style={{ color: tokens.colorPaletteRedForeground1, flexShrink: 0 }} />
            <div>
              <Text weight="semibold" style={{ color: tokens.colorPaletteRedForeground1 }}>
                Please complete the following:
              </Text>
              <ul style={{ margin: `${tokens.spacingVerticalS} 0 0 0`, paddingLeft: tokens.spacingHorizontalL }}>
                {validationErrors.map((error, i) => (
                  <li key={i} style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3 }}>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Sections */}
        {activePage.sections.map((section) => {
          const visibleSectionQuestions = section.questions.filter((q) => isQuestionVisible(q, responses, allQuestions));
          const visibleBranches = section.branches.filter((branch) => isBranchVisible(branch, responses, allQuestions));
          const hasVisibleContent = visibleSectionQuestions.length > 0 || visibleBranches.length > 0;
          if (!hasVisibleContent) return null;

          return (
            <div key={section.id} className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <Text weight="semibold" size={400}>
                  {section.name}
                </Text>
                {section.description && <Caption1>{section.description}</Caption1>}
              </div>
              <div className={styles.questionsContainer}>
                {visibleSectionQuestions.map((question) => (
                  <QuestionRenderer
                    key={question.id}
                    question={question}
                    value={responses[question.id] ?? null}
                    onChange={(value) => handleResponseChange(question.id, value)}
                    activeAnswerSet={getActiveAnswerSetForQuestion(question, responses, allQuestions)}
                  />
                ))}

                {visibleBranches.map((branch) => {
                  const visibleBranchQuestions = branch.questions.filter((q) =>
                    isQuestionVisible(q, responses, allQuestions)
                  );

                  if (visibleBranchQuestions.length === 0) return null;

                  return (
                    <div key={branch.id} className={styles.branchContainer}>
                      <Text weight="semibold">{branch.name}</Text>
                      {visibleBranchQuestions.map((question) => (
                        <QuestionRenderer
                          key={question.id}
                          question={question}
                          value={responses[question.id] ?? null}
                          onChange={(value) => handleResponseChange(question.id, value)}
                          activeAnswerSet={getActiveAnswerSetForQuestion(question, responses, allQuestions)}
                        />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <Button appearance="outline" icon={<ArrowLeft24Regular />} onClick={handlePrevPage} disabled={isFirstPage}>
            Previous
          </Button>

          <div className={styles.buttonRow}>
            <Button appearance="subtle" onClick={handleReset}>
              Cancel
            </Button>
            {isLastPage ? (
              <Button appearance="primary" icon={<CheckmarkCircle24Regular />} onClick={handleSubmit}>
                Submit
              </Button>
            ) : (
              <Button appearance="primary" icon={<ArrowRight24Regular />} iconPosition="after" onClick={handleNextPage}>
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Execute;
