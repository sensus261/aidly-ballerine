import {
  StateProvider,
  useStateManagerContext,
} from '@/components/organisms/DynamicUI/StateManager/components/StateProvider';
import { useMachineLogic } from '@/components/organisms/DynamicUI/StateManager/hooks/useMachineLogic';
import { useStateLogic } from '@/components/organisms/DynamicUI/StateManager/hooks/useStateLogic';
import { createStateMachine } from '@/components/organisms/DynamicUI/StateManager/state-machine.factory';
import {
  StateManagerContext,
  StateManagerProps,
} from '@/components/organisms/DynamicUI/StateManager/types';
import { useMemo } from 'react';
import { useLanguageParam } from '@/hooks/useLanguageParam/useLanguageParam';
import { useUISchemasQuery } from '@/hooks/useUISchemasQuery';
import { useFlowContextQuery } from '@/hooks/useFlowContextQuery';

export const StateManager = ({
  definition,
  extensions,
  definitionType,
  children,
  workflowId,
  initialContext,
}: StateManagerProps) => {
  const { stateApi } = useStateManagerContext();
  const { language } = useLanguageParam();
  const { data: schema } = useUISchemasQuery(language);
  const { refetch } = useFlowContextQuery();
  const elements = schema?.uiSchema?.elements;
  const machine = useMemo(() => {
    const initialMachineState = {
      ...initialContext,
      state: initialContext?.flowConfig?.appState,
    };

    const machine = createStateMachine(
      workflowId,
      definition,
      definitionType,
      extensions,
      initialMachineState,
    );

    machine.overrideContext(initialMachineState);
    return machine;
  }, []);

  const { machineApi } = useMachineLogic(machine);
  const { contextPayload, state, sendEvent, invokePlugin, setContext, getContext, getState } =
    useStateLogic(
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
    };
    return ctx;
  }, [state, contextPayload, getState, sendEvent, invokePlugin, setContext, getContext]);

  const child = useMemo(
    () => (typeof children === 'function' ? children(context) : children),
    [children, context],
  );

  return <StateProvider context={context}>{child}</StateProvider>;
};
