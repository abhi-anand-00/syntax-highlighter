import * as React from 'react';
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogContent,
  Input,
  Button,
  Badge,
  makeStyles,
  tokens,
  Text,
} from "@fluentui/react-components";
import { Search24Regular } from "@fluentui/react-icons";
import { AnswerSet } from "../../types/questionnaire";
import { sampleAnswerSets, getUniqueTags } from "../../data/sampleAnswerSets";
import { cn } from "../../lib/utils";

const useStyles = makeStyles({
  surface: {
    maxWidth: "672px",
    maxHeight: "80vh",
  },
  content: {
    display: "flex",
    flexDirection: "column" as const,
    gap: tokens.spacingVerticalM,
  },
  searchContainer: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute" as const,
    left: tokens.spacingHorizontalM,
    color: tokens.colorNeutralForeground3,
  },
  searchInput: {
    paddingLeft: "40px",
    width: "100%",
  },
  tagsContainer: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: tokens.spacingHorizontalS,
  },
  tagBadge: {
    cursor: "pointer",
    textTransform: "capitalize" as const,
  },
  listContainer: {
    height: "400px",
    overflowY: "auto" as const,
    paddingRight: tokens.spacingHorizontalS,
  },
  listContent: {
    display: "flex",
    flexDirection: "column" as const,
    gap: tokens.spacingVerticalS,
  },
  emptyState: {
    textAlign: "center" as const,
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
  },
  answerSetCard: {
    padding: tokens.spacingVerticalM,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  answerSetCardHover: {
    backgroundColor: tokens.colorNeutralBackground1Hover,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: tokens.spacingVerticalS,
  },
  answersContainer: {
    display: "flex",
    flexWrap: "wrap" as const,
    gap: tokens.spacingHorizontalXS,
  },
});

interface AnswerSetPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (answerSet: AnswerSet) => void;
}

const AnswerSetPickerDialog = ({
  open,
  onOpenChange,
  onSelect,
}: AnswerSetPickerDialogProps) => {
  const styles = useStyles();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const tags = useMemo(() => getUniqueTags(), []);

  const filteredAnswerSets = useMemo(() => {
    return sampleAnswerSets.filter((set) => {
      const matchesSearch =
        searchQuery === "" ||
        set.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        set.tag.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag === null || set.tag === selectedTag;
      return matchesSearch && matchesTag;
    });
  }, [searchQuery, selectedTag]);

  const handleSelect = (answerSet: AnswerSet) => {
    // Create a copy with new IDs to avoid conflicts
    const newAnswerSet: AnswerSet = {
      ...answerSet,
      id: `as-${Date.now()}`,
      answers: answerSet.answers.map((ans) => ({
        ...ans,
        id: `ans-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      })),
    };
    onSelect(newAnswerSet);
    onOpenChange(false);
    setSearchQuery("");
    setSelectedTag(null);
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => onOpenChange(data.open)}>
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <DialogTitle>Add from Existing Answer Set</DialogTitle>
          <DialogContent className={styles.content}>
            {/* Search */}
            <div className={styles.searchContainer}>
              <Search24Regular className={styles.searchIcon} />
              <Input
                placeholder="Search answer sets..."
                value={searchQuery}
                onChange={(_, data) => setSearchQuery(data.value)}
                className={styles.searchInput}
              />
            </div>

            {/* Tag filters */}
            <div className={styles.tagsContainer}>
              <Badge
                appearance={selectedTag === null ? "filled" : "outline"}
                className={styles.tagBadge}
                onClick={() => setSelectedTag(null)}
              >
                All
              </Badge>
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  appearance={selectedTag === tag ? "filled" : "outline"}
                  className={styles.tagBadge}
                  onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Answer set list */}
            <div className={styles.listContainer}>
              <div className={styles.listContent}>
                {filteredAnswerSets.length === 0 ? (
                  <div className={styles.emptyState}>No answer sets found</div>
                ) : (
                  filteredAnswerSets.map((set) => (
                    <div
                      key={set.id}
                      className={cn(
                        styles.answerSetCard,
                        hoveredId === set.id && styles.answerSetCardHover
                      )}
                      onClick={() => handleSelect(set)}
                      onMouseEnter={() => setHoveredId(set.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <div className={styles.cardHeader}>
                        <Text weight="semibold">{set.name}</Text>
                        <Badge appearance="tint" style={{ textTransform: "capitalize" }}>
                          {set.tag}
                        </Badge>
                      </div>
                      <div className={styles.answersContainer}>
                        {set.answers.slice(0, 5).map((ans) => (
                          <Badge key={ans.id} appearance="outline" size="small">
                            {ans.label}
                          </Badge>
                        ))}
                        {set.answers.length > 5 && (
                          <Badge appearance="outline" size="small">
                            +{set.answers.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default AnswerSetPickerDialog;
