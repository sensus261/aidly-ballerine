import { MultiSelect, MultiSelectOption, MultiSelectValue } from '@/components/molecules';
import { SelectedElementParams } from '@/components/molecules/inputs/MultiSelect/types';
import { useCallback } from 'react';
import { useField } from '../../hooks/external';
import { TBaseFormElements, TDynamicFormField } from '../../types';
import { useStack } from '../FieldList/providers/StackProvider';
import { MultiselectfieldSelectedItem } from './MultiselectFieldSelectedItem';

export interface IMultiselectFieldParams {
  options: MultiSelectOption[];
}

export const MultiselectField: TDynamicFormField<TBaseFormElements, IMultiselectFieldParams> = ({
  element,
}) => {
  const { stack } = useStack();
  const { value, onChange, disabled } = useField<MultiSelectValue[] | undefined>(element, stack);

  const renderSelected = useCallback((params: SelectedElementParams, option: MultiSelectOption) => {
    return <MultiselectfieldSelectedItem option={option} params={params} />;
  }, []);

  return (
    <MultiSelect
      value={value}
      disabled={disabled}
      onChange={onChange}
      options={element.params?.options || []}
      renderSelected={renderSelected}
    />
  );
};
