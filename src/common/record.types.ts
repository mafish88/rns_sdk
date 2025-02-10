export type ContextT = "receivers" | "delegation" | "navigation" | "social" | "discovery" | "widgets";

export interface DocketI {

    context: ContextT;
    directive?: string;
    platformIdentifier: string;
    value: string;

}

export interface RecordItemI {
    record_id: string;
    platform_identifier: string;
    domain_id: string;
    context: string;
    value: string | null;
    directive?: string;
    id_additions: string[];
}

export interface DocketPropsI {

    context?: string;
    directive?: string;
    proven?: boolean;

}
export interface RemovalPreferencesI {
    deleteSubdomains: boolean;
    deleteRecords: boolean;
}

export type RecordResultsT = RecordItemI[] | [];
