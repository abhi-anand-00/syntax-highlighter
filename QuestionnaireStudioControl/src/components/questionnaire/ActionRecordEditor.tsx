import * as React from 'react';
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Input,
  Label,
  Field,
  Dropdown,
  Option,
  makeStyles,
  tokens,
  Text,
} from "@fluentui/react-components";
import { Flash24Regular, Edit24Regular } from "@fluentui/react-icons";
import { ActionRecord, ImpactLevel, UrgencyLevel } from "../../types/questionnaire";

const useStyles = makeStyles({
  surface: {
    maxWidth: "600px",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  flashIcon: {
    color: tokens.colorPaletteYellowForeground1,
  },
  section: {
    marginBottom: tokens.spacingVerticalL,
  },
  sectionLabel: {
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: tokens.spacingVerticalS,
    display: "block",
  },
  grid3: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: tokens.spacingHorizontalM,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: tokens.spacingHorizontalM,
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: tokens.spacingVerticalL,
  },
  rightActions: {
    display: "flex",
    gap: tokens.spacingHorizontalS,
    marginLeft: "auto",
  },
});

interface ActionRecordEditorProps {
  actionRecord?: ActionRecord;
  onUpdate: (actionRecord: ActionRecord | undefined) => void;
}

const IMPACT_OPTIONS: { value: ImpactLevel; label: string }[] = [
  { value: '1', label: '1 - Extensive / Widespread' },
  { value: '2', label: '2 - Significant / Large' },
  { value: '3', label: '3 - Moderate / Limited' },
  { value: '4', label: '4 - Minor / Localized' },
];

const URGENCY_OPTIONS: { value: UrgencyLevel; label: string }[] = [
  { value: '1', label: '1 - Critical' },
  { value: '2', label: '2 - High' },
  { value: '3', label: '3 - Medium' },
  { value: '4', label: '4 - Low' },
];

const createEmptyActionRecord = (): ActionRecord => ({
  operationCategoryTier1: '',
  operationCategoryTier2: '',
  operationCategoryTier3: '',
  productCategoryTier1: '',
  productCategoryTier2: '',
  productCategoryTier3: '',
  impact: '',
  urgency: '',
});

const ActionRecordEditor = ({ actionRecord, onUpdate }: ActionRecordEditorProps) => {
  const styles = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [localRecord, setLocalRecord] = useState<ActionRecord>(
    actionRecord || createEmptyActionRecord()
  );

  const handleOpen = (open: boolean) => {
    if (open) {
      setLocalRecord(actionRecord || createEmptyActionRecord());
    }
    setIsOpen(open);
  };

  const handleSave = () => {
    onUpdate(localRecord);
    setIsOpen(false);
  };

  const handleRemove = () => {
    onUpdate(undefined);
    setIsOpen(false);
  };

  const handleFieldChange = (field: keyof ActionRecord, value: string) => {
    setLocalRecord(prev => ({ ...prev, [field]: value }));
  };

  const hasAction = !!actionRecord;

  return (
    <Dialog open={isOpen} onOpenChange={(_, data) => handleOpen(data.open)}>
      <DialogTrigger disableButtonEnhancement>
        {hasAction ? (
          <Button
            appearance="subtle"
            size="small"
            icon={<Edit24Regular />}
            style={{ color: tokens.colorPaletteYellowForeground1 }}
          />
        ) : (
          <Button
            appearance="subtle"
            size="small"
            icon={<Flash24Regular />}
          >
            Action
          </Button>
        )}
      </DialogTrigger>
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <DialogTitle>
            <div className={styles.titleRow}>
              <Flash24Regular className={styles.flashIcon} />
              {hasAction ? 'Edit Action Record' : 'Attach Action Record'}
            </div>
          </DialogTitle>
          <DialogContent>
            <Text size={200} block style={{ marginBottom: tokens.spacingVerticalL }}>
              Configure the action record details for this answer.
            </Text>

            {/* Operation Category */}
            <div className={styles.section}>
              <Text weight="semibold" size={200} className={styles.sectionLabel}>
                Operation Category
              </Text>
              <div className={styles.grid3}>
                <Field label={<Label size="small">Tier 1</Label>}>
                  <Input
                    placeholder="Tier 1"
                    value={localRecord.operationCategoryTier1}
                    onChange={(_, data) => handleFieldChange('operationCategoryTier1', data.value)}
                  />
                </Field>
                <Field label={<Label size="small">Tier 2</Label>}>
                  <Input
                    placeholder="Tier 2"
                    value={localRecord.operationCategoryTier2}
                    onChange={(_, data) => handleFieldChange('operationCategoryTier2', data.value)}
                  />
                </Field>
                <Field label={<Label size="small">Tier 3</Label>}>
                  <Input
                    placeholder="Tier 3"
                    value={localRecord.operationCategoryTier3}
                    onChange={(_, data) => handleFieldChange('operationCategoryTier3', data.value)}
                  />
                </Field>
              </div>
            </div>

            {/* Product Category */}
            <div className={styles.section}>
              <Text weight="semibold" size={200} className={styles.sectionLabel}>
                Product Category
              </Text>
              <div className={styles.grid3}>
                <Field label={<Label size="small">Tier 1</Label>}>
                  <Input
                    placeholder="Tier 1"
                    value={localRecord.productCategoryTier1}
                    onChange={(_, data) => handleFieldChange('productCategoryTier1', data.value)}
                  />
                </Field>
                <Field label={<Label size="small">Tier 2</Label>}>
                  <Input
                    placeholder="Tier 2"
                    value={localRecord.productCategoryTier2}
                    onChange={(_, data) => handleFieldChange('productCategoryTier2', data.value)}
                  />
                </Field>
                <Field label={<Label size="small">Tier 3</Label>}>
                  <Input
                    placeholder="Tier 3"
                    value={localRecord.productCategoryTier3}
                    onChange={(_, data) => handleFieldChange('productCategoryTier3', data.value)}
                  />
                </Field>
              </div>
            </div>

            {/* Impact & Urgency */}
            <div className={styles.grid2}>
              <Field label={<Text weight="semibold" size={200} className={styles.sectionLabel}>Impact</Text>}>
                <Dropdown
                  placeholder="Select impact level"
                  value={IMPACT_OPTIONS.find(o => o.value === localRecord.impact)?.label || ''}
                  selectedOptions={localRecord.impact ? [localRecord.impact] : []}
                  onOptionSelect={(_, data) => handleFieldChange('impact', data.optionValue as string)}
                >
                  {IMPACT_OPTIONS.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Dropdown>
              </Field>
              <Field label={<Text weight="semibold" size={200} className={styles.sectionLabel}>Urgency</Text>}>
                <Dropdown
                  placeholder="Select urgency level"
                  value={URGENCY_OPTIONS.find(o => o.value === localRecord.urgency)?.label || ''}
                  selectedOptions={localRecord.urgency ? [localRecord.urgency] : []}
                  onOptionSelect={(_, data) => handleFieldChange('urgency', data.optionValue as string)}
                >
                  {URGENCY_OPTIONS.map((option) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Dropdown>
              </Field>
            </div>
          </DialogContent>
          <DialogActions className={styles.actions}>
            {hasAction && (
              <Button
                appearance="primary"
                onClick={handleRemove}
                style={{ 
                  backgroundColor: tokens.colorPaletteRedBackground3,
                  color: tokens.colorNeutralForegroundOnBrand,
                }}
              >
                Remove Action
              </Button>
            )}
            <div className={styles.rightActions}>
              <Button appearance="secondary" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={handleSave}>
                {hasAction ? 'Update' : 'Attach'} Action
              </Button>
            </div>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default ActionRecordEditor;
