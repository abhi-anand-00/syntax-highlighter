/**
 * Published Records Service
 * 
 * Manages published questionnaire persistence.
 */

import { Questionnaire } from '../../types/questionnaire';
import { createStorageService, getWithFallback } from './storageService';
import { StorageKeys, QuestionnaireStatus } from '../questionnaire/constants';
import { calculateQuestionnaireStats } from '../questionnaire/stats';
import { EntityId } from '../core/id';
import { createLogger } from '../core/logger';

const logger = createLogger('PublishedService');

/**
 * ITSM Record metadata (for display in lists)
 */
export interface ITSMRecordMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  priority: string;
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

/**
 * Published record structure
 */
export interface PublishedRecord {
  metadata: ITSMRecordMetadata;
  questionnaire: Questionnaire;
}

/**
 * Published records map
 */
export type PublishedRecordsMap = Record<string, PublishedRecord>;

// Create the storage service
const publishedStorage = createStorageService<PublishedRecordsMap>(StorageKeys.PUBLISHED_RECORDS);

/**
 * Published records service operations
 */
export const PublishedService = {
  /**
   * Load all published records from storage
   */
  loadAll: (): PublishedRecordsMap => {
    return getWithFallback(publishedStorage, {});
  },
  
  /**
   * Save all published records to storage
   */
  saveAll: (records: PublishedRecordsMap): boolean => {
    const result = publishedStorage.set(records);
    if (!result.success) {
      logger.error('Failed to save published records', result.error);
    }
    return result.success;
  },
  
  /**
   * Find a published record by ID
   */
  findById: (id: string): PublishedRecord | undefined => {
    const records = PublishedService.loadAll();
    return records[id];
  },
  
  /**
   * Publish a questionnaire
   */
  publish: (
    questionnaire: Questionnaire,
    existingId?: string
  ): PublishedRecord => {
    const records = PublishedService.loadAll();
    const stats = calculateQuestionnaireStats(questionnaire);
    const now = new Date().toISOString().split('T')[0];
    
    // Determine the record ID
    const recordId = existingId || EntityId.published();
    const existingRecord = records[recordId];
    
    const metadata: ITSMRecordMetadata = {
      id: recordId,
      name: questionnaire.name || 'Untitled Questionnaire',
      description: questionnaire.description || '',
      category: 'Service Request',
      status: QuestionnaireStatus.ACTIVE,
      priority: 'Medium',
      createdAt: existingRecord?.metadata.createdAt || now,
      updatedAt: now,
      questionCount: stats.questionCount,
      serviceCatalog: questionnaire.serviceCatalog || 'General',
      pageCount: stats.pageCount,
      sectionCount: stats.sectionCount,
      branchCount: stats.branchCount,
      actionCount: stats.actionCount,
      answerSetCount: stats.answerSetCount,
    };
    
    const publishedRecord: PublishedRecord = {
      metadata,
      questionnaire: { ...questionnaire, status: QuestionnaireStatus.ACTIVE },
    };
    
    PublishedService.saveAll({
      ...records,
      [recordId]: publishedRecord,
    });
    
    logger.info(`Published questionnaire: ${recordId}`);
    return publishedRecord;
  },
  
  /**
   * Delete a published record by ID
   */
  delete: (id: string): boolean => {
    const records = PublishedService.loadAll();
    
    if (!records[id]) {
      logger.warn(`Published record not found for deletion: ${id}`);
      return false;
    }
    
    const { [id]: deleted, ...remaining } = records;
    PublishedService.saveAll(remaining);
    
    logger.info(`Deleted published record: ${id}`);
    return true;
  },
  
  /**
   * Get all records as an array
   */
  getAll: (): PublishedRecord[] => {
    const records = PublishedService.loadAll();
    return Object.values(records);
  },
  
  /**
   * Clear all published records
   */
  clearAll: (): void => {
    publishedStorage.remove();
    logger.info('Cleared all published records');
  },
};
