import { useEffect, useState } from "react";
import { DiscordSDK } from "@discord/embedded-app-sdk";

export function useDiscord(appId: string) {
  const [discordSdk, setDiscordSdk] = useState<DiscordSDK | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      const sdk = new DiscordSDK(appId);
      await sdk.ready();
      setDiscordSdk(sdk);
      setIsReady(true);
      console.log("Discord SDK Ready");
    };

    init();
  }, [appId]);

  return { discordSdk, isReady };
}
