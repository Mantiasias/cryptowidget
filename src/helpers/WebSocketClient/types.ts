export interface IWebSocketClient {
  openWs: (wsUrl: string) => Promise<boolean>;
  reconnect: (wsUrl: string) => void;
  close: () => boolean;
  setMessageHandler: (handler: Function) => void;
}
