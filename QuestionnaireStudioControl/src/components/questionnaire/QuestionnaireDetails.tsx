import * as React from 'react';
import {
  Card,
  CardHeader,
  Input,
  Label,
  Button,
  Dropdown,
  Option,
  makeStyles,
  tokens,
  Text,
} from "@fluentui/react-components";
import { Questionnaire } from "../../types/questionnaire";

const useStyles = makeStyles({
  card: {
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: tokens.borderRadiusMedium,
  },
  content: {
    padding: tokens.spacingVerticalM,
    display: "flex",
    flexDirection: "column" as const,
    gap: tokens.spacingVerticalM,
  },
  detailsBox: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingVerticalM,
    backgroundColor: tokens.colorNeutralBackground3,
    display: "flex",
    flexDirection: "column" as const,
    gap: tokens.spacingVerticalM,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: tokens.spacingHorizontalM,
  },
  field: {
    display: "flex",
    flexDirection: "column" as const,
    gap: tokens.spacingVerticalXS,
  },
  statusSection: {
    display: "flex",
    flexDirection: "column" as const,
    gap: tokens.spacingVerticalM,
  },
  fullWidth: {
    width: "100%",
  },
});

interface QuestionnaireDetailsProps {
  questionnaire: Questionnaire;
  onUpdate: (updated: Questionnaire) => void;
  onPublish?: () => void;
  canPublish?: boolean;
}

const QuestionnaireDetails = ({
  questionnaire,
  onUpdate,
  onPublish,
  canPublish = false,
}: QuestionnaireDetailsProps) => {
  const styles = useStyles();

  return (
    <Card className={styles.card}>
      <CardHeader
        header={<Text weight="semibold" size={400}>Questionnaire Details</Text>}
      />
      <div className={styles.content}>
        {/* Details Box */}
        <div className={styles.detailsBox}>
          <div className={styles.grid}>
            <div className={styles.field}>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter questionnaire name"
                value={questionnaire.name}
                onChange={(_, data) => onUpdate({ ...questionnaire, name: data.value })}
              />
            </div>

            <div className={styles.field}>
              <Label htmlFor="catalog">Service Catalog</Label>
              <Dropdown
                id="catalog"
                value={questionnaire.serviceCatalog || ""}
                selectedOptions={questionnaire.serviceCatalog ? [questionnaire.serviceCatalog] : []}
                onOptionSelect={(_, data) =>
                  onUpdate({ ...questionnaire, serviceCatalog: data.optionValue || "" })
                }
                placeholder="Select catalog"
              >
                <Option value="Catalog A">Catalog A</Option>
                <Option value="Catalog B">Catalog B</Option>
                <Option value="Catalog C">Catalog C</Option>
              </Dropdown>
            </div>
          </div>

          <div className={styles.field}>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Enter description"
              value={questionnaire.description}
              onChange={(_, data) => onUpdate({ ...questionnaire, description: data.value })}
            />
          </div>
        </div>

        {/* Status and Publish */}
        <div className={styles.statusSection}>
          <div className={styles.field}>
            <Label htmlFor="status">Status</Label>
            <Dropdown
              id="status"
              value={questionnaire.status}
              selectedOptions={[questionnaire.status]}
              onOptionSelect={(_, data) =>
                onUpdate({ ...questionnaire, status: data.optionValue || "Draft" })
              }
            >
              <Option value="Draft">Draft</Option>
              <Option value="Active">Active</Option>
            </Dropdown>
          </div>

          <Button
            appearance="primary"
            onClick={onPublish}
            disabled={!canPublish}
            className={styles.fullWidth}
            title={
              !canPublish
                ? "Only records opened from Templates can be published back"
                : "Publish changes to the record"
            }
          >
            Publish
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default QuestionnaireDetails;
