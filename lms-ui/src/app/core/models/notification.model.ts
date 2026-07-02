export interface AppNotification {
  id: string;
  type: 'ENROLLMENT' | 'QUIZ_PASSED';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}