// Bob app runtime globals

interface BobStreamResult {
  result: {
    from: string;
    to: string;
    toParagraphs: string[];
  };
}

interface BobCompletionResult {
  result?: {
    from: string;
    to: string;
    toParagraphs: string[];
  };
  error?: {
    type: string;
    message: string;
    addition?: string;
    addtion?: string;
  };
}

interface BobQuery {
  text: string;
  detectFrom: string;
  detectTo: string;
  cancelSignal: unknown;
  onStream: (result: BobStreamResult) => void;
  onCompletion: (result: BobCompletionResult) => void;
}

interface BobHttpResponse {
  response: {
    statusCode: number;
  };
  data?: unknown;
}

interface BobHttp {
  streamRequest(options: {
    method: string;
    url: string;
    header: Record<string, string>;
    body: Record<string, unknown>;
    cancelSignal: unknown;
    streamHandler: (streamData: { text?: string }) => void;
    handler: (result: BobHttpResponse) => void;
  }): Promise<void>;
}

interface BobOption {
  apiUrl?: string;
  apiKey?: string;
  model?: string;
  mode?: string;
  customizePrompt?: string;
}

declare const $http: BobHttp;
declare const $option: BobOption;
