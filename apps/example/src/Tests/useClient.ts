import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { io, Socket } from "socket.io-client";

const { OS } = Platform;
const ANDROID_WS_HOST = "10.0.2.2";
const IOS_WS_HOST = "localhost";
const HOST = OS === "android" ? ANDROID_WS_HOST : IOS_WS_HOST;
const PORT = 4242;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const arch = (global as any)?.nativeFabricUIManager ? "fabric" : "paper";

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';
type UseClient = [client: Socket | null, hostname: string, state: ConnectionState];

export const useClient = (): UseClient => {
  const [client, setClient] = useState<Socket | null>(null);
  const [state, setState] = useState<ConnectionState>('connecting');

  useEffect(() => {
    const url = `http://${HOST}:${PORT}`;
    
    console.log('Connecting to Socket.IO server at:', url);
    setState('connecting');
    
    const socket = io(url, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 10,
      autoConnect: true,
      forceNew: true
    });

    socket.on('connect', () => {
      console.log('Socket.IO connected');
      setState('connected');
      setClient(socket);
      
      // Send initial handshake
      socket.emit('handshake', {
        OS,
        arch,
      });
    });

    socket.on('handshake-ack', (data) => {
      console.log('Handshake acknowledged:', data);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      setState('disconnected');
      setClient(null);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setState('error');
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket.IO reconnected after', attemptNumber, 'attempts');
      setState('connected');
      setClient(socket);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket.IO reconnection attempt', attemptNumber);
      setState('connecting');
    });

    socket.on('reconnect_error', (error) => {
      console.error('Socket.IO reconnection error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.error('Socket.IO reconnection failed');
      setState('error');
    });

    return () => {
      console.log('Disconnecting Socket.IO client');
      socket.disconnect();
    };
  }, []);
  
  return [client, HOST, state];
};
