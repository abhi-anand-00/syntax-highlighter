import { Questionnaire } from "../types/questionnaire";
import { ExportedQuestionnaire, buildExportData } from "./questionnaireExport";
import { DraftService, SavedDraft } from "./storage/draftService";
import { PublishedService, PublishedRecord } from "./storage/publishedService";
import { Result, success, failure } from "./core/result";
import { CrudService } from "./dataverse/pcf/CrudService";
import type { IPCFContext } from "./dataverse/pcf/types";

/**
 * Lookup result containing the questionnaire and its source
 */
export interface QuestionnaireLookupResult {
  questionnaire: Questionnaire;
  source: 'draft' | 'published';
  id: string;
  name: string;
}

/**
 * Status choice values for Dataverse ctna_questionnaire entity
 */
export enum DataverseQuestionnaireStatus {
  Draft = 100000000,
  Published = 100000001,
}

/**
 * Dataverse record structure for ctna_questionnaire entity
 */
export interface DataverseQuestionnaireRecord {
  /** Display name (ctna_name) */
  ctna_name: string;
  /** Designer notes (ctna_description) */
  ctna_description: string;
  /** Draft/Published status choice (ctna_status) */
  ctna_status: DataverseQuestionnaireStatus;
  /** Semantic version e.g. "1.0.0" (ctna_version) */
  ctna_version: string;
  /** JSON schema version e.g. "1.0" (ctna_schemaversion) */
  ctna_schemaversion: string;
  /** Full questionnaire JSON tree (ctna_definitionjson) */
  ctna_definitionjson: string;
}

/**
 * Generic wrapper class for Questionnaire operations.
 * Provides programmatic access to questionnaire data in the standard export format.
 */
export class QuestionnaireWrapper {
  private questionnaire: Questionnaire;
  private sourceInfo?: { source: 'draft' | 'published'; id: string };

  constructor(questionnaire: Questionnaire, sourceInfo?: { source: 'draft' | 'published'; id: string }) {
    this.questionnaire = questionnaire;
    this.sourceInfo = sourceInfo;
  }

  /**
   * Returns the full questionnaire JSON in the standard export format.
   * Same structure as Export JSON feature.
   */
  toJSON(): ExportedQuestionnaire {
    return buildExportData(this.questionnaire);
  }

  /**
   * Returns the questionnaire JSON as a formatted string.
   * @param indent - Number of spaces for indentation (default: 2)
   */
  toJSONString(indent = 2): string {
    return JSON.stringify(this.toJSON(), null, indent);
  }

  /**
   * Returns the raw questionnaire object without export metadata.
   */
  getRawQuestionnaire(): Questionnaire {
    return this.questionnaire;
  }

  /**
   * Updates the wrapped questionnaire.
   */
  setQuestionnaire(questionnaire: Questionnaire): void {
    this.questionnaire = questionnaire;
  }

  /**
   * Returns questionnaire metadata.
   */
  getMetadata(): { name: string; description: string; status: string; version: string; serviceCatalog: string } {
    return {
      name: this.questionnaire.name,
      description: this.questionnaire.description,
      status: this.questionnaire.status,
      version: this.questionnaire.version,
      serviceCatalog: this.questionnaire.serviceCatalog,
    };
  }

  /**
   * Returns the source info if loaded via fromId or fromName
   */
  getSourceInfo(): { source: 'draft' | 'published'; id: string } | undefined {
    return this.sourceInfo;
  }

  /**
   * Converts the questionnaire to a Dataverse-compatible record for ctna_questionnaire entity.
   * 
   * @example
   * const record = wrapper.toDataverseRecord();
   * await crudService.create("ctna_questionnaire", record);
   */
  toDataverseRecord(): DataverseQuestionnaireRecord {
    const exportData = this.toJSON();
    const status = this.questionnaire.status?.toLowerCase() === 'published' 
      ? DataverseQuestionnaireStatus.Published 
      : DataverseQuestionnaireStatus.Draft;

    return {
      ctna_name: this.questionnaire.name || 'Untitled Questionnaire',
      ctna_description: this.questionnaire.description || '',
      ctna_status: status,
      ctna_version: this.questionnaire.version || '1.0.0',
      ctna_schemaversion: exportData.version,
      ctna_definitionjson: JSON.stringify(exportData.questionnaire),
    };
  }

  /**
   * Creates a Blob suitable for file download or API transmission.
   */
  toBlob(): Blob {
    return new Blob([this.toJSONString()], { type: "application/json" });
  }

  /**
   * Static factory method to create wrapper from existing questionnaire.
   */
  static from(questionnaire: Questionnaire): QuestionnaireWrapper {
    return new QuestionnaireWrapper(questionnaire);
  }

  /**
   * Static factory method to create wrapper from exported JSON.
   */
  static fromExport(exported: ExportedQuestionnaire): QuestionnaireWrapper {
    return new QuestionnaireWrapper(exported.questionnaire);
  }

  /**
   * Load questionnaire from Dataverse by record ID.
   * Retrieves the ctna_questionnaire record and parses the DefinitionJson field.
   * 
   * @param context - The PCF context (containing webAPI)
   * @param recordId - The Dataverse record GUID
   * 
   * @example
   * const result = await QuestionnaireWrapper.fromDataverseRecord(context, "12345678-1234-1234-1234-123456789abc");
   * if (result.success) {
   *   const wrapper = result.data;
   *   console.log(wrapper.getMetadata());
   * }
   */
  static async fromDataverseRecord(
    context: IPCFContext,
    recordId: string
  ): Promise<Result<QuestionnaireWrapper, Error>> {
    try {
      const crudService = new CrudService(context, {
        entityLogicalName: "ctna_questionnaire",
      });
      
      const result = await crudService.retrieve(recordId, {
        select: [
          "ctna_name",
          "ctna_description", 
          "ctna_status",
          "ctna_version",
          "ctna_schemaversion",
          "ctna_definitionjson"
        ],
      });

      if (!result.success) {
        return failure(new Error(result.error.userMessage || "Failed to retrieve record"));
      }

      const record = result.data;
      const definitionJson = record.ctna_definitionjson as string | undefined;
      
      if (!definitionJson) {
        return failure(new Error("Record has no DefinitionJson data"));
      }

      // Parse the DefinitionJson to get the full questionnaire
      const questionnaire: Questionnaire = JSON.parse(definitionJson);
      
      return success(new QuestionnaireWrapper(
        questionnaire,
        { source: 'published', id: recordId }
      ));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error loading from Dataverse";
      return failure(new Error(message));
    }
  }

  /**
  /**
   * Load questionnaire from localStorage by ID.
   * Searches both drafts and published records.
   * 
   * @example
   * const result = QuestionnaireWrapper.fromId("draft-abc123");
   * if (result.success) {
   *   const wrapper = result.data;
   *   console.log(wrapper.toJSON());
   * }
   */
  static fromId(id: string): Result<QuestionnaireWrapper, Error> {
    // Check drafts first
    const draft = DraftService.findById(id);
    if (draft) {
      return success(new QuestionnaireWrapper(
        draft.questionnaire,
        { source: 'draft', id: draft.id }
      ));
    }

    // Check published records
    const published = PublishedService.findById(id);
    if (published) {
      return success(new QuestionnaireWrapper(
        published.questionnaire,
        { source: 'published', id: published.metadata.id }
      ));
    }

    return failure(new Error(`Questionnaire not found with ID: ${id}`));
  }

  /**
   * Load questionnaire from localStorage by name.
   * Searches both drafts and published records.
   * Returns the first match found (published records take priority).
   * 
   * @example
   * const result = QuestionnaireWrapper.fromName("IT Support Request");
   * if (result.success) {
   *   const wrapper = result.data;
   *   console.log(wrapper.getMetadata());
   * }
   */
  static fromName(name: string): Result<QuestionnaireWrapper, Error> {
    const normalizedName = name.toLowerCase().trim();

    // Check published records first (they take priority)
    const publishedRecords = PublishedService.getAll();
    const publishedMatch = publishedRecords.find(
      r => r.questionnaire.name.toLowerCase().trim() === normalizedName
    );
    if (publishedMatch) {
      return success(new QuestionnaireWrapper(
        publishedMatch.questionnaire,
        { source: 'published', id: publishedMatch.metadata.id }
      ));
    }

    // Check drafts
    const drafts = DraftService.loadAll();
    const draftMatch = drafts.find(
      d => d.questionnaire.name.toLowerCase().trim() === normalizedName
    );
    if (draftMatch) {
      return success(new QuestionnaireWrapper(
        draftMatch.questionnaire,
        { source: 'draft', id: draftMatch.id }
      ));
    }

    return failure(new Error(`Questionnaire not found with name: ${name}`));
  }

  /**
   * List all available questionnaires from localStorage.
   * Returns both drafts and published records.
   */
  static listAll(): QuestionnaireLookupResult[] {
    const results: QuestionnaireLookupResult[] = [];

    // Add published records
    const publishedRecords = PublishedService.getAll();
    for (const record of publishedRecords) {
      results.push({
        questionnaire: record.questionnaire,
        source: 'published',
        id: record.metadata.id,
        name: record.questionnaire.name,
      });
    }

    // Add drafts
    const drafts = DraftService.loadAll();
    for (const draft of drafts) {
      results.push({
        questionnaire: draft.questionnaire,
        source: 'draft',
        id: draft.id,
        name: draft.questionnaire.name,
      });
    }

    return results;
  }
}

/**
 * Factory function for creating QuestionnaireWrapper instances.
 */
export const createQuestionnaireWrapper = (questionnaire: Questionnaire): QuestionnaireWrapper => {
  return new QuestionnaireWrapper(questionnaire);
};
