import { AnswerSet } from "../types/questionnaire";

export const sampleAnswerSets: AnswerSet[] = [
  {
    id: 'sample-yes-no',
    name: 'Yes / No',
    tag: 'boolean',
    isDefault: false,
    answers: [
      { id: 's-yn-1', label: 'Yes', value: 'yes', active: true },
      { id: 's-yn-2', label: 'No', value: 'no', active: true }
    ]
  },
  {
    id: 'sample-agree-disagree',
    name: 'Agree / Disagree',
    tag: 'opinion',
    isDefault: false,
    answers: [
      { id: 's-ad-1', label: 'Strongly Agree', value: 'strongly_agree', active: true },
      { id: 's-ad-2', label: 'Agree', value: 'agree', active: true },
      { id: 's-ad-3', label: 'Neutral', value: 'neutral', active: true },
      { id: 's-ad-4', label: 'Disagree', value: 'disagree', active: true },
      { id: 's-ad-5', label: 'Strongly Disagree', value: 'strongly_disagree', active: true }
    ]
  },
  {
    id: 'sample-satisfaction',
    name: 'Satisfaction Level',
    tag: 'rating',
    isDefault: false,
    answers: [
      { id: 's-sat-1', label: 'Very Satisfied', value: 'very_satisfied', active: true },
      { id: 's-sat-2', label: 'Satisfied', value: 'satisfied', active: true },
      { id: 's-sat-3', label: 'Neutral', value: 'neutral', active: true },
      { id: 's-sat-4', label: 'Dissatisfied', value: 'dissatisfied', active: true },
      { id: 's-sat-5', label: 'Very Dissatisfied', value: 'very_dissatisfied', active: true }
    ]
  },
  {
    id: 'sample-frequency',
    name: 'Frequency',
    tag: 'frequency',
    isDefault: false,
    answers: [
      { id: 's-freq-1', label: 'Always', value: 'always', active: true },
      { id: 's-freq-2', label: 'Often', value: 'often', active: true },
      { id: 's-freq-3', label: 'Sometimes', value: 'sometimes', active: true },
      { id: 's-freq-4', label: 'Rarely', value: 'rarely', active: true },
      { id: 's-freq-5', label: 'Never', value: 'never', active: true }
    ]
  },
  {
    id: 'sample-priority',
    name: 'Priority Level',
    tag: 'priority',
    isDefault: false,
    answers: [
      { id: 's-pri-1', label: 'Critical', value: 'critical', active: true },
      { id: 's-pri-2', label: 'High', value: 'high', active: true },
      { id: 's-pri-3', label: 'Medium', value: 'medium', active: true },
      { id: 's-pri-4', label: 'Low', value: 'low', active: true }
    ]
  },
  {
    id: 'sample-likelihood',
    name: 'Likelihood',
    tag: 'probability',
    isDefault: false,
    answers: [
      { id: 's-lik-1', label: 'Very Likely', value: 'very_likely', active: true },
      { id: 's-lik-2', label: 'Likely', value: 'likely', active: true },
      { id: 's-lik-3', label: 'Undecided', value: 'undecided', active: true },
      { id: 's-lik-4', label: 'Unlikely', value: 'unlikely', active: true },
      { id: 's-lik-5', label: 'Very Unlikely', value: 'very_unlikely', active: true }
    ]
  },
  {
    id: 'sample-importance',
    name: 'Importance',
    tag: 'rating',
    isDefault: false,
    answers: [
      { id: 's-imp-1', label: 'Extremely Important', value: 'extremely_important', active: true },
      { id: 's-imp-2', label: 'Very Important', value: 'very_important', active: true },
      { id: 's-imp-3', label: 'Moderately Important', value: 'moderately_important', active: true },
      { id: 's-imp-4', label: 'Slightly Important', value: 'slightly_important', active: true },
      { id: 's-imp-5', label: 'Not Important', value: 'not_important', active: true }
    ]
  },
  {
    id: 'sample-quality',
    name: 'Quality Rating',
    tag: 'rating',
    isDefault: false,
    answers: [
      { id: 's-qual-1', label: 'Excellent', value: 'excellent', active: true },
      { id: 's-qual-2', label: 'Good', value: 'good', active: true },
      { id: 's-qual-3', label: 'Average', value: 'average', active: true },
      { id: 's-qual-4', label: 'Below Average', value: 'below_average', active: true },
      { id: 's-qual-5', label: 'Poor', value: 'poor', active: true }
    ]
  },
  {
    id: 'sample-nps',
    name: 'Net Promoter Score (0-10)',
    tag: 'nps',
    isDefault: false,
    answers: Array.from({ length: 11 }, (_, i) => ({
      id: `s-nps-${i}`,
      label: String(i),
      value: String(i),
      active: true
    }))
  },
  {
    id: 'sample-age-range',
    name: 'Age Range',
    tag: 'demographic',
    isDefault: false,
    answers: [
      { id: 's-age-1', label: 'Under 18', value: 'under_18', active: true },
      { id: 's-age-2', label: '18-24', value: '18_24', active: true },
      { id: 's-age-3', label: '25-34', value: '25_34', active: true },
      { id: 's-age-4', label: '35-44', value: '35_44', active: true },
      { id: 's-age-5', label: '45-54', value: '45_54', active: true },
      { id: 's-age-6', label: '55-64', value: '55_64', active: true },
      { id: 's-age-7', label: '65+', value: '65_plus', active: true }
    ]
  }
];

export const getUniqueTags = (): string[] => {
  const tags = new Set(sampleAnswerSets.map(set => set.tag));
  return Array.from(tags).sort();
};
