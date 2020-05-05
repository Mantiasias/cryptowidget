import {IWebSocketClient} from './types'
import {debounce} from 'lodash';
import {w3cwebsocket as W3CWebSocket} from "websocket";

const WEBSOCKET_RECONNECTION_TIME = 1000;

class WebSocketClient implements IWebSocketClient {
    private webSocketURL: string = null;
    private connection: W3CWebSocket = null;

    public reconnect = debounce((wsUrl) => {
        console.log('trying to reconnect to ', wsUrl);
        return this.openWs(wsUrl);
    }, WEBSOCKET_RECONNECTION_TIME);

    public async openWs(wsUrl: string): Promise<boolean> {
        if (this.connection && this.webSocketURL === wsUrl) {
            console.log('connection already exists');
            return false;
        }

        if (this.connection) {
            this.connection.onclose = () => null;
            this.connection.close()
        }

        this.connection = new W3CWebSocket(wsUrl);
        this.webSocketURL = wsUrl;

        console.log('ws url is set to', wsUrl);

        this.connection.onopen = () => {
            console.log('ws is connected');
        };

        this.connection.onclose = error => {
            console.log('ws close', error);
            this.connection = null;
            this.reconnect(wsUrl);
        };

        this.connection.onerror = error => {
            console.log('ws error detected', error);
        };

        return true;
    }

    public setMessageHandler(handler: Function): void {
        if (!this.connection || typeof handler !== 'function') {
            return;
        }

        console.log('set handler');
        this.connection.onmessage = handler
    }

    public close(): boolean {
        if (!this.connection) {
            return false;
        }
        this.connection.close();
        return true;
    }
}

const webSocketInstance = new WebSocketClient();

export default webSocketInstance
