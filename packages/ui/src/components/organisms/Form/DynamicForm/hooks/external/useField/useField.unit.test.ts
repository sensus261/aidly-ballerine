import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IDynamicFormContext, useDynamicForm } from '../../../context';
import { IFormElement } from '../../../types';
import { useElementId } from '../useElementId';
import { useValueDestination } from '../useValueDestination';
import { useField } from './useField';

vi.mock('../../../context', () => ({
  useDynamicForm: vi.fn(),
}));

vi.mock('../useElementId', () => ({
  useElementId: vi.fn(),
}));

vi.mock('../useValueDestination', () => ({
  useValueDestination: vi.fn(),
}));

describe('useField', () => {
  const mockElement = {
    id: 'test-field',
    valueDestination: 'test.path',
  } as IFormElement;

  const mockStack = [1, 2];

  const mockSetValue = vi.fn();
  const mockGetValue = vi.fn();
  const mockSetTouched = vi.fn();
  const mockGetTouched = vi.fn();

  const mockFieldHelpers = {
    setValue: mockSetValue,
    getValue: mockGetValue,
    setTouched: mockSetTouched,
    getTouched: mockGetTouched,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useElementId).mockReturnValue('test-field-1-2');
    vi.mocked(useValueDestination).mockReturnValue('test.path[1][2]');
    vi.mocked(useDynamicForm).mockReturnValue({
      fieldHelpers: mockFieldHelpers,
    } as unknown as IDynamicFormContext<object>);
    mockGetValue.mockReturnValue('test-value');
    mockGetTouched.mockReturnValue(false);
  });

  it('should return field state and handlers', () => {
    const { result } = renderHook(() => useField(mockElement, mockStack));

    expect(result.current).toEqual({
      value: 'test-value',
      touched: false,
      onChange: expect.any(Function),
      onBlur: expect.any(Function),
    });
  });

  it('should call useElementId with element and stack', () => {
    renderHook(() => useField(mockElement, mockStack));

    expect(useElementId).toHaveBeenCalledWith(mockElement, mockStack);
  });

  it('should call useValueDestination with element and stack', () => {
    renderHook(() => useField(mockElement, mockStack));

    expect(useValueDestination).toHaveBeenCalledWith(mockElement, mockStack);
  });

  it('should get value using valueDestination', () => {
    renderHook(() => useField(mockElement, mockStack));

    expect(mockGetValue).toHaveBeenCalledWith('test.path[1][2]');
  });

  it('should get touched state using fieldId', () => {
    renderHook(() => useField(mockElement, mockStack));

    expect(mockGetTouched).toHaveBeenCalledWith('test-field-1-2');
  });

  describe('onChange', () => {
    it('should update value and touched state', () => {
      const { result } = renderHook(() => useField(mockElement, mockStack));

      result.current.onChange('new-value');

      expect(mockSetValue).toHaveBeenCalledWith('test.path[1][2]', 'new-value');
      expect(mockSetTouched).toHaveBeenCalledWith('test-field-1-2', true);
    });
  });

  describe('when stack is not provided', () => {
    it('should use empty array as default stack', () => {
      renderHook(() => useField(mockElement));

      expect(useElementId).toHaveBeenCalledWith(mockElement, []);
      expect(useValueDestination).toHaveBeenCalledWith(mockElement, []);
    });
  });

  it('should memoize value', () => {
    const { result, rerender } = renderHook(() => useField(mockElement, mockStack));
    const initialValue = result.current.value;

    rerender();

    expect(result.current.value).toBe(initialValue);
  });

  it('should memoize touched', () => {
    const { result, rerender } = renderHook(() => useField(mockElement, mockStack));
    const initialTouched = result.current.touched;

    rerender();

    expect(result.current.touched).toBe(initialTouched);
  });

  it('should memoize onChange', () => {
    const { result, rerender } = renderHook(() => useField(mockElement, mockStack));
    const initialOnChange = result.current.onChange;

    rerender();

    expect(result.current.onChange).toBe(initialOnChange);
  });

  it('should memoize onBlur', () => {
    const { result, rerender } = renderHook(() => useField(mockElement, mockStack));
    const initialOnBlur = result.current.onBlur;

    rerender();

    expect(result.current.onBlur).toBe(initialOnBlur);
  });
});
