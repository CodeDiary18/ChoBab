export interface SuccessResType {
  message: string;
  data: any;
}

export interface FailResType {
  message: string;
}

export const SUCCESS_RES = (message: string, data: any): SuccessResType => {
  return { message, data };
};

export const FAIL_RES = (message: string): FailResType => {
  return { message };
};
