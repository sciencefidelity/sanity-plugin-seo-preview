import {
  cache as cacheReq,
} from "./lspExtensions";

/** For the current document active in the editor tell the Deno LSP to cache
 * the file and all of its dependencies in the local cache. */
export function cache(
  _context: nova.ExtensionContext,
  extensionContext: DenoExtensionContext,
): Callback {
  return (uris: DocumentUri[] = []) => {
    const activeEditor = nova.window.activeTextEditor;
    const client = extensionContext.client;
    if (!activeEditor || !client) {
      return;
    }
    return nova.window.withProgress({
      location: nova.ProgressLocation.Window,
      title: "caching",
    }, () => {
      return client.sendRequest(
        cacheReq,
        {
          referrer: { uri: activeEditor.document.uri.toString() },
          uris: uris.map((uri) => ({
            uri,
          })),
        },
      );
    });
  };
}
