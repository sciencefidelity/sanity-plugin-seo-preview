import type { DocumentUri } from "vscode-languageclient/node";
import type * as lspTypes from "vscode-languageserver-protocol";
import { applyWorkspaceEdit } from "../applyWorkspaceEdit";
import { wrapCommand } from "../novaUtils";

/** For the current document active in the editor tell the Deno LSP
to cache the file and all of its dependencies in the local cache. */
export function registerCache(client: LanguageClient) {
  return nova.commands.register(
    "deno.cache",
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
      command: "deno.cache",
      arguments: [editor.document.path]
    };
    const response = (await client.sendRequest(
      "workspace/executeCommand",
      cacheCommand
    )) as lspTypes.WorkspaceEdit | null;
    if (response == null) {
      nova.workspace.showWarningMessage("Couldn't cache dependencies.");
      return;
    }
    await applyWorkspaceEdit(response);

  }
}
