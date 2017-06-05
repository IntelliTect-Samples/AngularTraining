import { Project } from "./project";

export class TimesheetEntry {
    id: number;
    description: string;
    project: Project;
    startTime: Date;
    endTime: Date;
}
