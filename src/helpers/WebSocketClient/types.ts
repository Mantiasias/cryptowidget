export interface IWebSocketClient {
  openWs: (wsUrl: string) => Promise<boolean>;
  reconnect: (wsUrl: string, messageHandler?: Function) => boolean;
  close: () => boolean;
  setMessageHandler: (handler: Function) => void;
}
