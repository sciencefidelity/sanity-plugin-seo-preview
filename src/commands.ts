import type { DocumentUri } from "vscode-languageclient/node";
import type { DenoExtensionContext } from "./types";

const cacheReq = "deno/cache";

export type Callback = (...args: any[]) => unknown;
export type Factory = (
  extensionContext: DenoExtensionContext,
) => Callback;

/** For the current document active in the editor tell the Deno LSP
to cache the file and all of its dependencies in the local cache. */
export function cache(
  extensionContext: DenoExtensionContext,
  editor: TextEditor
): Callback {
  return (uris: DocumentUri[] = []) => {
    const client = extensionContext.client;
    const notification = new NotificationRequest("caching");
    notification.body = "Deno is caching dependencies";
    nova.notifications.add(notification);
    return client?.sendRequest(
      cacheReq,
      {
        referrer: { uri: editor.document.uri.toString() },
        uris: uris.map((uri) => ({
          uri,
        })),
      },
    );
  };
}
