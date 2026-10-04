import PusherClient from "pusher-js";

export const getPusherClient = () => {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  
  if (!key) {
    console.warn("NEXT_PUBLIC_PUSHER_KEY is missing. Real-time updates are disabled.");
    // Return a mock client that matches the expected PusherClient interface
    return {
      subscribe: (channelName: string) => ({
        bind: (eventName: string, callback: any) => {},
        unbind_all: () => {},
      }),
      unsubscribe: (channelName: string) => {},
    } as unknown as PusherClient;
  }

  return new PusherClient(key, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2",
  });
};
