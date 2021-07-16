import type { DocumentUri } from "vscode-languageclient/node";
// import type { DenoExtensionContext } from "./types";
import type * as lspTypes from "vscode-languageserver-protocol";
import { wrapCommand } from "./novaUtils";

export function registerCashe(client: LanguageClient) {
  return nova.commands.register(
    "sciencefidelity.deno.cache",
    wrapCommand(cache)
  );

  /** For the current document active in the editor tell the Deno LSP
  to cache the file and all of its dependencies in the local cache. */
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
    ) as (lspTypes.Command | lspTypes.CodeAction)[] | null;
  }
}

// https://microsoft.github.io/language-server-protocol/specifications/specification-current/#workspace_executeCommand
// NOTE: this actually handled "externally" in the applyEdit command handler
export async function executeCommand(
  client: LanguageClient,
  command: lspTypes.Command
) {
  console.info("executing command", command.command);
  const params: lspTypes.ExecuteCommandParams = {
    command: command.command,
    arguments: command.arguments,
  };
  return client.sendRequest("workspace/executeCommand", params);
}
