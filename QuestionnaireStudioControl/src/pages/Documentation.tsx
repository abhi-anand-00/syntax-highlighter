import { useNavigation } from "../lib/navigation";
import * as React from 'react';
import { useState, useEffect, useRef } from "react";
import {
  Button,
  Card,
  Badge,
  Divider,
  Text,
  makeStyles,
  tokens,
  shorthands,
} from "@fluentui/react-components";
import {
  ArrowLeft24Regular as ArrowLeft,
  Document24Regular as FileText,
  Layer24Regular as Layers,
  QuestionCircle24Regular as HelpCircle,
  BranchFork24Regular as GitBranch,
  TaskListSquareLtr24Regular as ListChecks,
  Flash24Regular as Zap,
  Settings24Regular as Settings,
  Eye24Regular as Eye,
  EyeOff24Regular as EyeOff,
  LockClosed24Regular as Lock,
  CheckmarkCircle24Regular as CheckCircle,
  Database24Regular as Database,
  Filter24Regular as Filter,
  ArrowSort24Regular as ArrowUpDown,
  Star24Regular as Star,
  Calendar24Regular as Calendar,
  NumberSymbol24Regular as Hash,
  TextT24Regular as Type,
  RadioButton24Regular as CircleDot,
  ToggleLeft24Regular as ToggleLeft,
  CheckboxChecked24Regular as CheckSquare,
  Add24Regular as Plus,
  Cursor24Regular as MousePointer,
  ArrowRight24Regular as ArrowRight,
  Folder24Regular as FolderTree,
  PanelLeft24Regular as PanelLeft,
  Edit24Regular as Pencil,
  ChevronRight24Regular as ChevronRight,
  ChevronDown24Regular as ChevronDown,
  Grid24Regular as LayoutGrid,
  Delete24Regular as Trash2,
  Info24Regular as Info,
  Warning24Regular as AlertTriangle,
  Clock24Regular as Clock,
  People24Regular as Users,
  Code24Regular as FileCode,
  Play24Regular as Play,
  ArrowDownload24Regular as Download,
  ArrowUpload24Regular as Upload,
  ArrowSync24Regular as RefreshCw,
  Copy24Regular as Copy,
  Link24Regular as LinkIcon,
  Cube24Regular as Box,
  Circle24Regular as Circle,
  Square24Regular as Square,
  Triangle24Regular as Triangle,
  Hexagon24Regular as Hexagon,
  Flow24Regular as Workflow,
  NumberSymbol24Regular as Binary,
  Braces24Regular as Braces,
  Table24Regular as Table,
  List24Regular as List,
  TextAlignLeft24Regular as AlignLeft,
  DataBarVertical24Regular as BarChart3,
  ChartPerson24Regular as PieChart,
  Pulse24Regular as Activity,
  TargetArrow24Regular as Target,
  Target24Regular as Crosshair,
  Gauge24Regular as Gauge,
  Options24Regular as Sliders,
  MoreHorizontal24Regular as MoreHorizontal,
  TableColumnTopBottom24Regular as Columns,
  Grid24Regular as Grid,
  LayoutCellFour24Regular as Layout,
  Phone24Regular as Smartphone,
  Desktop24Regular as Monitor,
  Globe24Regular as Globe,
  Mail24Regular as Mail,
  Call24Regular as Phone,
  Location24Regular as MapPin,
  Building24Regular as Building,
  Briefcase24Regular as Briefcase,
  Ribbon24Regular as Award,
  Shield24Regular as Shield,
  Key24Regular as Key,
  LockOpen24Regular as Unlock,
  PersonAvailable24Regular as UserCheck,
  PersonProhibited24Regular as UserX,
  ErrorCircle24Regular as AlertCircle,
  DismissCircle24Regular as XCircle,
  SubtractCircle24Regular as MinusCircle,
  AddCircle24Regular as PlusCircle,
  ArrowDown24Regular as ArrowDown,
  ArrowUp24Regular as ArrowUp,
  ArrowForwardDownPerson24Regular as CornerDownRight,
  SplitHorizontal24Regular as Split,
  Merge24Regular as Merge,
  NetworkCheck24Regular as Network,
  Share24Regular as Share2,
  Bookmark24Regular as Bookmark,
  Tag24Regular as Tag,
  Flag24Regular as Flag,
  Alert24Regular as Bell,
  Chat24Regular as MessageSquare,
  Send24Regular as Send,
  Save24Regular as Save,
  Edit24Regular as Edit,
  Delete24Regular as Trash,
  ArrowReset24Regular as RotateCcw,
  Open24Regular as ExternalLink,
  ArrowMaximize24Regular as Maximize2,
  ArrowMinimize24Regular as Minimize2,
  ReOrder24Regular as Move,
  ReOrderDotsVertical24Regular as GripVertical,
  MoreVertical24Regular as MoreVertical,
  Navigation24Regular as Menu,
  Dismiss24Regular as X,
  Checkmark24Regular as Check,
  ArrowSync24Regular as Loader,
  Search24Regular as Search,
  ZoomIn24Regular as ZoomIn,
  ZoomOut24Regular as ZoomOut,
  Color24Regular as Palette,
  Image24Regular as Image,
  ImageMultiple24Regular as FileImage,
  Video24Regular as Film,
  MusicNote224Regular as Music,
  Mic24Regular as Mic,
  Speaker224Regular as Volume2,
  Camera24Regular as Camera,
  Video24Regular as Video,
  Code24Regular as Code,
  WindowConsole20Regular as Terminal,
  Box24Regular as Package,
  Folder24Regular as Folder,
  FolderOpen24Regular as FolderOpen,
  Document24Regular as File,
  DocumentAdd24Regular as FilePlus,
  DocumentDismiss24Regular as FileX,
  Clipboard24Regular as Clipboard,
  ClipboardCheckmark24Regular as ClipboardCheck,
  ClipboardTextLtr24Regular as ClipboardList,
} from "@fluentui/react-icons";
import { cn } from "../lib/utils";

const useStyles = makeStyles({
  page: {
    minHeight: "100vh",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  headerContent: {
    display: "flex",
    alignItems: "center",
    height: "56px",
    maxWidth: "1400px",
    marginInline: "auto",
    paddingInline: tokens.spacingHorizontalL,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
  },
  container: {
    maxWidth: "1400px",
    marginInline: "auto",
    paddingBlock: tokens.spacingVerticalXXL,
    paddingInline: tokens.spacingHorizontalL,
  },
  layout: {
    display: "grid",
    gap: tokens.spacingHorizontalXXL,
    "@media (min-width: 1024px)": {
      gridTemplateColumns: "260px 1fr",
    },
  },
  sidebar: {
    display: "none",
    "@media (min-width: 1024px)": {
      display: "block",
    },
  },
  sidebarNav: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXS,
    paddingRight: tokens.spacingHorizontalM,
    maxHeight: "calc(100vh - 8rem)",
    overflowY: "auto",
    position: "sticky",
    top: "80px",
  },
  navLink: {
    display: "block",
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    paddingBlock: tokens.spacingVerticalXS,
    paddingInline: tokens.spacingHorizontalS,
    textDecoration: "none",
    borderRadius: tokens.borderRadiusSmall,
    borderLeft: "2px solid transparent",
    transition: "all 0.15s ease-in-out",
    "&:hover": {
      color: tokens.colorNeutralForeground1,
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  navLinkActive: {
    display: "block",
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorBrandForeground1,
    fontWeight: tokens.fontWeightSemibold,
    paddingBlock: tokens.spacingVerticalXS,
    paddingInline: tokens.spacingHorizontalS,
    textDecoration: "none",
    borderRadius: tokens.borderRadiusSmall,
    borderLeft: `2px solid ${tokens.colorBrandForeground1}`,
    backgroundColor: tokens.colorBrandBackground2,
    transition: "all 0.15s ease-in-out",
  },
  navSection: {
    fontSize: tokens.fontSizeBase100,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground2,
    paddingBlock: tokens.spacingVerticalS,
    paddingInline: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalM,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  main: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXXL,
  },
  card: {
    ...shorthands.padding(tokens.spacingVerticalL, tokens.spacingHorizontalL),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    boxShadow: tokens.shadow4,
  },
  cardHeaderRow: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalM,
  },
  iconBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "44px",
    height: "44px",
    borderRadius: tokens.borderRadiusMedium,
    backgroundColor: tokens.colorBrandBackground2,
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalM,
  },
  grid2: {
    display: "grid",
    gap: tokens.spacingHorizontalM,
    "@media (min-width: 640px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },
  grid3: {
    display: "grid",
    gap: tokens.spacingHorizontalM,
    "@media (min-width: 640px)": {
      gridTemplateColumns: "1fr 1fr 1fr",
    },
  },
  grid4: {
    display: "grid",
    gap: tokens.spacingHorizontalM,
    gridTemplateColumns: "1fr 1fr",
    "@media (min-width: 768px)": {
      gridTemplateColumns: "1fr 1fr 1fr 1fr",
    },
  },
  featureBox: {
    ...shorthands.padding(tokens.spacingVerticalM),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  stepCard: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
    ...shorthands.padding(tokens.spacingVerticalM),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  stepNumber: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: tokens.fontWeightBold,
    fontSize: tokens.fontSizeBase200,
    flexShrink: 0,
  },
  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: tokens.spacingHorizontalS,
    alignItems: "center",
  },
  treeExample: {
    ...shorthands.padding(tokens.spacingVerticalM),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    fontFamily: "monospace",
    fontSize: tokens.fontSizeBase200,
  },
  treeNested: {
    marginLeft: tokens.spacingHorizontalL,
    borderLeft: `2px solid ${tokens.colorNeutralStroke2}`,
    paddingLeft: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalXS,
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalXS,
  },
  treeItem: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  tipBox: {
    ...shorthands.padding(tokens.spacingVerticalM),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  warningBox: {
    ...shorthands.padding(tokens.spacingVerticalM),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorPaletteYellowBackground1,
    border: `1px solid ${tokens.colorPaletteYellowBorder1}`,
  },
  errorBox: {
    ...shorthands.padding(tokens.spacingVerticalM),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorPaletteRedBackground1,
    border: `1px solid ${tokens.colorPaletteRedBorder1}`,
  },
  successBox: {
    ...shorthands.padding(tokens.spacingVerticalM),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorPaletteGreenBackground1,
    border: `1px solid ${tokens.colorPaletteGreenBorder1}`,
  },
  erdContainer: {
    ...shorthands.padding(tokens.spacingVerticalXL),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    overflowX: "auto",
  },
  erdEntity: {
    ...shorthands.padding(tokens.spacingVerticalM),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    ...shorthands.borderWidth("2px"),
    ...shorthands.borderStyle("solid"),
    minWidth: "200px",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  erdRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: tokens.spacingHorizontalM,
    fontSize: tokens.fontSizeBase100,
  },
  erdConnector: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: tokens.spacingVerticalXS,
  },
  erdLine: {
    width: "2px",
    height: "24px",
    backgroundColor: tokens.colorNeutralStroke2,
  },
  questionTypeCard: {
    ...shorthands.padding(tokens.spacingVerticalM),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
  },
  iconList: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalS,
  },
  iconListItem: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
  codeBlock: {
    ...shorthands.padding(tokens.spacingVerticalM),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    backgroundColor: tokens.colorNeutralBackground4,
    fontFamily: "monospace",
    fontSize: tokens.fontSizeBase200,
    overflowX: "auto",
    whiteSpace: "pre-wrap",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: tokens.fontSizeBase200,
    "& th": {
      textAlign: "left",
      ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalS),
      borderBottom: `2px solid ${tokens.colorNeutralStroke1}`,
      fontWeight: tokens.fontWeightSemibold,
      backgroundColor: tokens.colorNeutralBackground3,
    },
    "& td": {
      ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalS),
      borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    "& tr:hover td": {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  flowDiagram: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: tokens.spacingVerticalM,
    ...shorthands.padding(tokens.spacingVerticalL),
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },
  flowBox: {
    ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalL),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    border: `2px solid`,
    backgroundColor: tokens.colorNeutralBackground1,
    textAlign: "center",
    minWidth: "150px",
  },
  flowArrow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: tokens.colorNeutralForeground3,
  },
  flowRow: {
    display: "flex",
    gap: tokens.spacingHorizontalL,
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  decisionDiamond: {
    ...shorthands.padding(tokens.spacingVerticalM),
    transform: "rotate(0deg)",
    border: `2px solid ${tokens.colorPaletteYellowBorder2}`,
    backgroundColor: tokens.colorPaletteYellowBackground1,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    textAlign: "center",
    minWidth: "120px",
  },
  workflowContainer: {
    display: "flex",
    flexDirection: "column",
    gap: tokens.spacingVerticalL,
    ...shorthands.padding(tokens.spacingVerticalL),
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
  },
  workflowStep: {
    display: "flex",
    alignItems: "flex-start",
    gap: tokens.spacingHorizontalM,
  },
  workflowIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    ...shorthands.borderRadius("50%"),
    flexShrink: 0,
  },
  comparisonTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: tokens.fontSizeBase200,
    "& th": {
      textAlign: "center",
      ...shorthands.padding(tokens.spacingVerticalM, tokens.spacingHorizontalS),
      borderBottom: `2px solid ${tokens.colorNeutralStroke1}`,
      fontWeight: tokens.fontWeightSemibold,
      backgroundColor: tokens.colorNeutralBackground3,
    },
    "& th:first-child": {
      textAlign: "left",
    },
    "& td": {
      ...shorthands.padding(tokens.spacingVerticalS, tokens.spacingHorizontalS),
      borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
      textAlign: "center",
    },
    "& td:first-child": {
      textAlign: "left",
      fontWeight: tokens.fontWeightMedium,
    },
  },
});

const Documentation = () => {
  const styles = useStyles();
  const { navigate } = useNavigation();
  const [activeSection, setActiveSection] = useState<string>("overview");
  const observerRef = useRef<IntersectionObserver | null>(null);

  const navLinks = [
    { type: "section", label: "Getting Started" },
    { href: "#overview", label: "Overview" },
    { href: "#getting-started", label: "Quick Start Guide" },
    { href: "#workflow", label: "Workflow & Navigation" },
    { type: "section", label: "Building Questionnaires" },
    { href: "#structure", label: "Structure & Hierarchy" },
    { href: "#sidebar-tree", label: "Sidebar Tree View" },
    { href: "#adding-content", label: "Adding Content" },
    { href: "#question-types", label: "Question Types" },
    { href: "#answer-sets", label: "Answer Sets" },
    { type: "section", label: "Advanced Features" },
    { href: "#conditional-branching", label: "Conditional Branching" },
    { href: "#dynamic-values", label: "Dynamic Values" },
    { href: "#rules", label: "Rules & Logic" },
    { href: "#action-records", label: "Action Records" },
    { type: "section", label: "Data Model" },
    { href: "#erd", label: "Entity Relationship Diagram" },
    { href: "#data-flow", label: "Data Flow" },
    { type: "section", label: "Reference" },
    { href: "#question-properties", label: "Question Properties" },
    { href: "#feature-comparison", label: "Feature Comparison" },
    { href: "#validation", label: "Validation" },
    { href: "#templates", label: "Templates & Drafts" },
    { href: "#preview", label: "Preview & Testing" },
    { href: "#troubleshooting", label: "Troubleshooting" },
    { href: "#glossary", label: "Glossary" },
  ];

  // Get section IDs for scroll spy
  const sectionIds = navLinks
    .filter((link) => link.href)
    .map((link) => link.href!.replace("#", ""));

  // Set up IntersectionObserver for scroll-spy
  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: "-80px 0px -60% 0px",
      threshold: 0,
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Find the entry that is intersecting and closest to the top
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      if (visibleEntries.length > 0) {
        // Sort by position in the document (top to bottom)
        const sorted = visibleEntries.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
        );
        setActiveSection(sorted[0].target.id);
      }
    };

    observerRef.current = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all section elements
    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  // Handle smooth scrolling when clicking nav links
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(targetId);
    }
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Button appearance="subtle" icon={<ArrowLeft className="h-4 w-4" />} onClick={() => navigate('home')}>
            Back to Builder
          </Button>
          <div className={styles.headerTitle}>
            <Text weight="semibold" size={400}>Questionnaire Builder Documentation</Text>
          </div>
          <Button appearance="primary" icon={<Database className="h-4 w-4" />} onClick={() => navigate('docs-pcf')}>
            PCF Technical Docs
          </Button>
        </div>
      </header>

      <div className={styles.container}>
        <div className={styles.layout}>
          {/* Sidebar Navigation */}
          <aside className={styles.sidebar}>
            <nav className={styles.sidebarNav}>
              {navLinks.map((link, index) => 
                link.type === "section" ? (
                  <div key={index} className={styles.navSection}>{link.label}</div>
                ) : (
                  <a 
                    key={link.href} 
                    href={link.href} 
                    onClick={(e) => handleNavClick(e, link.href!)}
                    className={
                      activeSection === link.href?.replace("#", "") 
                        ? styles.navLinkActive 
                        : styles.navLink
                    }
                  >
                    {link.label}
                  </a>
                )
              )}
            </nav>
          </aside>

          {/* Main Content */}
          <main className={styles.main}>
            
            {/* ================================================================ */}
            {/* OVERVIEW SECTION */}
            {/* ================================================================ */}
            <section id="overview">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <FileText className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <div>
                    <Text weight="semibold" size={500} block>Questionnaire Builder</Text>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                      A comprehensive tool for creating dynamic, interactive questionnaires with advanced logic
                    </Text>
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    The Questionnaire Builder is a powerful visual tool designed for creating complex, 
                    multi-page questionnaires with advanced conditional logic. It supports nested branching, 
                    dynamic answer sets, rule-based visibility, and automated action records for ITSM workflows.
                  </Text>
                  
                  <div className={styles.grid3}>
                    <div className={styles.featureBox}>
                      <div className={styles.treeItem} style={{ marginBottom: tokens.spacingVerticalS }}>
                        <LayoutGrid className="h-5 w-5" style={{ color: tokens.colorBrandForeground1 }} />
                        <Text weight="semibold">Visual Builder</Text>
                      </div>
                      <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                        Hierarchical tree navigation with click-to-select editing. See your entire questionnaire structure at a glance.
                      </Text>
                    </div>
                    <div className={styles.featureBox}>
                      <div className={styles.treeItem} style={{ marginBottom: tokens.spacingVerticalS }}>
                        <GitBranch className="h-5 w-5" style={{ color: tokens.colorBrandForeground1 }} />
                        <Text weight="semibold">Conditional Logic</Text>
                      </div>
                      <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                        Complex AND/OR rules with nested branches. Show or hide questions based on previous answers.
                      </Text>
                    </div>
                    <div className={styles.featureBox}>
                      <div className={styles.treeItem} style={{ marginBottom: tokens.spacingVerticalS }}>
                        <Zap className="h-5 w-5" style={{ color: tokens.colorBrandForeground1 }} />
                        <Text weight="semibold">ITSM Integration</Text>
                      </div>
                      <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                        Built-in support for creating incident tickets, service requests, and change records.
                      </Text>
                    </div>
                  </div>

                  <Divider />

                  <Text weight="semibold" size={300} block>Key Capabilities</Text>
                  <div className={styles.grid2}>
                    <div className={styles.iconList}>
                      <div className={styles.iconListItem}>
                        <CheckCircle className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} />
                        <span>13 question types including text, choice, date, rating, and more</span>
                      </div>
                      <div className={styles.iconListItem}>
                        <CheckCircle className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} />
                        <span>Multi-page questionnaires with section organization</span>
                      </div>
                      <div className={styles.iconListItem}>
                        <CheckCircle className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} />
                        <span>Nested conditional branches with unlimited depth</span>
                      </div>
                      <div className={styles.iconListItem}>
                        <CheckCircle className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} />
                        <span>Dynamic answer sets from external data sources</span>
                      </div>
                    </div>
                    <div className={styles.iconList}>
                      <div className={styles.iconListItem}>
                        <CheckCircle className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} />
                        <span>Answer-level rule groups for granular control</span>
                      </div>
                      <div className={styles.iconListItem}>
                        <CheckCircle className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} />
                        <span>Action records for automated ITSM ticket creation</span>
                      </div>
                      <div className={styles.iconListItem}>
                        <CheckCircle className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} />
                        <span>Export/Import as JSON for sharing and backup</span>
                      </div>
                      <div className={styles.iconListItem}>
                        <CheckCircle className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} />
                        <span>Live preview mode for testing questionnaire flow</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* GETTING STARTED SECTION */}
            {/* ================================================================ */}
            <section id="getting-started">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <Play className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Quick Start Guide</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    Follow these steps to create your first questionnaire from scratch:
                  </Text>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacingVerticalM }}>
                    {[
                      { 
                        num: "1", 
                        title: 'Create a New Questionnaire', 
                        desc: 'Click "Create New" on the Home Screen. This opens a blank questionnaire with one default page. Alternatively, select an existing template to start with pre-built content.',
                        icon: <FilePlus className="h-4 w-4" />
                      },
                      { 
                        num: "2", 
                        title: "Configure Questionnaire Details", 
                        desc: 'Expand the "Questionnaire Details" section in the sidebar. Set the name (required), description, service catalog association, and initial status (Draft/Active/Inactive).',
                        icon: <Settings className="h-4 w-4" />
                      },
                      { 
                        num: "3", 
                        title: "Add Sections to Organize Content", 
                        desc: 'Click "Add Section" in the main workspace. Sections are containers that group related questions by topic. Name each section descriptively (e.g., "Contact Information", "Issue Details").',
                        icon: <Folder className="h-4 w-4" />
                      },
                      { 
                        num: "4", 
                        title: "Add Questions to Sections", 
                        desc: 'Click "Add Question" within a section. Select the question type, enter the question text, configure answer options for choice-based questions, and set required/optional status.',
                        icon: <HelpCircle className="h-4 w-4" />
                      },
                      { 
                        num: "5", 
                        title: "Add Conditional Branches (Optional)", 
                        desc: 'Click "Add Branch" to create conditional logic. Define conditions based on previous answers. Questions inside branches only appear when conditions are met.',
                        icon: <GitBranch className="h-4 w-4" />
                      },
                      { 
                        num: "6", 
                        title: "Preview and Test", 
                        desc: 'Click "Preview" to test your questionnaire as end users will experience it. Verify conditional logic works correctly and all required fields are properly configured.',
                        icon: <Eye className="h-4 w-4" />
                      },
                      { 
                        num: "7", 
                        title: "Save Your Work", 
                        desc: 'Click "Save as Draft" to store your questionnaire locally. You can also export as JSON for backup or sharing with others.',
                        icon: <Save className="h-4 w-4" />
                      },
                    ].map((step) => (
                      <div key={step.num} className={styles.stepCard}>
                        <div className={styles.stepNumber}>{step.num}</div>
                        <div style={{ flex: 1 }}>
                          <div className={styles.treeItem} style={{ marginBottom: tokens.spacingVerticalXS }}>
                            {step.icon}
                            <Text weight="semibold">{step.title}</Text>
                          </div>
                          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{step.desc}</Text>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.tipBox}>
                    <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalXS }}>
                      💡 Pro Tip: Start Simple
                    </Text>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                      Begin with a simple questionnaire structure and add complexity gradually. 
                      Test frequently using Preview mode to ensure your conditional logic works as expected.
                    </Text>
                  </div>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* WORKFLOW & NAVIGATION SECTION */}
            {/* ================================================================ */}
            <section id="workflow">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <Layout className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Workflow & Navigation</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    The builder uses a split-panel layout optimized for efficient questionnaire creation:
                  </Text>
                  
                  {/* Layout Diagram */}
                  <div className={styles.erdContainer}>
                    <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalM, textAlign: "center" }}>
                      Builder Layout Overview
                    </Text>
                    <div style={{ display: "flex", gap: tokens.spacingHorizontalM, minHeight: "200px" }}>
                      {/* Left Sidebar */}
                      <div style={{ 
                        flex: "0 0 30%", 
                        border: `2px solid ${tokens.colorBrandStroke1}`,
                        borderRadius: tokens.borderRadiusMedium,
                        padding: tokens.spacingVerticalM,
                        backgroundColor: tokens.colorNeutralBackground1,
                      }}>
                        <Text weight="semibold" size={200} block style={{ marginBottom: tokens.spacingVerticalS, color: tokens.colorBrandForeground1 }}>
                          LEFT SIDEBAR (30%)
                        </Text>
                        <div className={styles.iconList}>
                          <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>📋 Questionnaire Details</Text>
                          <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>🌳 Tree View Navigation</Text>
                          <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>├─ Pages</Text>
                          <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>│  ├─ Sections</Text>
                          <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>│  │  ├─ Questions</Text>
                          <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>│  │  └─ Branches</Text>
                        </div>
                      </div>
                      {/* Right Workspace */}
                      <div style={{ 
                        flex: "1", 
                        border: `2px solid ${tokens.colorPaletteGreenBorder1}`,
                        borderRadius: tokens.borderRadiusMedium,
                        padding: tokens.spacingVerticalM,
                        backgroundColor: tokens.colorNeutralBackground1,
                      }}>
                        <Text weight="semibold" size={200} block style={{ marginBottom: tokens.spacingVerticalS, color: tokens.colorPaletteGreenForeground1 }}>
                          MAIN WORKSPACE (70%)
                        </Text>
                        <div style={{ 
                          border: `1px dashed ${tokens.colorNeutralStroke2}`,
                          padding: tokens.spacingVerticalS,
                          marginBottom: tokens.spacingVerticalS,
                          borderRadius: tokens.borderRadiusSmall,
                        }}>
                          <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>Page Tabs: [Page 1] [Page 2] [+]</Text>
                        </div>
                        <div style={{ 
                          border: `1px dashed ${tokens.colorNeutralStroke2}`,
                          padding: tokens.spacingVerticalS,
                          borderRadius: tokens.borderRadiusSmall,
                          flex: 1,
                        }}>
                          <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                            Section Cards / Question Editor / Branch Editor
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.grid2}>
                    <div className={styles.featureBox}>
                      <div className={styles.treeItem} style={{ marginBottom: tokens.spacingVerticalS }}>
                        <PanelLeft className="h-5 w-5" style={{ color: tokens.colorBrandForeground1 }} />
                        <Text weight="semibold">Left Sidebar (30%)</Text>
                      </div>
                      <div className={styles.iconList}>
                        <div className={styles.iconListItem}>
                          <ChevronRight className="h-3 w-3" />
                          <span>Collapsible Questionnaire Details form</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <ChevronRight className="h-3 w-3" />
                          <span>Interactive tree view of all content</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <ChevronRight className="h-3 w-3" />
                          <span>Click any item to select and edit</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <ChevronRight className="h-3 w-3" />
                          <span>Visual hierarchy with connector lines</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <ChevronRight className="h-3 w-3" />
                          <span>Reset button to return to home</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.featureBox}>
                      <div className={styles.treeItem} style={{ marginBottom: tokens.spacingVerticalS }}>
                        <LayoutGrid className="h-5 w-5" style={{ color: tokens.colorBrandForeground1 }} />
                        <Text weight="semibold">Main Workspace (70%)</Text>
                      </div>
                      <div className={styles.iconList}>
                        <div className={styles.iconListItem}>
                          <ChevronRight className="h-3 w-3" />
                          <span>Page tabs for multi-page navigation</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <ChevronRight className="h-3 w-3" />
                          <span>Section cards with question preview</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <ChevronRight className="h-3 w-3" />
                          <span>Full-featured Question/Branch editors</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <ChevronRight className="h-3 w-3" />
                          <span>Add Section/Question/Branch buttons</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <ChevronRight className="h-3 w-3" />
                          <span>Inline hierarchy visualization</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Divider />
                  
                  {/* Selection Flow Diagram */}
                  <Text weight="semibold" size={300} block>Selection Flow</Text>
                  <div className={styles.flowDiagram}>
                    <div className={styles.flowRow}>
                      <div className={styles.flowBox} style={{ borderColor: tokens.colorBrandStroke1 }}>
                        <Text size={200} weight="medium">Click Page Tab</Text>
                      </div>
                      <ArrowRight className="h-5 w-5" style={{ color: tokens.colorNeutralForeground3 }} />
                      <div className={styles.flowBox} style={{ borderColor: tokens.colorBrandStroke1 }}>
                        <Text size={200} weight="medium">Page Loads</Text>
                      </div>
                      <ArrowRight className="h-5 w-5" style={{ color: tokens.colorNeutralForeground3 }} />
                      <div className={styles.flowBox} style={{ borderColor: tokens.colorPaletteGreenBorder1 }}>
                        <Text size={200} weight="medium">Click Item in Tree</Text>
                      </div>
                      <ArrowRight className="h-5 w-5" style={{ color: tokens.colorNeutralForeground3 }} />
                      <div className={styles.flowBox} style={{ borderColor: tokens.colorPaletteGreenBorder1 }}>
                        <Text size={200} weight="medium">Editor Opens</Text>
                      </div>
                    </div>
                  </div>
                  
                  <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                    Selected items are highlighted in both the sidebar tree and the section preview. 
                    The corresponding editor appears in the main workspace for immediate editing.
                  </Text>

                  <Divider />

                  <Text weight="semibold" size={300} block>Page Tab Interactions</Text>
                  <div className={styles.badgeRow}>
                    <Badge appearance="outline" icon={<MousePointer className="h-3 w-3" />}>Single Click = Select Page</Badge>
                    <Badge appearance="outline" icon={<Pencil className="h-3 w-3" />}>Double Click = Rename Page</Badge>
                    <Badge appearance="outline" icon={<X className="h-3 w-3" />}>X Button = Delete Page</Badge>
                    <Badge appearance="outline" icon={<Plus className="h-3 w-3" />}>+ Button = Add New Page</Badge>
                  </div>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* STRUCTURE SECTION */}
            {/* ================================================================ */}
            <section id="structure">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <Layers className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Structure & Hierarchy</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    Questionnaires follow a strict hierarchical structure that organizes content into manageable units:
                  </Text>
                  
                  {/* Hierarchy Diagram */}
                  <div className={styles.erdContainer}>
                    <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalM, textAlign: "center" }}>
                      Content Hierarchy
                    </Text>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: tokens.spacingVerticalS }}>
                      {/* Questionnaire Level */}
                      <div className={styles.erdEntity} style={{ borderColor: tokens.colorBrandStroke1, backgroundColor: tokens.colorBrandBackground2 }}>
                        <Text weight="bold" block style={{ textAlign: "center", color: tokens.colorBrandForeground1 }}>
                          📋 Questionnaire
                        </Text>
                        <Text size={100} block style={{ textAlign: "center", color: tokens.colorNeutralForeground3 }}>
                          Top-level container (name, description, status)
                        </Text>
                      </div>
                      <div className={styles.erdConnector}>
                        <div className={styles.erdLine} />
                        <Badge appearance="outline" size="small">contains 1..N</Badge>
                        <div className={styles.erdLine} />
                      </div>
                      {/* Page Level */}
                      <div className={styles.erdEntity} style={{ borderColor: tokens.colorPaletteCornflowerBorderActive }}>
                        <Text weight="bold" block style={{ textAlign: "center", color: tokens.colorPaletteCornflowerForeground2 }}>
                          📄 Pages
                        </Text>
                        <Text size={100} block style={{ textAlign: "center", color: tokens.colorNeutralForeground3 }}>
                          Multi-step navigation (one visible at a time)
                        </Text>
                      </div>
                      <div className={styles.erdConnector}>
                        <div className={styles.erdLine} />
                        <Badge appearance="outline" size="small">contains 1..N</Badge>
                        <div className={styles.erdLine} />
                      </div>
                      {/* Section Level */}
                      <div className={styles.erdEntity} style={{ borderColor: tokens.colorPaletteGreenBorder1 }}>
                        <Text weight="bold" block style={{ textAlign: "center", color: tokens.colorPaletteGreenForeground1 }}>
                          📁 Sections
                        </Text>
                        <Text size={100} block style={{ textAlign: "center", color: tokens.colorNeutralForeground3 }}>
                          Collapsible groups for organizing related questions
                        </Text>
                      </div>
                      <div className={styles.erdConnector}>
                        <div className={styles.erdLine} />
                        <Badge appearance="outline" size="small">contains 0..N</Badge>
                        <div className={styles.erdLine} />
                      </div>
                      {/* Questions & Branches Level */}
                      <div style={{ display: "flex", gap: tokens.spacingHorizontalXL }}>
                        <div className={styles.erdEntity} style={{ borderColor: tokens.colorPaletteMarigoldBorder1 }}>
                          <Text weight="bold" block style={{ textAlign: "center", color: tokens.colorPaletteMarigoldForeground1 }}>
                            ❓ Questions
                          </Text>
                          <Text size={100} block style={{ textAlign: "center", color: tokens.colorNeutralForeground3 }}>
                            User input fields
                          </Text>
                        </div>
                        <div className={styles.erdEntity} style={{ borderColor: tokens.colorPaletteLilacBorderActive }}>
                          <Text weight="bold" block style={{ textAlign: "center", color: tokens.colorPaletteLilacForeground2 }}>
                            🔀 Branches
                          </Text>
                          <Text size={100} block style={{ textAlign: "center", color: tokens.colorNeutralForeground3 }}>
                            Conditional containers
                          </Text>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacingVerticalM }}>
                    {[
                      { 
                        level: "Level 1", 
                        title: "Pages", 
                        desc: "Top-level containers that represent steps in a multi-page form. Users navigate between pages using Previous/Next buttons. Each page can contain multiple sections.",
                        color: tokens.colorPaletteCornflowerForeground2,
                        icon: <File className="h-4 w-4" />
                      },
                      { 
                        level: "Level 2", 
                        title: "Sections", 
                        desc: "Collapsible cards within pages that organize questions by topic or category. Sections have a name and optional description. They contain both direct questions and conditional branches.",
                        color: tokens.colorPaletteGreenForeground1,
                        icon: <Folder className="h-4 w-4" />
                      },
                      { 
                        level: "Level 3", 
                        title: "Questions & Branches", 
                        desc: "The actual content. Questions collect user input (text, choice, date, etc.). Conditional Branches are containers that show/hide their contents based on rule conditions. Branches can be nested infinitely.",
                        color: tokens.colorPaletteMarigoldForeground1,
                        icon: <HelpCircle className="h-4 w-4" />
                      },
                    ].map((item) => (
                      <div key={item.level} className={styles.stepCard}>
                        <Badge appearance="filled" style={{ backgroundColor: item.color }}>{item.level}</Badge>
                        <div style={{ flex: 1 }}>
                          <div className={styles.treeItem} style={{ marginBottom: tokens.spacingVerticalXS }}>
                            <span style={{ color: item.color }}>{item.icon}</span>
                            <Text weight="semibold">{item.title}</Text>
                          </div>
                          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{item.desc}</Text>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.tipBox}>
                    <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalXS }}>
                      💡 Nesting Rules
                    </Text>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                      Branches can contain both questions and other branches (child branches), allowing for 
                      complex decision trees. Each branch can have its own conditions, and nested branches 
                      inherit visibility from their parent—if a parent branch is hidden, all its contents are hidden too.
                    </Text>
                  </div>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* SIDEBAR TREE VIEW SECTION */}
            {/* ================================================================ */}
            <section id="sidebar-tree">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <FolderTree className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Sidebar Tree View</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    The sidebar displays your entire questionnaire as an interactive hierarchical tree with visual connector lines 
                    that show parent-child relationships.
                  </Text>
                  
                  {/* Tree Example */}
                  <div className={styles.treeExample}>
                    <div style={{ color: tokens.colorBrandForeground1 }}>📋 IT Support Request Form</div>
                    <div className={styles.treeNested}>
                      <div style={{ color: tokens.colorPaletteCornflowerForeground2 }}>📄 Page 1: Initial Assessment</div>
                      <div className={styles.treeNested}>
                        <div style={{ color: tokens.colorPaletteGreenForeground1 }}>📁 Section: Contact Information</div>
                        <div className={styles.treeNested}>
                          <div className={styles.treeItem}>
                            <HelpCircle className="h-3 w-3" style={{ color: tokens.colorPaletteMarigoldForeground1 }} />
                            <span>What is your name?</span>
                            <Badge appearance="tint" size="small" color="danger">Required</Badge>
                          </div>
                          <div className={styles.treeItem}>
                            <HelpCircle className="h-3 w-3" style={{ color: tokens.colorPaletteMarigoldForeground1 }} />
                            <span>What is your department?</span>
                          </div>
                          <div className={styles.treeItem}>
                            <HelpCircle className="h-3 w-3" style={{ color: tokens.colorPaletteMarigoldForeground1 }} />
                            <span>Preferred contact method?</span>
                            <Zap className="h-3 w-3" style={{ color: "#eab308" }} />
                          </div>
                        </div>
                        <div style={{ color: tokens.colorPaletteGreenForeground1 }}>📁 Section: Issue Details</div>
                        <div className={styles.treeNested}>
                          <div className={styles.treeItem}>
                            <HelpCircle className="h-3 w-3" style={{ color: tokens.colorPaletteMarigoldForeground1 }} />
                            <span>What type of issue are you experiencing?</span>
                          </div>
                          <div className={styles.treeItem} style={{ color: tokens.colorPaletteLilacForeground2 }}>
                            <GitBranch className="h-3 w-3" />
                            <span>If Hardware Issue...</span>
                          </div>
                          <div className={styles.treeNested} style={{ borderColor: tokens.colorPaletteLilacBorderActive, opacity: 0.9 }}>
                            <div className={styles.treeItem}>
                              <HelpCircle className="h-3 w-3" style={{ color: tokens.colorPaletteMarigoldForeground1 }} />
                              <span>What hardware is affected?</span>
                            </div>
                            <div className={styles.treeItem}>
                              <HelpCircle className="h-3 w-3" style={{ color: tokens.colorPaletteMarigoldForeground1 }} />
                              <span>Serial number (if known)?</span>
                            </div>
                            <div className={styles.treeItem} style={{ color: tokens.colorPaletteLilacForeground2 }}>
                              <GitBranch className="h-3 w-3" />
                              <span>If Laptop/Desktop...</span>
                            </div>
                            <div className={styles.treeNested} style={{ borderColor: tokens.colorPaletteLilacBorderActive, opacity: 0.8 }}>
                              <div className={styles.treeItem}>
                                <HelpCircle className="h-3 w-3" style={{ color: tokens.colorPaletteMarigoldForeground1 }} />
                                <span>Operating system?</span>
                              </div>
                            </div>
                          </div>
                          <div className={styles.treeItem} style={{ color: tokens.colorPaletteLilacForeground2 }}>
                            <GitBranch className="h-3 w-3" />
                            <span>If Software Issue...</span>
                          </div>
                          <div className={styles.treeNested} style={{ borderColor: tokens.colorPaletteLilacBorderActive, opacity: 0.9 }}>
                            <div className={styles.treeItem}>
                              <HelpCircle className="h-3 w-3" style={{ color: tokens.colorPaletteMarigoldForeground1 }} />
                              <span>Application name?</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={{ color: tokens.colorPaletteCornflowerForeground2 }}>📄 Page 2: Additional Details</div>
                    </div>
                  </div>
                  
                  <div className={styles.grid2}>
                    <div className={styles.featureBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>Tree Icons Legend</Text>
                      <div className={styles.iconList}>
                        <div className={styles.iconListItem}>
                          <span style={{ fontSize: "14px" }}>📋</span>
                          <span>Questionnaire (root)</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <span style={{ fontSize: "14px" }}>📄</span>
                          <span>Page</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <span style={{ fontSize: "14px" }}>📁</span>
                          <span>Section</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <HelpCircle className="h-4 w-4" style={{ color: tokens.colorPaletteMarigoldForeground1 }} />
                          <span>Question</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <GitBranch className="h-4 w-4" style={{ color: tokens.colorPaletteLilacForeground2 }} />
                          <span>Conditional Branch</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Zap className="h-4 w-4" style={{ color: "#eab308" }} />
                          <span>Has Action Record</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.featureBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>Interactions</Text>
                      <div className={styles.iconList}>
                        <div className={styles.iconListItem}>
                          <MousePointer className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Click to select and edit</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Eye className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Selected = highlighted</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <CornerDownRight className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Connector lines show nesting</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Badge appearance="tint" size="small" color="danger">Required</Badge>
                          <span>Required indicator</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.tipBox}>
                    <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalXS }}>
                      💡 Visual Connector Lines
                    </Text>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                      CSS-based tree lines (border-left-2) connect parent and child items, making the hierarchy easy to understand. 
                      Deeper nesting levels show progressively lighter/different colored connector lines to maintain visual clarity 
                      and distinguish between branch depths.
                    </Text>
                  </div>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* ADDING CONTENT SECTION */}
            {/* ================================================================ */}
            <section id="adding-content">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <Plus className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Adding Questions & Branches</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    Learn how to add different types of content to your questionnaire:
                  </Text>
                  
                  <div className={styles.grid2}>
                    <div className={styles.featureBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>
                        <Plus className="h-4 w-4" style={{ display: "inline", marginRight: "8px" }} />
                        Adding a Section
                      </Text>
                      <div className={styles.iconList}>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>1. Navigate to the desired page</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>2. Click "Add Section" button in workspace</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>3. Enter section name and description</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>4. Section appears in tree and workspace</Text>
                      </div>
                    </div>
                    
                    <div className={styles.featureBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>
                        <HelpCircle className="h-4 w-4" style={{ display: "inline", marginRight: "8px" }} />
                        Adding a Question
                      </Text>
                      <div className={styles.iconList}>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>1. Click section or branch to select it</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>2. Click "Add Question" button</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>3. Select question type from dropdown</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>4. Configure in the Question Editor</Text>
                      </div>
                    </div>
                    
                    <div className={styles.featureBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>
                        <GitBranch className="h-4 w-4" style={{ display: "inline", marginRight: "8px" }} />
                        Adding a Branch
                      </Text>
                      <div className={styles.iconList}>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>1. Click section or parent branch</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>2. Click "Add Branch" button</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>3. Name the branch descriptively</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>4. Configure conditions in Branch Editor</Text>
                      </div>
                    </div>
                    
                    <div className={styles.featureBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>
                        <File className="h-4 w-4" style={{ display: "inline", marginRight: "8px" }} />
                        Adding a Page
                      </Text>
                      <div className={styles.iconList}>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>1. Click the "+" tab next to page tabs</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>2. New page is created with default name</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>3. Double-click tab to rename</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>4. Add sections and content as needed</Text>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* QUESTION TYPES SECTION */}
            {/* ================================================================ */}
            <section id="question-types">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <HelpCircle className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Question Types</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    The builder supports 13 question types to capture different kinds of user input:
                  </Text>
                  
                  {/* Question Types Grid */}
                  <div className={styles.grid3}>
                    {[
                      { icon: <Type className="h-5 w-5" />, name: "Text", desc: "Single-line text input for short answers like names or titles", needsAnswerSet: false },
                      { icon: <AlignLeft className="h-5 w-5" />, name: "MultiLineText", desc: "Multi-line textarea for longer descriptions or comments", needsAnswerSet: false },
                      { icon: <Hash className="h-5 w-5" />, name: "Number", desc: "Integer numeric input with optional min/max validation", needsAnswerSet: false },
                      { icon: <BarChart3 className="h-5 w-5" />, name: "Decimal", desc: "Floating-point numeric input for precise values", needsAnswerSet: false },
                      { icon: <Calendar className="h-5 w-5" />, name: "Date", desc: "Date picker for selecting dates", needsAnswerSet: false },
                      { icon: <Clock className="h-5 w-5" />, name: "DateTime", desc: "Date and time picker combined", needsAnswerSet: false },
                      { icon: <ToggleLeft className="h-5 w-5" />, name: "Boolean", desc: "Yes/No toggle switch for binary choices", needsAnswerSet: false },
                      { icon: <CircleDot className="h-5 w-5" />, name: "Choice", desc: "Single selection from option list (general)", needsAnswerSet: true },
                      { icon: <Circle className="h-5 w-5" />, name: "RadioButton", desc: "Single selection with radio button UI", needsAnswerSet: true },
                      { icon: <CheckSquare className="h-5 w-5" />, name: "MultiSelect", desc: "Multiple selections from checkbox list", needsAnswerSet: true },
                      { icon: <ListChecks className="h-5 w-5" />, name: "Dropdown", desc: "Single selection from dropdown menu", needsAnswerSet: true },
                      { icon: <Star className="h-5 w-5" />, name: "Rating", desc: "1-5 star rating input for feedback", needsAnswerSet: false },
                      { icon: <Database className="h-5 w-5" />, name: "Lookup", desc: "Select from external data source (Dataverse)", needsAnswerSet: true },
                    ].map((type) => (
                      <div key={type.name} className={styles.questionTypeCard}>
                        <div className={styles.treeItem} style={{ marginBottom: tokens.spacingVerticalXS }}>
                          <span style={{ color: tokens.colorBrandForeground1 }}>{type.icon}</span>
                          <Text weight="semibold">{type.name}</Text>
                        </div>
                        <Text size={200} block style={{ color: tokens.colorNeutralForeground3, marginBottom: tokens.spacingVerticalXS }}>
                          {type.desc}
                        </Text>
                        {type.needsAnswerSet && (
                          <Badge appearance="outline" size="small">Requires Answer Set</Badge>
                        )}
                      </div>
                    ))}
                  </div>

                  <Divider />

                  <Text weight="semibold" size={300} block>Question Type Categories</Text>
                  <div className={styles.grid3}>
                    <div className={styles.successBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalXS }}>
                        📝 Free-Form Input
                      </Text>
                      <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                        Text, MultiLineText, Number, Decimal, Date, DateTime
                      </Text>
                    </div>
                    <div className={styles.tipBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalXS }}>
                        📋 Choice-Based
                      </Text>
                      <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                        Choice, RadioButton, MultiSelect, Dropdown, Lookup
                      </Text>
                    </div>
                    <div className={styles.warningBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalXS }}>
                        ⭐ Special Types
                      </Text>
                      <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                        Boolean (toggle), Rating (stars)
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* ANSWER SETS SECTION */}
            {/* ================================================================ */}
            <section id="answer-sets">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <ListChecks className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Answer Sets</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    Answer sets define the available options for choice-based questions. Each question can have 
                    multiple answer sets, with one marked as default and rules controlling which set is active.
                  </Text>
                  
                  {/* Answer Set Flow Diagram */}
                  <div className={styles.erdContainer}>
                    <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalM, textAlign: "center" }}>
                      Answer Set Configuration Flow
                    </Text>
                    <div className={styles.flowDiagram} style={{ backgroundColor: "transparent" }}>
                      <div className={styles.flowRow}>
                        <div className={styles.flowBox} style={{ borderColor: tokens.colorBrandStroke1 }}>
                          <Text size={200} weight="medium">Question Created</Text>
                        </div>
                        <ArrowRight className="h-5 w-5" />
                        <div className={styles.decisionDiamond}>
                          <Text size={200} weight="medium">Choice Type?</Text>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: tokens.spacingHorizontalXXL }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: tokens.spacingVerticalS }}>
                          <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>YES</Text>
                          <ArrowDown className="h-5 w-5" />
                          <div className={styles.flowBox} style={{ borderColor: tokens.colorPaletteGreenBorder1 }}>
                            <Text size={200} weight="medium">Add Answer Set</Text>
                          </div>
                          <ArrowDown className="h-5 w-5" />
                          <div className={styles.flowBox} style={{ borderColor: tokens.colorPaletteGreenBorder1 }}>
                            <Text size={200} weight="medium">Define Options</Text>
                          </div>
                          <ArrowDown className="h-5 w-5" />
                          <div className={styles.flowBox} style={{ borderColor: tokens.colorPaletteGreenBorder1 }}>
                            <Text size={200} weight="medium">Set Default</Text>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: tokens.spacingVerticalS }}>
                          <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>NO</Text>
                          <ArrowDown className="h-5 w-5" />
                          <div className={styles.flowBox} style={{ borderColor: tokens.colorNeutralStroke2 }}>
                            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>No Answer Set Needed</Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.grid2}>
                    <div className={styles.featureBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>Inline Answer Sets</Text>
                      <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block", marginBottom: tokens.spacingVerticalS }}>
                        Define options directly within the question. Best for unique, question-specific choices.
                      </Text>
                      <div className={styles.codeBlock}>
                        {`Answer Set: "Priority Options"
├─ High (value: "high")
├─ Medium (value: "medium")  
└─ Low (value: "low")`}
                      </div>
                    </div>
                    <div className={styles.featureBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>Answer Set Picker</Text>
                      <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: "block", marginBottom: tokens.spacingVerticalS }}>
                        Choose from pre-defined shared answer sets for consistency across multiple questions.
                      </Text>
                      <div className={styles.codeBlock}>
                        {`Shared Sets Available:
├─ Priority Levels
├─ Department List
├─ Impact Categories
└─ Yes/No/Maybe`}
                      </div>
                    </div>
                  </div>

                  <Divider />

                  <Text weight="semibold" size={300} block>Answer Set Properties</Text>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Type</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><code>id</code></td>
                        <td>string</td>
                        <td>Unique identifier for the answer set</td>
                      </tr>
                      <tr>
                        <td><code>name</code></td>
                        <td>string</td>
                        <td>Display name for identification</td>
                      </tr>
                      <tr>
                        <td><code>isDefault</code></td>
                        <td>boolean</td>
                        <td>Whether this is the default set when no conditions match</td>
                      </tr>
                      <tr>
                        <td><code>answers</code></td>
                        <td>Answer[]</td>
                        <td>Array of answer options with label, value, and optional order</td>
                      </tr>
                      <tr>
                        <td><code>conditionGroup</code></td>
                        <td>ConditionGroup?</td>
                        <td>Optional conditions for when this set should be active</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className={styles.tipBox}>
                    <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalXS }}>
                      💡 Dynamic Answer Set Swapping
                    </Text>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                      A question can have multiple answer sets with different conditions. Based on previous answers, 
                      the appropriate answer set is automatically selected. For example, selecting "Hardware" as 
                      issue type could swap the "Equipment" dropdown to show hardware-specific options.
                    </Text>
                  </div>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* CONDITIONAL BRANCHING SECTION */}
            {/* ================================================================ */}
            <section id="conditional-branching">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <GitBranch className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Conditional Branching</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    Conditional branches allow you to show different questions based on previous answers, 
                    creating dynamic questionnaire paths tailored to each user's responses.
                  </Text>
                  
                  {/* Branching Logic Diagram */}
                  <div className={styles.erdContainer}>
                    <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalM, textAlign: "center" }}>
                      Conditional Branching Decision Flow
                    </Text>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: tokens.spacingVerticalM }}>
                      <div className={styles.flowBox} style={{ borderColor: tokens.colorBrandStroke1 }}>
                        <Text weight="medium">Q: What type of issue?</Text>
                      </div>
                      <div className={styles.erdLine} />
                      <div className={styles.decisionDiamond}>
                        <Text size={200} weight="medium">User Selects...</Text>
                      </div>
                      <div style={{ display: "flex", gap: tokens.spacingHorizontalXXL, marginTop: tokens.spacingVerticalM }}>
                        {/* Hardware Branch */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: tokens.spacingVerticalS }}>
                          <Badge appearance="filled" color="informative">Hardware</Badge>
                          <div className={styles.erdLine} />
                        <div style={{ 
                          border: `2px solid ${tokens.colorPaletteCornflowerBorderActive}`,
                          borderRadius: tokens.borderRadiusMedium,
                          padding: tokens.spacingVerticalM,
                          backgroundColor: tokens.colorPaletteCornflowerBackground2,
                        }}>
                            <Text size={200} weight="medium" block>Hardware Branch</Text>
                            <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                              • Device type?<br/>
                              • Serial number?
                            </Text>
                          </div>
                        </div>
                        {/* Software Branch */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: tokens.spacingVerticalS }}>
                          <Badge appearance="filled" color="success">Software</Badge>
                          <div className={styles.erdLine} />
                          <div style={{ 
                            border: `2px solid ${tokens.colorPaletteGreenBorder1}`,
                            borderRadius: tokens.borderRadiusMedium,
                            padding: tokens.spacingVerticalM,
                            backgroundColor: tokens.colorPaletteGreenBackground1,
                          }}>
                            <Text size={200} weight="medium" block>Software Branch</Text>
                            <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                              • Application name?<br/>
                              • Error message?
                            </Text>
                          </div>
                        </div>
                        {/* Network Branch */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: tokens.spacingVerticalS }}>
                          <Badge appearance="filled" color="warning">Network</Badge>
                          <div className={styles.erdLine} />
                          <div style={{ 
                            border: `2px solid ${tokens.colorPaletteYellowBorder1}`,
                            borderRadius: tokens.borderRadiusMedium,
                            padding: tokens.spacingVerticalM,
                            backgroundColor: tokens.colorPaletteYellowBackground1,
                          }}>
                            <Text size={200} weight="medium" block>Network Branch</Text>
                            <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>
                              • Connection type?<br/>
                              • Location?
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.grid2}>
                    <div className={styles.featureBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>Branch Conditions</Text>
                      <div className={styles.iconList}>
                        <div className={styles.iconListItem}>
                          <Target className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Reference any previous question</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Filter className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Operators: equals, not equals, contains, greater than, less than</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Braces className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Combine multiple conditions with AND/OR logic</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Layers className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Nested condition groups for complex logic</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.featureBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>Nested Branches</Text>
                      <div className={styles.iconList}>
                        <div className={styles.iconListItem}>
                          <GitBranch className="h-4 w-4" style={{ color: tokens.colorPaletteLilacForeground2 }} />
                          <span>Branches can contain child branches</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Network className="h-4 w-4" style={{ color: tokens.colorPaletteLilacForeground2 }} />
                          <span>Create multi-level decision trees</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Eye className="h-4 w-4" style={{ color: tokens.colorPaletteLilacForeground2 }} />
                          <span>Visual tree shows full hierarchy</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <EyeOff className="h-4 w-4" style={{ color: tokens.colorPaletteLilacForeground2 }} />
                          <span>Child visibility inherits from parent</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Divider />

                  <Text weight="semibold" size={300} block>Condition Operators</Text>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Operator</th>
                        <th>Description</th>
                        <th>Example</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><Badge appearance="outline">equals</Badge></td>
                        <td>Exact match (case-sensitive for text)</td>
                        <td>Issue Type equals "Hardware"</td>
                      </tr>
                      <tr>
                        <td><Badge appearance="outline">notEquals</Badge></td>
                        <td>Does not match the specified value</td>
                        <td>Priority notEquals "Low"</td>
                      </tr>
                      <tr>
                        <td><Badge appearance="outline">contains</Badge></td>
                        <td>Value includes substring</td>
                        <td>Description contains "error"</td>
                      </tr>
                      <tr>
                        <td><Badge appearance="outline">greaterThan</Badge></td>
                        <td>Numeric comparison</td>
                        <td>Impact Score greaterThan 5</td>
                      </tr>
                      <tr>
                        <td><Badge appearance="outline">lessThan</Badge></td>
                        <td>Numeric comparison</td>
                        <td>Age lessThan 18</td>
                      </tr>
                      <tr>
                        <td><Badge appearance="outline">isEmpty</Badge></td>
                        <td>Check if field is empty</td>
                        <td>Email isEmpty true</td>
                      </tr>
                      <tr>
                        <td><Badge appearance="outline">isNotEmpty</Badge></td>
                        <td>Check if field has value</td>
                        <td>Phone isNotEmpty true</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* DYNAMIC VALUES SECTION */}
            {/* ================================================================ */}
            <section id="dynamic-values">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <Database className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Dynamic Values</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    Dynamic values allow answer sets to be populated from external data sources like Dataverse tables, 
                    enabling real-time data integration in your questionnaires.
                  </Text>
                  
                  {/* Dynamic Values Flow Diagram */}
                  <div className={styles.erdContainer}>
                    <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalM, textAlign: "center" }}>
                      Dynamic Values Data Flow
                    </Text>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: tokens.spacingHorizontalL, flexWrap: "wrap" }}>
                      <div style={{ 
                        border: `2px solid ${tokens.colorPaletteCornflowerBorderActive}`,
                        borderRadius: tokens.borderRadiusMedium,
                        padding: tokens.spacingVerticalM,
                        textAlign: "center",
                      }}>
                        <Database className="h-8 w-8" style={{ color: tokens.colorPaletteCornflowerForeground2, marginBottom: tokens.spacingVerticalXS }} />
                        <Text size={200} weight="medium" block>Dataverse Table</Text>
                        <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>accounts, contacts, etc.</Text>
                      </div>
                      <ArrowRight className="h-6 w-6" style={{ color: tokens.colorNeutralForeground3 }} />
                      <div style={{ 
                        border: `2px solid ${tokens.colorPaletteGreenBorder1}`,
                        borderRadius: tokens.borderRadiusMedium,
                        padding: tokens.spacingVerticalM,
                        textAlign: "center",
                      }}>
                        <Filter className="h-8 w-8" style={{ color: tokens.colorPaletteGreenForeground1, marginBottom: tokens.spacingVerticalXS }} />
                        <Text size={200} weight="medium" block>Filter & Sort</Text>
                        <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>FetchXML / OData</Text>
                      </div>
                      <ArrowRight className="h-6 w-6" style={{ color: tokens.colorNeutralForeground3 }} />
                      <div style={{ 
                        border: `2px solid ${tokens.colorPaletteMarigoldBorder1}`,
                        borderRadius: tokens.borderRadiusMedium,
                        padding: tokens.spacingVerticalM,
                        textAlign: "center",
                      }}>
                        <ListChecks className="h-8 w-8" style={{ color: tokens.colorPaletteMarigoldForeground1, marginBottom: tokens.spacingVerticalXS }} />
                        <Text size={200} weight="medium" block>Answer Set</Text>
                        <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>Populated dynamically</Text>
                      </div>
                      <ArrowRight className="h-6 w-6" style={{ color: tokens.colorNeutralForeground3 }} />
                      <div style={{ 
                        border: `2px solid ${tokens.colorBrandStroke1}`,
                        borderRadius: tokens.borderRadiusMedium,
                        padding: tokens.spacingVerticalM,
                        textAlign: "center",
                      }}>
                        <HelpCircle className="h-8 w-8" style={{ color: tokens.colorBrandForeground1, marginBottom: tokens.spacingVerticalXS }} />
                        <Text size={200} weight="medium" block>Question</Text>
                        <Text size={100} style={{ color: tokens.colorNeutralForeground3 }}>User sees options</Text>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.grid2}>
                    <div className={styles.featureBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>Configuration</Text>
                      <div className={styles.iconList}>
                        <div className={styles.iconListItem}>
                          <Table className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Select source entity (e.g., accounts)</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Columns className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Choose display field (label)</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Key className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Choose value field (usually ID)</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Filter className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Optional: Add filter conditions</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <ArrowUpDown className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Optional: Set sort order</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.featureBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>Supported Data Sources</Text>
                      <div className={styles.iconList}>
                        <div className={styles.iconListItem}>
                          <Building className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} />
                          <span>Accounts (companies, organizations)</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Users className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} />
                          <span>Contacts (people, employees)</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Briefcase className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} />
                          <span>Custom entities (any Dataverse table)</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <MapPin className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} />
                          <span>Locations, departments, teams</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.tipBox}>
                    <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalXS }}>
                      💡 Query Generation
                    </Text>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                      The builder can generate both FetchXML and OData queries based on your configuration. 
                      These queries are executed at runtime to fetch current data from the source system.
                    </Text>
                  </div>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* RULES & LOGIC SECTION */}
            {/* ================================================================ */}
            <section id="rules">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <Filter className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Rules & Logic</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    Rules control when questions appear, what options are available, and what actions are triggered. 
                    The system supports three types of rules:
                  </Text>
                  
                  <div className={styles.grid3}>
                    <div className={styles.featureBox}>
                      <div className={styles.treeItem} style={{ marginBottom: tokens.spacingVerticalS }}>
                        <Eye className="h-5 w-5" style={{ color: tokens.colorPaletteCornflowerForeground2 }} />
                        <Text weight="semibold">Visibility Rules</Text>
                      </div>
                      <Text size={200} block style={{ color: tokens.colorNeutralForeground3, marginBottom: tokens.spacingVerticalS }}>
                        Control when a question is shown based on conditions. Applied at the question level.
                      </Text>
                      <Badge appearance="outline">conditionGroup on Question</Badge>
                    </div>
                    <div className={styles.featureBox}>
                      <div className={styles.treeItem} style={{ marginBottom: tokens.spacingVerticalS }}>
                        <ListChecks className="h-5 w-5" style={{ color: tokens.colorPaletteGreenForeground1 }} />
                        <Text weight="semibold">Answer Set Rules</Text>
                      </div>
                      <Text size={200} block style={{ color: tokens.colorNeutralForeground3, marginBottom: tokens.spacingVerticalS }}>
                        Control which answer set is active. Multiple sets can have different conditions.
                      </Text>
                      <Badge appearance="outline">conditionGroup on AnswerSet</Badge>
                    </div>
                    <div className={styles.featureBox}>
                      <div className={styles.treeItem} style={{ marginBottom: tokens.spacingVerticalS }}>
                        <Zap className="h-5 w-5" style={{ color: tokens.colorPaletteMarigoldForeground1 }} />
                        <Text weight="semibold">Answer-Level Rules</Text>
                      </div>
                      <Text size={200} block style={{ color: tokens.colorNeutralForeground3, marginBottom: tokens.spacingVerticalS }}>
                        Trigger actions when specific answers are selected. Enable granular response handling.
                      </Text>
                      <Badge appearance="outline">answerLevelRuleGroups on Question</Badge>
                    </div>
                  </div>

                  <Divider />

                  <Text weight="semibold" size={300} block>Rule Group Structure</Text>
                  <div className={styles.codeBlock}>
{`ConditionGroup {
  operator: "AND" | "OR"
  conditions: [
    {
      questionId: "q_issue_type"
      operator: "equals"
      value: "Hardware"
    },
    {
      questionId: "q_priority"  
      operator: "greaterThan"
      value: "3"
    }
  ]
  groups: [
    // Nested condition groups for complex logic
    {
      operator: "OR"
      conditions: [...]
    }
  ]
}`}
                  </div>

                  <div className={styles.grid2}>
                    <div className={styles.successBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalXS }}>
                        ✅ AND Logic
                      </Text>
                      <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                        ALL conditions must be true for the rule to match. Use for strict requirements.
                      </Text>
                    </div>
                    <div className={styles.tipBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalXS }}>
                        ⚡ OR Logic
                      </Text>
                      <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                        ANY condition can be true for the rule to match. Use for flexible alternatives.
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* ACTION RECORDS SECTION */}
            {/* ================================================================ */}
            <section id="action-records">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <Zap className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Action Records</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    Action records define automated ITSM tickets or tasks that should be created based on 
                    questionnaire responses. They enable workflow automation from survey answers.
                  </Text>
                  
                  <div className={styles.grid2}>
                    <div className={styles.featureBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>Record Types</Text>
                      <div className={styles.iconList}>
                        <div className={styles.iconListItem}>
                          <AlertCircle className="h-4 w-4" style={{ color: tokens.colorPaletteRedForeground1 }} />
                          <span>Incident - Report issues or outages</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Briefcase className="h-4 w-4" style={{ color: tokens.colorPaletteCornflowerForeground2 }} />
                          <span>Service Request - Request services</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <RefreshCw className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} />
                          <span>Change Request - Request changes</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Search className="h-4 w-4" style={{ color: tokens.colorPaletteMarigoldForeground1 }} />
                          <span>Problem - Root cause analysis</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <ClipboardList className="h-4 w-4" style={{ color: tokens.colorPaletteLilacForeground2 }} />
                          <span>Task - General work items</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.featureBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>Configuration Fields</Text>
                      <div className={styles.iconList}>
                        <div className={styles.iconListItem}>
                          <Tag className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Title - Summary of the action</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <AlignLeft className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Description - Detailed information</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Flag className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Priority - Urgency level (1-5)</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Target className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Impact - Business impact level</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Folder className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Category - Operation category</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={styles.tipBox}>
                    <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalXS }}>
                      💡 Answer-Level Action Records
                    </Text>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                      Action records can be attached to specific answer options. When a user selects that answer, 
                      the corresponding action record is triggered. This enables fine-grained automation based on 
                      individual responses. Look for the ⚡ icon in the tree view to identify questions with action records.
                    </Text>
                  </div>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* ENTITY RELATIONSHIP DIAGRAM SECTION */}
            {/* ================================================================ */}
            <section id="erd">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <Network className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Entity Relationship Diagram</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    Complete data model showing all entities and their relationships in the questionnaire system:
                  </Text>
                  
                  {/* Full ERD Diagram */}
                  <div className={styles.erdContainer}>
                    <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalL, textAlign: "center" }}>
                      Complete Entity-Relationship Diagram
                    </Text>
                    
                    {/* Level 1: Questionnaire */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: tokens.spacingVerticalS }}>
                      <div className={styles.erdEntity} style={{ borderColor: tokens.colorBrandStroke1, minWidth: "280px" }}>
                        <Text weight="bold" block style={{ textAlign: "center", color: tokens.colorBrandForeground1, marginBottom: tokens.spacingVerticalS }}>
                          📋 Questionnaire
                        </Text>
                        <div className={styles.erdRow}><span>id</span><span style={{ color: tokens.colorBrandForeground1 }}>string (UUID)</span></div>
                        <div className={styles.erdRow}><span>name</span><span style={{ color: tokens.colorBrandForeground1 }}>string *</span></div>
                        <div className={styles.erdRow}><span>description</span><span style={{ color: tokens.colorBrandForeground1 }}>string</span></div>
                        <div className={styles.erdRow}><span>version</span><span style={{ color: tokens.colorBrandForeground1 }}>string</span></div>
                        <div className={styles.erdRow}><span>status</span><span style={{ color: tokens.colorBrandForeground1 }}>enum</span></div>
                        <div className={styles.erdRow}><span>serviceCatalog</span><span style={{ color: tokens.colorBrandForeground1 }}>string</span></div>
                        <div className={styles.erdRow}><span>pages[]</span><span style={{ color: tokens.colorPaletteCornflowerForeground2 }}>Page[]</span></div>
                      </div>
                      
                      <div className={styles.erdConnector}>
                        <div className={styles.erdLine} />
                        <Badge appearance="outline" size="small">1 : N</Badge>
                        <div className={styles.erdLine} />
                      </div>
                      
                      {/* Level 2: Page */}
                      <div className={styles.erdEntity} style={{ borderColor: tokens.colorPaletteCornflowerBorderActive, minWidth: "250px" }}>
                        <Text weight="bold" block style={{ textAlign: "center", color: tokens.colorPaletteCornflowerForeground2, marginBottom: tokens.spacingVerticalS }}>
                          📄 Page
                        </Text>
                        <div className={styles.erdRow}><span>id</span><span style={{ color: tokens.colorPaletteCornflowerForeground2 }}>string</span></div>
                        <div className={styles.erdRow}><span>name</span><span style={{ color: tokens.colorPaletteCornflowerForeground2 }}>string *</span></div>
                        <div className={styles.erdRow}><span>description</span><span style={{ color: tokens.colorPaletteCornflowerForeground2 }}>string</span></div>
                        <div className={styles.erdRow}><span>order</span><span style={{ color: tokens.colorPaletteCornflowerForeground2 }}>number</span></div>
                        <div className={styles.erdRow}><span>sections[]</span><span style={{ color: tokens.colorPaletteGreenForeground1 }}>Section[]</span></div>
                      </div>
                      
                      <div className={styles.erdConnector}>
                        <div className={styles.erdLine} />
                        <Badge appearance="outline" size="small">1 : N</Badge>
                        <div className={styles.erdLine} />
                      </div>
                      
                      {/* Level 3: Section */}
                      <div className={styles.erdEntity} style={{ borderColor: tokens.colorPaletteGreenBorder1, minWidth: "280px" }}>
                        <Text weight="bold" block style={{ textAlign: "center", color: tokens.colorPaletteGreenForeground1, marginBottom: tokens.spacingVerticalS }}>
                          📁 Section
                        </Text>
                        <div className={styles.erdRow}><span>id</span><span style={{ color: tokens.colorPaletteGreenForeground1 }}>string</span></div>
                        <div className={styles.erdRow}><span>name</span><span style={{ color: tokens.colorPaletteGreenForeground1 }}>string *</span></div>
                        <div className={styles.erdRow}><span>description</span><span style={{ color: tokens.colorPaletteGreenForeground1 }}>string</span></div>
                        <div className={styles.erdRow}><span>order</span><span style={{ color: tokens.colorPaletteGreenForeground1 }}>number</span></div>
                        <div className={styles.erdRow}><span>questions[]</span><span style={{ color: tokens.colorPaletteMarigoldForeground1 }}>Question[]</span></div>
                        <div className={styles.erdRow}><span>branches[]</span><span style={{ color: tokens.colorPaletteLilacForeground2 }}>Branch[]</span></div>
                      </div>
                      
                      <div className={styles.erdConnector}>
                        <div className={styles.erdLine} />
                        <Badge appearance="outline" size="small">1 : N</Badge>
                        <div className={styles.erdLine} />
                      </div>
                      
                      {/* Level 4: Question and Branch side by side */}
                      <div style={{ display: "flex", gap: tokens.spacingHorizontalXL, flexWrap: "wrap", justifyContent: "center" }}>
                        {/* Question Entity */}
                        <div className={styles.erdEntity} style={{ borderColor: tokens.colorPaletteMarigoldBorder1, minWidth: "300px" }}>
                          <Text weight="bold" block style={{ textAlign: "center", color: tokens.colorPaletteMarigoldForeground1, marginBottom: tokens.spacingVerticalS }}>
                            ❓ Question
                          </Text>
                          <div className={styles.erdRow}><span>id</span><span style={{ color: tokens.colorPaletteMarigoldForeground1 }}>string</span></div>
                          <div className={styles.erdRow}><span>text</span><span style={{ color: tokens.colorPaletteMarigoldForeground1 }}>string *</span></div>
                          <div className={styles.erdRow}><span>type</span><span style={{ color: tokens.colorPaletteMarigoldForeground1 }}>QuestionType</span></div>
                          <div className={styles.erdRow}><span>required</span><span style={{ color: tokens.colorPaletteMarigoldForeground1 }}>boolean</span></div>
                          <div className={styles.erdRow}><span>order</span><span style={{ color: tokens.colorPaletteMarigoldForeground1 }}>number</span></div>
                          <div className={styles.erdRow}><span>readOnly</span><span style={{ color: tokens.colorPaletteMarigoldForeground1 }}>boolean</span></div>
                          <div className={styles.erdRow}><span>hidden</span><span style={{ color: tokens.colorPaletteMarigoldForeground1 }}>boolean</span></div>
                          <div className={styles.erdRow}><span>helpText</span><span style={{ color: tokens.colorPaletteMarigoldForeground1 }}>string</span></div>
                          <div className={styles.erdRow}><span>placeholder</span><span style={{ color: tokens.colorPaletteMarigoldForeground1 }}>string</span></div>
                          <div className={styles.erdRow}><span>answerSets[]</span><span style={{ color: tokens.colorPaletteTealForeground2 }}>AnswerSet[]</span></div>
                          <div className={styles.erdRow}><span>conditionGroup</span><span style={{ color: tokens.colorPaletteRedForeground1 }}>ConditionGroup</span></div>
                          <div className={styles.erdRow}><span>answerLevelRuleGroups[]</span><span style={{ color: tokens.colorPaletteRedForeground1 }}>RuleGroup[]</span></div>
                        </div>
                        
                        {/* ConditionalBranch Entity */}
                        <div className={styles.erdEntity} style={{ borderColor: tokens.colorPaletteLilacBorderActive, minWidth: "280px" }}>
                          <Text weight="bold" block style={{ textAlign: "center", color: tokens.colorPaletteLilacForeground2, marginBottom: tokens.spacingVerticalS }}>
                            🔀 ConditionalBranch
                          </Text>
                          <div className={styles.erdRow}><span>id</span><span style={{ color: tokens.colorPaletteLilacForeground2 }}>string</span></div>
                          <div className={styles.erdRow}><span>name</span><span style={{ color: tokens.colorPaletteLilacForeground2 }}>string *</span></div>
                          <div className={styles.erdRow}><span>conditionGroup</span><span style={{ color: tokens.colorPaletteRedForeground1 }}>ConditionGroup *</span></div>
                          <div className={styles.erdRow}><span>questions[]</span><span style={{ color: tokens.colorPaletteMarigoldForeground1 }}>Question[]</span></div>
                          <div className={styles.erdRow}><span>childBranches[]</span><span style={{ color: tokens.colorPaletteLilacForeground2 }}>Branch[] (self)</span></div>
                        </div>
                      </div>
                      
                      <Divider style={{ width: "100%", marginBlock: tokens.spacingVerticalL }} />
                      
                      {/* Supporting Entities */}
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalM }}>Supporting Entities</Text>
                      <div style={{ display: "flex", gap: tokens.spacingHorizontalL, flexWrap: "wrap", justifyContent: "center" }}>
                        {/* AnswerSet */}
                        <div className={styles.erdEntity} style={{ borderColor: tokens.colorPaletteTealBorderActive, minWidth: "220px" }}>
                          <Text weight="bold" block style={{ textAlign: "center", color: tokens.colorPaletteTealForeground2, marginBottom: tokens.spacingVerticalS }}>
                            📋 AnswerSet
                          </Text>
                          <div className={styles.erdRow}><span>id</span><span style={{ color: tokens.colorPaletteTealForeground2 }}>string</span></div>
                          <div className={styles.erdRow}><span>name</span><span style={{ color: tokens.colorPaletteTealForeground2 }}>string</span></div>
                          <div className={styles.erdRow}><span>isDefault</span><span style={{ color: tokens.colorPaletteTealForeground2 }}>boolean</span></div>
                          <div className={styles.erdRow}><span>answers[]</span><span style={{ color: tokens.colorPaletteTealForeground2 }}>Answer[]</span></div>
                          <div className={styles.erdRow}><span>conditionGroup</span><span style={{ color: tokens.colorPaletteRedForeground1 }}>ConditionGroup</span></div>
                        </div>
                        
                        {/* Answer */}
                        <div className={styles.erdEntity} style={{ borderColor: tokens.colorNeutralStroke1, minWidth: "200px" }}>
                          <Text weight="bold" block style={{ textAlign: "center", marginBottom: tokens.spacingVerticalS }}>
                            ✓ Answer
                          </Text>
                          <div className={styles.erdRow}><span>id</span><span>string</span></div>
                          <div className={styles.erdRow}><span>label</span><span>string *</span></div>
                          <div className={styles.erdRow}><span>value</span><span>string *</span></div>
                          <div className={styles.erdRow}><span>order</span><span>number</span></div>
                        </div>
                        
                        {/* ConditionGroup */}
                        <div className={styles.erdEntity} style={{ borderColor: tokens.colorPaletteRedBorder1, minWidth: "220px" }}>
                          <Text weight="bold" block style={{ textAlign: "center", color: tokens.colorPaletteRedForeground1, marginBottom: tokens.spacingVerticalS }}>
                            🔗 ConditionGroup
                          </Text>
                          <div className={styles.erdRow}><span>operator</span><span style={{ color: tokens.colorPaletteRedForeground1 }}>AND | OR</span></div>
                          <div className={styles.erdRow}><span>conditions[]</span><span style={{ color: tokens.colorPaletteRedForeground1 }}>Condition[]</span></div>
                          <div className={styles.erdRow}><span>groups[]</span><span style={{ color: tokens.colorPaletteRedForeground1 }}>ConditionGroup[]</span></div>
                        </div>
                        
                        {/* ActionRecord */}
                        <div className={styles.erdEntity} style={{ borderColor: tokens.colorPaletteYellowBorder2, minWidth: "200px" }}>
                          <Text weight="bold" block style={{ textAlign: "center", color: tokens.colorPaletteYellowForeground2, marginBottom: tokens.spacingVerticalS }}>
                            ⚡ ActionRecord
                          </Text>
                          <div className={styles.erdRow}><span>id</span><span style={{ color: tokens.colorPaletteYellowForeground2 }}>string</span></div>
                          <div className={styles.erdRow}><span>type</span><span style={{ color: tokens.colorPaletteYellowForeground2 }}>RecordType</span></div>
                          <div className={styles.erdRow}><span>title</span><span style={{ color: tokens.colorPaletteYellowForeground2 }}>string</span></div>
                          <div className={styles.erdRow}><span>priority</span><span style={{ color: tokens.colorPaletteYellowForeground2 }}>number</span></div>
                          <div className={styles.erdRow}><span>impact</span><span style={{ color: tokens.colorPaletteYellowForeground2 }}>string</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* DATA FLOW SECTION */}
            {/* ================================================================ */}
            <section id="data-flow">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <Workflow className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Data Flow</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    How data flows through the questionnaire system from creation to execution:
                  </Text>
                  
                  <div className={styles.workflowContainer}>
                    {[
                      { 
                        icon: <Pencil className="h-5 w-5" />, 
                        title: "1. Design Phase", 
                        desc: "Author creates questionnaire structure in the builder. Define pages, sections, questions, and branches.",
                        color: tokens.colorBrandBackground 
                      },
                      { 
                        icon: <Save className="h-5 w-5" />, 
                        title: "2. Save/Export", 
                        desc: "Questionnaire is saved as JSON (localStorage for drafts, or exported as file). Schema validated on save.",
                        color: tokens.colorPaletteGreenBackground1 
                      },
                      { 
                        icon: <Upload className="h-5 w-5" />, 
                        title: "3. Load/Import", 
                        desc: "Questionnaire is loaded into the executor. Can be from preview, file upload, or session storage.",
                        color: tokens.colorPaletteCornflowerForeground2 
                      },
                      { 
                        icon: <Play className="h-5 w-5" />, 
                        title: "4. Execute", 
                        desc: "User navigates pages, answers questions. Conditional logic evaluated in real-time. Dynamic values fetched.",
                        color: tokens.colorPaletteMarigoldForeground1 
                      },
                      { 
                        icon: <CheckCircle className="h-5 w-5" />, 
                        title: "5. Submit", 
                        desc: "Responses validated against required fields. Action records triggered. Response exported as JSON/CSV.",
                        color: tokens.colorPaletteGreenForeground1 
                      },
                    ].map((step, index) => (
                      <div key={index} className={styles.workflowStep}>
                        <div className={styles.workflowIcon} style={{ backgroundColor: step.color, color: "white" }}>
                          {step.icon}
                        </div>
                        <div>
                          <Text weight="semibold" block>{step.title}</Text>
                          <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>{step.desc}</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* QUESTION PROPERTIES SECTION */}
            {/* ================================================================ */}
            <section id="question-properties">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <Settings className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Question Properties</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    Each question has configurable properties that control its behavior and appearance:
                  </Text>
                  
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Default</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><Text weight="semibold">text</Text></td>
                        <td>string</td>
                        <td>The question text shown to users (required)</td>
                        <td>-</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">type</Text></td>
                        <td>QuestionType</td>
                        <td>The input type (Text, Choice, Date, etc.)</td>
                        <td>Text</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">required</Text></td>
                        <td>boolean</td>
                        <td>Whether the question must be answered</td>
                        <td>false</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">readOnly</Text></td>
                        <td>boolean</td>
                        <td>Display value without allowing edits</td>
                        <td>false</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">hidden</Text></td>
                        <td>boolean</td>
                        <td>Hide from view (still collected)</td>
                        <td>false</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">order</Text></td>
                        <td>number</td>
                        <td>Display sequence within section</td>
                        <td>auto</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">helpText</Text></td>
                        <td>string</td>
                        <td>Additional guidance shown below question</td>
                        <td>-</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">placeholder</Text></td>
                        <td>string</td>
                        <td>Placeholder text for empty inputs</td>
                        <td>-</td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className={styles.grid2}>
                    <div className={styles.featureBox}>
                      <div className={styles.treeItem} style={{ marginBottom: tokens.spacingVerticalS }}>
                        <CheckCircle className="h-4 w-4" style={{ color: tokens.colorPaletteRedForeground1 }} />
                        <Text weight="semibold">Required</Text>
                      </div>
                      <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                        Mark questions that must be answered before submission. Shows red asterisk (*) indicator.
                      </Text>
                    </div>
                    <div className={styles.featureBox}>
                      <div className={styles.treeItem} style={{ marginBottom: tokens.spacingVerticalS }}>
                        <Lock className="h-4 w-4" style={{ color: tokens.colorNeutralForeground3 }} />
                        <Text weight="semibold">Read Only</Text>
                      </div>
                      <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                        Display information without allowing changes. Useful for showing computed or pre-filled values.
                      </Text>
                    </div>
                    <div className={styles.featureBox}>
                      <div className={styles.treeItem} style={{ marginBottom: tokens.spacingVerticalS }}>
                        <EyeOff className="h-4 w-4" style={{ color: tokens.colorNeutralForeground3 }} />
                        <Text weight="semibold">Hidden</Text>
                      </div>
                      <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                        Hide from view while retaining for data collection. Useful for tracking or computed fields.
                      </Text>
                    </div>
                    <div className={styles.featureBox}>
                      <div className={styles.treeItem} style={{ marginBottom: tokens.spacingVerticalS }}>
                        <ArrowUpDown className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                        <Text weight="semibold">Order</Text>
                      </div>
                      <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                        Control the display sequence within a section. Lower numbers appear first.
                      </Text>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* FEATURE COMPARISON SECTION */}
            {/* ================================================================ */}
            <section id="feature-comparison">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <Table className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Feature Comparison</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    Understanding the differences between similar features:
                  </Text>
                  
                  <Text weight="semibold" size={300} block style={{ marginTop: tokens.spacingVerticalM }}>
                    Visibility Control Methods
                  </Text>
                  <table className={styles.comparisonTable}>
                    <thead>
                      <tr>
                        <th>Feature</th>
                        <th>Question Visibility</th>
                        <th>Branch Visibility</th>
                        <th>Hidden Property</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Applied To</td>
                        <td>Single question</td>
                        <td>Container + contents</td>
                        <td>Single question</td>
                      </tr>
                      <tr>
                        <td>Condition-Based</td>
                        <td><Check className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} /></td>
                        <td><Check className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} /></td>
                        <td><X className="h-4 w-4" style={{ color: tokens.colorPaletteRedForeground1 }} /></td>
                      </tr>
                      <tr>
                        <td>Data Collected</td>
                        <td>Only when visible</td>
                        <td>Only when visible</td>
                        <td>Always collected</td>
                      </tr>
                      <tr>
                        <td>Use Case</td>
                        <td>Dynamic show/hide</td>
                        <td>Conditional paths</td>
                        <td>Hidden fields</td>
                      </tr>
                    </tbody>
                  </table>

                  <Divider />

                  <Text weight="semibold" size={300} block>
                    Logic Types Comparison
                  </Text>
                  <table className={styles.comparisonTable}>
                    <thead>
                      <tr>
                        <th>Feature</th>
                        <th>Visibility Rules</th>
                        <th>Answer Set Rules</th>
                        <th>Answer-Level Rules</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Purpose</td>
                        <td>Show/hide question</td>
                        <td>Swap answer options</td>
                        <td>Trigger actions</td>
                      </tr>
                      <tr>
                        <td>Trigger</td>
                        <td>Previous answers</td>
                        <td>Previous answers</td>
                        <td>This answer</td>
                      </tr>
                      <tr>
                        <td>Scope</td>
                        <td>Question-level</td>
                        <td>AnswerSet-level</td>
                        <td>Answer-level</td>
                      </tr>
                      <tr>
                        <td>Complexity</td>
                        <td>Medium</td>
                        <td>Medium</td>
                        <td>High</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* VALIDATION SECTION */}
            {/* ================================================================ */}
            <section id="validation">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <CheckCircle className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Validation & Required Fields</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    The builder validates your questionnaire to ensure completeness and correctness:
                  </Text>
                  
                  <div className={styles.grid2}>
                    <div className={styles.successBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>
                        ✅ Builder Validation
                      </Text>
                      <div className={styles.iconList}>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>• Questionnaire name is always required</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>• Question text is required for all questions</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>• Choice questions need at least one answer</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>• Branch conditions must be configured</Text>
                      </div>
                    </div>
                    <div className={styles.tipBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>
                        📝 Executor Validation
                      </Text>
                      <div className={styles.iconList}>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>• Required fields checked on page navigation</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>• Required fields checked on submit</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>• Error messages list missing fields</Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>• Only visible questions are validated</Text>
                      </div>
                    </div>
                  </div>

                  <div className={styles.warningBox}>
                    <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalXS }}>
                      ⚠️ Required Field Indicators
                    </Text>
                    <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                      Required fields are marked with a red asterisk (*) next to the label. 
                      In the tree view, required questions show a "Required" badge. 
                      Empty required fields show validation errors when trying to navigate or submit.
                    </Text>
                  </div>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* TEMPLATES & DRAFTS SECTION */}
            {/* ================================================================ */}
            <section id="templates">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <FileText className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Templates & Drafts</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    Save your work and reuse common questionnaire patterns:
                  </Text>
                  
                  <div className={styles.grid2}>
                    <div className={styles.featureBox}>
                      <div className={styles.treeItem} style={{ marginBottom: tokens.spacingVerticalS }}>
                        <Save className="h-5 w-5" style={{ color: tokens.colorBrandForeground1 }} />
                        <Text weight="semibold">Drafts</Text>
                      </div>
                      <div className={styles.iconList}>
                        <div className={styles.iconListItem}>
                          <Database className="h-4 w-4" />
                          <span>Saved to browser localStorage</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Clock className="h-4 w-4" />
                          <span>Resume editing anytime</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Edit className="h-4 w-4" />
                          <span>Update existing drafts</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Download className="h-4 w-4" />
                          <span>Export as JSON for backup</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Trash className="h-4 w-4" />
                          <span>Delete when no longer needed</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.featureBox}>
                      <div className={styles.treeItem} style={{ marginBottom: tokens.spacingVerticalS }}>
                        <Copy className="h-5 w-5" style={{ color: tokens.colorBrandForeground1 }} />
                        <Text weight="semibold">Templates</Text>
                      </div>
                      <div className={styles.iconList}>
                        <div className={styles.iconListItem}>
                          <Package className="h-4 w-4" />
                          <span>Pre-built starting points</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Briefcase className="h-4 w-4" />
                          <span>ITSM-focused templates included</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Copy className="h-4 w-4" />
                          <span>Clone and customize</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Upload className="h-4 w-4" />
                          <span>Import from JSON file</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Share2 className="h-4 w-4" />
                          <span>Share with team members</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* PREVIEW & TESTING SECTION */}
            {/* ================================================================ */}
            <section id="preview">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <Eye className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Preview & Testing</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    Test your questionnaire in preview mode to see exactly how end users will experience it:
                  </Text>
                  
                  {/* Preview Workflow Diagram */}
                  <div className={styles.flowDiagram}>
                    <div className={styles.flowRow}>
                      <div className={styles.flowBox} style={{ borderColor: tokens.colorBrandStroke1 }}>
                        <Text size={200} weight="medium">Click "Preview"</Text>
                      </div>
                      <ArrowRight className="h-5 w-5" />
                      <div className={styles.flowBox} style={{ borderColor: tokens.colorPaletteGreenBorder1 }}>
                        <Text size={200} weight="medium">Opens /execute</Text>
                      </div>
                      <ArrowRight className="h-5 w-5" />
                      <div className={styles.flowBox} style={{ borderColor: tokens.colorPaletteCornflowerBorderActive }}>
                        <Text size={200} weight="medium">Test Questionnaire</Text>
                      </div>
                      <ArrowRight className="h-5 w-5" />
                      <div className={styles.flowBox} style={{ borderColor: tokens.colorPaletteMarigoldBorder1 }}>
                        <Text size={200} weight="medium">Verify Responses</Text>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.grid2}>
                    <div className={styles.featureBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>What to Test</Text>
                      <div className={styles.iconList}>
                        <div className={styles.iconListItem}>
                          <Eye className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Question display and formatting</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <GitBranch className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Conditional branch logic</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <CheckCircle className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Required field validation</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <ListChecks className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Answer set options display</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <ArrowRight className="h-4 w-4" style={{ color: tokens.colorBrandForeground1 }} />
                          <span>Page navigation flow</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.featureBox}>
                      <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>Preview Features</Text>
                      <div className={styles.iconList}>
                        <div className={styles.iconListItem}>
                          <Monitor className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} />
                          <span>Full executor experience</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <BarChart3 className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} />
                          <span>Progress indicator</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Send className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} />
                          <span>Submit simulation</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <Download className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} />
                          <span>Export responses (JSON/CSV)</span>
                        </div>
                        <div className={styles.iconListItem}>
                          <RotateCcw className="h-4 w-4" style={{ color: tokens.colorPaletteGreenForeground1 }} />
                          <span>Start over option</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* TROUBLESHOOTING SECTION */}
            {/* ================================================================ */}
            <section id="troubleshooting">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <AlertTriangle className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Troubleshooting</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    Common issues and their solutions:
                  </Text>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: tokens.spacingVerticalM }}>
                    {[
                      {
                        issue: "Branch conditions not working?",
                        causes: [
                          "Referenced question appears after the branch",
                          "Condition value doesn't match exactly (case-sensitive)",
                          "Wrong operator selected",
                          "Condition references a hidden question"
                        ],
                        solution: "Ensure the source question comes before the branch. Check exact value match including case."
                      },
                      {
                        issue: "Questions not appearing?",
                        causes: [
                          "Question is inside a branch with unmet conditions",
                          "Question is marked as hidden",
                          "Question visibility conditions not met",
                          "Parent branch is hidden"
                        ],
                        solution: "Check the tree view to see if question is inside a branch. Verify visibility rules."
                      },
                      {
                        issue: "Answer set not showing options?",
                        causes: [
                          "No answers defined in the set",
                          "Question type doesn't support answer sets",
                          "Answer set conditions not met",
                          "Dynamic data source not configured"
                        ],
                        solution: "Verify answer set has options. Check if question type is Choice/Dropdown/etc."
                      },
                      {
                        issue: "Draft not saving?",
                        causes: [
                          "Questionnaire name is empty",
                          "Browser localStorage is full",
                          "Browser blocks localStorage",
                          "Private/incognito mode"
                        ],
                        solution: "Ensure questionnaire has a name. Try exporting as JSON as backup."
                      },
                      {
                        issue: "Preview not loading?",
                        causes: [
                          "Questionnaire has validation errors",
                          "Session storage issue",
                          "Browser pop-up blocker"
                        ],
                        solution: "Fix any validation errors. Try exporting and loading via file upload."
                      }
                    ].map((item, index) => (
                      <div key={index} className={styles.errorBox}>
                        <Text weight="semibold" block style={{ marginBottom: tokens.spacingVerticalS }}>
                          ❌ {item.issue}
                        </Text>
                        <Text size={200} weight="medium" block style={{ marginBottom: tokens.spacingVerticalXS }}>
                          Possible causes:
                        </Text>
                        <div className={styles.iconList} style={{ marginBottom: tokens.spacingVerticalS }}>
                          {item.causes.map((cause, i) => (
                            <Text key={i} size={200} style={{ color: tokens.colorNeutralForeground2 }}>• {cause}</Text>
                          ))}
                        </div>
                        <div className={styles.successBox} style={{ marginTop: tokens.spacingVerticalS }}>
                          <Text size={200}><strong>Solution:</strong> {item.solution}</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </section>

            {/* ================================================================ */}
            {/* GLOSSARY SECTION */}
            {/* ================================================================ */}
            <section id="glossary">
              <Card className={styles.card}>
                <div className={styles.cardHeaderRow}>
                  <div className={styles.iconBox}>
                    <FileCode className="h-6 w-6" style={{ color: tokens.colorBrandForeground1 }} />
                  </div>
                  <Text weight="semibold" size={500}>Glossary</Text>
                </div>
                <div className={styles.cardContent}>
                  <Text style={{ color: tokens.colorNeutralForeground2 }}>
                    Key terms and definitions used throughout the Questionnaire Builder:
                  </Text>
                  
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th style={{ width: "200px" }}>Term</th>
                        <th>Definition</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><Text weight="semibold">Questionnaire</Text></td>
                        <td>The top-level container that holds all pages, sections, questions, and configuration.</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">Page</Text></td>
                        <td>A step in a multi-page form. Users navigate between pages with Previous/Next buttons.</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">Section</Text></td>
                        <td>A collapsible group of related questions within a page. Used for organization.</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">Question</Text></td>
                        <td>An individual input field that collects a user response. Has a type, text, and optional answer set.</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">Conditional Branch</Text></td>
                        <td>A container that shows/hides its contents based on rule conditions. Can be nested.</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">Answer Set</Text></td>
                        <td>A collection of answer options for choice-based questions. Each question can have multiple sets.</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">Answer</Text></td>
                        <td>A single option within an answer set. Has a display label and a stored value.</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">Condition</Text></td>
                        <td>A single rule comparing a question's answer to a value using an operator.</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">Condition Group</Text></td>
                        <td>A set of conditions combined with AND/OR logic. Can contain nested groups.</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">Rule Group</Text></td>
                        <td>A named set of conditions used for answer-level logic or visibility rules.</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">Action Record</Text></td>
                        <td>An ITSM ticket (incident, request, change) to be created based on questionnaire answers.</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">Dynamic Value</Text></td>
                        <td>An answer set populated at runtime from an external data source like Dataverse.</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">Executor</Text></td>
                        <td>The runtime environment where users answer the questionnaire (preview or production).</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">Draft</Text></td>
                        <td>A saved questionnaire stored in browser localStorage for later editing.</td>
                      </tr>
                      <tr>
                        <td><Text weight="semibold">Template</Text></td>
                        <td>A reusable questionnaire pattern that can be cloned as a starting point.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
