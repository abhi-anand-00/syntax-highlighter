import * as React from "react";
import App from "./App";
import { IInputs } from "../generated/ManifestTypes";


export interface PCFRootProps {
  context: ComponentFramework.Context<IInputs>;
}

export const PCFRoot: React.FC<PCFRootProps> = ({ context }) => {
  return (
    <div className="pcf-root">
      <App />
    </div>
  );
};
