import { useState, type FormEvent } from 'react';
import styled from 'styled-components';
import type { Extension, MessageState } from '../types';

const MAX_CUSTOM_EXTENSIONS = 200;

interface Props {
  extensions: Extension[];
  count: number;
  onAdd: (name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export default function CustomExtensionManager({ extensions, count, onAdd, onDelete }: Props) {
  const [newExtName, setNewExtName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const [message, setMessage] = useState<MessageState>({ type: null, text: '' });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage({ type: null, text: '' }); 
    
    if (!newExtName) {
      setMessage({ type: 'error', text: '확장자 명을 입력하세요.' });
      return;
    }
    if (newExtName.length > 20 || !/^[a-zA-Z0-9]+$/.test(newExtName)) {
      setMessage({ type: 'error', text: '최대 20자, 영문/숫자만 입력 가능합니다.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd(newExtName); 
      setMessage({ type: 'success', text: `'.${newExtName}'이(가) 추가되었습니다.` });
      setNewExtName('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message }); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setMessage({ type: null, text: '' });
    try {
        await onDelete(id); 
        setMessage({ type: 'success', text: '확장자가 삭제되었습니다.'});
    } catch(error: any) {
        if (error.message !== '삭제가 취소되었습니다.') {
            setMessage({ type: 'error', text: error.message });
        }
    }
  }

  return (
    <SectionContainer>
      <h2>커스텀 확장자</h2>
      
      <Form onSubmit={handleSubmit}>
        
          <TextInput
            type="text"
            value={newExtName}
            onChange={e => setNewExtName(e.target.value)}
            placeholder="예: zip (최대 20자, 영문/숫자)"
            maxLength={20}
            disabled={isSubmitting}
          />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '저장'}
        </Button>
      </Form>

    
      {message.text && (
        <Message $type={message.type}>
          {message.text}
        </Message>
      )}

      <CountStatus>
        {count} / {MAX_CUSTOM_EXTENSIONS} 개
      </CountStatus>

      <List>
        {extensions.length > 0 ? (
          extensions.map(ext => (
            <ListItem key={ext.id}>
              <ExtensionName>.{ext.name}</ExtensionName>
              <DeleteButton
                onClick={() => handleDelete(ext.id)}
                title="삭제"
              >
                X
              </DeleteButton>
            </ListItem>
          ))
        ) : (
          <NoItems>등록된 커스텀 확장자가 없습니다.</NoItems>
        )}
      </List>
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
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;


const TextInput = styled.input`
  width: 90%;
  &:focus {
    outline: 2px solid #2563eb;
    border-color: transparent;
  }
`;


const Message = styled.p<{ $type: MessageState['type'] }>`
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  background-color: ${props => props.$type === 'success' ? '#d1fae5' : '#fee2e2'};
  color: ${props => props.$type === 'success' ? '#065f46' : '#991b1b'};
`;

const Button = styled.button`
  background-color: #2563eb;
  color: white;
  &:hover {
    background-color: #1d4ed8;
  }
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const CountStatus = styled.p`
  text-align: right;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
  margin-top: 0.5rem;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  border-top: 1px solid #e5e7eb;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0.25rem;
  border-bottom: 1px solid #e5e7eb;
`;

const ExtensionName = styled.span`
  color: #1f2937;
  font-family: monospace;
  font-size: 1.1rem;
`;

const DeleteButton = styled.button`
  padding: 0.25rem 0.75rem;
  background-color: #ef4444;
  color: white;
  font-size: 0.875rem;
  border-radius: 9999px;
  &:hover {
    background-color: #dc2626;
  }
`;

const NoItems = styled.p`
  color: #6b7280;
  text-align: center;
  padding: 1rem 0;
  margin: 0;
`;