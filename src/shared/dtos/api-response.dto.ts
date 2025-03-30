export interface IApiResponse<T> {
  success: boolean;
  payload?: T;
  errorType?: string | string[];
  message?: string;
  statusCode?: number;
  timestamp?: number;
}

export class ApiSuccessResponse<T = undefined> implements IApiResponse<T> {
  success: boolean;
  payload?: T;
  timestamp: number;
  constructor(payload?: T, success?: boolean) {
    this.success = success ?? true;
    this.payload = payload;
    this.timestamp = Date.now();
  }
}

export class ApiFailureResponse<T> implements IApiResponse<T> {
  success: boolean;
  errorType?: string | string[];
  message?: string;
  statusCode?: number;
  timestamp: number;

  constructor(errorType?: string | string[], message: string = 'An error occurred', statusCode: number = 400) {
    this.success = false;
    this.errorType = errorType;
    this.message = message;
    this.statusCode = statusCode;
    this.timestamp = Date.now();
  }
}
