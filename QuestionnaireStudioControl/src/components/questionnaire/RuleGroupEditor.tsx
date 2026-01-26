import * as React from 'react';
import {
  Button,
  Dropdown,
  Option,
  Menu,
  MenuTrigger,
  MenuList,
  MenuItem,
  MenuPopover,
  makeStyles,
  tokens,
  Text,
} from "@fluentui/react-components";
import {
  Add24Regular,
  ChevronDown24Regular,
  Delete24Regular,
} from "@fluentui/react-icons";
import { RuleGroup, QuestionLevelRule, Question, AnswerLevelOperator } from "../../types/questionnaire";
import DynamicRuleValueInput from "./DynamicRuleValueInput";

const useStyles = makeStyles({
  container: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  header: {
    display: "flex",
    alignItems: "center",
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  matchTypeCell: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    minWidth: "80px",
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  columnsHeader: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
  },
  actionsCell: {
    width: "40px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.spacingHorizontalS,
  },
  ruleRow: {
    display: "flex",
    alignItems: "stretch",
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  connectorCell: {
    width: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  treeLine: {
    position: "absolute",
    left: "16px",
    width: "1px",
    backgroundColor: tokens.colorNeutralStroke1,
    top: 0,
    bottom: 0,
  },
  treeConnector: {
    position: "absolute",
    left: "16px",
    width: "16px",
    height: "1px",
    backgroundColor: tokens.colorNeutralStroke1,
    top: "50%",
  },
  ruleColumns: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalS}`,
  },
  nestedGroup: {
    flex: 1,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalS}`,
  },
  addRow: {
    display: "flex",
    alignItems: "center",
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  addButton: {
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalS}`,
  },
});

interface RuleGroupEditorProps {
  group: RuleGroup;
  allQuestions: Question[];
  currentQuestionOrder?: number;
  onUpdate: (updated: RuleGroup) => void;
  isRoot?: boolean;
  onDelete?: () => void;
}

const OPERATORS: { value: AnswerLevelOperator; label: string }[] = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Not Contains' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'ends_with', label: 'Ends With' },
];

const RuleGroupEditor = ({ group, allQuestions, currentQuestionOrder, onUpdate, isRoot = true, onDelete }: RuleGroupEditorProps) => {
  const styles = useStyles();
  
  const availableQuestions = currentQuestionOrder !== undefined
    ? allQuestions.filter(q => q.order < currentQuestionOrder)
    : allQuestions;

  const updateGroup = (partial: Partial<RuleGroup>) => {
    onUpdate({ ...group, ...partial });
  };

  const updateChild = (index: number, updatedChild: RuleGroup | QuestionLevelRule) => {
    const newChildren = [...group.children];
    newChildren[index] = updatedChild;
    updateGroup({ children: newChildren });
  };

  const deleteChild = (index: number) => {
    const newChildren = group.children.filter((_, i) => i !== index);
    updateGroup({ children: newChildren });
  };

  const addGroup = () => {
    const newGroup: RuleGroup = {
      type: 'group',
      id: `g-${Date.now()}`,
      matchType: 'AND',
      children: []
    };
    updateGroup({ children: [...group.children, newGroup] });
  };

  const addRule = () => {
    const newRule: QuestionLevelRule = {
      type: 'rule',
      id: `r-${Date.now()}`,
      sourceQuestionId: '',
      sourceAnswerSetId: '',
      operator: 'equals',
      sourceAnswerId: ''
    };
    updateGroup({ children: [...group.children, newRule] });
  };

  const getAnswerSetsForQuestion = (questionId: string) => {
    const question = allQuestions.find(q => q.id === questionId);
    if (!question) return [];

    const allAnswerSets = [...question.answerSets];
    question.answerLevelRuleGroups?.forEach(ruleGroup => {
      if (ruleGroup.inlineAnswerSet) {
        allAnswerSets.push(ruleGroup.inlineAnswerSet);
      }
    });

    return allAnswerSets;
  };

  const getAnswersForAnswerSet = (questionId: string, answerSetId: string) => {
    const question = allQuestions.find(q => q.id === questionId);
    if (!question || !answerSetId) return [];

    let answerSet = question.answerSets.find(as => as.id === answerSetId);

    if (!answerSet) {
      for (const ruleGroup of question.answerLevelRuleGroups || []) {
        if (ruleGroup.inlineAnswerSet?.id === answerSetId) {
          answerSet = ruleGroup.inlineAnswerSet;
          break;
        }
      }
    }

    return answerSet?.answers || [];
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.matchTypeCell}>
          <Dropdown
            value={group.matchType}
            selectedOptions={[group.matchType]}
            onOptionSelect={(_, data) => updateGroup({ matchType: data.optionValue as 'AND' | 'OR' })}
            size="small"
            style={{ minWidth: '64px' }}
          >
            <Option value="AND">AND</Option>
            <Option value="OR">OR</Option>
          </Dropdown>
        </div>
        <div className={styles.columnsHeader}>
          <Text size={200} weight="medium">Source Question</Text>
          <Text size={200} weight="medium">Answer Set</Text>
          <Text size={200} weight="medium">Operator</Text>
          <Text size={200} weight="medium">Answer</Text>
        </div>
        <div className={styles.actionsCell}>
          {!isRoot && onDelete && (
            <Button 
              appearance="subtle" 
              size="small"
              icon={<Delete24Regular />}
              onClick={onDelete}
            />
          )}
        </div>
      </div>

      {/* Rules */}
      <div className="relative">
        {group.children.map((child, index) => (
          <div key={child.id} className={styles.ruleRow}>
            <div className={styles.connectorCell}>
              <div className={styles.treeLine} />
              <div className={styles.treeConnector} />
            </div>

            {child.type === 'group' ? (
              <div className={styles.nestedGroup}>
                <RuleGroupEditor
                  group={child}
                  allQuestions={allQuestions}
                  currentQuestionOrder={currentQuestionOrder}
                  onUpdate={(updated) => updateChild(index, updated)}
                  isRoot={false}
                  onDelete={() => deleteChild(index)}
                />
              </div>
            ) : (
              <>
                <div className={styles.ruleColumns}>
                  <Dropdown
                    placeholder="Select question"
                    value={allQuestions.find(q => q.id === child.sourceQuestionId)?.text || ''}
                    selectedOptions={child.sourceQuestionId ? [child.sourceQuestionId] : []}
                    onOptionSelect={(_, data) => {
                      updateChild(index, { 
                        ...child, 
                        sourceQuestionId: data.optionValue as string,
                        sourceAnswerSetId: '',
                        sourceAnswerId: ''
                      });
                    }}
                    size="small"
                  >
                    {availableQuestions.map(q => (
                      <Option key={q.id} value={q.id}>
                        {q.text || 'Untitled Question'}
                      </Option>
                    ))}
                  </Dropdown>

                  <Dropdown
                    placeholder="Select answer set"
                    value={getAnswerSetsForQuestion(child.sourceQuestionId).find(as => as.id === child.sourceAnswerSetId)?.name || ''}
                    selectedOptions={child.sourceAnswerSetId ? [child.sourceAnswerSetId] : []}
                    onOptionSelect={(_, data) => {
                      updateChild(index, { 
                        ...child, 
                        sourceAnswerSetId: data.optionValue as string,
                        sourceAnswerId: ''
                      });
                    }}
                    disabled={!child.sourceQuestionId}
                    size="small"
                  >
                    {getAnswerSetsForQuestion(child.sourceQuestionId).map(as => (
                      <Option key={as.id} value={as.id}>
                        {as.name || 'Untitled Answer Set'}
                      </Option>
                    ))}
                  </Dropdown>

                  <Dropdown
                    value={OPERATORS.find(op => op.value === child.operator)?.label || 'Equals'}
                    selectedOptions={[child.operator]}
                    onOptionSelect={(_, data) => {
                      updateChild(index, { ...child, operator: data.optionValue as AnswerLevelOperator });
                    }}
                    size="small"
                  >
                    {OPERATORS.map(op => (
                      <Option key={op.value} value={op.value}>
                        {op.label}
                      </Option>
                    ))}
                  </Dropdown>

                  {(() => {
                    const sourceQuestion = allQuestions.find(q => q.id === child.sourceQuestionId);
                    const questionType = sourceQuestion?.type || 'Choice';
                    const answers = getAnswersForAnswerSet(child.sourceQuestionId, child.sourceAnswerSetId);
                    
                    return (
                      <DynamicRuleValueInput
                        questionType={questionType}
                        answers={answers}
                        value={child.sourceAnswerId}
                        onChange={(value) => {
                          updateChild(index, { ...child, sourceAnswerId: value });
                        }}
                        disabled={!child.sourceAnswerSetId}
                      />
                    );
                  })()}
                </div>

                <div className={styles.actionsCell}>
                  <Button 
                    appearance="subtle" 
                    size="small"
                    icon={<Delete24Regular />}
                    onClick={() => deleteChild(index)}
                  />
                </div>
              </>
            )}
          </div>
        ))}

        {/* Add Button */}
        <div className={styles.addRow}>
          <div className={styles.connectorCell}>
            {group.children.length > 0 && (
              <>
                <div className={styles.treeLine} style={{ bottom: '50%' }} />
                <div className={styles.treeConnector} />
              </>
            )}
          </div>
          <div className={styles.addButton}>
            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <Button appearance="outline" size="small" icon={<Add24Regular />} iconPosition="before">
                  Add
                  <ChevronDown24Regular style={{ marginLeft: tokens.spacingHorizontalXS }} />
                </Button>
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem onClick={addRule}>Add Rule</MenuItem>
                  <MenuItem onClick={addGroup}>Add Group</MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RuleGroupEditor;
