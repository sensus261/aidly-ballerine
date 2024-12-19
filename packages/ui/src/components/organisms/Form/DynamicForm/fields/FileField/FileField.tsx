import { ctw } from '@/common';
import { Button } from '@/components/atoms';
import { Input } from '@/components/atoms/Input';
import { createTestId } from '@/components/organisms/Renderer';
import { Upload, XCircle } from 'lucide-react';
import { useCallback, useMemo, useRef } from 'react';
import { useElement, useField } from '../../hooks/external';
import { useMountEvent } from '../../hooks/internal/useMountEvent';
import { useUnmountEvent } from '../../hooks/internal/useUnmountEvent';
import { FieldErrors } from '../../layouts/FieldErrors';
import { FieldLayout } from '../../layouts/FieldLayout';
import { ICommonFieldParams, TDynamicFormField } from '../../types';
import { useStack } from '../FieldList/providers/StackProvider';

export interface IFileFieldParams extends ICommonFieldParams {
  uploadOn?: 'change' | 'submit';
  uploadSettings?: {
    url: string;
    method: 'POST' | 'PUT';
    headers: Record<string, string>;
  };
  acceptFileFormats?: string;
}

export const FileField: TDynamicFormField<IFileFieldParams> = ({ element }) => {
  useMountEvent(element);
  useUnmountEvent(element);

  const {
    uploadOn = 'change',
    uploadSettings = {},
    placeholder = 'Choose file',
    acceptFileFormats = undefined,
  } = element.params || {};

  const { stack } = useStack();
  const { id } = useElement(element, stack);
  const { value, disabled, onChange, onBlur, onFocus } = useField<File | string | undefined>(
    element,
    stack,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInputOnContainerClick = useCallback(() => {
    inputRef.current?.click();
  }, [inputRef]);

  const file = useMemo(() => {
    if (value instanceof File) return value;

    if (typeof value === 'string') return new File([], value);

    return undefined;
  }, [value]);

  return (
    <FieldLayout element={element}>
      <div
        className={ctw(
          'relative flex h-[56px] flex-row items-center gap-3 rounded-[16px] border bg-white px-4',
          { 'pointer-events-none opacity-50': disabled },
        )}
        onClick={focusInputOnContainerClick}
        data-testid={createTestId(element, stack)}
      >
        <div className="flex gap-3 text-[#007AFF]">
          <Upload />
          <span className="select-none whitespace-nowrap text-base font-bold">{placeholder}</span>
        </div>
        <span className="truncate text-sm">{file ? file.name : 'No File Choosen'}</span>
        {file && (
          <Button
            variant="ghost"
            size="icon"
            className="h-[28px] w-[28px] rounded-full"
            onClick={e => {
              e.stopPropagation();
              onChange(undefined);
            }}
          >
            <div className="rounded-full bg-white">
              <XCircle />
            </div>
          </Button>
        )}
        <Input
          data-testid={`${createTestId(element, stack)}-hidden-input`}
          type="file"
          placeholder={placeholder}
          accept={acceptFileFormats}
          disabled={disabled}
          onChange={e => {
            const file = e.target.files?.[0];

            if (file) {
              onChange(file);
            }
          }}
          onBlur={onBlur}
          onFocus={onFocus}
          ref={inputRef}
          className="hidden"
        />
      </div>
      <FieldErrors element={element} />
    </FieldLayout>
  );
};
