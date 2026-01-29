import * as React from 'react';
import { useState, useMemo } from "react";
import {
  Button,
  Input,
  Label,
  Field,
  Dropdown,
  Option,
  Spinner,
  makeStyles,
  tokens,
  Text,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
} from "@fluentui/react-components";
import {
  Add24Regular,
  DocumentText24Regular,
  BranchFork24Regular,
  QuestionCircle24Regular,
  ArrowSync24Regular,
  ChevronDown24Regular,
  ChevronUp24Regular,
  Settings24Regular,
  Flash24Regular,
  Layer24Regular,
  Document24Regular,
  Search24Regular,
  Dismiss24Regular,
} from "@fluentui/react-icons";
import { AutoResizeTextarea } from "../ui/auto-resize-textarea";
import { Question, ConditionalBranch, Questionnaire, Page, Section } from "../../types/questionnaire";
import { cn } from "../../lib/utils";

const useStyles = makeStyles({
  container: {
    height: "100%",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  header: {
    padding: tokens.spacingHorizontalL,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scrollArea: {
    flex: 1,
    overflow: "auto",
  },
  content: {
    padding: tokens.spacingHorizontalS,
  },
  treeItem: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    cursor: "pointer",
    transition: "all 0.2s",
    border: `1px solid transparent`,
  },
  treeItemActive: {
    backgroundColor: tokens.colorBrandBackground2,
    border: `1px solid ${tokens.colorBrandStroke1}`,
    color: tokens.colorBrandForeground1,
  },
  treeItemPath: {
    backgroundColor: tokens.colorBrandBackground2Hover,
    border: `1px solid ${tokens.colorBrandStroke2}`,
  },
  treeItemHover: {
    backgroundColor: tokens.colorNeutralBackground1Hover,
  },
  detailsBox: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingHorizontalM,
    backgroundColor: tokens.colorNeutralBackground3,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  searchWrapper: {
    position: "relative",
    marginTop: tokens.spacingVerticalS,
  },
  searchIcon: {
    position: "absolute",
    left: tokens.spacingHorizontalS,
    top: "50%",
    transform: "translateY(-50%)",
    color: tokens.colorNeutralForeground4,
  },
  searchInput: {
    paddingLeft: "32px",
    paddingRight: "32px",
  },
  clearButton: {
    position: "absolute",
    right: tokens.spacingHorizontalS,
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: tokens.colorNeutralForeground4,
  },
  highlight: {
    backgroundColor: tokens.colorPaletteYellowBackground2,
    borderRadius: tokens.borderRadiusSmall,
    padding: `0 ${tokens.spacingHorizontalXXS}`,
  },
  sectionItem: {
    marginLeft: tokens.spacingHorizontalL,
  },
  questionItem: {
    marginLeft: tokens.spacingHorizontalL,
  },
  branchItem: {
    marginLeft: tokens.spacingHorizontalL,
  },
  treeLine: {
    position: "absolute",
    left: "8px",
    width: "1px",
    backgroundColor: tokens.colorNeutralStroke1,
  },
  treeConnector: {
    position: "absolute",
    left: "8px",
    width: "12px",
    height: "1px",
    backgroundColor: tokens.colorNeutralStroke1,
  },
});

interface SidebarProps {
  questionnaire: Questionnaire | null;
  activePageId: string | null;
  selectedSectionId: string | null;
  selectedQuestionId: string | null;
  selectedBranchId: string | null;
  onCreateQuestionnaire: () => void;
  onSelectPage: (id: string) => void;
  onSelectSection: (id: string) => void;
  onSelectQuestion: (id: string, branchId: string | null) => void;
  onSelectBranch: (id: string) => void;
  onReset: () => void;
  onUpdateQuestionnaire: (updated: Questionnaire) => void;
  onPublish?: () => void;
  isPublishing?: boolean;
  canPublish?: boolean;
}

const Sidebar = ({
  questionnaire,
  activePageId,
  selectedSectionId,
  selectedQuestionId,
  selectedBranchId,
  onCreateQuestionnaire,
  onSelectPage,
  onSelectSection,
  onSelectQuestion,
  onSelectBranch,
  onReset,
  onUpdateQuestionnaire,
  onPublish,
  isPublishing = false,
  canPublish = false,
}: SidebarProps) => {
  const styles = useStyles();
  const [detailsOpen, setDetailsOpen] = useState<string[]>(["details"]);
  const [searchQuery, setSearchQuery] = useState("");

  const matchesSearch = (text: string | undefined): boolean => {
    if (!searchQuery.trim()) return true;
    return (text || '').toLowerCase().includes(searchQuery.toLowerCase());
  };

  const highlightText = (text: string | undefined): React.ReactNode => {
    const displayText = text || 'Untitled';
    if (!searchQuery.trim()) return displayText;
    
    const query = searchQuery.toLowerCase();
    const lowerText = displayText.toLowerCase();
    const matchIndex = lowerText.indexOf(query);
    
    if (matchIndex === -1) return displayText;
    
    const before = displayText.slice(0, matchIndex);
    const match = displayText.slice(matchIndex, matchIndex + searchQuery.length);
    const after = displayText.slice(matchIndex + searchQuery.length);
    
    return (
      <>
        {before}
        <mark className={styles.highlight}>{match}</mark>
        {after}
      </>
    );
  };

  const branchMatchesSearch = (branch: ConditionalBranch): boolean => {
    if (matchesSearch(branch.name)) return true;
    if (branch.questions.some(q => matchesSearch(q.text))) return true;
    return branch.childBranches.some(cb => branchMatchesSearch(cb));
  };

  const sectionMatchesSearch = (section: Section): boolean => {
    if (matchesSearch(section.name)) return true;
    if (section.questions.some(q => matchesSearch(q.text))) return true;
    return section.branches.some(b => branchMatchesSearch(b));
  };

  const pageMatchesSearch = (page: Page): boolean => {
    if (matchesSearch(page.name)) return true;
    return page.sections.some(s => sectionMatchesSearch(s));
  };

  const filteredPages = useMemo(() => {
    if (!questionnaire || !searchQuery.trim()) return questionnaire?.pages || [];
    return questionnaire.pages.filter(page => pageMatchesSearch(page));
  }, [questionnaire, searchQuery]);

  const findAncestorBranchIds = (
    targetBranchId: string | null,
    targetQuestionId: string | null,
    branches: ConditionalBranch[],
    ancestors: string[] = []
  ): string[] | null => {
    for (const branch of branches) {
      if (targetBranchId && branch.id === targetBranchId) {
        return ancestors;
      }
      if (targetQuestionId && branch.questions.some(q => q.id === targetQuestionId)) {
        return [...ancestors, branch.id];
      }
      const found = findAncestorBranchIds(
        targetBranchId,
        targetQuestionId,
        branch.childBranches,
        [...ancestors, branch.id]
      );
      if (found) return found;
    }
    return null;
  };

  const getSelectedPageId = (): string | null => {
    if (!questionnaire || (!selectedSectionId && !selectedQuestionId && !selectedBranchId)) {
      return null;
    }
    for (const page of questionnaire.pages) {
      if (selectedSectionId && page.sections.some(s => s.id === selectedSectionId)) {
        return page.id;
      }
    }
    return null;
  };

  const selectedPageId = getSelectedPageId();

  const getAncestorBranchIds = (): string[] => {
    if (!questionnaire || !selectedSectionId) return [];
    const section = questionnaire.pages
      .flatMap(p => p.sections)
      .find(s => s.id === selectedSectionId);
    if (!section) return [];
    const ancestors = findAncestorBranchIds(
      selectedBranchId,
      selectedQuestionId,
      section.branches
    );
    return ancestors || [];
  };

  const ancestorBranchIds = getAncestorBranchIds();

  const questionHasAction = (question: Question): boolean => {
    if (question.actionRecord) return true;
    for (const answerSet of question.answerSets) {
      for (const answer of answerSet.answers) {
        if (answer.actionRecord) return true;
      }
    }
    for (const ruleGroup of question.answerLevelRuleGroups) {
      if (ruleGroup.inlineAnswerSet) {
        for (const answer of ruleGroup.inlineAnswerSet.answers) {
          if (answer.actionRecord) return true;
        }
      }
    }
    return false;
  };

  const renderBranchTree = (
    branch: ConditionalBranch,
    sectionId: string,
    pageId: string,
    depth = 0,
    isLast = true,
    parentLines: boolean[] = []
  ): JSX.Element => {
    const allItems = [
      ...branch.questions.map(q => ({ type: 'question' as const, item: q })),
      ...branch.childBranches.map(cb => ({ type: 'branch' as const, item: cb }))
    ];

    const isInPath = ancestorBranchIds.includes(branch.id);
    const isDirectlySelected = selectedBranchId === branch.id && !selectedQuestionId;

    return (
      <div key={branch.id} className="relative">
        <div className="flex items-stretch">
          <div className="flex" style={{ width: `${depth * 20}px` }}>
            {parentLines.map((showLine, i) => (
              <div key={i} className="w-5 relative">
                {showLine && <div className={cn(styles.treeLine, "top-0 bottom-0")} />}
              </div>
            ))}
          </div>

          {depth > 0 && (
            <div className="w-5 relative flex items-center">
              <div className={cn(styles.treeLine, isLast ? "top-0 h-1/2" : "top-0 bottom-0")} />
              <div className={cn(styles.treeConnector, "top-1/2")} />
            </div>
          )}

          <div
            className={cn(
              styles.treeItem,
              "flex-1",
              isDirectlySelected && styles.treeItemActive,
              isInPath && !isDirectlySelected && styles.treeItemPath
            )}
            onClick={() => {
              onSelectPage(pageId);
              onSelectSection(sectionId);
              onSelectBranch(branch.id);
            }}
          >
            <BranchFork24Regular primaryFill={isDirectlySelected || isInPath ? tokens.colorBrandForeground1 : tokens.colorNeutralForeground4} />
            <Text size={200} weight="medium" truncate>{highlightText(branch.name) || 'Untitled Branch'}</Text>
          </div>
        </div>

        {allItems.map((child, index) => {
          const isChildLast = index === allItems.length - 1;
          const newParentLines = [...parentLines, !isLast];

          if (child.type === 'question') {
            return (
              <div key={child.item.id} className="flex items-stretch">
                <div className="flex" style={{ width: `${(depth + 1) * 20}px` }}>
                  {[...parentLines, !isLast].map((showLine, i) => (
                    <div key={i} className="w-5 relative">
                      {showLine && <div className={cn(styles.treeLine, "top-0 bottom-0")} />}
                    </div>
                  ))}
                </div>

                <div className="w-5 relative flex items-center">
                  <div className={cn(styles.treeLine, isChildLast ? "top-0 h-1/2" : "top-0 bottom-0")} />
                  <div className={cn(styles.treeConnector, "top-1/2")} />
                </div>

                <div
                  className={cn(
                    styles.treeItem,
                    "flex-1",
                    selectedQuestionId === child.item.id && styles.treeItemActive
                  )}
                  onClick={() => {
                    onSelectPage(pageId);
                    onSelectSection(sectionId);
                    onSelectQuestion(child.item.id, branch.id);
                  }}
                >
                  <QuestionCircle24Regular />
                  <Text size={200} truncate style={{ flex: 1 }}>{highlightText(child.item.text) || 'Untitled Question'}</Text>
                  {questionHasAction(child.item) && (
                    <Flash24Regular primaryFill={tokens.colorPaletteYellowForeground1} />
                  )}
                </div>
              </div>
            );
          } else {
            return renderBranchTree(child.item, sectionId, pageId, depth + 1, isChildLast, newParentLines);
          }
        })}
      </div>
    );
  };

  const renderSectionTree = (section: Section, pageId: string): JSX.Element => {
    const hasSelectedChild = selectedSectionId === section.id && (selectedQuestionId || selectedBranchId);
    const isSectionDirectlySelected = selectedSectionId === section.id && !selectedQuestionId && !selectedBranchId;
    
    const filteredQuestions = searchQuery.trim() 
      ? section.questions.filter(q => matchesSearch(q.text))
      : section.questions;
    
    const filteredBranches = searchQuery.trim()
      ? section.branches.filter(b => branchMatchesSearch(b))
      : section.branches;

    const sectionDirectlyMatches = matchesSearch(section.name);
    const hasMatchingChildren = filteredQuestions.length > 0 || filteredBranches.length > 0;
    
    if (searchQuery.trim() && !sectionDirectlyMatches && !hasMatchingChildren) {
      return <></>;
    }
    
    return (
      <div key={section.id} className={styles.sectionItem}>
        <div
          className={cn(
            styles.treeItem,
            isSectionDirectlySelected && styles.treeItemActive,
            hasSelectedChild && !isSectionDirectlySelected && styles.treeItemPath
          )}
          onClick={() => {
            onSelectPage(pageId);
            onSelectSection(section.id);
          }}
        >
          <Layer24Regular primaryFill={isSectionDirectlySelected || hasSelectedChild ? tokens.colorBrandForeground1 : tokens.colorNeutralForeground4} />
          <Text size={200} weight="medium" truncate>{highlightText(section.name) || 'Untitled Section'}</Text>
        </div>

        {filteredQuestions.map(q => (
          <div
            key={q.id}
            className={cn(
              styles.treeItem,
              styles.questionItem,
              selectedQuestionId === q.id && selectedSectionId === section.id && styles.treeItemActive
            )}
            onClick={() => {
              onSelectPage(pageId);
              onSelectSection(section.id);
              onSelectQuestion(q.id, null);
            }}
          >
            <QuestionCircle24Regular />
            <Text size={200} truncate style={{ flex: 1 }}>{highlightText(q.text) || 'Untitled Question'}</Text>
            {questionHasAction(q) && (
              <Flash24Regular primaryFill={tokens.colorPaletteYellowForeground1} />
            )}
          </div>
        ))}

        {filteredBranches.map((branch, idx) => (
          <div key={branch.id} className={styles.branchItem}>
            {renderBranchTree(branch, section.id, pageId, 0, idx === filteredBranches.length - 1, [])}
          </div>
        ))}
      </div>
    );
  };

  const renderPageTree = (page: Page): JSX.Element => {
    const isPageInPath = selectedPageId === page.id;
    const isPageActive = activePageId === page.id;
    const hasSelectedDescendant = isPageInPath && (selectedSectionId || selectedQuestionId || selectedBranchId);

    const filteredSections = searchQuery.trim()
      ? page.sections.filter(s => sectionMatchesSearch(s))
      : page.sections;
    
    return (
      <div key={page.id}>
        <div
          className={cn(
            styles.treeItem,
            isPageActive && styles.treeItemActive,
            hasSelectedDescendant && !isPageActive && styles.treeItemPath
          )}
          onClick={() => onSelectPage(page.id)}
        >
          <Document24Regular primaryFill={isPageActive || hasSelectedDescendant ? tokens.colorBrandForeground1 : tokens.colorNeutralForeground4} />
          <Text size={200} weight="medium" truncate>{highlightText(page.name) || 'Untitled Page'}</Text>
        </div>

        {filteredSections.map(section => renderSectionTree(section, page.id))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text weight="semibold" size={300}>Questionnaire Tree</Text>
        {questionnaire && (
          <Button
            appearance="subtle"
            size="small"
            icon={<ArrowSync24Regular />}
            onClick={onReset}
          >
            Reset
          </Button>
        )}
      </div>

      <div className={styles.scrollArea}>
        <div className={styles.content}>
          {questionnaire ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacingVerticalXS }}>
              {/* Questionnaire Header */}
              <div className={cn(styles.treeItem, styles.treeItemActive)}>
                <DocumentText24Regular primaryFill={tokens.colorBrandForeground1} />
                <Text size={200} weight="semibold" truncate>
                  {questionnaire.name || 'Untitled Questionnaire'}
                </Text>
              </div>

              {/* Collapsible Details */}
              <Accordion
                openItems={detailsOpen}
                onToggle={(_, data) => setDetailsOpen(data.openItems as string[])}
                collapsible
              >
                <AccordionItem value="details">
                  <AccordionHeader icon={<Settings24Regular />} size="small">
                    <Text size={200}>Details</Text>
                  </AccordionHeader>
                  <AccordionPanel>
                    <div className={styles.detailsBox}>
                      <Field label={<Label size="small">Name</Label>}>
                        <Input
                          placeholder="Questionnaire name"
                          value={questionnaire.name}
                          onChange={(_, data) => onUpdateQuestionnaire({ ...questionnaire, name: data.value })}
                          size="small"
                        />
                      </Field>

                      <Field label={<Label size="small">Description</Label>}>
                        <AutoResizeTextarea
                          placeholder="Description"
                          value={questionnaire.description}
                          onChange={(e) => onUpdateQuestionnaire({ ...questionnaire, description: e.target.value })}
                          className="text-xs w-full min-w-0 min-h-[28px] py-1.5"
                          minRows={1}
                          maxRows={5}
                        />
                      </Field>

                      <Field label={<Label size="small">Service Catalog</Label>}>
                        <Dropdown
                          placeholder="Select catalog"
                          value={questionnaire.serviceCatalog || ''}
                          selectedOptions={questionnaire.serviceCatalog ? [questionnaire.serviceCatalog] : []}
                          onOptionSelect={(_, data) => onUpdateQuestionnaire({ ...questionnaire, serviceCatalog: data.optionValue as string })}
                          size="small"
                        >
                          <Option value="Catalog A">Catalog A</Option>
                          <Option value="Catalog B">Catalog B</Option>
                          <Option value="Catalog C">Catalog C</Option>
                        </Dropdown>
                      </Field>

                      <Field label={<Label size="small">Status</Label>}>
                        <Dropdown
                          value={questionnaire.status || 'Draft'}
                          selectedOptions={[questionnaire.status || 'Draft']}
                          onOptionSelect={(_, data) => onUpdateQuestionnaire({ ...questionnaire, status: data.optionValue as string })}
                          size="small"
                        >
                          <Option value="Draft">Draft</Option>
                          <Option value="Active">Active</Option>
                        </Dropdown>
                      </Field>

                      <Button 
                        appearance="primary"
                        size="small"
                        onClick={onPublish}
                        disabled={!questionnaire?.name || isPublishing}
                        style={{ width: '100%' }}
                        icon={isPublishing ? <Spinner size="tiny" /> : undefined}
                      >
                        {isPublishing ? "Publishing..." : "Publish"}
                      </Button>
                    </div>
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>

              {/* Search Box */}
              <div className={styles.searchWrapper}>
                <Search24Regular className={styles.searchIcon} />
                <Input
                  placeholder="Search tree..."
                  value={searchQuery}
                  onChange={(_, data) => setSearchQuery(data.value)}
                  size="small"
                  className={styles.searchInput}
                  style={{ paddingLeft: '32px' }}
                />
                {searchQuery && (
                  <span
                    onClick={() => setSearchQuery("")}
                    className={styles.clearButton}
                  >
                    <Dismiss24Regular />
                  </span>
                )}
              </div>

              {/* Pages Tree */}
              <div style={{ marginTop: tokens.spacingVerticalS }}>
                {filteredPages.length > 0 ? (
                  filteredPages.map(page => renderPageTree(page))
                ) : searchQuery ? (
                  <Text size={200} style={{ textAlign: 'center', padding: tokens.spacingVerticalL }}>
                    No results found for "{searchQuery}"
                  </Text>
                ) : (
                  questionnaire.pages.map(page => renderPageTree(page))
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: tokens.spacingHorizontalL }}>
              <Button
                appearance="primary"
                icon={<Add24Regular />}
                onClick={onCreateQuestionnaire}
                style={{ width: '100%' }}
              >
                Create Questionnaire
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
