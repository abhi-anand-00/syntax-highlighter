import * as React from 'react';
import { useState } from "react";
import {
  Button,
  Input,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import {
  Add24Regular,
  Dismiss12Regular,
  Document24Regular,
} from "@fluentui/react-icons";
import { Page } from "../../types/questionnaire";
import { cn } from "../../lib/utils";
import { ConfirmDialog } from "../fluent";

const useStyles = makeStyles({
  container: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground3,
    overflowX: "auto",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    borderRadius: tokens.borderRadiusMedium,
    cursor: "pointer",
    border: `1px solid transparent`,
    transition: "all 0.15s",
  },
  tabActive: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    boxShadow: tokens.shadow4,
  },
  tabInactive: {
    backgroundColor: "transparent",
  },
  tabIcon: {
    flexShrink: 0,
  },
  tabName: {
    fontSize: tokens.fontSizeBase200,
    whiteSpace: "nowrap" as const,
    minWidth: "60px",
    userSelect: "none" as const,
  },
  deleteButton: {
    opacity: 0,
    transition: "opacity 0.15s",
  },
  tabHover: {
    "& $deleteButton": {
      opacity: 1,
    },
  },
  input: {
    width: "100px",
    minWidth: "60px",
  },
});

interface PageTabsProps {
  pages: Page[];
  activePageId: string | null;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  onUpdatePage: (pageId: string, updated: Partial<Page>) => void;
}

const PageTabs = ({
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onUpdatePage,
}: PageTabsProps) => {
  const styles = useStyles();
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [hoveredPageId, setHoveredPageId] = useState<string | null>(null);

  const handleDoubleClick = (pageId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPageId(pageId);
  };

  const handleBlur = () => {
    setEditingPageId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape") {
      setEditingPageId(null);
    }
  };

  return (
    <div className={styles.container}>
      {pages.map((page, index) => (
        <div
          key={page.id}
          className={cn(
            styles.tab,
            activePageId === page.id ? styles.tabActive : styles.tabInactive
          )}
          onClick={() => onSelectPage(page.id)}
          onDoubleClick={(e) => handleDoubleClick(page.id, e)}
          onMouseEnter={() => setHoveredPageId(page.id)}
          onMouseLeave={() => setHoveredPageId(null)}
        >
          <Document24Regular className={styles.tabIcon} />
          {editingPageId === page.id ? (
            <Input
              value={page.name}
              onChange={(_, data) => onUpdatePage(page.id, { name: data.value })}
              onClick={(e) => e.stopPropagation()}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className={styles.input}
              placeholder={`Page ${index + 1}`}
              size="small"
              autoFocus
            />
          ) : (
            <span className={styles.tabName}>
              {page.name || `Page ${index + 1}`}
            </span>
          )}
          {pages.length > 1 && (
            <ConfirmDialog
              trigger={
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<Dismiss12Regular />}
                  style={{ opacity: hoveredPageId === page.id ? 1 : 0 }}
                />
              }
              title="Delete Page"
              description={`Are you sure you want to delete "${page.name || `Page ${index + 1}`}"? This will remove all sections, questions, and branches within it. This action cannot be undone.`}
              onConfirm={() => onDeletePage(page.id)}
            />
          )}
        </div>
      ))}
      <Button
        appearance="subtle"
        size="small"
        icon={<Add24Regular />}
        onClick={onAddPage}
      />
    </div>
  );
};

export default PageTabs;
