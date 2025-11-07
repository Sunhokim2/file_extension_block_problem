import  { useState, type FormEvent, type ChangeEvent } from 'react';
import styled from 'styled-components';
import type { MessageState } from '../types';

interface Props {
  onUpload: (file: File) => Promise<string>;
}

export default function FileUpload({ onUpload }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<MessageState>({ type: null, text: '' });
  
  // [수정] 파일 입력을 초기화하기 위한 별도의 key 상태
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage({ type: null, text: '' }); 
    
    if (!selectedFile) {
      setMessage({ type: 'error', text: '파일을 선택해주세요.' });
      return;
    }

    setIsUploading(true);
    try {
      const successMessage = await onUpload(selectedFile);
      setMessage({ type: 'success', text: successMessage }); 
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message }); 
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      // [수정] 업로드 완료 후 key를 변경하여 <input>을 강제로 리셋
      setFileInputKey(Date.now()); 
      // (e.target as HTMLFormElement).reset() 대신 key 변경을 사용
    }
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files ? e.target.files[0] : null);
    setMessage({ type: null, text: '' }); 
  }

  return (
    <SectionContainer>
      <h2>파일 업로드 테스트</h2>
      <Form onSubmit={handleSubmit}>
        <FileInput
          type="file"
          // [수정] key가 파일 이름이 아닌, 별도의 상태를 바라보도록 변경
          key={fileInputKey} 
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <UploadButton type="submit" disabled={isUploading}>
          {isUploading ? '업로드 중...' : '업로드 테스트'}
        </UploadButton>
      </Form>

      
      {message.text && (
        <Message $type={message.type}>
          {message.text}
        </Message>
      )}
    </SectionContainer>
  );
}

const SectionContainer = styled.section`
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FileInput = styled.input`
  font-size: 0.875rem;
  color: #374151;
`;

const UploadButton = styled.button`
  background-color: #16a34a;
  color: white;
  &:hover {
    background-color: #15803d;
  }
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const Message = styled.div<{ $type: MessageState['type'] }>`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 6px;
  font-weight: 500;
  background-color: ${props => props.$type === 'success' ? '#d1fae5' : '#fee2e2'};
  color: ${props => props.$type === 'success' ? '#065f46' : '#991b1b'};
`;