import { useState, useEffect, } from 'react';
import styled from 'styled-components';
import type { Extension, InitialData, MessageState } from './types';
import { v4 as uuidv4 } from 'uuid';

// 컴포넌트
import FixedExtensionList from './components/FixedExtensionList';
import CustomExtensionManager from './components/CustomExtensionManager';
import FileUpload from './components/FileUpload';

// 로컬영
// const API_BASE_URL = 'http://localhost:8080/api';

const API_BASE_URL = 'http://13.124.49.85:8080/api';

// changedByIp에 들어갈 값 < UUID생성
function getVisitorId(): string {
  let visitorId = localStorage.getItem('visitorId');
  if (!visitorId) {
    visitorId = uuidv4();
    if (visitorId === null)
      visitorId = "NAN";
    localStorage.setItem('visitorId', visitorId);
  }
  return visitorId;
}

// 헤더 얻는 함수
const getApiHeaders = () => {
  const headers: HeadersInit = {
    'X-Visitor-ID': getVisitorId()
  };
  return headers;
};

export default function App() {
  const [fixedExtensions, setFixedExtensions] = useState<Extension[]>([]);
  const [customExtensions, setCustomExtensions] = useState<Extension[]>([]);
  const [customCount, setCustomCount] = useState(0);
  
  const [appMessage, setAppMessage] = useState<MessageState>({ type: null, text: '' });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setAppMessage({ type: null, text: '' });
    try {
      // 헤더 추가
      const response = await fetch(`${API_BASE_URL}/extensions`,{
        headers: getApiHeaders()
      });

      if (!response.ok) throw new Error('서버에서 데이터를 불러오지 못했습니다.');
      
      const data: InitialData = await response.json();
      setFixedExtensions(data.fixedExtensions);
      setCustomExtensions(data.customExtensions);
      setCustomCount(data.currentCustomCount);
    } catch (error: any) {
      setAppMessage({ type: 'error', text: error.message }); // 로딩 실패 시에만 전역 메시지 사용
    } finally {
      setIsLoading(false);
    }
  };


  const handleFixedChange = async (name: string, isChecked: boolean) => {
    setFixedExtensions(prev =>
      prev.map(ext => (ext.name === name ? { ...ext, checked: isChecked } : ext))
    );

    const formData = new URLSearchParams();
    formData.append('name', name);
    formData.append('checked', String(isChecked));

    try {
      const response = await fetch(`${API_BASE_URL}/fixed/update`, {
        method: 'POST',
        headers: { 
          ...getApiHeaders(),
          'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });
      if (!response.ok) throw new Error('상태 업데이트 실패');
    } catch (error) {
      setFixedExtensions(prev =>
        prev.map(ext => (ext.name === name ? { ...ext, checked: !isChecked } : ext))
      );
      // 에러를 throw하여 자식 컴포넌트가 catch하도록 함
      throw new Error('고정 확장자 업데이트에 실패했습니다.'); 
    }
  };

  const handleCustomAdd = async (name: string) => {
    const formData = new FormData();
    formData.append('name', name);

    try {
      const response = await fetch(`${API_BASE_URL}/custom/add`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || '등록 실패');
      }

      const addedExtension: Extension = await response.json();
      setCustomExtensions(prev => [...prev, addedExtension]);
      setCustomCount(prev => prev + 1);
      
    } catch (error: any) {
      throw error; 
    }
  };

  const handleCustomDelete = async (id: number) => {

    const formData = new URLSearchParams();
    formData.append('id', String(id));

    try {
      const response = await fetch(`${API_BASE_URL}/custom/delete`, {
        method: 'POST',
        headers: { 
          ...getApiHeaders(),
          'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      if (!response.ok) throw new Error('삭제 실패');
      
      setCustomExtensions(prev => prev.filter(ext => ext.id !== id));
      setCustomCount(prev => prev - 1);

    } catch (error: any) {
      throw error; 
    }
  };
  
  const handleUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('fileUpload', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: formData,
      });
      const message = await response.text();
      if (!response.ok) throw new Error(message);
      return message; 
    } catch (error: any) {
      throw error;
    }
  };


  if (isLoading) {
    return <Container><h1>로딩 중...</h1></Container>;
  }

  return (
    <Container>
      <h1>파일 확장자 차단 설정</h1>

      {appMessage.text && (
        <Message $type={appMessage.type}>
          {appMessage.text}
        </Message>
      )}

      <FixedExtensionList 
        extensions={fixedExtensions} 
        onChange={handleFixedChange} 
      />

      <CustomExtensionManager
        extensions={customExtensions}
        count={customCount}
        onAdd={handleCustomAdd}
        onDelete={handleCustomDelete}
      />
      <br/>
      <hr/>
      <br />
      <FileUpload 
        onUpload={handleUpload} 
      />
      
    </Container>
  );
}


const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
`;

const Message = styled.div<{ $type: MessageState['type'] }>`
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 6px;
  font-weight: 500;
  background-color: ${props => props.$type === 'success' ? '#d1fae5' : '#fee2e2'};
  color: ${props => props.$type === 'success' ? '#065f46' : '#991b1b'};
`;