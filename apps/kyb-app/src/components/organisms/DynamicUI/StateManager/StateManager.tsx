import { StateProvider } from '@/components/organisms/DynamicUI/StateManager/components/StateProvider';
import { useMachineLogic } from '@/components/organisms/DynamicUI/StateManager/hooks/useMachineLogic';
import { useStateLogic } from '@/components/organisms/DynamicUI/StateManager/hooks/useStateLogic';
import { createStateMachine } from '@/components/organisms/DynamicUI/StateManager/state-machine.factory';
import {
  StateManagerContext,
  StateManagerProps,
} from '@/components/organisms/DynamicUI/StateManager/types';
import { useMemo } from 'react';

export const StateManager = ({
  definition,
  extensions,
  definitionType,
  children,
  workflowId,
  initialContext,
  config,
  additionalContext,
}: StateManagerProps) => {
  const machine = useMemo(() => {
    const initialMachineState = {
      ...initialContext,
      state: initialContext?.collectionFlow?.state?.currentStep,
    };

    const machine = createStateMachine(
      workflowId,
      definition,
      definitionType,
      extensions,
      initialMachineState,
      additionalContext,
    );

    machine.overrideContext(initialMachineState);

    return machine;
  }, [additionalContext]);

  const { machineApi } = useMachineLogic(machine, additionalContext);
  const {
    contextPayload,
    isPluginLoading,
    state,
    sendEvent,
    invokePlugin,
    setContext,
    getContext,
    getState,
  } = useStateLogic(
    machineApi,
    // @ts-ignore
    initialContext,
  );
  const context: StateManagerContext = useMemo(() => {
    const ctx: StateManagerContext = {
      stateApi: {
        sendEvent,
        invokePlugin,
        setContext,
        getContext,
        getState,
      },
      state,
      payload: contextPayload,
      config,
      isPluginLoading: isPluginLoading,
    };

    return ctx;
  }, [
    state,
    contextPayload,
    isPluginLoading,
    config,
    getState,
    sendEvent,
    invokePlugin,
    setContext,
    getContext,
  ]);

  const child = useMemo(
    () => (typeof children === 'function' ? children(context) : children),
    [children, context],
  );

  return <StateProvider context={context}>{child}</StateProvider>;
};
