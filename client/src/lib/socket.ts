export class SocketManager {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: Array<{ type: string; data: any }> = [];
  private isConnected = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;

      console.log("🔌 Attempting to connect to WebSocket:", wsUrl);
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log("✅ Connected to WebSocket successfully");
        this.reconnectAttempts = 0;
        this.isConnected = true;
        this.emit('connection_status', 'connected');

        // Send any queued messages
        if (this.messageQueue.length > 0) {
          console.log(`📦 Sending ${this.messageQueue.length} queued messages`);
          const queuedMessages = [...this.messageQueue];
          this.messageQueue = [];

          queuedMessages.forEach(({ type, data }) => {
            const message = { type, ...data };
            console.log("📤 Sending queued message:", message);
            this.socket!.send(JSON.stringify(message));
            console.log("✅ Queued message sent successfully");
          });
        }

        resolve();
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("📨 WebSocket message received:", message);
          this.emit(message.type, message);
        } catch (error) {
          console.error("❌ Failed to parse WebSocket message:", error);
        }
      };

      this.socket.onclose = (event) => {
        console.log(
          "🔌 WebSocket connection closed:",
          event.code,
          event.reason,
        );
        this.socket = null;
        this.isConnected = false;
        this.emit('connection_status', 'disconnected');
        this.handleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        reject(error);
      };
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      this.emit('connection_status', 'connecting');
      
      setTimeout(() => {
        console.log(
          `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`,
        );
        this.connect().catch(() => {
          // Reconnection failed, will try again if attempts remaining
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.emit('connection_status', 'disconnected');
            console.error('❌ Max reconnection attempts reached. Please refresh the page.');
          }
        });
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      this.emit('connection_status', 'disconnected');
    }
  }

  send(type: string, data: any = {}) {
    const message = { type, ...data };
    console.log("📤 Sending WebSocket message:", message);

    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
      console.log("✅ Message sent successfully");
    } else if (this.socket?.readyState === WebSocket.CONNECTING) {
      console.log("⏳ WebSocket is connecting, queuing message");
      this.messageQueue.push({ type, data });
    } else {
      console.warn(
        "⚠️ WebSocket is not connected, ready state:",
        this.socket?.readyState,
      );
      console.log(
        "WebSocket states: CONNECTING=0, OPEN=1, CLOSING=2, CLOSED=3",
      );
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => callback(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.listeners.clear();
  }
}

export const socketManager = new SocketManager();
