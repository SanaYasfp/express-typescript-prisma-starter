export default interface SGMailData {
  to: string;
  from?: {
    name?: string;
    email: string;
  };
  templateId?: string;
  dynamicTemplateData?: {
    [x: string]: any;
  };
};
