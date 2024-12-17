import { Button } from '@/components/atoms';
import { useMemo } from 'react';
import { useValidator } from '../../../Validator';
import { useDynamicForm } from '../../context';
import { useElement } from '../../hooks/external/useElement';
import { useField } from '../../hooks/external/useField';
import { TBaseFormElements, TDynamicFormElement } from '../../types';

export interface ISubmitButtonParams {
  disableWhenFormIsInvalid?: boolean;
  text?: string;
}

export const SubmitButton: TDynamicFormElement<TBaseFormElements, ISubmitButtonParams> = ({
  element,
}) => {
  const { id } = useElement(element);
  const { disabled: _disabled } = useField(element);
  const { submit } = useDynamicForm();
  const { isValid } = useValidator();

  const { disableWhenFormIsInvalid = false, text = 'Submit' } = element.params || {};

  const disabled = useMemo(() => {
    if (disableWhenFormIsInvalid && !isValid) return true;

    return _disabled;
  }, [disableWhenFormIsInvalid, isValid, _disabled]);

  return (
    <Button
      data-testid={`${id}-submit-button`}
      variant="secondary"
      disabled={disabled}
      onClick={() => submit()}
    >
      {text}
    </Button>
  );
};
