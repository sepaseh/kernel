import { apiClient } from "@/shared/api";

const basePath = "/calendar";

export const createCalendarDate = (date: string): Promise<void> =>
  apiClient.post<void>(basePath, { date });

export const deleteCalendarDate = (date: string): Promise<void> =>
  apiClient.del<void>(`${basePath}/${date}`);

export const fetchCalendarDates = (): Promise<string[]> =>
  apiClient.get<string[]>(basePath);
