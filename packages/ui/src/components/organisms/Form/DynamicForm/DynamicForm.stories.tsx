import { DynamicFormV2 } from './DynamicForm';
import { ConditionalRenderingShowcaseComponent } from './_stories/ConditionalRenderingShowcase';
import { CustomInputsShowCaseComponent } from './_stories/CustomInputsShowcase';
import { CustomValidatorsShowcaseComponent } from './_stories/CustomValidatorsShowcase';
import { FileUploadShowcaseComponent } from './_stories/FileUploadShowcase';
import { InputsShowcaseComponent } from './_stories/InputsShowcase';
import { ValidationShowcaseComponent } from './_stories/ValidationShowcase/ValidationShowcase';

export default {
  component: DynamicFormV2,
};

export const InputsShowcase = {
  render: () => <InputsShowcaseComponent />,
};

export const FileUploadShowcase = {
  render: () => <FileUploadShowcaseComponent />,
};

export const ValidationShowcase = {
  render: () => <ValidationShowcaseComponent />,
};

export const ConditionalRenderingShowcase = {
  render: () => <ConditionalRenderingShowcaseComponent />,
};

export const CustomInputsShowCase = {
  render: () => <CustomInputsShowCaseComponent />,
};

export const CustomValidatorsShowcase = {
  render: () => <CustomValidatorsShowcaseComponent />,
};
