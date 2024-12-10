import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useRuleEngine } from './useRuleEngine';
import { executeRules } from './utils/execute-rules';

vi.mock('./utils/execute-rules', () => ({
  executeRules: vi.fn(),
}));

describe('useRuleEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should execute rules synchronously when executeRulesSync is true', () => {
    // Arrange
    const context = { foo: 'bar' };
    const rules = [{ engine: 'json-logic', value: true }];
    const expectedResults = [{ rule: rules[0], result: true }];

    (executeRules as Mock).mockReturnValue(expectedResults);

    // Act
    const { result } = renderHook(() => useRuleEngine(context, { rules, executeRulesSync: true }));

    // Assert
    expect(result.current).toEqual(expectedResults);
    expect(executeRules).toHaveBeenCalledWith(context, rules);
  });

  it('should execute rules asynchronously when executeRulesSync is false', async () => {
    // Arrange
    const context = { foo: 'bar' };
    const rules = [{ engine: 'json-logic', value: true }];
    const expectedResults = [{ rule: rules[0], result: true }];

    (executeRules as Mock).mockReturnValue(expectedResults);

    // Act
    const { result } = renderHook(() => useRuleEngine(context, { rules, executeRulesSync: false }));

    // Wait for debounced execution
    await vi.advanceTimersByTimeAsync(500);

    // Assert
    expect(result.current).toEqual(expectedResults);
    expect(executeRules).toHaveBeenCalledWith(context, rules);
  });

  it('should execute rules on initialize when runOnInitialize is true', () => {
    // Arrange
    const context = { foo: 'bar' };
    const rules = [{ engine: 'json-logic', value: true }];
    const expectedResults = [{ rule: rules[0], result: true }];

    (executeRules as Mock).mockReturnValue(expectedResults);

    // Act
    const { result } = renderHook(() => useRuleEngine(context, { rules, runOnInitialize: true }));

    // Assert
    expect(result.current).toEqual(expectedResults);
    expect(executeRules).toHaveBeenCalledWith(context, rules);
  });

  it('should convert single rule to array', () => {
    // Arrange
    const context = { foo: 'bar' };
    const rule = { engine: 'json-logic', value: true };
    const expectedResults = [{ rule, result: true }];

    (executeRules as Mock).mockReturnValue(expectedResults);

    // Act
    const { result } = renderHook(() =>
      useRuleEngine(context, { rules: rule, executeRulesSync: true }),
    );

    // Assert
    expect(result.current).toEqual(expectedResults);
    expect(executeRules).toHaveBeenCalledWith(context, [rule]);
  });

  it('should use custom execution delay', async () => {
    // Arrange
    const context = { foo: 'bar' };
    const rules = [{ engine: 'json-logic', value: true }];
    const customDelay = 1000;
    const expectedResults = [{ rule: rules[0], result: true }];

    (executeRules as Mock).mockReturnValue(expectedResults);

    // Act
    const { result } = renderHook(() =>
      useRuleEngine(context, { rules, executeRulesSync: false, executionDelay: customDelay }),
    );

    // Assert initial empty state
    expect(result.current).toEqual([]);

    // Wait for custom delayed execution
    await vi.advanceTimersByTimeAsync(customDelay);

    // Assert after delay
    expect(result.current).toEqual(expectedResults);
    expect(executeRules).toHaveBeenCalledWith(context, rules);
  });
});
