export interface ITSMRecord {
  id: string;
  name: string;
  description: string;
  category: 'Incident' | 'Service Request' | 'Change' | 'Problem';
  status: 'Draft' | 'Active' | 'Archived';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  createdAt: string;
  updatedAt: string;
  questionCount: number;
  serviceCatalog: string;
  pageCount: number;
  sectionCount: number;
  branchCount: number;
  actionCount: number;
  answerSetCount: number;
}

export const sampleITSMRecords: ITSMRecord[] = [
  {
    id: 'itsm-001',
    name: 'Hardware Issue Triage',
    description: 'Questionnaire for diagnosing hardware-related incidents',
    category: 'Incident',
    status: 'Active',
    priority: 'High',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    questionCount: 12,
    serviceCatalog: 'IT Support',
    pageCount: 3,
    sectionCount: 5,
    branchCount: 4,
    actionCount: 8,
    answerSetCount: 6
  },
  {
    id: 'itsm-002',
    name: 'New Employee Onboarding',
    description: 'Service request form for new employee IT setup',
    category: 'Service Request',
    status: 'Active',
    priority: 'Medium',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    questionCount: 18,
    serviceCatalog: 'HR Services',
    pageCount: 4,
    sectionCount: 8,
    branchCount: 6,
    actionCount: 12,
    answerSetCount: 10
  },
  {
    id: 'itsm-003',
    name: 'Software Installation Request',
    description: 'Request form for new software installation approval',
    category: 'Service Request',
    status: 'Active',
    priority: 'Low',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-12',
    questionCount: 8,
    serviceCatalog: 'IT Support',
    pageCount: 2,
    sectionCount: 3,
    branchCount: 2,
    actionCount: 4,
    answerSetCount: 5
  },
  {
    id: 'itsm-004',
    name: 'Network Outage Assessment',
    description: 'Critical incident questionnaire for network issues',
    category: 'Incident',
    status: 'Active',
    priority: 'Critical',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-22',
    questionCount: 15,
    serviceCatalog: 'Network Services',
    pageCount: 3,
    sectionCount: 6,
    branchCount: 8,
    actionCount: 15,
    answerSetCount: 9
  },
  {
    id: 'itsm-005',
    name: 'Password Reset Workflow',
    description: 'Self-service password reset verification',
    category: 'Service Request',
    status: 'Active',
    priority: 'Medium',
    createdAt: '2024-01-03',
    updatedAt: '2024-01-15',
    questionCount: 5,
    serviceCatalog: 'Security',
    pageCount: 1,
    sectionCount: 2,
    branchCount: 1,
    actionCount: 3,
    answerSetCount: 3
  },
  {
    id: 'itsm-006',
    name: 'Infrastructure Change Request',
    description: 'Change management form for infrastructure modifications',
    category: 'Change',
    status: 'Draft',
    priority: 'High',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-21',
    questionCount: 22,
    serviceCatalog: 'Infrastructure',
    pageCount: 5,
    sectionCount: 10,
    branchCount: 12,
    actionCount: 20,
    answerSetCount: 14
  },
  {
    id: 'itsm-007',
    name: 'Recurring Issue Analysis',
    description: 'Problem management questionnaire for root cause analysis',
    category: 'Problem',
    status: 'Active',
    priority: 'Medium',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-19',
    questionCount: 10,
    serviceCatalog: 'IT Support',
    pageCount: 2,
    sectionCount: 4,
    branchCount: 3,
    actionCount: 6,
    answerSetCount: 5
  },
  {
    id: 'itsm-008',
    name: 'VPN Access Request',
    description: 'Remote access VPN setup and verification',
    category: 'Service Request',
    status: 'Archived',
    priority: 'Low',
    createdAt: '2023-12-15',
    updatedAt: '2024-01-02',
    questionCount: 7,
    serviceCatalog: 'Security',
    pageCount: 1,
    sectionCount: 2,
    branchCount: 2,
    actionCount: 4,
    answerSetCount: 4
  }
];
