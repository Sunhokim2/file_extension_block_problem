
import styled from 'styled-components';
import type { Extension, MessageState } from '../types';
import { useState } from 'react';


interface Props {
  extensions: Extension[];
  onChange: (name: string, isChecked: boolean) => Promise<void>;
}

export default function FixedExtensionList({ extensions, onChange }: Props) {
  const [message, setMessage] = useState<MessageState>({ type: null, text: '' });

  const handleChange = async (name: string, isChecked: boolean) => {
    setMessage({ type: null, text: '' });
    try {
      await onChange(name, isChecked); 
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message }); 
    }
  };

  return (
    <SectionContainer>
      <h2>고정 확장자</h2>
      
      {message.text && (
        <Message $type={message.type}>
          {message.text}
        </Message>
      )}

      <Grid>
        {extensions.map(ext => (
          <CheckboxLabel key={ext.id}>
            <CheckboxInput
              type="checkbox"
              value={ext.name}
              checked={ext.checked}
              onChange={e => handleChange(ext.name, e.target.checked)}
            />
            <ExtensionName>{ext.name}</ExtensionName>
          </CheckboxLabel>
        ))}
      </Grid>
    </SectionContainer>
  );
}



const SectionContainer = styled.section`
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px,150px));
  gap: 14px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: #d6e4f2ff;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #ecf0f9ff;
  }
`;

const CheckboxInput = styled.input`
  height: 1.25rem;
  width: 1.25rem;
  border-radius: 4px;
  border: 1px solid #d1d5db;
  color: #2563eb;
`;

const ExtensionName = styled.span`
  margin-left: 0.75rem;
  color: #1f2937;
  font-family: monospace;
`;

const Message = styled.div<{ $type: MessageState['type'] }>`
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  background-color: ${props => props.$type === 'success' ? '#d1fae5' : '#fee2e2'};
  color: ${props => props.$type === 'success' ? '#065f46' : '#991b1b'};
`;