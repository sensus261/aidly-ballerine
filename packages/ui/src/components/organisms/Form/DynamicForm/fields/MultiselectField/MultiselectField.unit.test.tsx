import { MultiSelect, MultiSelectOption, MultiSelectValue } from '@/components/molecules';
import { SelectedElementParams } from '@/components/molecules/inputs/MultiSelect/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useField } from '../../hooks/external';
import { useMountEvent } from '../../hooks/internal/useMountEvent';
import { useUnmountEvent } from '../../hooks/internal/useUnmountEvent';
import { FieldErrors } from '../../layouts/FieldErrors';
import { FieldLayout } from '../../layouts/FieldLayout';
import { IFormElement } from '../../types';
import { useStack } from '../FieldList/providers/StackProvider';
import { IMultiselectFieldParams, MultiselectField } from './MultiselectField';
import { MultiselectfieldSelectedItem } from './MultiselectFieldSelectedItem';

vi.mock('./MultiselectFieldSelectedItem', () => ({
  MultiselectfieldSelectedItem: vi.fn(() => <div data-testid="selected-item" />),
}));

vi.mock('@/components/molecules', () => ({
  MultiSelect: vi.fn(props => (
    <div data-testid="multiselect">
      <input
        data-testid="multiselect-input"
        disabled={props.disabled}
        onChange={e => props.onChange([e.target.value])}
        onBlur={props.onBlur}
        onFocus={props.onFocus}
      />
      {props.value?.map((val: MultiSelectValue, idx: number) => (
        <div key={idx} data-testid="selected-value">
          {props.renderSelected({ unselectButtonProps: {} }, { value: val, title: String(val) })}
        </div>
      ))}
    </div>
  )),
}));

vi.mock('../../hooks/external', () => ({
  useField: vi.fn(),
}));

vi.mock('../../hooks/internal/useMountEvent', () => ({
  useMountEvent: vi.fn(),
}));

vi.mock('../../hooks/internal/useUnmountEvent', () => ({
  useUnmountEvent: vi.fn(),
}));

vi.mock('../../layouts/FieldErrors', () => ({
  FieldErrors: vi.fn(),
}));

vi.mock('../../layouts/FieldLayout', () => ({
  FieldLayout: vi.fn(({ children }) => <div>{children}</div>),
}));

vi.mock('../FieldList/providers/StackProvider', () => ({
  useStack: vi.fn(),
}));

describe('MultiselectField', () => {
  const mockOptions: MultiSelectOption[] = [
    { title: 'Option 1', value: 'opt1' },
    { title: 'Option 2', value: 'opt2' },
    { title: 'Option 3', value: 'opt3' },
  ];

  const mockElement = {
    id: 'test-multiselect',
    type: '',
    params: {
      options: mockOptions,
    },
  } as unknown as IFormElement<string, IMultiselectFieldParams>;

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useStack).mockReturnValue({
      stack: [],
    });

    vi.mocked(useField).mockReturnValue({
      value: ['opt1'],
      onChange: vi.fn(),
      onBlur: vi.fn(),
      onFocus: vi.fn(),
      disabled: false,
    } as unknown as ReturnType<typeof useField>);
  });

  it('renders MultiSelect component within FieldLayout', () => {
    render(<MultiselectField element={mockElement} />);
    expect(screen.getByTestId('multiselect')).toBeInTheDocument();
    expect(FieldLayout).toHaveBeenCalledWith(
      expect.objectContaining({ element: mockElement }),
      expect.anything(),
    );
  });

  it('passes correct props to MultiSelect', () => {
    const mockOnChange = vi.fn();
    const mockOnBlur = vi.fn();
    const mockOnFocus = vi.fn();

    vi.mocked(useField).mockReturnValue({
      value: ['opt1'],
      onChange: mockOnChange,
      onBlur: mockOnBlur,
      onFocus: mockOnFocus,
      disabled: false,
    } as unknown as ReturnType<typeof useField>);

    render(<MultiselectField element={mockElement} />);

    const multiselect = vi.mocked(MultiSelect).mock.calls[0]![0];
    expect(multiselect.value).toEqual(['opt1']);
    expect(multiselect.disabled).toBe(false);
    expect(multiselect.options).toEqual(mockOptions);
    expect(multiselect.onBlur).toBe(mockOnBlur);
    expect(multiselect.onFocus).toBe(mockOnFocus);
  });

  it('handles empty options gracefully', () => {
    const elementWithoutOptions = {
      ...mockElement,
      params: {},
    } as unknown as IFormElement<string, IMultiselectFieldParams>;

    render(<MultiselectField element={elementWithoutOptions} />);

    const multiselect = vi.mocked(MultiSelect).mock.calls[0]![0];
    expect(multiselect.options).toEqual([]);
  });

  it('respects disabled state', () => {
    vi.mocked(useField).mockReturnValue({
      value: [],
      onChange: vi.fn(),
      onBlur: vi.fn(),
      onFocus: vi.fn(),
      disabled: true,
    } as unknown as ReturnType<typeof useField>);

    render(<MultiselectField element={mockElement} />);

    const multiselect = vi.mocked(MultiSelect).mock.calls[0]![0];
    expect(multiselect.disabled).toBe(true);
  });

  it('renders selected items using MultiselectfieldSelectedItem', () => {
    render(<MultiselectField element={mockElement} />);

    const selectedValues = screen.getAllByTestId('selected-value');
    expect(selectedValues).toHaveLength(1);
    expect(screen.getByTestId('selected-item')).toBeInTheDocument();
  });

  it('provides renderSelected callback that returns MultiselectfieldSelectedItem', () => {
    render(<MultiselectField element={mockElement} />);

    const multiselect = vi.mocked(MultiSelect).mock.calls[0]![0];
    const mockParams: SelectedElementParams = { unselectButtonProps: { onClick: vi.fn() } as any };
    const mockOption: MultiSelectOption = { title: 'Test', value: 'test' };

    const result = multiselect.renderSelected(mockParams, mockOption);
    expect(result.type).toBe(MultiselectfieldSelectedItem);
    expect(result.props).toEqual({
      option: mockOption,
      params: mockParams,
    });
  });

  it('handles onBlur events', async () => {
    const user = userEvent.setup();
    const mockOnBlur = vi.fn();
    vi.mocked(useField).mockReturnValue({
      value: ['opt1'],
      onChange: vi.fn(),
      onBlur: mockOnBlur,
      onFocus: vi.fn(),
      disabled: false,
    } as unknown as ReturnType<typeof useField>);

    render(<MultiselectField element={mockElement} />);
    const input = screen.getByTestId('multiselect-input');

    await user.click(input);
    await user.tab();
    expect(mockOnBlur).toHaveBeenCalled();
  });

  it('handles onFocus events', async () => {
    const user = userEvent.setup();
    const mockOnFocus = vi.fn();
    vi.mocked(useField).mockReturnValue({
      value: ['opt1'],
      onChange: vi.fn(),
      onBlur: vi.fn(),
      onFocus: mockOnFocus,
      disabled: false,
    } as unknown as ReturnType<typeof useField>);

    render(<MultiselectField element={mockElement} />);
    const input = screen.getByTestId('multiselect-input');

    await user.click(input);
    expect(mockOnFocus).toHaveBeenCalled();
  });

  it('should call useMountEvent with element', () => {
    const mockUseMountEvent = vi.mocked(useMountEvent);
    render(<MultiselectField element={mockElement} />);
    expect(mockUseMountEvent).toHaveBeenCalledWith(mockElement);
  });

  it('should call useUnmountEvent with element', () => {
    const mockUseUnmountEvent = vi.mocked(useUnmountEvent);
    render(<MultiselectField element={mockElement} />);
    expect(mockUseUnmountEvent).toHaveBeenCalledWith(mockElement);
  });

  it('should render FieldErrors with element prop', () => {
    render(<MultiselectField element={mockElement} />);
    expect(FieldErrors).toHaveBeenCalledWith(
      expect.objectContaining({ element: mockElement }),
      expect.anything(),
    );
  });
});
