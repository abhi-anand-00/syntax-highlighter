import * as React from 'react';
import { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  Input,
  Label,
  makeStyles,
  tokens,
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from "@fluentui/react-components";
import {
  Add24Regular,
  Delete24Regular,
  LayerDiagonal24Regular,
  ChevronDown24Regular,
  ChevronUp24Regular,
  BranchFork24Regular,
  QuestionCircle24Regular,
} from "@fluentui/react-icons";
import { Section, Question, ConditionalBranch, AnswerSet } from "../../types/questionnaire";
import QuestionEditor from "./QuestionEditor";
import BranchEditor from "./BranchEditor";
import { cn } from "../../lib/utils";
import { ConfirmDialog } from "../fluent";

const useStyles = makeStyles({
  card: {
    borderLeft: `4px solid ${tokens.colorBrandBackground}`,
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
    marginBottom: tokens.spacingVerticalM,
  },
  header: {
    padding: tokens.spacingVerticalM,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    flex: 1,
  },
  sectionTitle: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    cursor: "pointer",
  },
  sectionTitleHover: {
    color: tokens.colorBrandForeground1,
  },
  content: {
    padding: tokens.spacingHorizontalM,
    paddingTop: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: tokens.spacingVerticalM,
  },
  buttonRow: {
    display: "flex",
    gap: tokens.spacingHorizontalS,
  },
  questionChip: {
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusMedium,
    fontSize: tokens.fontSizeBase200,
    cursor: "pointer",
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid transparent`,
  },
  questionChipHover: {
    backgroundColor: tokens.colorNeutralBackground3Hover,
  },
  questionChipSelected: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  branchContainer: {
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  branchHeader: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalS}`,
    borderRadius: tokens.borderRadiusSmall,
    cursor: "pointer",
    fontSize: tokens.fontSizeBase200,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  branchHeaderHover: {
    backgroundColor: tokens.colorNeutralBackground3Hover,
  },
  branchSelected: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
  },
  branchChildren: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: tokens.spacingHorizontalXS,
    marginTop: tokens.spacingVerticalS,
    paddingLeft: tokens.spacingHorizontalS,
    borderLeft: `2px solid ${tokens.colorNeutralStroke2}`,
    marginLeft: tokens.spacingHorizontalXS,
  },
  itemsContainer: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: tokens.spacingHorizontalS,
    alignItems: "flex-start",
  },
  editorSection: {
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingTop: tokens.spacingVerticalM,
  },
  nameInput: {
    minWidth: "200px",
  },
});

// Recursive component to render branch with nested children
interface BranchContainerProps {
  branch: ConditionalBranch;
  selectedBranchId: string | null;
  selectedQuestionId: string | null;
  onSelectBranch: (branchId: string) => void;
  onSelectQuestion: (questionId: string, branchId: string | null) => void;
  depth?: number;
}

const BranchContainerView = ({
  branch,
  selectedBranchId,
  selectedQuestionId,
  onSelectBranch,
  onSelectQuestion,
  depth = 0,
}: BranchContainerProps) => {
  const styles = useStyles();
  const hasChildren = branch.questions.length > 0 || branch.childBranches.length > 0;

  return (
    <div className={styles.branchContainer}>
      {/* Branch header */}
      <div
        onClick={() => onSelectBranch(branch.id)}
        className={cn(
          styles.branchHeader,
          selectedBranchId === branch.id && styles.branchSelected
        )}
      >
        <BranchFork24Regular style={{ width: 12, height: 12 }} />
        <span style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {branch.name || "Untitled Branch"}
        </span>
      </div>

      {/* Nested children */}
      {hasChildren && (
        <div className={styles.branchChildren}>
          {/* Branch questions */}
          {branch.questions.map((q) => (
            <div
              key={q.id}
              onClick={() => onSelectQuestion(q.id, branch.id)}
              className={cn(
                styles.questionChip,
                selectedQuestionId === q.id && styles.questionChipSelected
              )}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <QuestionCircle24Regular style={{ width: 12, height: 12 }} />
                <span style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {q.text || "Untitled"}
                </span>
              </div>
            </div>
          ))}

          {/* Child branches (recursive) */}
          {branch.childBranches.map((cb) => (
            <BranchContainerView
              key={cb.id}
              branch={cb}
              selectedBranchId={selectedBranchId}
              selectedQuestionId={selectedQuestionId}
              onSelectBranch={onSelectBranch}
              onSelectQuestion={onSelectQuestion}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SectionEditorProps {
  section: Section;
  allQuestions: Question[];
  selectedQuestionId: string | null;
  selectedBranchId: string | null;
  onUpdate: (updated: Section) => void;
  onDelete: () => void;
  onSelectQuestion: (questionId: string, branchId: string | null) => void;
  onSelectBranch: (branchId: string) => void;
}

const SectionEditor = ({
  section,
  allQuestions,
  selectedQuestionId,
  selectedBranchId,
  onUpdate,
  onDelete,
  onSelectQuestion,
  onSelectBranch,
}: SectionEditorProps) => {
  const styles = useStyles();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);

  const handleNameDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingName(true);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape") {
      setIsEditingName(false);
    }
  };

  const handleAddQuestion = (branchId?: string) => {
    const defaultAnswerSet: AnswerSet = {
      id: `as-${Date.now()}`,
      name: "Default Answer Set",
      tag: "",
      isDefault: true,
      answers: [{ id: `ans-${Date.now()}`, label: "", value: "", active: true }],
    };
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      text: "",
      type: "Choice",
      required: false,
      order: section.questions.length + 1,
      answerSets: [defaultAnswerSet],
      conditionGroup: {
        type: "group",
        id: `g-${Date.now()}`,
        matchType: "AND",
        children: [],
      },
      answerLevelRuleGroups: [],
    };

    if (branchId) {
      const addQuestionToBranch = (branchList: ConditionalBranch[]): ConditionalBranch[] =>
        branchList.map((b) => {
          if (b.id === branchId) {
            return { ...b, questions: [...b.questions, newQuestion] };
          }
          return { ...b, childBranches: addQuestionToBranch(b.childBranches) };
        });
      onUpdate({ ...section, branches: addQuestionToBranch(section.branches) });
      onSelectQuestion(newQuestion.id, branchId);
    } else {
      onUpdate({ ...section, questions: [...section.questions, newQuestion] });
      onSelectQuestion(newQuestion.id, null);
    }
  };

  const handleAddBranch = (parentId?: string) => {
    const newBranch: ConditionalBranch = {
      id: `cb-${Date.now()}`,
      name: "Conditional Branch",
      conditionGroup: {
        type: "group",
        id: `g-${Date.now()}`,
        matchType: "AND",
        children: [],
      },
      questions: [],
      childBranches: [],
    };

    if (parentId) {
      const addBranchToParent = (branchList: ConditionalBranch[]): ConditionalBranch[] =>
        branchList.map((b) => {
          if (b.id === parentId) {
            return { ...b, childBranches: [...b.childBranches, newBranch] };
          }
          return { ...b, childBranches: addBranchToParent(b.childBranches) };
        });
      onUpdate({ ...section, branches: addBranchToParent(section.branches) });
    } else {
      onUpdate({ ...section, branches: [...section.branches, newBranch] });
    }
    onSelectBranch(newBranch.id);
  };

  const updateQuestion = (id: string, updated: Partial<Question>) => {
    const updatedQuestions = section.questions.map((q) =>
      q.id === id ? { ...q, ...updated } : q
    );

    const updateInBranch = (branch: ConditionalBranch): ConditionalBranch => ({
      ...branch,
      questions: branch.questions.map((q) => (q.id === id ? { ...q, ...updated } : q)),
      childBranches: branch.childBranches.map(updateInBranch),
    });

    onUpdate({
      ...section,
      questions: updatedQuestions,
      branches: section.branches.map(updateInBranch),
    });
  };

  const deleteQuestion = (questionId: string) => {
    const deleteFromBranch = (branchList: ConditionalBranch[]): ConditionalBranch[] =>
      branchList.map((b) => ({
        ...b,
        questions: b.questions.filter((q) => q.id !== questionId),
        childBranches: deleteFromBranch(b.childBranches),
      }));

    onUpdate({
      ...section,
      questions: section.questions.filter((q) => q.id !== questionId),
      branches: deleteFromBranch(section.branches),
    });
  };

  const updateBranch = (id: string, updated: Partial<ConditionalBranch>) => {
    const updateRecursive = (branchList: ConditionalBranch[]): ConditionalBranch[] =>
      branchList.map((b) => ({
        ...b,
        ...(b.id === id ? updated : {}),
        childBranches: updateRecursive(b.childBranches),
      }));
    onUpdate({ ...section, branches: updateRecursive(section.branches) });
  };

  const deleteBranch = (branchId: string) => {
    const deleteRecursive = (branchList: ConditionalBranch[]): ConditionalBranch[] =>
      branchList
        .filter((b) => b.id !== branchId)
        .map((b) => ({ ...b, childBranches: deleteRecursive(b.childBranches) }));
    onUpdate({ ...section, branches: deleteRecursive(section.branches) });
  };

  const findBranchById = (branchList: ConditionalBranch[], id: string): ConditionalBranch | null => {
    for (const b of branchList) {
      if (b.id === id) return b;
      const found = findBranchById(b.childBranches, id);
      if (found) return found;
    }
    return null;
  };

  const selectedBranch = selectedBranchId ? findBranchById(section.branches, selectedBranchId) : null;

  const selectedQuestion = selectedQuestionId
    ? section.questions.find((q) => q.id === selectedQuestionId) ||
      (() => {
        const findQuestion = (branchList: ConditionalBranch[]): Question | null => {
          for (const b of branchList) {
            const q = b.questions.find((q) => q.id === selectedQuestionId);
            if (q) return q;
            const found = findQuestion(b.childBranches);
            if (found) return found;
          }
          return null;
        };
        return findQuestion(section.branches);
      })()
    : null;

  return (
    <Accordion
      collapsible
      openItems={isExpanded ? ["section"] : []}
      onToggle={(_, data) => setIsExpanded(data.openItems.includes("section"))}
    >
      <AccordionItem value="section" className={styles.card}>
        <AccordionHeader
          expandIconPosition="end"
          className={styles.header}
        >
          <div className={styles.headerLeft} onDoubleClick={handleNameDoubleClick}>
            <LayerDiagonal24Regular style={{ color: tokens.colorBrandForeground1 }} />
            {isEditingName ? (
              <Input
                value={section.name}
                onChange={(e, data) => onUpdate({ ...section, name: data.value })}
                onClick={(e) => e.stopPropagation()}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                className={styles.nameInput}
                placeholder="Section name"
                autoFocus
              />
            ) : (
              <span className={styles.sectionTitle}>
                {section.name || "Untitled Section"}
              </span>
            )}
          </div>
          <ConfirmDialog
            trigger={
              <Button
                appearance="subtle"
                icon={<Delete24Regular />}
              />
            }
            title="Delete Section"
            description={`Are you sure you want to delete "${section.name || "Untitled Section"}"? This will remove all questions and branches within it. This action cannot be undone.`}
            onConfirm={onDelete}
          />
        </AccordionHeader>
        <AccordionPanel className={styles.content}>
          <div className={styles.buttonRow}>
            <Button appearance="primary" icon={<Add24Regular />} onClick={() => handleAddQuestion()}>
              Add Question
            </Button>
            <Button appearance="secondary" icon={<Add24Regular />} onClick={() => handleAddBranch()}>
              Add Branch
            </Button>
          </div>

          {/* Compact Questions & Branches List */}
          {(section.questions.length > 0 || section.branches.length > 0) && (
            <div className={styles.itemsContainer}>
              {/* Section-level Questions */}
              {section.questions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => onSelectQuestion(q.id, null)}
                  className={cn(
                    styles.questionChip,
                    selectedQuestionId === q.id && !selectedBranchId && styles.questionChipSelected
                  )}
                >
                  {q.text || "Untitled Question"}
                </div>
              ))}

              {/* Branches with nested content */}
              {section.branches.map((b) => (
                <BranchContainerView
                  key={b.id}
                  branch={b}
                  selectedBranchId={selectedBranchId}
                  selectedQuestionId={selectedQuestionId}
                  onSelectBranch={onSelectBranch}
                  onSelectQuestion={onSelectQuestion}
                />
              ))}
            </div>
          )}

          {/* Selected Branch Editor */}
          {selectedBranch && (
            <div className={styles.editorSection}>
              <BranchEditor
                branch={selectedBranch}
                allQuestions={allQuestions}
                selectedQuestionId={selectedQuestionId}
                onUpdateBranch={updateBranch}
                onAddQuestion={handleAddQuestion}
                onAddChildBranch={handleAddBranch}
                onSelectQuestion={(id) => onSelectQuestion(id, selectedBranchId)}
                onDeleteBranch={deleteBranch}
                onDeleteQuestion={deleteQuestion}
                questionEditor={
                  selectedQuestion && selectedBranch.questions.some((q) => q.id === selectedQuestionId) ? (
                    <QuestionEditor
                      question={selectedQuestion}
                      allQuestions={allQuestions}
                      onUpdate={updateQuestion}
                      onDelete={deleteQuestion}
                    />
                  ) : undefined
                }
              />
            </div>
          )}

          {/* Selected Question Editor (not in branch) */}
          {selectedQuestion && !selectedBranch && section.questions.some((q) => q.id === selectedQuestionId) && (
            <div className={styles.editorSection}>
              <QuestionEditor
                question={selectedQuestion}
                allQuestions={allQuestions}
                onUpdate={updateQuestion}
                onDelete={deleteQuestion}
              />
            </div>
          )}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default SectionEditor;
