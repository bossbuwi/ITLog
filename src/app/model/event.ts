export class Event {
  _id: number;
  user: string;
  system: string;
  zone: string;
  type: string;
  startDate: Date;
  endDate: Date;
  apiUsed: string;
  compiledSources: string;
  featureOn: string;
  featureOff: string;
  jiraCase: string;
}
