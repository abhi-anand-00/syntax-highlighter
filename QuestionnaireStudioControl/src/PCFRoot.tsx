import * as React from "react";
import App from "./App";

// NOTE: In actual PCF project, replace this with:
// import { IInputs } from "../generated/ManifestTypes";
// and use: ComponentFramework.Context<IInputs>

export interface PCFRootProps {
  context?: unknown; // PCF context - typed as unknown for Lovable compatibility
}

export const PCFRoot: React.FC<PCFRootProps> = ({ context }) => {
  return (
    <div className="pcf-root">
      <App />
    </div>
  );
};
