// 확장글자
export interface Extension {
  id: number;
  name: string;
  type: 'FIXED' | 'CUSTOM';
  checked: boolean;
  changedAt: string;
  changedByIp: string;
}

// 화면에 보여줄 데이터
export interface InitialData {
  fixedExtensions: Extension[];
  customExtensions: Extension[];
  currentCustomCount: number;
}

// 알림 메시지
export interface MessageState {
  type: 'success' | 'error' | null;
  text: string;
}