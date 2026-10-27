/**
 * Most of this code is from Zotero team's official Make It Red example[1]
 * or the Zotero 7 documentation[2].
 * [1] https://github.com/zotero/make-it-red
 * [2] https://www.zotero.org/support/dev/zotero_7_for_developers
 */

var chromeHandle;

function install(data, reason) {}

async function startup({ id, version, resourceURI, rootURI }, reason) {
  var aomStartup = Components.classes[
    "@mozilla.org/addons/addon-manager-startup;1"
  ].getService(Components.interfaces.amIAddonManagerStartup);
  var manifestURI = Services.io.newURI(rootURI + "manifest.json");
  chromeHandle = aomStartup.registerChrome(manifestURI, [
    ["content", "ai-assistant", rootURI + "content/"],
    ["locale", "ai-assistant", "en-US", rootURI + "locale/en-US/"],
    ["locale", "ai-assistant", "zh-CN", rootURI + "locale/zh-CN/"],
  ]);

  /**
   * Global variables for plugin code.
   * The `_globalThis` is the global root variable of the plugin sandbox environment
   * and all child variables assigned to it is globally accessible.
   * See `src/index.ts` for details.
   */
  const ctx = { rootURI };
  ctx._globalThis = ctx;

  // Load markdown + math rendering libraries into the plugin sandbox before
  // the plugin code, so the bundled ai-assistant.js can find them.
  Services.scriptloader.loadSubScript(
    `${rootURI}/content/scripts/markdown-it.min.js`,
    ctx,
  );
  Services.scriptloader.loadSubScript(
    `${rootURI}/content/scripts/katex.min.js`,
    ctx,
  );

  // UMD builds attach to `this`, `self`, or `globalThis` depending on the
  // host. Normalize them onto `ctx` so the plugin code always finds them.
  ctx.markdownit =
    ctx.markdownit ||
    (typeof markdownit !== "undefined" ? markdownit : undefined) ||
    (typeof globalThis !== "undefined" ? globalThis.markdownit : undefined) ||
    (typeof self !== "undefined" ? self.markdownit : undefined);
  ctx.katex =
    ctx.katex ||
    (typeof katex !== "undefined" ? katex : undefined) ||
    (typeof globalThis !== "undefined" ? globalThis.katex : undefined) ||
    (typeof self !== "undefined" ? self.katex : undefined);

  Services.scriptloader.loadSubScript(
    `${rootURI}/content/scripts/ai-assistant.js`,
    ctx,
  );
  await Zotero.AIAssistant.hooks.onStartup();
}

async function onMainWindowLoad({ window }, reason) {
  await Zotero.AIAssistant?.hooks.onMainWindowLoad(window);
}

async function onMainWindowUnload({ window }, reason) {
  await Zotero.AIAssistant?.hooks.onMainWindowUnload(window);
}

async function shutdown({ id, version, resourceURI, rootURI }, reason) {
  if (reason === APP_SHUTDOWN) {
    return;
  }

  await Zotero.AIAssistant?.hooks.onShutdown();

  if (chromeHandle) {
    chromeHandle.destruct();
    chromeHandle = null;
  }
}

async function uninstall(data, reason) {}
