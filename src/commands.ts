import type * as lspTypes from "vscode-languageserver-protocol";
import { wrapCommand } from "./novaUtils";

/** For the current document active in the editor tell the Deno LSP to cache
 * the file and all of its dependencies in the local cache. */
export function registerCache(client: LanguageClient) {

  return nova.commands.register(
    "sciencefidelity.dano.cache",
    wrapCommand(cache)
  );

  async function cache(editor: TextEditor): Promise<void>;
  async function cache(
    workspace: Workspace,
    editor: TextEditor
  ): Promise<void>;
  async function cache(
    editorOrWorkspace: TextEditor | Workspace,
    maybeEditor?: TextEditor
  ) {

    const editor: TextEditor = maybeEditor ?? (editorOrWorkspace as TextEditor);

    // const originalSelections = editor.selectedRanges;
    // const originalLength = editor.document.length;

    if (!editor.document.path) {
      nova.workspace.showWarningMessage(
        "Please save this document before organizing imports."
      );
      return;
    }

    // const notification = new NotificationRequest("caching");
    // notification.body = "Deno is caching dependencies";
    // nova.notifications.add(notification);

    const cacheDependencies: lspTypes.DocumentFormattingParams = {
      textDocument: { uri: editor.document.uri },
      options: {
        insertSpaces: editor.softTabs,
        tabSize: editor.tabLength,
      },
    };

    const cacheDependenciesCommand: lspTypes.ExecuteCommandParams = {
      command: "_deno.cacheDependencies",
      arguments: [editor.document.path],
    };

    await client.sendRequest("deno/cache", cacheDependencies);

    await client.sendRequest(
      "workspace/executeCommand",
      cacheDependenciesCommand
    );

  }
}
