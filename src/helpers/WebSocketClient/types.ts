export interface IWebSocketClient {
  openWs: (wsUrl: string) => Promise<boolean>;
  reconnect: (wsUrl: string, messageHandler?: Function) => Promise<boolean>;
  close: () => boolean;
  setMessageHandler: (handler: Function) => void;
}
