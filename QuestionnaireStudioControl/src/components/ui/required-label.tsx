import * as React from 'react';
import { Label, makeStyles, tokens } from "@fluentui/react-components";
import { cn } from "../../lib/utils";

const useStyles = makeStyles({
  container: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalXS,
  },
  required: {
    color: tokens.colorPaletteRedForeground1,
  },
});

interface RequiredLabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export const RequiredLabel = ({
  htmlFor,
  children,
  required = true,
  className,
}: RequiredLabelProps) => {
  const styles = useStyles();
  
  return (
    <div className={cn(styles.container, className)}>
      <Label htmlFor={htmlFor}>{children}</Label>
      {required && <span className={styles.required}>*</span>}
    </div>
  );
};

export default RequiredLabel;
