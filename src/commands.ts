import type { DocumentUri } from "vscode-languageclient/node";
import type * as lspTypes from "vscode-languageserver-protocol";
import { wrapCommand } from "./novaUtils";

/** For the current document active in the editor tell the Deno LSP
to cache the file and all of its dependencies in the local cache. */
export function registerCache(client: LanguageClient) {
  return nova.commands.register(
    "sciencefidelity.deno.commands.cache",
    wrapCommand(cache)
  );

  async function cache(
    editor: TextEditor,
    uris: DocumentUri[] = []
  ) {

    const notification = new NotificationRequest("caching");
    notification.body = "Deno is caching dependencies";
    nova.notifications.add(notification);

    await client.sendRequest(
      "deno/cache",
      {
        referrer: { uri: editor.document.uri.toString() },
        uris: uris.map((uri) => ({
          uri,
        })),
      },
    );

    const cacheCommand: lspTypes.ExecuteCommandParams = {
      command: "_deno.cacheImports",
      arguments: [editor.document.path],
    };
    await client.sendRequest(
      "workspace/executeCommand",
      cacheCommand
    );

  }
}
