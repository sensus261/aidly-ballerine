import { DefaultCaseActions } from '@/pages/Entity/components/Case/case-action-variants/DefaultCaseActions';
import { PDFRevisionCaseActions } from '@/pages/Entity/components/Case/case-action-variants/PDFRevisionCaseActions';
import { checkIfPdfResivisionCaseActions } from '@/pages/Entity/components/Case/case-action-variants/utils/case-actions-variant-resolvers';
import { IActionsProps } from '@/pages/Entity/components/Case/interfaces';

export const CaseActionsVariantResolver = (props: IActionsProps) => {
  const { workflow } = props;
  const isPdfRevisionCaseActions = checkIfPdfResivisionCaseActions(workflow);

  if (isPdfRevisionCaseActions) {
    return <PDFRevisionCaseActions {...props} />;
  }

  return <DefaultCaseActions {...props} />;
};
