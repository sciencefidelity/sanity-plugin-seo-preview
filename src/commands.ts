import type * as lspTypes from "vscode-languageserver-protocol";
import { wrapCommand } from "./novaUtils";

/** For the current document active in the editor tell the Deno LSP to cache
 * the file and all of its dependencies in the local cache. */
export function registerCache(client: LanguageClient) {

  return nova.commands.register(
    "sciencefidelity.dano.cache",
    wrapCommand(cache)
  );

  async function cache() {
    const notification = new NotificationRequest("caching");
    notification.body = "Deno is caching dependencies";
    nova.notifications.add(notification);

    const response = (await client.sendRequest(
      "deno/cache",
    )) as lspTypes.Location[] | null;
    if (response == null) {
      nova.workspace.showInformativeMessage("Couldn't cache dependencies.");
      return;
    }
  }
}
