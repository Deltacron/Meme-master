import { useEffect, useRef } from 'react';
import { socketManager } from '@/lib/socket';

export function useSocket() {
  const isConnected = useRef(false);

  useEffect(() => {
    if (!isConnected.current) {
      socketManager.connect().then(() => {
        isConnected.current = true;
      }).catch((error) => {
        console.error('Failed to connect to WebSocket:', error);
      });
    }

    return () => {
      // Don't disconnect on unmount to maintain connection across components
    };
  }, []);

  const send = (type: string, data: any = {}) => {
    socketManager.send(type, data);
  };

  const on = (event: string, callback: Function) => {
    socketManager.on(event, callback);
  };

  const off = (event: string, callback: Function) => {
    socketManager.off(event, callback);
  };

  return { send, on, off };
}
