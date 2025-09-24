export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number; // Add order field for chapter ordering
  createdAt: Date;
  updatedAt: Date;
}
