declare module '*.less' {
  const resource: { [key: string]: string };

  export default resource;
}

interface BasicWebviewMessage {
  command: string;
}

interface ConnectMessage extends BasicWebviewMessage {
  command: 'CONNECT';
  connectionModel: object;
}

interface OpenConnectionStringInputMessage extends BasicWebviewMessage {
  command: 'OPEN_CONNECTION_STRING_INPUT';
}

interface FilePickerMessage {
  command: 'OPEN_FILE_PICKER';
  action: string;
  multi: boolean;
}

type WebviewMessage =
  | ConnectMessage
  | FilePickerMessage
  | OpenConnectionStringInputMessage;

interface VSCodeApi {
  postMessage: (message: WebviewMessage) => void;
}

declare const acquireVsCodeApi: () => VSCodeApi;
