import * as React from 'react';
import { useState, useEffect } from 'react';
import { useNavigation } from '../../lib/navigation';
import {
  Add24Regular,
  QuestionCircle24Regular,
  Layer24Regular,
  Document24Regular,
  Clock24Regular,
  ErrorCircle24Regular,
  Settings24Regular,
  Edit24Regular,
  BranchFork24Regular,
  TaskListSquareLtr24Regular,
  Flash24Regular,
  DocumentMultiple24Regular,
  Save24Regular,
  Delete24Regular,
  Book24Regular,
  ArrowDownload24Regular,
  Play24Regular,
  Dismiss24Regular,
  ArrowUpload24Regular,
  ReOrder24Regular,
  Code24Regular,
} from "@fluentui/react-icons";
import { 
  ConfirmDialog, 
  Button, 
  Card, 
  CardHeader, 
  Badge,
  makeStyles,
  tokens,
  mergeClasses,
} from "../fluent";
import { exportQuestionnaire, buildExportData, parseQuestionnaireFile } from "../../lib/questionnaireExport";
import { QuestionnaireWrapper } from "../../lib/QuestionnaireWrapper";
import { useDataverse } from "../../lib/dataverse/pcf/DataverseContext";
import {
  Question,
  ConditionalBranch,
  Questionnaire,
  Page,
  Section,
} from "../../types/questionnaire";
import Sidebar from "./Sidebar";
import PageTabs from "./PageTabs";
import SectionEditor from "./SectionEditor";
import { sampleITSMRecords, ITSMRecord } from "../../data/sampleITSMRecords";
import { cn } from "../../lib/utils";
import { useFluentToast } from "../../hooks/useFluentToast";

const useStyles = makeStyles({
  container: {
    display: "flex",
    height: "100vh",
    width: "100%",
    backgroundColor: tokens.colorNeutralBackground2,
  },
  resizeHandle: {
    position: "relative",
    display: "flex",
    width: "4px",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colorNeutralStroke1,
    cursor: "col-resize",
    transition: "background-color 0.2s",
    "&:hover": {
      backgroundColor: tokens.colorBrandStroke1,
    },
  },
  handleIcon: {
    zIndex: 10,
    display: "flex",
    height: "16px",
    width: "12px",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: tokens.borderRadiusSmall,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  scrollContainer: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
  },
  mainContent: {
    height: "100%",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  card: {
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow4,
    transition: "box-shadow 0.2s",
    "&:hover": {
      boxShadow: tokens.shadow8,
    },
  },
  cardDashed: {},
  cardContent: {
    padding: tokens.spacingVerticalM,
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    padding: tokens.spacingVerticalS,
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorPaletteRedBackground2,
    border: `1px solid ${tokens.colorPaletteRedBorder2}`,
    color: tokens.colorPaletteRedForeground2,
  },
  emptyState: {
    padding: `${tokens.spacingVerticalXXL} 0`,
    textAlign: "center" as const,
  },
  statsRow: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    flexWrap: "wrap" as const,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
  },
  statItem: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
  },
  categoryIcon: {
    height: "40px",
    width: "40px",
    borderRadius: tokens.borderRadiusMedium,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  incident: {
    backgroundColor: tokens.colorPaletteRedBackground2,
    color: tokens.colorPaletteRedForeground2,
  },
  serviceRequest: {
    backgroundColor: tokens.colorPaletteBlueBorderActive,
    color: tokens.colorPaletteBlueForeground2,
  },
  change: {
    backgroundColor: tokens.colorPaletteYellowBackground2,
    color: tokens.colorPaletteYellowForeground2,
  },
  problem: {
    backgroundColor: tokens.colorPalettePurpleBackground2,
    color: tokens.colorPalettePurpleForeground2,
  },
  draft: {
    backgroundColor: tokens.colorBrandBackgroundInverted,
    color: tokens.colorBrandForeground1,
  },
});

const DRAFTS_STORAGE_KEY = 'questionnaire-drafts';

interface SavedDraft {
  id: string;
  questionnaire: Questionnaire;
  savedAt: string;
  pageCount: number;
  sectionCount: number;
  questionCount: number;
  branchCount: number;
}

const loadDraftsFromStorage = (): SavedDraft[] => {
  try {
    const stored = localStorage.getItem(DRAFTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveDraftsToStorage = (drafts: SavedDraft[]) => {
  try {
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(drafts));
  } catch (e) {
    console.error('Failed to save drafts to localStorage', e);
  }
};

const PUBLISHED_RECORDS_KEY = 'published-itsm-records';
const PUBLISHED_QUESTIONNAIRES_KEY = 'published-questionnaires';

interface PublishedRecord {
  metadata: ITSMRecord;
  questionnaire: Questionnaire;
}

const loadPublishedRecords = (): Record<string, PublishedRecord> => {
  try {
    const stored = localStorage.getItem(PUBLISHED_QUESTIONNAIRES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const savePublishedRecords = (records: Record<string, PublishedRecord>) => {
  try {
    localStorage.setItem(PUBLISHED_QUESTIONNAIRES_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save published records to localStorage', e);
  }
};

// Categorized validation errors for publish
interface ValidationErrors {
  pages: string[];
  sections: string[];
  branches: string[];
  questions: string[];
}

const QuestionnaireBuilder = () => {
  const styles = useStyles();
  const toast = useFluentToast();
  const { navigate } = useNavigation();
  const { createQuestionnaireRecord, updateQuestionnaireRecord, isPCFEnvironment } = useDataverse();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [savedDrafts, setSavedDrafts] = useState<SavedDraft[]>([]);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [publishedRecords, setPublishedRecords] = useState<Record<string, PublishedRecord>>(loadPublishedRecords());
  const [publishValidationErrors, setPublishValidationErrors] = useState<ValidationErrors | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [dataverseRecordId, setDataverseRecordId] = useState<string | null>(null);

  // Load drafts from localStorage on mount
  useEffect(() => {
    setSavedDrafts(loadDraftsFromStorage());
  }, []);

  // Save drafts to localStorage whenever they change
  useEffect(() => {
    saveDraftsToStorage(savedDrafts);
  }, [savedDrafts]);

  // Save published records whenever they change
  useEffect(() => {
    savePublishedRecords(publishedRecords);
  }, [publishedRecords]);

  // Clear publish validation errors when questionnaire changes
  useEffect(() => {
    if (publishValidationErrors) {
      setPublishValidationErrors(null);
    }
  }, [questionnaire]);

  const handleCreateQuestionnaire = () => {
    const defaultPage: Page = {
      id: `page-${Date.now()}`,
      name: 'Page 1',
      description: '',
      sections: []
    };
    setQuestionnaire({
      name: '',
      description: '',
      status: 'Draft',
      version: '1.0',
      serviceCatalog: '',
      pages: [defaultPage]
    });
    setActivePageId(defaultPage.id);
  };

  const handleEditRecord = (record: ITSMRecord) => {
    const ts = Date.now();
    
    // Page 1: Initial Assessment
    const page1: Page = {
      id: `page-${ts}-1`,
      name: 'Initial Assessment',
      description: 'Gather basic information about the request',
      sections: [
        {
          id: `section-${ts}-1`,
          name: 'Contact Information',
          description: 'Requester details',
          questions: [
            {
              id: `q-${ts}-1`,
              text: 'What is your department?',
              type: 'Choice',
              required: true,
              order: 1,
              answerSets: [{
                id: `as-${ts}-1`,
                name: 'Departments',
                tag: 'department',
                isDefault: false,
                answers: [
                  { id: `a-${ts}-1a`, label: 'IT', value: 'it', active: true },
                  { id: `a-${ts}-1b`, label: 'HR', value: 'hr', active: true },
                  { id: `a-${ts}-1c`, label: 'Finance', value: 'finance', active: true },
                  { id: `a-${ts}-1d`, label: 'Operations', value: 'operations', active: true },
                  { id: `a-${ts}-1e`, label: 'Sales', value: 'sales', active: true }
                ]
              }],
              conditionGroup: { type: 'group', id: `rg-${ts}-1`, matchType: 'AND', children: [] },
              answerLevelRuleGroups: []
            },
            {
              id: `q-${ts}-2`,
              text: 'Preferred contact method?',
              type: 'Choice',
              required: true,
              order: 2,
              answerSets: [{
                id: `as-${ts}-2`,
                name: 'Contact Methods',
                tag: 'contact',
                isDefault: false,
                answers: [
                  { id: `a-${ts}-2a`, label: 'Email', value: 'email', active: true },
                  { id: `a-${ts}-2b`, label: 'Phone', value: 'phone', active: true },
                  { id: `a-${ts}-2c`, label: 'Teams/Slack', value: 'chat', active: true }
                ]
              }],
              conditionGroup: { type: 'group', id: `rg-${ts}-2`, matchType: 'AND', children: [] },
              answerLevelRuleGroups: []
            }
          ],
          branches: []
        },
        {
          id: `section-${ts}-2`,
          name: 'Issue Classification',
          description: 'Categorize the request',
          questions: [
            {
              id: `q-${ts}-3`,
              text: 'What type of issue are you experiencing?',
              type: 'Choice',
              required: true,
              order: 1,
              answerSets: [{
                id: `as-${ts}-3`,
                name: 'Issue Types',
                tag: 'issue-type',
                isDefault: false,
                answers: [
                  { id: `a-${ts}-3a`, label: 'Hardware', value: 'hardware', active: true },
                  { id: `a-${ts}-3b`, label: 'Software', value: 'software', active: true },
                  { id: `a-${ts}-3c`, label: 'Network', value: 'network', active: true },
                  { id: `a-${ts}-3d`, label: 'Access/Permissions', value: 'access', active: true }
                ]
              }],
              conditionGroup: { type: 'group', id: `rg-${ts}-3`, matchType: 'AND', children: [] },
              answerLevelRuleGroups: []
            },
            {
              id: `q-${ts}-4`,
              text: 'What is the urgency level?',
              type: 'Choice',
              required: true,
              order: 2,
              answerSets: [{
                id: `as-${ts}-4`,
                name: 'Urgency Levels',
                tag: 'urgency',
                isDefault: false,
                answers: [
                  { id: `a-${ts}-4a`, label: 'Critical - Service Down', value: 'critical', active: true },
                  { id: `a-${ts}-4b`, label: 'High - Major Impact', value: 'high', active: true },
                  { id: `a-${ts}-4c`, label: 'Medium - Moderate Impact', value: 'medium', active: true },
                  { id: `a-${ts}-4d`, label: 'Low - Minor Impact', value: 'low', active: true }
                ]
              }],
              conditionGroup: { type: 'group', id: `rg-${ts}-4`, matchType: 'AND', children: [] },
              answerLevelRuleGroups: []
            }
          ],
          branches: [
            {
              id: `branch-${ts}-1`,
              name: 'Hardware Issues',
              conditionGroup: { type: 'group', id: `brg-${ts}-1`, matchType: 'AND', children: [] },
              questions: [
                {
                  id: `q-${ts}-5`,
                  text: 'What hardware is affected?',
                  type: 'Choice',
                  required: true,
                  order: 1,
                  answerSets: [{
                    id: `as-${ts}-5`,
                    name: 'Hardware Types',
                    tag: 'hardware',
                    isDefault: false,
                    answers: [
                      { id: `a-${ts}-5a`, label: 'Laptop/Desktop', value: 'computer', active: true },
                      { id: `a-${ts}-5b`, label: 'Monitor', value: 'monitor', active: true },
                      { id: `a-${ts}-5c`, label: 'Printer', value: 'printer', active: true },
                      { id: `a-${ts}-5d`, label: 'Keyboard/Mouse', value: 'peripheral', active: true }
                    ]
                  }],
                  conditionGroup: { type: 'group', id: `rg-${ts}-5`, matchType: 'AND', children: [] },
                  answerLevelRuleGroups: []
                },
                {
                  id: `q-${ts}-6`,
                  text: 'Is this hardware under warranty?',
                  type: 'Choice',
                  required: false,
                  order: 2,
                  answerSets: [{
                    id: `as-${ts}-6`,
                    name: 'Yes/No',
                    tag: 'yesno',
                    isDefault: true,
                    answers: [
                      { id: `a-${ts}-6a`, label: 'Yes', value: 'yes', active: true },
                      { id: `a-${ts}-6b`, label: 'No', value: 'no', active: true },
                      { id: `a-${ts}-6c`, label: 'Not Sure', value: 'unknown', active: true }
                    ]
                  }],
                  conditionGroup: { type: 'group', id: `rg-${ts}-6`, matchType: 'AND', children: [] },
                  answerLevelRuleGroups: []
                }
              ],
              childBranches: []
            },
            {
              id: `branch-${ts}-2`,
              name: 'Software Issues',
              conditionGroup: { type: 'group', id: `brg-${ts}-2`, matchType: 'AND', children: [] },
              questions: [
                {
                  id: `q-${ts}-7`,
                  text: 'Which application is affected?',
                  type: 'Text',
                  required: true,
                  order: 1,
                  answerSets: [{
                    id: `as-${ts}-7`,
                    name: 'Application Name',
                    tag: '',
                    isDefault: false,
                    answers: [{ id: `a-${ts}-7a`, label: '', value: '', active: true }]
                  }],
                  conditionGroup: { type: 'group', id: `rg-${ts}-7`, matchType: 'AND', children: [] },
                  answerLevelRuleGroups: []
                }
              ],
              childBranches: [
                {
                  id: `branch-${ts}-2-1`,
                  name: 'Installation Issues',
                  conditionGroup: { type: 'group', id: `brg-${ts}-2-1`, matchType: 'AND', children: [] },
                  questions: [
                    {
                      id: `q-${ts}-8`,
                      text: 'What error message do you see during installation?',
                      type: 'Text',
                      required: false,
                      order: 1,
                      answerSets: [{
                        id: `as-${ts}-8`,
                        name: 'Error Message',
                        tag: '',
                        isDefault: false,
                        answers: [{ id: `a-${ts}-8a`, label: '', value: '', active: true }]
                      }],
                      conditionGroup: { type: 'group', id: `rg-${ts}-8`, matchType: 'AND', children: [] },
                      answerLevelRuleGroups: []
                    }
                  ],
                  childBranches: []
                }
              ]
            }
          ]
        }
      ]
    };

    // Page 2: Detailed Information
    const page2: Page = {
      id: `page-${ts}-2`,
      name: 'Detailed Information',
      description: 'Provide more details about the issue',
      sections: [
        {
          id: `section-${ts}-3`,
          name: 'Problem Description',
          description: 'Describe the issue in detail',
          questions: [
            {
              id: `q-${ts}-9`,
              text: 'Please describe the issue in detail',
              type: 'Text',
              required: true,
              order: 1,
              answerSets: [{
                id: `as-${ts}-9`,
                name: 'Description',
                tag: '',
                isDefault: false,
                answers: [{ id: `a-${ts}-9a`, label: '', value: '', active: true }]
              }],
              conditionGroup: { type: 'group', id: `rg-${ts}-9`, matchType: 'AND', children: [] },
              answerLevelRuleGroups: []
            },
            {
              id: `q-${ts}-10`,
              text: 'When did this issue first occur?',
              type: 'Date',
              required: true,
              order: 2,
              answerSets: [{
                id: `as-${ts}-10`,
                name: 'Date',
                tag: '',
                isDefault: false,
                answers: [{ id: `a-${ts}-10a`, label: '', value: '', active: true }]
              }],
              conditionGroup: { type: 'group', id: `rg-${ts}-10`, matchType: 'AND', children: [] },
              answerLevelRuleGroups: []
            },
            {
              id: `q-${ts}-11`,
              text: 'How many users are affected?',
              type: 'Number',
              required: false,
              order: 3,
              answerSets: [{
                id: `as-${ts}-11`,
                name: 'User Count',
                tag: '',
                isDefault: false,
                answers: [{ id: `a-${ts}-11a`, label: '', value: '', active: true }]
              }],
              conditionGroup: { type: 'group', id: `rg-${ts}-11`, matchType: 'AND', children: [] },
              answerLevelRuleGroups: [],
              numberConfig: { min: 1, max: 1000, step: 1 }
            }
          ],
          branches: []
        },
        {
          id: `section-${ts}-4`,
          name: 'Impact Assessment',
          description: 'Assess the business impact',
          questions: [
            {
              id: `q-${ts}-12`,
              text: 'Is this preventing you from completing your work?',
              type: 'Choice',
              required: true,
              order: 1,
              answerSets: [{
                id: `as-${ts}-12`,
                name: 'Work Impact',
                tag: 'impact',
                isDefault: false,
                answers: [
                  { id: `a-${ts}-12a`, label: 'Yes, completely blocked', value: 'blocked', active: true },
                  { id: `a-${ts}-12b`, label: 'Partially, using workaround', value: 'workaround', active: true },
                  { id: `a-${ts}-12c`, label: 'No, minor inconvenience', value: 'minor', active: true }
                ]
              }],
              conditionGroup: { type: 'group', id: `rg-${ts}-12`, matchType: 'AND', children: [] },
              answerLevelRuleGroups: []
            },
            {
              id: `q-${ts}-13`,
              text: 'Rate the severity of this issue',
              type: 'Rating',
              required: true,
              order: 2,
              answerSets: [{
                id: `as-${ts}-13`,
                name: 'Severity Rating',
                tag: '',
                isDefault: false,
                answers: [{ id: `a-${ts}-13a`, label: '', value: '', active: true }]
              }],
              conditionGroup: { type: 'group', id: `rg-${ts}-13`, matchType: 'AND', children: [] },
              answerLevelRuleGroups: [],
              ratingConfig: { minValue: 1, maxValue: 5, minLabel: 'Low', maxLabel: 'Critical' }
            }
          ],
          branches: [
            {
              id: `branch-${ts}-3`,
              name: 'Critical Impact Follow-up',
              conditionGroup: { type: 'group', id: `brg-${ts}-3`, matchType: 'AND', children: [] },
              questions: [
                {
                  id: `q-${ts}-14`,
                  text: 'Is there a deadline affected by this issue?',
                  type: 'Date',
                  required: true,
                  order: 1,
                  answerSets: [{
                    id: `as-${ts}-14`,
                    name: 'Deadline',
                    tag: '',
                    isDefault: false,
                    answers: [{ id: `a-${ts}-14a`, label: '', value: '', active: true }]
                  }],
                  conditionGroup: { type: 'group', id: `rg-${ts}-14`, matchType: 'AND', children: [] },
                  answerLevelRuleGroups: []
                }
              ],
              childBranches: []
            }
          ]
        }
      ]
    };

    // Page 3: Resolution & Follow-up
    const page3: Page = {
      id: `page-${ts}-3`,
      name: 'Resolution & Follow-up',
      description: 'Preferences for resolution',
      sections: [
        {
          id: `section-${ts}-5`,
          name: 'Resolution Preferences',
          description: 'How would you like this resolved?',
          questions: [
            {
              id: `q-${ts}-15`,
              text: 'Preferred resolution method',
              type: 'MultiSelect',
              required: false,
              order: 1,
              answerSets: [{
                id: `as-${ts}-15`,
                name: 'Resolution Methods',
                tag: 'resolution',
                isDefault: false,
                answers: [
                  { id: `a-${ts}-15a`, label: 'Remote Support', value: 'remote', active: true },
                  { id: `a-${ts}-15b`, label: 'On-site Visit', value: 'onsite', active: true },
                  { id: `a-${ts}-15c`, label: 'Phone Call', value: 'phone', active: true },
                  { id: `a-${ts}-15d`, label: 'Email Instructions', value: 'email', active: true }
                ]
              }],
              conditionGroup: { type: 'group', id: `rg-${ts}-15`, matchType: 'AND', children: [] },
              answerLevelRuleGroups: []
            },
            {
              id: `q-${ts}-16`,
              text: 'Best time to contact you',
              type: 'Choice',
              required: true,
              order: 2,
              answerSets: [{
                id: `as-${ts}-16`,
                name: 'Contact Times',
                tag: 'time',
                isDefault: false,
                answers: [
                  { id: `a-${ts}-16a`, label: 'Morning (9am-12pm)', value: 'morning', active: true },
                  { id: `a-${ts}-16b`, label: 'Afternoon (12pm-5pm)', value: 'afternoon', active: true },
                  { id: `a-${ts}-16c`, label: 'Anytime', value: 'anytime', active: true }
                ]
              }],
              conditionGroup: { type: 'group', id: `rg-${ts}-16`, matchType: 'AND', children: [] },
              answerLevelRuleGroups: []
            }
          ],
          branches: []
        },
        {
          id: `section-${ts}-6`,
          name: 'Additional Notes',
          description: 'Any other information',
          questions: [
            {
              id: `q-${ts}-17`,
              text: 'Any additional comments or information?',
              type: 'Text',
              required: false,
              order: 1,
              answerSets: [{
                id: `as-${ts}-17`,
                name: 'Comments',
                tag: '',
                isDefault: false,
                answers: [{ id: `a-${ts}-17a`, label: '', value: '', active: true }]
              }],
              conditionGroup: { type: 'group', id: `rg-${ts}-17`, matchType: 'AND', children: [] },
              answerLevelRuleGroups: []
            }
          ],
          branches: []
        }
      ]
    };
    
    setQuestionnaire({
      name: record.name,
      description: record.description,
      status: record.status,
      version: '1.0',
      serviceCatalog: record.serviceCatalog,
      pages: [page1, page2, page3]
    });
    setActivePageId(page1.id);
    setSelectedSectionId(page1.sections[0].id);
    setEditingRecordId(record.id);
  };

  const handlePublish = async () => {
    if (!questionnaire || isPublishing) return;
    
    // Categorized validation errors
    const errors: ValidationErrors = {
      pages: [],
      sections: [],
      branches: [],
      questions: [],
    };
    
    // Helper to check if a rule group has rules
    const hasRules = (ruleGroup: { children: unknown[] }): boolean => {
      return ruleGroup.children && ruleGroup.children.length > 0;
    };
    
    // Helper to validate branches recursively
    const validateBranch = (branch: ConditionalBranch, path: string): void => {
      // Check if branch has no questions
      if (branch.questions.length === 0 && branch.childBranches.length === 0) {
        errors.branches.push(`"${branch.name || 'Untitled Branch'}" has no questions`);
      }
      
      // Check if branch is missing conditions
      const branchConditionGroup = branch.conditionGroup || branch.ruleGroup;
      if (!branchConditionGroup || !hasRules(branchConditionGroup)) {
        errors.branches.push(`"${branch.name || 'Untitled Branch'}" is missing conditions`);
      }
      
      // Check answer-level rule groups in branch questions
      branch.questions.forEach(q => {
        q.answerLevelRuleGroups.forEach((rg, rgIndex) => {
          if (!hasRules(rg)) {
            errors.questions.push(`Answer Set ${rgIndex + 1} in "${q.text || 'Untitled Question'}" is missing rules`);
          }
        });
      });
      
      // Recurse into child branches
      branch.childBranches.forEach(cb => validateBranch(cb, path));
    };
    
    // Validate pages, sections, branches
    questionnaire.pages.forEach(page => {
      const pageName = page.name || 'Untitled Page';
      
      // Check empty pages
      let pageHasContent = false;
      page.sections.forEach(section => {
        if (section.questions.length > 0 || section.branches.length > 0) {
          pageHasContent = true;
        }
      });
      
      if (!pageHasContent) {
        errors.pages.push(`"${pageName}" is missing content`);
      }
      
      // Validate sections
      page.sections.forEach(section => {
        const sectionName = section.name || 'Untitled Section';
        const sectionPath = `Page "${pageName}" > Section "${sectionName}"`;
        
        // Check empty sections
        if (section.questions.length === 0 && section.branches.length === 0) {
          errors.sections.push(`"${sectionName}" in "${pageName}" is empty`);
        }
        
        // Check answer-level rule groups in section questions
        section.questions.forEach(q => {
          q.answerLevelRuleGroups.forEach((rg, rgIndex) => {
            if (!hasRules(rg)) {
              errors.questions.push(`Answer Set ${rgIndex + 1} in "${q.text || 'Untitled Question'}" is missing rules`);
            }
          });
        });
        
        // Validate branches
        section.branches.forEach(branch => validateBranch(branch, sectionPath));
      });
    });
    
    // Check if any category has errors
    const hasErrors = errors.pages.length > 0 || errors.sections.length > 0 || 
                      errors.branches.length > 0 || errors.questions.length > 0;
    
    if (hasErrors) {
      setPublishValidationErrors(errors);
      return;
    }
    
    // Clear any previous errors
    setPublishValidationErrors(null);
    const stats = getQuestionnaireStats(questionnaire);
    
    // Count answer sets
    let answerSetCount = 0;
    let actionCount = 0;
    
    const countInBranch = (branch: ConditionalBranch) => {
      branch.questions.forEach(q => {
        answerSetCount += q.answerSets.length;
        q.answerSets.forEach(as => {
          as.answers.forEach(a => {
            if (a.actionRecord) actionCount++;
          });
        });
        q.answerLevelRuleGroups.forEach(rg => {
          if (rg.inlineAnswerSet) {
            answerSetCount++;
            rg.inlineAnswerSet.answers.forEach(a => {
              if (a.actionRecord) actionCount++;
            });
          }
        });
      });
      branch.childBranches.forEach(countInBranch);
    };
    
    questionnaire.pages.forEach(page => {
      page.sections.forEach(section => {
        section.questions.forEach(q => {
          answerSetCount += q.answerSets.length;
          q.answerSets.forEach(as => {
            as.answers.forEach(a => {
              if (a.actionRecord) actionCount++;
            });
          });
          q.answerLevelRuleGroups.forEach(rg => {
            if (rg.inlineAnswerSet) {
              answerSetCount++;
              rg.inlineAnswerSet.answers.forEach(a => {
                if (a.actionRecord) actionCount++;
              });
            }
          });
        });
        section.branches.forEach(countInBranch);
      });
    });
    
    // Create metadata for the published record
    const publishedMetadata: ITSMRecord = {
      id: editingRecordId || `record-${Date.now()}`,
      name: questionnaire.name || 'Untitled Questionnaire',
      description: questionnaire.description || '',
      category: 'Service Request',
      status: 'Active',
      priority: 'Medium',
      serviceCatalog: questionnaire.serviceCatalog || 'General',
      ...stats,
      answerSetCount,
      actionCount,
      createdAt: new Date().toLocaleDateString(),
      updatedAt: new Date().toLocaleDateString()
    };
    
    // Create or update Dataverse record using QuestionnaireWrapper
    setIsPublishing(true);
    try {
      const publishedQuestionnaire = { ...questionnaire, status: 'Active' as const };
      const wrapper = new QuestionnaireWrapper(publishedQuestionnaire);
      const dataverseRecord = wrapper.toDataverseRecord();
      
      if (dataverseRecordId) {
        // Update existing record
        const result = await updateQuestionnaireRecord(dataverseRecordId, dataverseRecord);
        
        if (!result.success) {
          toast.error(`Failed to update Dataverse record: ${result.error.userMessage}`);
          console.error('Dataverse update error:', result.error);
        } else {
          console.log('Updated Dataverse record:', dataverseRecordId);
          toast.success(`Updated Dataverse record: ${dataverseRecordId}`);
        }
      } else {
        // Create new record
        const result = await createQuestionnaireRecord(dataverseRecord);
        
        if (!result.success) {
          toast.error(`Failed to create Dataverse record: ${result.error.userMessage}`);
          console.error('Dataverse publish error:', result.error);
        } else {
          console.log('Created Dataverse record:', result.data.id);
          toast.success(`Published to Dataverse: ${result.data.id}`);
          setDataverseRecordId(result.data.id);
        }
      }
    } catch (err) {
      console.error('Unexpected error publishing to Dataverse:', err);
      toast.error('Unexpected error publishing to Dataverse');
    } finally {
      setIsPublishing(false);
    }
    
    // Store the full questionnaire in localStorage
    setPublishedRecords(prev => ({
      ...prev,
      [publishedMetadata.id]: {
        metadata: publishedMetadata,
        questionnaire: { ...questionnaire, status: 'Active' }
      }
    }));
    
    // If this was a draft, remove it
    if (editingDraftId) {
      setSavedDrafts(prev => prev.filter(d => d.id !== editingDraftId));
    }
    
    toast.success("Questionnaire published successfully!");
    
    // Return to list view
    setQuestionnaire(null);
    setActivePageId(null);
    setSelectedSectionId(null);
    setSelectedQuestionId(null);
    setSelectedBranchId(null);
    setEditingDraftId(null);
    setEditingRecordId(null);
    setDataverseRecordId(null);
  };

  const countQuestionsInBranch = (branch: ConditionalBranch): number => {
    let count = branch.questions.length;
    branch.childBranches.forEach(cb => {
      count += countQuestionsInBranch(cb);
    });
    return count;
  };

  const countBranchesInBranch = (branch: ConditionalBranch): number => {
    let count = 1;
    branch.childBranches.forEach(cb => {
      count += countBranchesInBranch(cb);
    });
    return count;
  };

  const getQuestionnaireStats = (q: Questionnaire) => {
    let sectionCount = 0;
    let questionCount = 0;
    let branchCount = 0;

    q.pages.forEach(page => {
      sectionCount += page.sections.length;
      page.sections.forEach(section => {
        questionCount += section.questions.length;
        section.branches.forEach(branch => {
          branchCount += countBranchesInBranch(branch);
          questionCount += countQuestionsInBranch(branch);
        });
      });
    });

    return {
      pageCount: q.pages.length,
      sectionCount,
      questionCount,
      branchCount
    };
  };

  const handleSaveAsDraft = () => {
    if (!questionnaire) return;
    
    const stats = getQuestionnaireStats(questionnaire);
    
    // Determine the draft ID to use:
    // 1. If editing an existing draft, use that ID
    // 2. If editing a record/template, use a draft ID based on the record ID
    // 3. Otherwise, create a new draft ID
    const draftIdToUse = editingDraftId || (editingRecordId ? `draft-${editingRecordId}` : null);
    
    if (draftIdToUse) {
      // Check if this draft already exists
      const existingDraft = savedDrafts.find(d => d.id === draftIdToUse);
      
      if (existingDraft) {
        // Update existing draft
        setSavedDrafts(prev => prev.map(draft => 
          draft.id === draftIdToUse
            ? {
                ...draft,
                questionnaire: { ...questionnaire, status: 'Draft' },
                savedAt: new Date().toLocaleString(),
                ...stats
              }
            : draft
        ));
        toast.success("Draft updated!");
      } else {
        // Create new draft with the determined ID
        const newDraft: SavedDraft = {
          id: draftIdToUse,
          questionnaire: { ...questionnaire, status: 'Draft' },
          savedAt: new Date().toLocaleString(),
          ...stats
        };
        setSavedDrafts(prev => [...prev, newDraft]);
        setEditingDraftId(draftIdToUse);
        toast.success("Questionnaire saved as draft!");
      }
    } else {
      // Create new draft with a fresh ID
      const newDraftId = `draft-${Date.now()}`;
      const newDraft: SavedDraft = {
        id: newDraftId,
        questionnaire: { ...questionnaire, status: 'Draft' },
        savedAt: new Date().toLocaleString(),
        ...stats
      };
      setSavedDrafts(prev => [...prev, newDraft]);
      setEditingDraftId(newDraftId);
      toast.success("Questionnaire saved as draft!");
    }
    
    // Return to list view
    setQuestionnaire(null);
    setActivePageId(null);
    setSelectedSectionId(null);
    setSelectedQuestionId(null);
    setSelectedBranchId(null);
    setEditingDraftId(null);
    setEditingRecordId(null);
  };

  const handleEditDraft = (draft: SavedDraft) => {
    setQuestionnaire(draft.questionnaire);
    setActivePageId(draft.questionnaire.pages[0]?.id || null);
    setSelectedSectionId(draft.questionnaire.pages[0]?.sections[0]?.id || null);
    setEditingDraftId(draft.id);
  };

  const handleDeleteDraft = (draftId: string) => {
    setSavedDrafts(prev => prev.filter(d => d.id !== draftId));
    toast.success("Draft deleted");
  };

  const handleEditPublishedRecord = (publishedRecord: PublishedRecord) => {
    // Restore the full questionnaire from the published record
    setQuestionnaire(publishedRecord.questionnaire);
    setActivePageId(publishedRecord.questionnaire.pages[0]?.id || null);
    setSelectedSectionId(publishedRecord.questionnaire.pages[0]?.sections[0]?.id || null);
    setEditingRecordId(publishedRecord.metadata.id);
  };

  const handleDeletePublishedRecord = (recordId: string) => {
    setPublishedRecords(prev => {
      const updated = { ...prev };
      delete updated[recordId];
      return updated;
    });
    toast.success("Published record deleted");
  };

  const activePage = questionnaire?.pages.find(p => p.id === activePageId) || null;

  const handleAddPage = () => {
    if (!questionnaire) return;
    const newPage: Page = {
      id: `page-${Date.now()}`,
      name: `Page ${questionnaire.pages.length + 1}`,
      description: '',
      sections: []
    };
    setQuestionnaire({
      ...questionnaire,
      pages: [...questionnaire.pages, newPage]
    });
    setActivePageId(newPage.id);
    setSelectedSectionId(null);
    setSelectedQuestionId(null);
    setSelectedBranchId(null);
  };

  const handleDeletePage = (pageId: string) => {
    if (!questionnaire || questionnaire.pages.length <= 1) return;
    const newPages = questionnaire.pages.filter(p => p.id !== pageId);
    setQuestionnaire({ ...questionnaire, pages: newPages });
    if (activePageId === pageId) {
      setActivePageId(newPages[0]?.id || null);
      setSelectedSectionId(null);
      setSelectedQuestionId(null);
      setSelectedBranchId(null);
    }
  };

  const handleUpdatePage = (pageId: string, updated: Partial<Page>) => {
    if (!questionnaire) return;
    setQuestionnaire({
      ...questionnaire,
      pages: questionnaire.pages.map(p => p.id === pageId ? { ...p, ...updated } : p)
    });
  };

  const handleAddSection = () => {
    if (!questionnaire || !activePageId) return;
    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: '',
      description: '',
      questions: [],
      branches: []
    };
    setQuestionnaire({
      ...questionnaire,
      pages: questionnaire.pages.map(p =>
        p.id === activePageId
          ? { ...p, sections: [...p.sections, newSection] }
          : p
      )
    });
    setSelectedSectionId(newSection.id);
    setSelectedQuestionId(null);
    setSelectedBranchId(null);
  };

  const handleUpdateSection = (sectionId: string, updated: Section) => {
    if (!questionnaire || !activePageId) return;
    setQuestionnaire({
      ...questionnaire,
      pages: questionnaire.pages.map(p =>
        p.id === activePageId
          ? { ...p, sections: p.sections.map(s => s.id === sectionId ? updated : s) }
          : p
      )
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!questionnaire || !activePageId) return;
    setQuestionnaire({
      ...questionnaire,
      pages: questionnaire.pages.map(p =>
        p.id === activePageId
          ? { ...p, sections: p.sections.filter(s => s.id !== sectionId) }
          : p
      )
    });
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
      setSelectedQuestionId(null);
      setSelectedBranchId(null);
    }
  };

  // Collect all questions for rule references
  const getAllQuestions = (): Question[] => {
    if (!questionnaire) return [];
    const questions: Question[] = [];
    
    const collectFromBranch = (branch: ConditionalBranch) => {
      questions.push(...branch.questions);
      branch.childBranches.forEach(collectFromBranch);
    };

    questionnaire.pages.forEach(page => {
      page.sections.forEach(section => {
        questions.push(...section.questions);
        section.branches.forEach(collectFromBranch);
      });
    });

    return questions;
  };

  const allQuestions = getAllQuestions();

  const handleSelectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedQuestionId(null);
    setSelectedBranchId(null);
  };

  const handleSelectQuestion = (questionId: string, branchId: string | null) => {
    setSelectedQuestionId(questionId);
    setSelectedBranchId(branchId);
  };

  const handleSelectBranch = (branchId: string) => {
    setSelectedBranchId(branchId);
    setSelectedQuestionId(null);
  };

  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Incident':
        return styles.incident;
      case 'Service Request':
        return styles.serviceRequest;
      case 'Change':
        return styles.change;
      case 'Problem':
        return styles.problem;
      default:
        return styles.serviceRequest;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Incident':
        return <ErrorCircle24Regular />;
      case 'Service Request':
        return <Document24Regular />;
      case 'Change':
        return <Settings24Regular />;
      case 'Problem':
        return <QuestionCircle24Regular />;
      default:
        return <Document24Regular />;
    }
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div style={{ width: '280px', minWidth: '200px', maxWidth: '400px', flexShrink: 0 }}>
        <Sidebar
          questionnaire={questionnaire}
          activePageId={activePageId}
          selectedSectionId={selectedSectionId}
          selectedQuestionId={selectedQuestionId}
          selectedBranchId={selectedBranchId}
          onCreateQuestionnaire={handleCreateQuestionnaire}
          onSelectPage={setActivePageId}
          onSelectSection={handleSelectSection}
          onSelectQuestion={handleSelectQuestion}
          onSelectBranch={handleSelectBranch}
          onReset={() => {
            setQuestionnaire(null);
            setActivePageId(null);
            setSelectedSectionId(null);
            setSelectedQuestionId(null);
            setSelectedBranchId(null);
            setEditingDraftId(null);
            setEditingRecordId(null);
          }}
          onUpdateQuestionnaire={setQuestionnaire}
          onPublish={handlePublish}
          canPublish={!!editingRecordId}
        />
      </div>

      {/* Resize Handle */}
      <div className={styles.resizeHandle}>
        <div className={styles.handleIcon}>
          <ReOrder24Regular style={{ width: 10, height: 10 }} />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className={styles.mainContent}>
        {questionnaire && (
          <PageTabs
            pages={questionnaire.pages}
            activePageId={activePageId}
            onSelectPage={(id) => {
              setActivePageId(id);
              setSelectedSectionId(null);
              setSelectedQuestionId(null);
              setSelectedBranchId(null);
            }}
            onAddPage={handleAddPage}
            onDeletePage={handleDeletePage}
            onUpdatePage={handleUpdatePage}
          />
        )}

        <div className={styles.scrollContainer}>
          <div style={{ padding: tokens.spacingVerticalL, display: "flex", flexDirection: "column", gap: tokens.spacingVerticalL }}>
            {questionnaire && activePage && (
              <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacingVerticalM }}>
                {/* Publish Validation Errors */}
                {publishValidationErrors && (
                  <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacingVerticalS }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: tokens.fontSizeBase300, fontWeight: tokens.fontWeightSemibold, color: tokens.colorPaletteRedForeground1 }}>
                        Please fix the following issues before publishing:
                      </span>
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<Dismiss24Regular />}
                        onClick={() => setPublishValidationErrors(null)}
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: tokens.spacingHorizontalS }}>
                      {publishValidationErrors.pages.length > 0 && (
                        <div className={styles.errorBanner}>
                          <DocumentMultiple24Regular style={{ width: 16, height: 16, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: tokens.fontWeightSemibold, fontSize: tokens.fontSizeBase200, marginBottom: "4px" }}>Pages ({publishValidationErrors.pages.length})</div>
                            {publishValidationErrors.pages.map((err, i) => (
                              <div key={i} style={{ fontSize: tokens.fontSizeBase100 }}>• {err}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {publishValidationErrors.sections.length > 0 && (
                        <div className={styles.errorBanner}>
                          <Layer24Regular style={{ width: 16, height: 16, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: tokens.fontWeightSemibold, fontSize: tokens.fontSizeBase200, marginBottom: "4px" }}>Sections ({publishValidationErrors.sections.length})</div>
                            {publishValidationErrors.sections.map((err, i) => (
                              <div key={i} style={{ fontSize: tokens.fontSizeBase100 }}>• {err}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {publishValidationErrors.branches.length > 0 && (
                        <div className={styles.errorBanner}>
                          <BranchFork24Regular style={{ width: 16, height: 16, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: tokens.fontWeightSemibold, fontSize: tokens.fontSizeBase200, marginBottom: "4px" }}>Branches ({publishValidationErrors.branches.length})</div>
                            {publishValidationErrors.branches.map((err, i) => (
                              <div key={i} style={{ fontSize: tokens.fontSizeBase100 }}>• {err}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {publishValidationErrors.questions.length > 0 && (
                        <div className={styles.errorBanner}>
                          <QuestionCircle24Regular style={{ width: 16, height: 16, flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: tokens.fontWeightSemibold, fontSize: tokens.fontSizeBase200, marginBottom: "4px" }}>Questions ({publishValidationErrors.questions.length})</div>
                            {publishValidationErrors.questions.map((err, i) => (
                              <div key={i} style={{ fontSize: tokens.fontSizeBase100 }}>• {err}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <h2 style={{ fontSize: tokens.fontSizeBase500, fontWeight: tokens.fontWeightSemibold }}>{activePage.name || 'Untitled Page'}</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: tokens.spacingHorizontalS }}>
                    <Button 
                      appearance="secondary"
                      onClick={() => {
                        exportQuestionnaire(questionnaire);
                        toast.success("Questionnaire exported successfully!");
                      }}
                      icon={<ArrowDownload24Regular />}
                    >
                      Export JSON
                    </Button>
                    <Button 
                      appearance="secondary"
                      onClick={() => {
                        if (questionnaire) {
                          const exportData = buildExportData(questionnaire);
                          sessionStorage.setItem('executor-questionnaire', JSON.stringify(exportData));
                          window.open('/execute', '_blank');
                        }
                      }}
                      icon={<Play24Regular />}
                    >
                      Preview
                    </Button>
                    <Button appearance="secondary" onClick={handleSaveAsDraft} icon={<Save24Regular />}>
                      Save as Draft
                    </Button>
                    <Button appearance="primary" onClick={handleAddSection} icon={<Add24Regular />}>
                      Add Section
                    </Button>
                  </div>
                </div>

                {activePage.sections.length === 0 && (
                  <Card className={mergeClasses(styles.card, styles.cardDashed)}>
                    <div className={styles.emptyState}>
                      <Layer24Regular style={{ height: "48px", width: "48px", color: tokens.colorNeutralForeground3, margin: "0 auto 16px" }} />
                      <h3 style={{ fontWeight: tokens.fontWeightMedium, marginBottom: tokens.spacingVerticalS }}>No sections yet</h3>
                      <p style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3, marginBottom: tokens.spacingVerticalM }}>
                        Add a section to start adding questions and conditional branches.
                      </p>
                      <Button appearance="primary" onClick={handleAddSection} icon={<Add24Regular />}>
                        Add Section
                      </Button>
                    </div>
                  </Card>
                )}

                {activePage.sections.map(section => (
                  <SectionEditor
                    key={section.id}
                    section={section}
                    allQuestions={allQuestions}
                    selectedQuestionId={selectedSectionId === section.id ? selectedQuestionId : null}
                    selectedBranchId={selectedSectionId === section.id ? selectedBranchId : null}
                    onUpdate={(updated) => handleUpdateSection(section.id, updated)}
                    onDelete={() => handleDeleteSection(section.id)}
                    onSelectQuestion={(qId, bId) => {
                      setSelectedSectionId(section.id);
                      handleSelectQuestion(qId, bId);
                    }}
                    onSelectBranch={(bId) => {
                      setSelectedSectionId(section.id);
                      handleSelectBranch(bId);
                    }}
                  />
                ))}
              </div>
            )}

            {!questionnaire && (
              <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacingVerticalL }}>
                {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <h2 style={{ fontSize: tokens.fontSizeBase600, fontWeight: tokens.fontWeightBold }}>ITSM Records</h2>
                      <p style={{ color: tokens.colorNeutralForeground3 }}>Manage your IT Service Management questionnaires</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: tokens.spacingHorizontalS }}>
                      <Button appearance="secondary" size="large" icon={<Book24Regular />} onClick={() => navigate('docs')}>
                        Documentation
                      </Button>
                      <Button 
                        appearance="secondary"
                        size="large"
                        icon={<ArrowUpload24Regular />}
                        onClick={() => document.getElementById('import-json-input')?.click()}
                      >
                        Import JSON
                      </Button>
                      <input
                        id="import-json-input"
                        type="file"
                        accept=".json"
                        style={{ display: "none" }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const parsed = await parseQuestionnaireFile(file);
                            setQuestionnaire(parsed.questionnaire);
                            if (parsed.questionnaire.pages.length > 0) {
                              setActivePageId(parsed.questionnaire.pages[0].id);
                            }
                            setEditingDraftId(null);
                            setEditingRecordId(null);
                            toast.success("Questionnaire imported successfully!");
                          } catch (error) {
                            toast.error("Failed to import questionnaire. Please check the file format.");
                          }
                          e.target.value = '';
                        }}
                      />
                      <Button size="large" appearance="primary" onClick={handleCreateQuestionnaire} icon={<Add24Regular />}>
                        Create New
                      </Button>
                    </div>
                  </div>

                {/* Saved Drafts */}
                {savedDrafts.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacingVerticalS }}>
                    <h3 style={{ fontSize: tokens.fontSizeBase500, fontWeight: tokens.fontWeightSemibold, display: "flex", alignItems: "center", gap: tokens.spacingHorizontalS }}>
                      <Save24Regular style={{ color: tokens.colorNeutralForeground3 }} />
                      Saved Drafts
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacingVerticalS }}>
                      {savedDrafts.map((draft) => (
                        <Card 
                          key={draft.id} 
                          className={mergeClasses(styles.card, styles.cardDashed)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className={styles.cardContent}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: tokens.spacingHorizontalM }}>
                              <div style={{ display: "flex", alignItems: "flex-start", gap: tokens.spacingHorizontalM, flex: 1, minWidth: 0 }}>
                                <div className={mergeClasses(styles.categoryIcon, styles.draft)}>
                                  <Document24Regular />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: tokens.spacingHorizontalS, flexWrap: "wrap" }}>
                                    <h3 style={{ fontWeight: tokens.fontWeightSemibold, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                      {draft.questionnaire.name || 'Untitled Questionnaire'}
                                    </h3>
                                    <Badge appearance="tint" color="informative" size="small">
                                      Draft
                                    </Badge>
                                  </div>
                                  <p style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3, marginTop: tokens.spacingVerticalXS, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {draft.questionnaire.description || 'No description'}
                                  </p>
                                  <div className={styles.statsRow} style={{ marginTop: tokens.spacingVerticalS }}>
                                    <span className={styles.statItem} title="Pages">
                                      <DocumentMultiple24Regular />
                                      {draft.pageCount}
                                    </span>
                                    <span className={styles.statItem} title="Sections">
                                      <Layer24Regular />
                                      {draft.sectionCount}
                                    </span>
                                    <span className={styles.statItem} title="Questions">
                                      <QuestionCircle24Regular />
                                      {draft.questionCount}
                                    </span>
                                    <span className={styles.statItem} title="Branches">
                                      <BranchFork24Regular />
                                      {draft.branchCount}
                                    </span>
                                    <span style={{ opacity: 0.5 }}>|</span>
                                    <span className={styles.statItem}>
                                      <Clock24Regular />
                                      Saved {draft.savedAt}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: tokens.spacingHorizontalXS, flexShrink: 0 }}>
                                <Button 
                                  appearance="subtle"
                                  size="small"
                                  icon={<Edit24Regular />}
                                  onClick={() => handleEditDraft(draft)}
                                >
                                  Edit
                                </Button>
                                <ConfirmDialog
                                  trigger={
                                    <Button 
                                      appearance="subtle"
                                      size="small"
                                      icon={<Delete24Regular />}
                                    />
                                  }
                                  title="Delete Draft"
                                  description={`Are you sure you want to delete the draft "${draft.questionnaire.name || 'Untitled Questionnaire'}"? This action cannot be undone.`}
                                  onConfirm={() => handleDeleteDraft(draft.id)}
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Published Records (user-created) */}
                {Object.values(publishedRecords).filter(r => !sampleITSMRecords.some(s => s.id === r.metadata.id)).length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacingVerticalS }}>
                    <h3 style={{ fontSize: tokens.fontSizeBase500, fontWeight: tokens.fontWeightSemibold, display: "flex", alignItems: "center", gap: tokens.spacingHorizontalS }}>
                      <Document24Regular style={{ color: tokens.colorNeutralForeground3 }} />
                      Published Records
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacingVerticalS }}>
                      {Object.values(publishedRecords)
                        .filter(r => !sampleITSMRecords.some(s => s.id === r.metadata.id))
                        .map((publishedRecord) => (
                        <Card 
                          key={publishedRecord.metadata.id} 
                          className={styles.card}
                          style={{ cursor: "pointer" }}
                        >
                          <div className={styles.cardContent}>
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: tokens.spacingHorizontalM }}>
                              <div style={{ display: "flex", alignItems: "flex-start", gap: tokens.spacingHorizontalM, flex: 1, minWidth: 0 }}>
                              <div className={mergeClasses(styles.categoryIcon, styles.draft)}>
                                  <Document24Regular />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: tokens.spacingHorizontalS, flexWrap: "wrap" }}>
                                    <h3 style={{ fontWeight: tokens.fontWeightSemibold, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{publishedRecord.metadata.name}</h3>
                                    <Badge 
                                      appearance="filled" 
                                      color={publishedRecord.metadata.status === 'Active' ? 'success' : publishedRecord.metadata.status === 'Draft' ? 'informative' : 'subtle'}
                                      size="small"
                                    >
                                      {publishedRecord.metadata.status}
                                    </Badge>
                                  </div>
                                  <p style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3, marginTop: tokens.spacingVerticalXS, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{publishedRecord.metadata.description || 'No description'}</p>
                                  <div className={styles.statsRow} style={{ marginTop: tokens.spacingVerticalS }}>
                                    <span className={styles.statItem} title="Pages">
                                      <DocumentMultiple24Regular />
                                      {publishedRecord.metadata.pageCount}
                                    </span>
                                    <span className={styles.statItem} title="Sections">
                                      <Layer24Regular />
                                      {publishedRecord.metadata.sectionCount}
                                    </span>
                                    <span className={styles.statItem} title="Questions">
                                      <QuestionCircle24Regular />
                                      {publishedRecord.metadata.questionCount}
                                    </span>
                                    <span className={styles.statItem} title="Branches">
                                      <BranchFork24Regular />
                                      {publishedRecord.metadata.branchCount}
                                    </span>
                                    <span style={{ opacity: 0.5 }}>|</span>
                                    <span className={styles.statItem}>
                                      <Clock24Regular />
                                      {publishedRecord.metadata.updatedAt}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: tokens.spacingHorizontalXS, flexShrink: 0 }}>
                                <Button 
                                  appearance="subtle"
                                  size="small"
                                  icon={<Edit24Regular />}
                                  onClick={() => handleEditPublishedRecord(publishedRecord)}
                                >
                                  Edit
                                </Button>
                                <ConfirmDialog
                                  trigger={
                                    <Button 
                                      appearance="subtle"
                                      size="small"
                                      icon={<Delete24Regular />}
                                    />
                                  }
                                  title="Delete Published Record"
                                  description={`Are you sure you want to delete "${publishedRecord.metadata.name}"? This action cannot be undone.`}
                                  onConfirm={() => handleDeletePublishedRecord(publishedRecord.metadata.id)}
                                />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* ITSM Templates Header */}
                <h3 style={{ fontSize: tokens.fontSizeBase500, fontWeight: tokens.fontWeightSemibold }}>Templates</h3>

                {/* ITSM Records List */}
                <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacingVerticalS }}>
                  {sampleITSMRecords.map((baseRecord) => {
                    // Use published version's metadata if available, otherwise use the base record
                    const record = publishedRecords[baseRecord.id]?.metadata || baseRecord;
                    return (
                    <Card 
                      key={record.id} 
                      className={styles.card}
                      style={{ cursor: "pointer" }}
                    >
                      <div className={styles.cardContent}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: tokens.spacingHorizontalM }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: tokens.spacingHorizontalM, flex: 1, minWidth: 0 }}>
                            <div className={mergeClasses(styles.categoryIcon, getCategoryStyles(record.category))}>
                              {getCategoryIcon(record.category)}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: tokens.spacingHorizontalS, flexWrap: "wrap" }}>
                                <h3 style={{ fontWeight: tokens.fontWeightSemibold, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{record.name}</h3>
                                <Badge 
                                  appearance="filled" 
                                  color={record.status === 'Active' ? 'success' : record.status === 'Draft' ? 'informative' : 'subtle'}
                                  size="small"
                                >
                                  {record.status}
                                </Badge>
                                <Badge 
                                  appearance="outline"
                                  color={record.priority === 'Critical' ? 'danger' : record.priority === 'High' ? 'warning' : record.priority === 'Medium' ? 'warning' : 'success'}
                                  size="small"
                                >
                                  {record.priority}
                                </Badge>
                              </div>
                              <p style={{ fontSize: tokens.fontSizeBase200, color: tokens.colorNeutralForeground3, marginTop: tokens.spacingVerticalXS, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{record.description}</p>
                              <div className={styles.statsRow} style={{ marginTop: tokens.spacingVerticalS }}>
                                <span className={styles.statItem} title="Pages">
                                  <DocumentMultiple24Regular />
                                  {record.pageCount}
                                </span>
                                <span className={styles.statItem} title="Sections">
                                  <Layer24Regular />
                                  {record.sectionCount}
                                </span>
                                <span className={styles.statItem} title="Questions">
                                  <QuestionCircle24Regular />
                                  {record.questionCount}
                                </span>
                                <span className={styles.statItem} title="Branches">
                                  <BranchFork24Regular />
                                  {record.branchCount}
                                </span>
                                <span className={styles.statItem} title="Answer Sets">
                                  <TaskListSquareLtr24Regular />
                                  {record.answerSetCount}
                                </span>
                                <span className={styles.statItem} title="Actions">
                                  <Flash24Regular />
                                  {record.actionCount}
                                </span>
                                <span style={{ opacity: 0.5 }}>|</span>
                                <span>{record.serviceCatalog}</span>
                                <span className={styles.statItem}>
                                  <Clock24Regular />
                                  {record.updatedAt}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            appearance="subtle"
                            size="small"
                            icon={<Edit24Regular />}
                            onClick={() => {
                              // If we have a published version with full questionnaire, use it
                              if (publishedRecords[baseRecord.id]) {
                                handleEditPublishedRecord(publishedRecords[baseRecord.id]);
                              } else {
                                handleEditRecord(baseRecord);
                              }
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireBuilder;
