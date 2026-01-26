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
      {/* <h1 style={{color:"blue",textAlign:"center"}}>This is a heading</h1> */}
    </div>
  );
};

// export const PCFRoot = () => {
//   return (
//     <div style={{ padding: "20px", background: "#d1fae5" }}>
//       ✅ PCF React is rendering
//     </div>
//   );
// };
