import { IDBPDatabase, openDB, IDBPTransaction } from "idb";
import {v4 as uuidv4} from "uuid";

export const DB_NAME = 'coverLetterDatabase';
export const DB_VERSION = 1

export type StoreName = 'experiences' | 'companies' | 'jobs' | 'templates';
export const EXPERIENCE_STORE = 'experiences' satisfies StoreName;
export const COMPANY_STORE = 'companies' satisfies StoreName;
export const JOB_STORE = 'jobs' satisfies StoreName;
export const TEMPLATE_STORE = 'templates' satisfies StoreName;


export type Experience = {
  uuid: string;
  name: string;
  content: string;
}

export type ExperienceCreation = Omit<Experience, 'uuid'>;

export type Company = {
  uuid: string;
  name: string;
  description: string;
}

export type CompanyCreation = Omit<Company, 'uuid'>;

export type Job = {
  uuid: string;
  company_uuid: string;
  title: string;
  date: number;
  description: string;
  cover_letter?: string;
}

export type JobCreation = Omit<Job, 'uuid' | 'cover_letter'>;

export type Template = {
  uuid: string
  name: string
  content: string
}

export type TemplateCreation = Omit<Template, 'uuid'>;


export interface DatabaseSchema {
  experiences: {
    key: string;
    value: Experience;
  };
  companies: {
    key: string;
    value: Company;
  };
  jobs: {
    key: string;
    value: Job;
  };
  templates: {
    key: string;
    value: Template;
  };
}


type DBQueryResult = {
  experiences: ReadonlyArray<Experience>;
  companies: ReadonlyArray<Company>;
  jobs: ReadonlyArray<Job>;
  templates: ReadonlyArray<Template>;
}
type DBItemBulkCreation = Partial<{
  experiences: ReadonlyArray<ExperienceCreation>;
  companies: ReadonlyArray<CompanyCreation>;
  jobs: ReadonlyArray<JobCreation>;
  templates: ReadonlyArray<TemplateCreation>;
}>;
type DBItemBulkRead = Partial<{
  experiences: ReadonlyArray<string>;
  companies: ReadonlyArray<string>;
  jobs: ReadonlyArray<string>;
  templates: ReadonlyArray<string>;
}>;
type DBItemBulkUpdate = Partial<{
  experiences: ReadonlyArray<Experience>;
  companies: ReadonlyArray<Company>;
  jobs: ReadonlyArray<Job>;
  templates: ReadonlyArray<Template>;
}>;
type DBItemBulkDelete = Partial<{
  experiences: ReadonlyArray<string>;
  companies: ReadonlyArray<string>;
  jobs: ReadonlyArray<string>;
  templates: ReadonlyArray<string>;
}>;

export class DatabaseConnector {
  idb: IDBPDatabase<DatabaseSchema>

  constructor(idb: IDBPDatabase<DatabaseSchema>){
    this.idb = idb;
  }

  static async create(): Promise<DatabaseConnector> {
    const idb: IDBPDatabase<DatabaseSchema> = await openDB(DB_NAME, DB_VERSION, {
      upgrade(idb) {
        if (!idb.objectStoreNames.contains(EXPERIENCE_STORE)) {
          idb.createObjectStore(EXPERIENCE_STORE, { keyPath: 'uuid' });
        }
        if (!idb.objectStoreNames.contains(COMPANY_STORE)) {
          idb.createObjectStore(COMPANY_STORE, { keyPath: 'uuid' });
        }
        if (!idb.objectStoreNames.contains(JOB_STORE)) {
          idb.createObjectStore(JOB_STORE, { keyPath: 'uuid'});
        }
        if (!idb.objectStoreNames.contains(TEMPLATE_STORE)) {
          idb.createObjectStore(TEMPLATE_STORE, { keyPath: 'uuid' });
        }
      },
    });

    return new DatabaseConnector(idb);
  }

  async listAll(stores: ReadonlyArray<StoreName>): Promise<DBQueryResult> {
    const result: DBQueryResult = {
      experiences: [],
      companies: [],
      jobs: [],
      templates: [],
    };
  
    const transaction = this.idb.transaction(stores, 'readonly');
    for (const store of stores) {
      const data = await transaction.objectStore(store).getAll();
      result[store] = data;
    }
    await transaction.done;
    return result;
  };

  async create(bulkCreation: DBItemBulkCreation){
    const stores = Object.keys(bulkCreation);
    if (stores.indexOf(JOB_STORE) !== -1) {
      stores.push(COMPANY_STORE);
    }
    const transaction = this.idb.transaction(stores, 'readwrite');
    for (const store of [EXPERIENCE_STORE, COMPANY_STORE, TEMPLATE_STORE] as const){
      if (bulkCreation[store] != null) {
        for (const itemToCreate of bulkCreation[store]!) {
          transaction.objectStore(store).add({
            uuid: uuidv4(),
            ...itemToCreate,
          })
        }
      }
    }
    if (bulkCreation[JOB_STORE] != null) {
      await this.createJobs(transaction, bulkCreation[JOB_STORE])
    }
    await transaction.done;
    return;
  }

  async createJobs(transaction: IDBPTransaction<DatabaseSchema, Array<string>, 'readwrite'>, newJobs: ReadonlyArray<JobCreation>){
    const companyStore = transaction.objectStore(COMPANY_STORE);
    const jobStore = transaction.objectStore(JOB_STORE);
    const allCompanyUUIDSet = new Set(await companyStore.getAllKeys());
    
    for (const newJob of newJobs) {
      if (!allCompanyUUIDSet.has(newJob.company_uuid)){
        transaction.abort();
        throw new Error("");
      }
      jobStore.add({
        uuid: uuidv4(),
        ...newJob,
      })
    }
    return;
  }

  async read(bulkRead: DBItemBulkRead): Promise<DBQueryResult> {
    const result: DBQueryResult = {
      experiences: [],
      companies: [],
      jobs: [],
      templates: [],
    }; // Initialize dynamically
    const transaction = this.idb.transaction(Object.keys(bulkRead), 'readonly');
  
    for (const store of [EXPERIENCE_STORE, COMPANY_STORE, JOB_STORE, TEMPLATE_STORE] as const) {
      if (bulkRead[store] != null) {
        const allUUIDs = bulkRead[store];
        const storeObject = transaction.objectStore(store);
  
        const items = await Promise.all(
          allUUIDs.map(async (uuid) => (await storeObject.get(uuid)) || null)
        );
        result[store] = items.filter(item=>item!=null);
      }
    }
    
    await transaction.done;
    return result;
  }

  async update(bulkUpdate: DBItemBulkUpdate){
    const stores = Object.keys(bulkUpdate);
    const transaction = this.idb.transaction(stores, 'readwrite');
    for (const store of [EXPERIENCE_STORE, COMPANY_STORE, JOB_STORE, TEMPLATE_STORE] as const){
      if (bulkUpdate[store] != null) {
        for (const toUpdate of bulkUpdate[store]) {
          transaction.objectStore(store).put(toUpdate)
        }
      }
    }
    await transaction.done;
    return;
  }

  async delete(bulkDeletion: DBItemBulkDelete){
    const stores = Object.keys(bulkDeletion);
    if (stores.indexOf(COMPANY_STORE) !== -1) {
      stores.push(JOB_STORE);
    }
    const transaction = this.idb.transaction(stores, 'readwrite');
    for (const store of [EXPERIENCE_STORE, JOB_STORE, TEMPLATE_STORE] as const){
      if (bulkDeletion[store] != null) {
        for (const uuid of bulkDeletion[store]!) {
          transaction.objectStore(store).delete(uuid)
        }
      }
    }
    if (bulkDeletion[COMPANY_STORE] != null) {
      await this.deleteCompany(transaction, bulkDeletion[COMPANY_STORE]);
    }
    await transaction.done;
    return;
  }

  async deleteCompany(transaction: IDBPTransaction<DatabaseSchema, Array<string>, 'readwrite'>, companyUUIDs: ReadonlyArray<string>){
    const companyStore = transaction.objectStore(COMPANY_STORE);
    const jobStore = transaction.objectStore(JOB_STORE);
    const jobUUIDsToDelete = [];

    for (const companyUUID of companyUUIDs) {
      // delete company
      await companyStore.delete(companyUUID);
      // collect related jobs
      let cursor = await jobStore.openCursor();
      while (cursor) {
        if (cursor.value.company_uuid === companyUUID){
          jobUUIDsToDelete.push(cursor.value.uuid);
        }
        cursor = await cursor.continue();
      }
    }

    for (const jobUUID of jobUUIDsToDelete) {
      // delete job
      await jobStore.delete(jobUUID);
    }
    return;
  }

  async listAllJobsByCompany(companyUUID: string): Promise<ReadonlyArray<Job>>{
    const transaction = this.idb.transaction(JOB_STORE, 'readonly');
    const store = transaction.objectStore(JOB_STORE);
    const jobs: Array<Job> = [];

    let cursor = await store.openCursor();
    while (cursor) {
      if (cursor.value.company_uuid === companyUUID){
        jobs.push(cursor.value);
      }
      cursor = await cursor.continue();
    }

    return jobs;
  }

  async export(): Promise<DBQueryResult> {
    const allStores = [EXPERIENCE_STORE, COMPANY_STORE, JOB_STORE, TEMPLATE_STORE] as const;
    return this.listAll(allStores);
  }
}