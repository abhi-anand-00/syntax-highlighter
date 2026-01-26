/**
 * PCF-Compatible Navigation Types
 * 
 * State-based navigation for PCF controls where browser routing is not supported.
 */

export type ViewState = 
  | 'home'           // Index/Builder
  | 'docs'           // Documentation
  | 'docs-pcf'       // PCF Documentation
  | 'docs-playground' // Dataverse Playground
  | 'execute';       // Execute questionnaire

export interface NavigationState {
  currentView: ViewState;
  previousView: ViewState | null;
}
