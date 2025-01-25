export enum ApplicationStatus {
    APPLIED = 'APPLIED',
    INTERVIEW_SCHEDULED = 'INTERVIEW_SCHEDULED',
    TECHNICAL_INTERVIEW = 'TECHNICAL_INTERVIEW',
    FINAL_INTERVIEW = 'FINAL_INTERVIEW',
    OFFER_RECEIVED = 'OFFER_RECEIVED',
    REJECTED = 'REJECTED',
    WITHDRAWN = 'WITHDRAWN'
  }
  
  export interface JobApplication {
    id?: number;
    companyName: string;
    jobTitle: string;
    jobDescription?: string;
    jobUrl?: string;
    status: ApplicationStatus;
    applicationDate?: string;
    lastUpdated?: string;
    resumeUrl?: string
  }