import * as React from 'react';
import {
  Button,
  Card,
  CardHeader,
  Input,
  Label,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  Add24Regular,
  Delete24Regular,
  BranchFork24Regular,
  QuestionCircle24Regular,
} from "@fluentui/react-icons";
import { ConditionalBranch, Question } from "../../types/questionnaire";
import RuleGroupEditor from "./RuleGroupEditor";
import { cn } from "../../lib/utils";
import { ReactNode } from "react";
import { ConfirmDialog } from "../fluent";

const useStyles = makeStyles({
  card: {
    border: `2px dashed ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
  },
  header: {
    padding: tokens.spacingVerticalM,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
  },
  content: {
    padding: tokens.spacingHorizontalM,
    paddingTop: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: tokens.spacingVerticalL,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: tokens.spacingVerticalS,
  },
  buttonRow: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
  },
  questionsSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: tokens.spacingVerticalM,
  },
  questionsLayout: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
  },
  questionList: {
    width: "20%",
    minWidth: "180px",
    display: "flex",
    flexDirection: "column" as const,
    gap: tokens.spacingVerticalS,
  },
  questionItem: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: "pointer",
  },
  questionItemHover: {
    backgroundColor: tokens.colorNeutralBackground1Hover,
  },
  questionItemSelected: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
  },
  questionText: {
    flex: 1,
    fontSize: tokens.fontSizeBase200,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  questionEditor: {
    width: "80%",
    flex: 1,
  },
  emptyState: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "128px",
    border: `1px dashed ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  emptyText: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  sectionLabel: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
  },
});

interface BranchEditorProps {
  branch: ConditionalBranch;
  allQuestions: Question[];
  selectedQuestionId: string | null;
  onUpdateBranch: (id: string, updated: Partial<ConditionalBranch>) => void;
  onAddQuestion: (branchId: string) => void;
  onAddChildBranch: (parentId: string) => void;
  onSelectQuestion: (questionId: string) => void;
  onDeleteQuestion?: (questionId: string) => void;
  onDeleteBranch?: (branchId: string) => void;
  questionEditor?: ReactNode;
}

const BranchEditor = ({
  branch,
  allQuestions,
  selectedQuestionId,
  onUpdateBranch,
  onAddQuestion,
  onAddChildBranch,
  onSelectQuestion,
  onDeleteQuestion,
  onDeleteBranch,
  questionEditor,
}: BranchEditorProps) => {
  const styles = useStyles();

  return (
    <Card className={styles.card}>
      <CardHeader
        header={
          <div className={styles.title}>
            <BranchFork24Regular style={{ color: tokens.colorBrandForeground1 }} />
            Conditional Branch Details
          </div>
        }
        action={
          onDeleteBranch && (
            <ConfirmDialog
              trigger={
                <Button
                  appearance="subtle"
                  icon={<Delete24Regular />}
                >
                  Delete Branch
                </Button>
              }
              title="Delete Branch"
              description={`Are you sure you want to delete "${branch.name || "Untitled Branch"}"? This will also delete all questions and child branches within it. This action cannot be undone.`}
              onConfirm={() => onDeleteBranch(branch.id)}
            />
          )
        }
      />
      <div className={styles.content}>
        <div className={styles.fieldGroup}>
          <Label htmlFor="branch-name">Branch Name</Label>
          <Input
            id="branch-name"
            placeholder="Enter branch name"
            value={branch.name}
            onChange={(e, data) => onUpdateBranch(branch.id, { name: data.value })}
          />
        </div>

        <div className={styles.fieldGroup}>
          <Label className={styles.sectionLabel}>Branch Conditions</Label>
          <RuleGroupEditor
            group={branch.conditionGroup || branch.ruleGroup}
            allQuestions={allQuestions}
            onUpdate={(updated) => onUpdateBranch(branch.id, { conditionGroup: updated })}
          />
        </div>

        <div className={styles.buttonRow}>
          <Button appearance="outline" icon={<Add24Regular />} onClick={() => onAddQuestion(branch.id)}>
            Add Question under this Branch
          </Button>
          <Button appearance="outline" icon={<Add24Regular />} onClick={() => onAddChildBranch(branch.id)}>
            Add Conditional Branch
          </Button>
        </div>

        {branch.questions.length > 0 && (
          <div className={styles.questionsSection}>
            <Label className={styles.sectionLabel}>Questions in this Branch</Label>
            <div className={styles.questionsLayout}>
              {/* Left panel - Question list (20%) */}
              <div className={styles.questionList}>
                {branch.questions.map((q) => (
                  <div
                    key={q.id}
                    className={cn(
                      styles.questionItem,
                      selectedQuestionId === q.id && styles.questionItemSelected
                    )}
                    onClick={() => onSelectQuestion(q.id)}
                  >
                    <QuestionCircle24Regular style={{ width: 16, height: 16, flexShrink: 0, color: tokens.colorNeutralForeground3 }} />
                    <span className={styles.questionText}>{q.text || "Untitled Question"}</span>
                    {onDeleteQuestion && (
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<Delete24Regular style={{ width: 16, height: 16 }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteQuestion(q.id);
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Right panel - Question details (80%) */}
              <div className={styles.questionEditor}>
                {questionEditor ? (
                  questionEditor
                ) : (
                  <div className={styles.emptyState}>
                    <p className={styles.emptyText}>Select a question to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default BranchEditor;
