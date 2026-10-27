"use strict";
(() => {
  // node_modules/zotero-plugin-toolkit/dist/chunk-Cl8Af3a2.js
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all) __defProp(target, name, {
      get: all[name],
      enumerable: true
    });
  };

  // node_modules/zotero-plugin-toolkit/dist/index.js
  var version = "5.1.0-beta.13";
  var DebugBridge = class DebugBridge2 {
    static version = 2;
    static passwordPref = "extensions.zotero.debug-bridge.password";
    get version() {
      return DebugBridge2.version;
    }
    _disableDebugBridgePassword;
    get disableDebugBridgePassword() {
      return this._disableDebugBridgePassword;
    }
    set disableDebugBridgePassword(value) {
      this._disableDebugBridgePassword = value;
    }
    get password() {
      return BasicTool.getZotero().Prefs.get(DebugBridge2.passwordPref, true);
    }
    set password(v) {
      BasicTool.getZotero().Prefs.set(DebugBridge2.passwordPref, v, true);
    }
    constructor() {
      this._disableDebugBridgePassword = false;
      this.initializeDebugBridge();
    }
    static setModule(instance) {
      if (!instance.debugBridge?.version || instance.debugBridge.version < DebugBridge2.version) instance.debugBridge = new DebugBridge2();
    }
    initializeDebugBridge() {
      const debugBridgeExtension = {
        noContent: true,
        doAction: async (uri) => {
          const Zotero$1 = BasicTool.getZotero();
          const window$1 = Zotero$1.getMainWindow();
          const uriString = uri.spec.split("//").pop();
          if (!uriString) return;
          const params = {};
          uriString.split("?").pop()?.split("&").forEach((p) => {
            params[p.split("=")[0]] = decodeURIComponent(p.split("=")[1]);
          });
          const skipPasswordCheck = toolkitGlobal_default.getInstance()?.debugBridge.disableDebugBridgePassword;
          let allowed = false;
          if (skipPasswordCheck) allowed = true;
          else if (typeof params.password === "undefined" && typeof this.password === "undefined") allowed = window$1.confirm(`External App ${params.app} wants to execute command without password.
Command:
${(params.run || params.file || "").slice(0, 100)}
If you do not know what it is, please click Cancel to deny.`);
          else allowed = this.password === params.password;
          if (allowed) {
            if (params.run) try {
              const AsyncFunction = Object.getPrototypeOf(async () => {
              }).constructor;
              const f = new AsyncFunction("Zotero,window", params.run);
              await f(Zotero$1, window$1);
            } catch (e) {
              Zotero$1.debug(e);
              window$1.console.log(e);
            }
            if (params.file) try {
              Services.scriptloader.loadSubScript(params.file, {
                Zotero: Zotero$1,
                window: window$1
              });
            } catch (e) {
              Zotero$1.debug(e);
              window$1.console.log(e);
            }
          }
        },
        newChannel(uri) {
          this.doAction(uri);
        }
      };
      Services.io.getProtocolHandler("zotero").wrappedJSObject._extensions["zotero://ztoolkit-debug"] = debugBridgeExtension;
    }
  };
  var PluginBridge = class PluginBridge2 {
    static version = 1;
    get version() {
      return PluginBridge2.version;
    }
    constructor() {
      this.initializePluginBridge();
    }
    static setModule(instance) {
      if (!instance.pluginBridge?.version || instance.pluginBridge.version < PluginBridge2.version) instance.pluginBridge = new PluginBridge2();
    }
    initializePluginBridge() {
      const { AddonManager } = _importESModule("resource://gre/modules/AddonManager.sys.mjs");
      const Zotero$1 = BasicTool.getZotero();
      const pluginBridgeExtension = {
        noContent: true,
        doAction: async (uri) => {
          try {
            const uriString = uri.spec.split("//").pop();
            if (!uriString) return;
            const params = {};
            uriString.split("?").pop()?.split("&").forEach((p) => {
              params[p.split("=")[0]] = decodeURIComponent(p.split("=")[1]);
            });
            if (params.action === "install" && params.url) {
              if (params.minVersion && Services.vc.compare(Zotero$1.version, params.minVersion) < 0 || params.maxVersion && Services.vc.compare(Zotero$1.version, params.maxVersion) > 0) throw new Error(`Plugin is not compatible with Zotero version ${Zotero$1.version}.The plugin requires Zotero version between ${params.minVersion} and ${params.maxVersion}.`);
              const addon2 = await AddonManager.getInstallForURL(params.url);
              if (addon2 && addon2.state === AddonManager.STATE_AVAILABLE) {
                addon2.install();
                hint("Plugin installed successfully.", true);
              } else throw new Error(`Plugin ${params.url} is not available.`);
            }
          } catch (e) {
            Zotero$1.logError(e);
            hint(e.message, false);
          }
        },
        newChannel(uri) {
          this.doAction(uri);
        }
      };
      Services.io.getProtocolHandler("zotero").wrappedJSObject._extensions["zotero://plugin"] = pluginBridgeExtension;
    }
  };
  function hint(content, success) {
    const progressWindow = new Zotero.ProgressWindow({ closeOnClick: true });
    progressWindow.changeHeadline("Plugin Toolkit");
    progressWindow.progress = new progressWindow.ItemProgress(success ? "chrome://zotero/skin/tick.png" : "chrome://zotero/skin/cross.png", content);
    progressWindow.progress.setProgress(100);
    progressWindow.show();
    progressWindow.startCloseTimer(5e3);
  }
  var ToolkitGlobal = class ToolkitGlobal2 {
    debugBridge;
    pluginBridge;
    prompt;
    currentWindow;
    constructor() {
      initializeModules(this);
      this.currentWindow = BasicTool.getZotero().getMainWindow();
    }
    /**
    * Get the global unique instance of `class ToolkitGlobal`.
    * @returns An instance of `ToolkitGlobal`.
    */
    static getInstance() {
      let _Zotero;
      try {
        if (typeof Zotero !== "undefined") _Zotero = Zotero;
        else _Zotero = BasicTool.getZotero();
      } catch {
      }
      if (!_Zotero) return void 0;
      let requireInit = false;
      if (!("_toolkitGlobal" in _Zotero)) {
        _Zotero._toolkitGlobal = new ToolkitGlobal2();
        requireInit = true;
      }
      const currentGlobal = _Zotero._toolkitGlobal;
      if (currentGlobal.currentWindow !== _Zotero.getMainWindow()) {
        checkWindowDependentModules(currentGlobal);
        requireInit = true;
      }
      if (requireInit) initializeModules(currentGlobal);
      return currentGlobal;
    }
  };
  function initializeModules(instance) {
    new BasicTool().log("Initializing ToolkitGlobal modules");
    setModule(instance, "prompt", {
      _ready: false,
      instance: void 0
    });
    DebugBridge.setModule(instance);
    PluginBridge.setModule(instance);
  }
  function setModule(instance, key, module) {
    if (!module) return;
    if (!instance[key]) instance[key] = module;
    for (const moduleKey in module) instance[key][moduleKey] ??= module[moduleKey];
  }
  function checkWindowDependentModules(instance) {
    instance.currentWindow = BasicTool.getZotero().getMainWindow();
    instance.prompt = void 0;
  }
  var toolkitGlobal_default = ToolkitGlobal;
  var BasicTool = class BasicTool2 {
    /**
    * configurations.
    */
    _basicOptions;
    _console;
    /**
    * @deprecated Use `patcherManager` instead.
    */
    patchSign = "zotero-plugin-toolkit@3.0.0";
    static _version = version;
    /**
    * Get version - checks subclass first, then falls back to parent
    */
    get _version() {
      return version;
    }
    get basicOptions() {
      return this._basicOptions;
    }
    /**
    *
    * @param data Pass an BasicTool instance to copy its options.
    */
    constructor(data) {
      this._basicOptions = {
        log: {
          _type: "toolkitlog",
          disableConsole: false,
          disableZLog: false,
          prefix: ""
        },
        get debug() {
          if (this._debug) return this._debug;
          this._debug = toolkitGlobal_default.getInstance()?.debugBridge || {
            disableDebugBridgePassword: false,
            password: ""
          };
          return this._debug;
        },
        api: { pluginID: "zotero-plugin-toolkit@windingwind.com" },
        listeners: {
          callbacks: {
            onMainWindowLoad: /* @__PURE__ */ new Set(),
            onMainWindowUnload: /* @__PURE__ */ new Set(),
            onPluginUnload: /* @__PURE__ */ new Set()
          },
          _mainWindow: void 0,
          _plugin: void 0
        }
      };
      try {
        if (typeof globalThis.ChromeUtils?.importESModule !== "undefined" || typeof globalThis.ChromeUtils?.import !== "undefined") {
          const { ConsoleAPI } = _importESModule("resource://gre/modules/Console.sys.mjs");
          this._console = new ConsoleAPI({ consoleID: `${this._basicOptions.api.pluginID}-${Date.now()}` });
        }
      } catch {
      }
      this.updateOptions(data);
    }
    getGlobal(k) {
      if (typeof globalThis[k] !== "undefined") return globalThis[k];
      const _Zotero = BasicTool2.getZotero();
      try {
        const window$1 = _Zotero.getMainWindow();
        switch (k) {
          case "Zotero":
          case "zotero":
            return _Zotero;
          case "window":
            return window$1;
          case "windows":
            return _Zotero.getMainWindows();
          case "document":
            return window$1.document;
          case "ZoteroPane":
          case "ZoteroPane_Local":
            return _Zotero.getActiveZoteroPane();
          default:
            return window$1[k];
        }
      } catch (e) {
        Zotero.logError(e);
      }
    }
    /**
    * If it's an XUL element
    * @param elem
    */
    isXULElement(elem) {
      return elem.namespaceURI === "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
    }
    /**
    * Create an XUL element
    *
    * For Zotero 6, use `createElementNS`;
    *
    * For Zotero 7+, use `createXULElement`.
    * @param doc
    * @param type
    * @example
    * Create a `<menuitem>`:
    * ```ts
    * const compat = new ZoteroCompat();
    * const doc = compat.getWindow().document;
    * const elem = compat.createXULElement(doc, "menuitem");
    * ```
    */
    createXULElement(doc, type) {
      return doc.createXULElement(type);
    }
    /**
    * Output to both Zotero.debug and console.log
    * @param data e.g. string, number, object, ...
    */
    log(...data) {
      if (data.length === 0) return;
      let _Zotero;
      try {
        if (typeof Zotero !== "undefined") _Zotero = Zotero;
        else _Zotero = BasicTool2.getZotero();
      } catch {
      }
      let options;
      if (data[data.length - 1]?._type === "toolkitlog") options = data.pop();
      else options = this._basicOptions.log;
      try {
        if (options.prefix) data.splice(0, 0, options.prefix);
        if (!options.disableConsole) {
          let _console;
          if (typeof console !== "undefined") _console = console;
          else if (_Zotero) _console = _Zotero.getMainWindow()?.console;
          if (!_console) {
            if (!this._console) return;
            _console = this._console;
          }
          if (_console.groupCollapsed) _console.groupCollapsed(...data);
          else _console.group(...data);
          _console.trace();
          _console.groupEnd();
        }
        if (!options.disableZLog) {
          if (typeof _Zotero === "undefined") return;
          _Zotero.debug(data.map((d) => {
            try {
              return typeof d === "object" ? JSON.stringify(d) : String(d);
            } catch {
              _Zotero.debug(d);
              return "";
            }
          }).join("\n"));
        }
      } catch (e) {
        if (_Zotero) Zotero.logError(e);
        else console.error(e);
      }
    }
    /**
    * Patch a function
    * @deprecated Use {@link PatchHelper} instead.
    * @param object The owner of the function
    * @param funcSign The signature of the function(function name)
    * @param ownerSign The signature of patch owner to avoid patching again
    * @param patcher The new wrapper of the patched function
    */
    patch(object, funcSign, ownerSign, patcher) {
      if (object[funcSign][ownerSign]) throw new Error(`${String(funcSign)} re-patched`);
      this.log("patching", funcSign, `by ${ownerSign}`);
      object[funcSign] = patcher(object[funcSign]);
      object[funcSign][ownerSign] = true;
    }
    /**
    * Add a Zotero event listener callback
    * @param type Event type
    * @param callback Event callback
    */
    addListenerCallback(type, callback) {
      if (["onMainWindowLoad", "onMainWindowUnload"].includes(type)) this._ensureMainWindowListener();
      if (type === "onPluginUnload") this._ensurePluginListener();
      this._basicOptions.listeners.callbacks[type].add(callback);
    }
    /**
    * Remove a Zotero event listener callback
    * @param type Event type
    * @param callback Event callback
    */
    removeListenerCallback(type, callback) {
      this._basicOptions.listeners.callbacks[type].delete(callback);
      this._ensureRemoveListener();
    }
    /**
    * Remove all Zotero event listener callbacks when the last callback is removed.
    */
    _ensureRemoveListener() {
      const { listeners } = this._basicOptions;
      if (listeners._mainWindow && listeners.callbacks.onMainWindowLoad.size === 0 && listeners.callbacks.onMainWindowUnload.size === 0) {
        Services.wm.removeListener(listeners._mainWindow);
        delete listeners._mainWindow;
      }
      if (listeners._plugin && listeners.callbacks.onPluginUnload.size === 0) {
        Zotero.Plugins.removeObserver(listeners._plugin);
        delete listeners._plugin;
      }
    }
    /**
    * Ensure the main window listener is registered.
    */
    _ensureMainWindowListener() {
      if (this._basicOptions.listeners._mainWindow) return;
      const mainWindowListener = {
        onOpenWindow: (xulWindow) => {
          const domWindow = xulWindow.docShell.domWindow;
          const onload = async () => {
            domWindow.removeEventListener("load", onload, false);
            if (domWindow.location.href !== "chrome://zotero/content/zoteroPane.xhtml") return;
            for (const cbk of this._basicOptions.listeners.callbacks.onMainWindowLoad) try {
              cbk(domWindow);
            } catch (e) {
              this.log(e);
            }
          };
          domWindow.addEventListener("load", () => onload(), false);
        },
        onCloseWindow: async (xulWindow) => {
          const domWindow = xulWindow.docShell.domWindow;
          if (domWindow.location.href !== "chrome://zotero/content/zoteroPane.xhtml") return;
          for (const cbk of this._basicOptions.listeners.callbacks.onMainWindowUnload) try {
            cbk(domWindow);
          } catch (e) {
            this.log(e);
          }
        }
      };
      this._basicOptions.listeners._mainWindow = mainWindowListener;
      Services.wm.addListener(mainWindowListener);
    }
    /**
    * Ensure the plugin listener is registered.
    */
    _ensurePluginListener() {
      if (this._basicOptions.listeners._plugin) return;
      const pluginListener = { shutdown: (...args) => {
        for (const cbk of this._basicOptions.listeners.callbacks.onPluginUnload) try {
          cbk(...args);
        } catch (e) {
          this.log(e);
        }
      } };
      this._basicOptions.listeners._plugin = pluginListener;
      Zotero.Plugins.addObserver(pluginListener);
    }
    updateOptions(source) {
      if (!source) return this;
      if (source instanceof BasicTool2) this._basicOptions = source._basicOptions;
      else this._basicOptions = source;
      return this;
    }
    static getZotero() {
      if (typeof Zotero !== "undefined") return Zotero;
      const { Zotero: _Zotero } = ChromeUtils.importESModule("chrome://zotero/content/zotero.mjs");
      return _Zotero;
    }
  };
  var ManagerTool = class extends BasicTool {
    _ensureAutoUnregisterAll() {
      this.addListenerCallback("onPluginUnload", (params, _reason) => {
        if (params.id !== this.basicOptions.api.pluginID) return;
        this.unregisterAll();
      });
    }
  };
  function unregister(tools) {
    Object.values(tools).forEach((tool) => {
      if (tool instanceof ManagerTool || typeof tool?.unregisterAll === "function") tool.unregisterAll();
    });
  }
  function makeHelperTool(cls, options) {
    return new Proxy(cls, { construct(target, args) {
      const _origin = new cls(...args);
      if (_origin instanceof BasicTool) _origin.updateOptions(options);
      else _origin._version = BasicTool._version;
      return _origin;
    } });
  }
  function _importESModule(path) {
    if (typeof ChromeUtils.import === "undefined") return ChromeUtils.importESModule(path, { global: "contextual" });
    if (path.endsWith(".sys.mjs")) path = path.replace(/\.sys\.mjs$/, ".jsm");
    return ChromeUtils.import(path);
  }
  var ClipboardHelper = class extends BasicTool {
    transferable;
    clipboardService;
    filePath = "";
    constructor() {
      super();
      this.transferable = Components.classes["@mozilla.org/widget/transferable;1"].createInstance(Components.interfaces.nsITransferable);
      this.clipboardService = Components.classes["@mozilla.org/widget/clipboard;1"].getService(Components.interfaces.nsIClipboard);
      this.transferable.init(null);
    }
    addText(source, type = "text/plain") {
      const str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
      str.data = source;
      if (type === "text/unicode") type = "text/plain";
      this.transferable.addDataFlavor(type);
      this.transferable.setTransferData(type, str, source.length * 2);
      return this;
    }
    addImage(source) {
      const parts = source.split(",");
      if (!parts[0].includes("base64")) return this;
      const mime = parts[0].match(/:(.*?);/)[1];
      const bstr = this.getGlobal("window").atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      const imgTools = Components.classes["@mozilla.org/image/tools;1"].getService(Components.interfaces.imgITools);
      let mimeType;
      let img;
      if (this.getGlobal("Zotero").platformMajorVersion >= 102) {
        img = imgTools.decodeImageFromArrayBuffer(u8arr.buffer, mime);
        mimeType = "application/x-moz-nativeimage";
      } else {
        mimeType = `image/png`;
        img = Components.classes["@mozilla.org/supports-interface-pointer;1"].createInstance(Components.interfaces.nsISupportsInterfacePointer);
        img.data = imgTools.decodeImageFromArrayBuffer(u8arr.buffer, mimeType);
      }
      this.transferable.addDataFlavor(mimeType);
      this.transferable.setTransferData(mimeType, img, 0);
      return this;
    }
    addFile(path) {
      const file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsIFile);
      file.initWithPath(path);
      this.transferable.addDataFlavor("application/x-moz-file");
      this.transferable.setTransferData("application/x-moz-file", file);
      this.filePath = path;
      return this;
    }
    copy() {
      try {
        this.clipboardService.setData(this.transferable, null, Components.interfaces.nsIClipboard.kGlobalClipboard);
      } catch (e) {
        if (this.filePath && Zotero.isMac) Zotero.Utilities.Internal.exec(`/usr/bin/osascript`, [`-e`, `set the clipboard to POSIX file "${this.filePath}"`]);
        else throw e;
      }
      return this;
    }
  };
  var UITool = class extends BasicTool {
    get basicOptions() {
      return this._basicOptions;
    }
    /**
    * Store elements created with this instance
    *
    * @remarks
    * > What is this for?
    *
    * In bootstrap plugins, elements must be manually maintained and removed on exiting.
    *
    * This API does this for you.
    */
    elementCache;
    constructor(base) {
      super(base);
      this.elementCache = [];
      if (!this._basicOptions.ui) this._basicOptions.ui = {
        enableElementRecord: true,
        enableElementJSONLog: false,
        enableElementDOMLog: true
      };
    }
    /**
    * Remove all elements created by `createElement`.
    *
    * @remarks
    * > What is this for?
    *
    * In bootstrap plugins, elements must be manually maintained and removed on exiting.
    *
    * This API does this for you.
    */
    unregisterAll() {
      this.elementCache.forEach((e) => {
        try {
          e?.deref()?.remove();
        } catch (e$1) {
          this.log(e$1);
        }
      });
    }
    createElement(...args) {
      const doc = args[0];
      const tagName = args[1].toLowerCase();
      let props = args[2] || {};
      if (!tagName) return;
      if (typeof args[2] === "string") props = {
        namespace: args[2],
        enableElementRecord: args[3]
      };
      if (typeof props.enableElementJSONLog !== "undefined" && props.enableElementJSONLog || this.basicOptions.ui.enableElementJSONLog) this.log(props);
      props.properties = props.properties || props.directAttributes;
      props.children = props.children || props.subElementOptions;
      let elem;
      if (tagName === "fragment") {
        const fragElem = doc.createDocumentFragment();
        elem = fragElem;
      } else {
        let realElem = props.id && (props.checkExistenceParent ? props.checkExistenceParent : doc).querySelector(`#${props.id}`);
        if (realElem && props.ignoreIfExists) return realElem;
        if (realElem && props.removeIfExists) {
          realElem.remove();
          realElem = void 0;
        }
        if (props.customCheck && !props.customCheck(doc, props)) return void 0;
        if (!realElem || !props.skipIfExists) {
          let namespace = props.namespace;
          if (!namespace) {
            const mightHTML = HTMLElementTagNames.includes(tagName);
            const mightXUL = XULElementTagNames.includes(tagName);
            const mightSVG = SVGElementTagNames.includes(tagName);
            if (Number(mightHTML) + Number(mightXUL) + Number(mightSVG) > 1) this.log(`[Warning] Creating element ${tagName} with no namespace specified. Found multiply namespace matches.`);
            if (mightHTML) namespace = "html";
            else if (mightXUL) namespace = "xul";
            else if (mightSVG) namespace = "svg";
            else namespace = "html";
          }
          if (namespace === "xul") realElem = this.createXULElement(doc, tagName);
          else realElem = doc.createElementNS({
            html: "http://www.w3.org/1999/xhtml",
            svg: "http://www.w3.org/2000/svg"
          }[namespace], tagName);
          if (typeof props.enableElementRecord !== "undefined" ? props.enableElementRecord : this.basicOptions.ui.enableElementRecord) this.elementCache.push(new WeakRef(realElem));
        }
        if (props.id) realElem.id = props.id;
        if (props.styles && Object.keys(props.styles).length) Object.keys(props.styles).forEach((k) => {
          const v = props.styles[k];
          typeof v !== "undefined" && (realElem.style[k] = v);
        });
        if (props.properties && Object.keys(props.properties).length) Object.keys(props.properties).forEach((k) => {
          const v = props.properties[k];
          typeof v !== "undefined" && (realElem[k] = v);
        });
        if (props.attributes && Object.keys(props.attributes).length) Object.keys(props.attributes).forEach((k) => {
          const v = props.attributes[k];
          typeof v !== "undefined" && realElem.setAttribute(k, String(v));
        });
        if (props.classList?.length) realElem.classList.add(...props.classList);
        if (props.listeners?.length) props.listeners.forEach(({ type, listener, options }) => {
          listener && realElem.addEventListener(type, listener, options);
        });
        elem = realElem;
      }
      if (props.children?.length) {
        const subElements = props.children.map((childProps) => {
          childProps.namespace = childProps.namespace || props.namespace;
          return this.createElement(doc, childProps.tag, childProps);
        }).filter((e) => e);
        elem.append(...subElements);
      }
      if (typeof props.enableElementDOMLog !== "undefined" ? props.enableElementDOMLog : this.basicOptions.ui.enableElementDOMLog) this.log(elem);
      return elem;
    }
    /**
    * Append element(s) to a node.
    * @param properties See {@link ElementProps}
    * @param container The parent node to append to.
    * @returns A Node that is the appended child (aChild),
    *          except when aChild is a DocumentFragment,
    *          in which case the empty DocumentFragment is returned.
    */
    appendElement(properties, container) {
      return container.appendChild(this.createElement(container.ownerDocument, properties.tag, properties));
    }
    /**
    * Inserts a node before a reference node as a child of its parent node.
    * @param properties See {@link ElementProps}
    * @param referenceNode The node before which newNode is inserted.
    * @returns Node
    */
    insertElementBefore(properties, referenceNode) {
      if (referenceNode.parentNode) return referenceNode.parentNode.insertBefore(this.createElement(referenceNode.ownerDocument, properties.tag, properties), referenceNode);
      else this.log(`${referenceNode.tagName} has no parent, cannot insert ${properties.tag}`);
    }
    /**
    * Replace oldNode with a new one.
    * @param properties See {@link ElementProps}
    * @param oldNode The child to be replaced.
    * @returns The replaced Node. This is the same node as oldChild.
    */
    replaceElement(properties, oldNode) {
      if (oldNode.parentNode) return oldNode.parentNode.replaceChild(this.createElement(oldNode.ownerDocument, properties.tag, properties), oldNode);
      else this.log(`${oldNode.tagName} has no parent, cannot replace it with ${properties.tag}`);
    }
    /**
    * Parse XHTML to XUL fragment. For Zotero 6.
    *
    * To load preferences from a Zotero 7's `.xhtml`, use this method to parse it.
    * @param str xhtml raw text
    * @param entities dtd file list ("chrome://xxx.dtd")
    * @param defaultXUL true for default XUL namespace
    */
    parseXHTMLToFragment(str, entities = [], defaultXUL = true) {
      const parser = new DOMParser();
      const xulns = "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul";
      const htmlns = "http://www.w3.org/1999/xhtml";
      const wrappedStr = `${entities.length ? `<!DOCTYPE bindings [ ${entities.reduce((preamble, url, index) => {
        return `${preamble}<!ENTITY % _dtd-${index} SYSTEM "${url}"> %_dtd-${index}; `;
      }, "")}]>` : ""}
      <html:div xmlns="${defaultXUL ? xulns : htmlns}"
          xmlns:xul="${xulns}" xmlns:html="${htmlns}">
      ${str}
      </html:div>`;
      this.log(wrappedStr, parser);
      const doc = parser.parseFromString(wrappedStr, "text/xml");
      this.log(doc);
      if (doc.documentElement.localName === "parsererror") throw new Error("not well-formed XHTML");
      const range = doc.createRange();
      range.selectNodeContents(doc.querySelector("div"));
      return range.extractContents();
    }
  };
  var HTMLElementTagNames = [
    "a",
    "abbr",
    "address",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "base",
    "bdi",
    "bdo",
    "blockquote",
    "body",
    "br",
    "button",
    "canvas",
    "caption",
    "cite",
    "code",
    "col",
    "colgroup",
    "data",
    "datalist",
    "dd",
    "del",
    "details",
    "dfn",
    "dialog",
    "div",
    "dl",
    "dt",
    "em",
    "embed",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "iframe",
    "img",
    "input",
    "ins",
    "kbd",
    "label",
    "legend",
    "li",
    "link",
    "main",
    "map",
    "mark",
    "menu",
    "meta",
    "meter",
    "nav",
    "noscript",
    "object",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "picture",
    "pre",
    "progress",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "script",
    "section",
    "select",
    "slot",
    "small",
    "source",
    "span",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "template",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "title",
    "tr",
    "track",
    "u",
    "ul",
    "var",
    "video",
    "wbr"
  ];
  var XULElementTagNames = [
    "action",
    "arrowscrollbox",
    "bbox",
    "binding",
    "bindings",
    "box",
    "broadcaster",
    "broadcasterset",
    "button",
    "browser",
    "checkbox",
    "caption",
    "colorpicker",
    "column",
    "columns",
    "commandset",
    "command",
    "conditions",
    "content",
    "deck",
    "description",
    "dialog",
    "dialogheader",
    "editor",
    "grid",
    "grippy",
    "groupbox",
    "hbox",
    "iframe",
    "image",
    "key",
    "keyset",
    "label",
    "listbox",
    "listcell",
    "listcol",
    "listcols",
    "listhead",
    "listheader",
    "listitem",
    "member",
    "menu",
    "menubar",
    "menuitem",
    "menulist",
    "menupopup",
    "menuseparator",
    "observes",
    "overlay",
    "page",
    "popup",
    "popupset",
    "preference",
    "preferences",
    "prefpane",
    "prefwindow",
    "progressmeter",
    "radio",
    "radiogroup",
    "resizer",
    "richlistbox",
    "richlistitem",
    "row",
    "rows",
    "rule",
    "script",
    "scrollbar",
    "scrollbox",
    "scrollcorner",
    "separator",
    "spacer",
    "splitter",
    "stack",
    "statusbar",
    "statusbarpanel",
    "stringbundle",
    "stringbundleset",
    "tab",
    "tabbrowser",
    "tabbox",
    "tabpanel",
    "tabpanels",
    "tabs",
    "template",
    "textnode",
    "textbox",
    "titlebar",
    "toolbar",
    "toolbarbutton",
    "toolbargrippy",
    "toolbaritem",
    "toolbarpalette",
    "toolbarseparator",
    "toolbarset",
    "toolbarspacer",
    "toolbarspring",
    "toolbox",
    "tooltip",
    "tree",
    "treecell",
    "treechildren",
    "treecol",
    "treecols",
    "treeitem",
    "treerow",
    "treeseparator",
    "triple",
    "vbox",
    "window",
    "wizard",
    "wizardpage"
  ];
  var SVGElementTagNames = [
    "a",
    "animate",
    "animateMotion",
    "animateTransform",
    "circle",
    "clipPath",
    "defs",
    "desc",
    "ellipse",
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feDropShadow",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence",
    "filter",
    "foreignObject",
    "g",
    "image",
    "line",
    "linearGradient",
    "marker",
    "mask",
    "metadata",
    "mpath",
    "path",
    "pattern",
    "polygon",
    "polyline",
    "radialGradient",
    "rect",
    "script",
    "set",
    "stop",
    "style",
    "svg",
    "switch",
    "symbol",
    "text",
    "textPath",
    "title",
    "tspan",
    "use",
    "view"
  ];
  var DialogHelper = class extends UITool {
    /**
    * Passed to dialog window for data-binding and lifecycle controls. See {@link DialogHelper.setDialogData}
    */
    dialogData;
    /**
    * Dialog window instance
    */
    window;
    elementProps;
    /**
    * Create a dialog helper with row \* column grids.
    * @param row
    * @param column
    */
    constructor(row, column) {
      super();
      if (row <= 0 || column <= 0) throw new Error(`row and column must be positive integers.`);
      this.elementProps = {
        tag: "vbox",
        attributes: { flex: 1 },
        styles: {
          width: "100%",
          height: "100%"
        },
        children: []
      };
      for (let i = 0; i < Math.max(row, 1); i++) {
        this.elementProps.children.push({
          tag: "hbox",
          attributes: { flex: 1 },
          children: []
        });
        for (let j = 0; j < Math.max(column, 1); j++) this.elementProps.children[i].children.push({
          tag: "vbox",
          attributes: { flex: 1 },
          children: []
        });
      }
      this.elementProps.children.push({
        tag: "hbox",
        attributes: {
          flex: 0,
          pack: "end"
        },
        children: []
      });
      this.dialogData = {};
    }
    /**
    * Add a cell at (row, column). Index starts from 0.
    * @param row
    * @param column
    * @param elementProps Cell element props. See {@link ElementProps}
    * @param cellFlex If the cell is flex. Default true.
    */
    addCell(row, column, elementProps, cellFlex = true) {
      if (row >= this.elementProps.children.length || column >= this.elementProps.children[row].children.length) throw new Error(`Cell index (${row}, ${column}) is invalid, maximum (${this.elementProps.children.length}, ${this.elementProps.children[0].children.length})`);
      this.elementProps.children[row].children[column].children = [elementProps];
      this.elementProps.children[row].children[column].attributes.flex = cellFlex ? 1 : 0;
      return this;
    }
    /**
    * Add a control button to the bottom of the dialog.
    * @param label Button label
    * @param id Button id.
    * The corresponding id of the last button user clicks before window exit will be set to `dialogData._lastButtonId`.
    * @param options Options
    * @param [options.noClose] Don't close window when clicking this button.
    * @param [options.callback] Callback of button click event.
    */
    addButton(label, id, options = {}) {
      id = id || `btn-${Zotero.Utilities.randomString()}-${(/* @__PURE__ */ new Date()).getTime()}`;
      this.elementProps.children[this.elementProps.children.length - 1].children.push({
        tag: "vbox",
        styles: { margin: "10px" },
        children: [{
          tag: "button",
          namespace: "html",
          id,
          attributes: {
            type: "button",
            "data-l10n-id": label
          },
          properties: { innerHTML: label },
          listeners: [{
            type: "click",
            listener: (e) => {
              this.dialogData._lastButtonId = id;
              if (options.callback) options.callback(e);
              if (!options.noClose) this.window.close();
            }
          }]
        }]
      });
      return this;
    }
    /**
    * Dialog data.
    * @remarks
    * This object is passed to the dialog window.
    *
    * The control button id is in `dialogData._lastButtonId`;
    *
    * The data-binding values are in `dialogData`.
    * ```ts
    * interface DialogData {
    *   [key: string | number | symbol]: any;
    *   loadLock?: { promise: Promise<void>; resolve: () => void; isResolved: () => boolean }; // resolve after window load (auto-generated)
    *   loadCallback?: Function; // called after window load
    *   unloadLock?: { promise: Promise<void>; resolve: () => void }; // resolve after window unload (auto-generated)
    *   unloadCallback?: Function; // called after window unload
    *   beforeUnloadCallback?: Function; // called before window unload when elements are accessable.
    * }
    * ```
    * @param dialogData
    */
    setDialogData(dialogData) {
      this.dialogData = dialogData;
      return this;
    }
    /**
    * Open the dialog
    * @param title Window title
    * @param windowFeatures
    * @param windowFeatures.width Ignored if fitContent is `true`.
    * @param windowFeatures.height Ignored if fitContent is `true`.
    * @param windowFeatures.left
    * @param windowFeatures.top
    * @param windowFeatures.centerscreen Open window at the center of screen.
    * @param windowFeatures.resizable If window is resizable.
    * @param windowFeatures.fitContent Resize the window to content size after elements are loaded.
    * @param windowFeatures.noDialogMode Dialog mode window only has a close button. Set `true` to make maximize and minimize button visible.
    * @param windowFeatures.alwaysRaised Is the window always at the top.
    */
    open(title, windowFeatures = {
      centerscreen: true,
      resizable: true,
      fitContent: true
    }) {
      this.window = openDialog(this, `dialog-${Zotero.Utilities.randomString()}-${(/* @__PURE__ */ new Date()).getTime()}`, title, this.elementProps, this.dialogData, windowFeatures);
      return this;
    }
  };
  function openDialog(dialogHelper, targetId, title, elementProps, dialogData, windowFeatures = {
    centerscreen: true,
    resizable: true,
    fitContent: true
  }) {
    dialogData = dialogData || {};
    if (!dialogData.loadLock) {
      let loadResolve;
      let isLoadResolved = false;
      const loadPromise = new Promise((resolve) => {
        loadResolve = resolve;
      });
      loadPromise.then(() => {
        isLoadResolved = true;
      });
      dialogData.loadLock = {
        promise: loadPromise,
        resolve: loadResolve,
        isResolved: () => isLoadResolved
      };
    }
    if (!dialogData.unloadLock) {
      let unloadResolve;
      const unloadPromise = new Promise((resolve) => {
        unloadResolve = resolve;
      });
      dialogData.unloadLock = {
        promise: unloadPromise,
        resolve: unloadResolve
      };
    }
    let featureString = `resizable=${windowFeatures.resizable ? "yes" : "no"},`;
    if (windowFeatures.width || windowFeatures.height) featureString += `width=${windowFeatures.width || 100},height=${windowFeatures.height || 100},`;
    if (windowFeatures.left) featureString += `left=${windowFeatures.left},`;
    if (windowFeatures.top) featureString += `top=${windowFeatures.top},`;
    if (windowFeatures.centerscreen) featureString += "centerscreen,";
    if (windowFeatures.noDialogMode) featureString += "dialog=no,";
    if (windowFeatures.alwaysRaised) featureString += "alwaysRaised=yes,";
    const win = dialogHelper.getGlobal("openDialog")("about:blank", targetId || "_blank", featureString, dialogData);
    dialogData.loadLock?.promise.then(() => {
      win.document.head.appendChild(dialogHelper.createElement(win.document, "title", {
        properties: { innerText: title },
        attributes: { "data-l10n-id": title }
      }));
      let l10nFiles = dialogData.l10nFiles || [];
      if (typeof l10nFiles === "string") l10nFiles = [l10nFiles];
      l10nFiles.forEach((file) => {
        win.document.head.appendChild(dialogHelper.createElement(win.document, "link", { properties: {
          rel: "localization",
          href: file
        } }));
      });
      dialogHelper.appendElement({
        tag: "fragment",
        children: [
          {
            tag: "style",
            properties: { innerHTML: style }
          },
          {
            tag: "link",
            properties: {
              rel: "stylesheet",
              href: "chrome://global/skin/global.css"
            }
          },
          {
            tag: "link",
            properties: {
              rel: "stylesheet",
              href: "chrome://zotero-platform/content/zotero.css"
            }
          }
        ]
      }, win.document.head);
      replaceElement(elementProps, dialogHelper);
      win.document.body.appendChild(dialogHelper.createElement(win.document, "fragment", { children: [elementProps] }));
      Array.from(win.document.querySelectorAll("*[data-bind]")).forEach((elem) => {
        const bindKey = elem.getAttribute("data-bind");
        const bindAttr = elem.getAttribute("data-attr");
        const bindProp = elem.getAttribute("data-prop");
        if (bindKey && dialogData && dialogData[bindKey]) if (bindProp) elem[bindProp] = dialogData[bindKey];
        else elem.setAttribute(bindAttr || "value", dialogData[bindKey]);
      });
      if (windowFeatures.fitContent) setTimeout(() => {
        win.sizeToContent();
      }, 300);
      win.focus();
    }).then(() => {
      dialogData?.loadCallback && dialogData.loadCallback();
    });
    dialogData.unloadLock?.promise.then(() => {
      dialogData?.unloadCallback && dialogData.unloadCallback();
    });
    win.addEventListener("DOMContentLoaded", function onWindowLoad(_ev) {
      win.arguments[0]?.loadLock?.resolve();
      win.removeEventListener("DOMContentLoaded", onWindowLoad, false);
    }, false);
    win.addEventListener("beforeunload", function onWindowBeforeUnload(_ev) {
      Array.from(win.document.querySelectorAll("*[data-bind]")).forEach((elem) => {
        const dialogData$1 = this.window.arguments[0];
        const bindKey = elem.getAttribute("data-bind");
        const bindAttr = elem.getAttribute("data-attr");
        const bindProp = elem.getAttribute("data-prop");
        if (bindKey && dialogData$1) if (bindProp) dialogData$1[bindKey] = elem[bindProp];
        else dialogData$1[bindKey] = elem.getAttribute(bindAttr || "value");
      });
      this.window.removeEventListener("beforeunload", onWindowBeforeUnload, false);
      dialogData?.beforeUnloadCallback && dialogData.beforeUnloadCallback();
    });
    win.addEventListener("unload", function onWindowUnload(_ev) {
      if (!this.window.arguments[0]?.loadLock?.isResolved()) return;
      this.window.arguments[0]?.unloadLock?.resolve();
      this.window.removeEventListener("unload", onWindowUnload, false);
    });
    if (win.document.readyState === "complete") win.arguments[0]?.loadLock?.resolve();
    return win;
  }
  function replaceElement(elementProps, uiTool) {
    let checkChildren = true;
    if (elementProps.tag === "select") {
      let is140 = false;
      try {
        is140 = Number.parseInt(Services.appinfo.platformVersion.match(/^\d+/)[0]) >= 140;
      } catch {
        is140 = false;
      }
      if (!is140) {
        checkChildren = false;
        const customSelectProps = {
          tag: "div",
          classList: ["dropdown"],
          listeners: [{
            type: "mouseleave",
            listener: (ev) => {
              const select = ev.target.querySelector("select");
              select?.blur();
            }
          }],
          children: [Object.assign({}, elementProps, {
            tag: "select",
            listeners: [{
              type: "focus",
              listener: (ev) => {
                const select = ev.target;
                const dropdown = select.parentElement?.querySelector(".dropdown-content");
                dropdown && (dropdown.style.display = "block");
                select.setAttribute("focus", "true");
              }
            }, {
              type: "blur",
              listener: (ev) => {
                const select = ev.target;
                const dropdown = select.parentElement?.querySelector(".dropdown-content");
                dropdown && (dropdown.style.display = "none");
                select.removeAttribute("focus");
              }
            }]
          }), {
            tag: "div",
            classList: ["dropdown-content"],
            children: elementProps.children?.map((option) => ({
              tag: "p",
              attributes: { value: option.properties?.value },
              properties: { innerHTML: option.properties?.innerHTML || option.properties?.textContent },
              classList: ["dropdown-item"],
              listeners: [{
                type: "click",
                listener: (ev) => {
                  const select = ev.target.parentElement?.previousElementSibling;
                  select && (select.value = ev.target.getAttribute("value") || "");
                  select?.blur();
                }
              }]
            }))
          }]
        };
        for (const key in elementProps) delete elementProps[key];
        Object.assign(elementProps, customSelectProps);
      } else {
        const children = elementProps.children || [];
        const randomString = CSS.escape(`${Zotero.Utilities.randomString()}-${(/* @__PURE__ */ new Date()).getTime()}`);
        if (!elementProps.id) elementProps.id = `select-${randomString}`;
        const selectId = elementProps.id;
        const popupId = `popup-${randomString}`;
        const popup = uiTool.appendElement({
          tag: "menupopup",
          namespace: "xul",
          id: popupId,
          children: children.map((option) => ({
            tag: "menuitem",
            attributes: {
              value: option.properties?.value,
              label: option.properties?.innerHTML || option.properties?.textContent
            }
          })),
          listeners: [{
            type: "command",
            listener: (ev) => {
              if (ev.target?.tagName !== "menuitem") return;
              const select = uiTool.window.document.getElementById(selectId);
              const menuitem = ev.target;
              if (select) {
                select.value = menuitem.getAttribute("value") || "";
                select.blur();
              }
              popup.hidePopup();
            }
          }]
        }, uiTool.window.document.body);
        if (!elementProps.listeners) elementProps.listeners = [];
        elementProps.listeners.push(...[{
          type: "click",
          listener: (ev) => {
            const select = ev.target;
            const rect = select.getBoundingClientRect();
            let left = rect.left + uiTool.window.scrollX;
            let top = rect.bottom + uiTool.window.scrollY;
            if (uiTool.getGlobal("Zotero").isMac) {
              left += uiTool.window.screenLeft;
              top += uiTool.window.screenTop + rect.height;
            }
            fixMenuPopup(popup, uiTool);
            popup.openPopup(null, "", left, top, false, false);
            select.setAttribute("focus", "true");
          }
        }]);
      }
    } else if (elementProps.tag === "a") {
      const href = elementProps?.properties?.href || "";
      elementProps.properties ??= {};
      elementProps.properties.href = "javascript:void(0);";
      elementProps.attributes ??= {};
      elementProps.attributes["zotero-href"] = href;
      elementProps.listeners ??= [];
      elementProps.listeners.push({
        type: "click",
        listener: (ev) => {
          const href$1 = ev.target?.getAttribute("zotero-href");
          href$1 && uiTool.getGlobal("Zotero").launchURL(href$1);
        }
      });
      elementProps.classList ??= [];
      elementProps.classList.push("zotero-text-link");
    }
    if (checkChildren) elementProps.children?.forEach((child) => replaceElement(child, uiTool));
  }
  var style = `
html {
  color-scheme: light dark;
}
.zotero-text-link {
  -moz-user-focus: normal;
  color: -moz-nativehyperlinktext;
  text-decoration: underline;
  border: 1px solid transparent;
  cursor: pointer;
}
.dropdown {
  position: relative;
  display: inline-block;
}
.dropdown-content {
  display: none;
  position: absolute;
  background-color: var(--material-toolbar);
  min-width: 160px;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.5);
  border-radius: 5px;
  padding: 5px 0 5px 0;
  z-index: 999;
}
.dropdown-item {
  margin: 0px;
  padding: 5px 10px 5px 10px;
}
.dropdown-item:hover {
  background-color: var(--fill-quinary);
}
`;
  function fixMenuPopup(popup, uiTool) {
    for (const item of popup.querySelectorAll("menuitem")) if (!item.innerHTML) uiTool.appendElement({
      tag: "fragment",
      children: [
        {
          tag: "image",
          namespace: "xul",
          classList: ["menu-icon"],
          attributes: { "aria-hidden": "true" }
        },
        {
          tag: "label",
          namespace: "xul",
          classList: ["menu-text"],
          properties: { value: item.getAttribute("label") || "" },
          attributes: {
            crop: "end",
            "aria-hidden": "true"
          }
        },
        {
          tag: "label",
          namespace: "xul",
          classList: ["menu-highlightable-text"],
          properties: { textContent: item.getAttribute("label") || "" },
          attributes: {
            crop: "end",
            "aria-hidden": "true"
          }
        },
        {
          tag: "label",
          namespace: "xul",
          classList: ["menu-accel"],
          attributes: { "aria-hidden": "true" }
        }
      ]
    }, item);
  }
  var FilePickerHelper = class extends BasicTool {
    title;
    mode;
    filters;
    suggestion;
    directory;
    window;
    filterMask;
    constructor(title, mode, filters, suggestion, window$1, filterMask, directory) {
      super();
      this.title = title;
      this.mode = mode;
      this.filters = filters;
      this.suggestion = suggestion;
      this.directory = directory;
      this.window = window$1;
      this.filterMask = filterMask;
    }
    async open() {
      const Backend = ChromeUtils.importESModule("chrome://zotero/content/modules/filePicker.mjs").FilePicker;
      const fp = new Backend();
      fp.init(this.window || this.getGlobal("window"), this.title, this.getMode(fp));
      for (const [label, ext] of this.filters || []) fp.appendFilter(label, ext);
      if (this.filterMask) fp.appendFilters(this.getFilterMask(fp));
      if (this.suggestion) fp.defaultString = this.suggestion;
      if (this.directory) fp.displayDirectory = this.directory;
      const userChoice = await fp.show();
      switch (userChoice) {
        case fp.returnOK:
        case fp.returnReplace:
          return this.mode === "multiple" ? fp.files : fp.file;
        default:
          return false;
      }
    }
    getMode(fp) {
      switch (this.mode) {
        case "open":
          return fp.modeOpen;
        case "save":
          return fp.modeSave;
        case "folder":
          return fp.modeGetFolder;
        case "multiple":
          return fp.modeOpenMultiple;
        default:
          return 0;
      }
    }
    getFilterMask(fp) {
      switch (this.filterMask) {
        case "all":
          return fp.filterAll;
        case "html":
          return fp.filterHTML;
        case "text":
          return fp.filterText;
        case "images":
          return fp.filterImages;
        case "xml":
          return fp.filterXML;
        case "apps":
          return fp.filterApps;
        case "urls":
          return fp.filterAllowURLs;
        case "audio":
          return fp.filterAudio;
        case "video":
          return fp.filterVideo;
        default:
          return 1;
      }
    }
  };
  var GuideHelper = class extends BasicTool {
    _steps = [];
    constructor() {
      super();
    }
    addStep(step) {
      this._steps.push(step);
      return this;
    }
    addSteps(steps) {
      this._steps.push(...steps);
      return this;
    }
    async show(doc) {
      if (!doc?.ownerGlobal) throw new Error("Document is required.");
      const guide = new Guide(doc.ownerGlobal);
      await guide.show(this._steps);
      const promise = new Promise((resolve) => {
        guide._panel.addEventListener("guide-finished", () => resolve(guide));
      });
      await promise;
      return guide;
    }
    async highlight(doc, step) {
      if (!doc?.ownerGlobal) throw new Error("Document is required.");
      const guide = new Guide(doc.ownerGlobal);
      await guide.show([step]);
      const promise = new Promise((resolve) => {
        guide._panel.addEventListener("guide-finished", () => resolve(guide));
      });
      await promise;
      return guide;
    }
  };
  var Guide = class {
    _window;
    _id = `guide-${Zotero.Utilities.randomString()}`;
    _panel;
    _header;
    _body;
    _footer;
    _progress;
    _closeButton;
    _prevButton;
    _nextButton;
    _steps;
    _noClose;
    _closed;
    _autoNext;
    _currentIndex;
    initialized;
    _cachedMasks = [];
    get content() {
      return this._window.MozXULElement.parseXULToFragment(`
      <panel id="${this._id}" class="guide-panel" type="arrow" align="top" noautohide="true">
          <html:div class="guide-panel-content">
              <html:div class="guide-panel-header"></html:div>
              <html:div class="guide-panel-body"></html:div>
              <html:div class="guide-panel-footer">
                  <html:div class="guide-panel-progress"></html:div>
                  <html:div class="guide-panel-buttons">
                      <button id="prev-button" class="guide-panel-button" hidden="true"></button>
                      <button id="next-button" class="guide-panel-button" hidden="true"></button>
                      <button id="close-button" class="guide-panel-button" hidden="true"></button>
                  </html:div>
              </html:div>
          </html:div>
          <html:style>
              .guide-panel {
                  background-color: var(--material-menu);
                  color: var(--fill-primary);
              }
              .guide-panel-content {
                  display: flex;
                  flex-direction: column;
                  padding: 0;
              }
              .guide-panel-header {
                  font-size: 1.2em;
                  font-weight: bold;
                  margin-bottom: 10px;
              }
              .guide-panel-header:empty {
                display: none;
              }
              .guide-panel-body {
                  align-items: center;
                  display: flex;
                  flex-direction: column;
                  white-space: pre-wrap;
              }
              .guide-panel-body:empty {
                display: none;
              }
              .guide-panel-footer {
                  display: flex;
                  flex-direction: row;
                  align-items: center;
                  justify-content: space-between;
                  margin-top: 10px;
              }
              .guide-panel-progress {
                  font-size: 0.8em;
              }
              .guide-panel-buttons {
                  display: flex;
                  flex-direction: row;
                  flex-grow: 1;
                  justify-content: flex-end;
              }
          </html:style>
      </panel>
  `);
    }
    get currentStep() {
      if (!this._steps) return void 0;
      return this._steps[this._currentIndex];
    }
    get currentTarget() {
      const step = this.currentStep;
      if (!step?.element) return void 0;
      let elem;
      if (typeof step.element === "function") elem = step.element();
      else if (typeof step.element === "string") elem = this._window.document.querySelector(step.element);
      else if (!step.element) elem = this._window.document.documentElement || void 0;
      else elem = step.element;
      return elem;
    }
    get hasNext() {
      return this._steps && this._currentIndex < this._steps.length - 1;
    }
    get hasPrevious() {
      return this._steps && this._currentIndex > 0;
    }
    get hookProps() {
      return {
        config: this.currentStep,
        state: {
          step: this._currentIndex,
          steps: this._steps,
          controller: this
        }
      };
    }
    get panel() {
      return this._panel;
    }
    constructor(win) {
      this._window = win;
      this._noClose = false;
      this._closed = false;
      this._autoNext = true;
      this._currentIndex = 0;
      const doc = win.document;
      const content = this.content;
      if (content) doc.documentElement?.append(doc.importNode(content, true));
      this._panel = doc.querySelector(`#${this._id}`);
      this._header = this._panel.querySelector(".guide-panel-header");
      this._body = this._panel.querySelector(".guide-panel-body");
      this._footer = this._panel.querySelector(".guide-panel-footer");
      this._progress = this._panel.querySelector(".guide-panel-progress");
      this._closeButton = this._panel.querySelector("#close-button");
      this._prevButton = this._panel.querySelector("#prev-button");
      this._nextButton = this._panel.querySelector("#next-button");
      this._closeButton.addEventListener("click", async () => {
        if (this.currentStep?.onCloseClick) await this.currentStep.onCloseClick(this.hookProps);
        this.abort();
      });
      this._prevButton.addEventListener("click", async () => {
        if (this.currentStep?.onPrevClick) await this.currentStep.onPrevClick(this.hookProps);
        this.movePrevious();
      });
      this._nextButton.addEventListener("click", async () => {
        if (this.currentStep?.onNextClick) await this.currentStep.onNextClick(this.hookProps);
        this.moveNext();
      });
      this._panel.addEventListener("popupshown", this._handleShown.bind(this));
      this._panel.addEventListener("popuphidden", this._handleHidden.bind(this));
      this._window.addEventListener("resize", this._centerPanel);
    }
    async show(steps) {
      if (steps) {
        this._steps = steps;
        this._currentIndex = 0;
      }
      const index = this._currentIndex;
      this._noClose = false;
      this._closed = false;
      this._autoNext = true;
      const step = this.currentStep;
      if (!step) return;
      const elem = this.currentTarget;
      if (step.onBeforeRender) {
        await step.onBeforeRender(this.hookProps);
        if (index !== this._currentIndex) {
          await this.show();
          return;
        }
      }
      if (step.onMask) step.onMask({ mask: (_e) => this._createMask(_e) });
      else this._createMask(elem);
      let x;
      let y = 0;
      let position = step.position || "after_start";
      if (position === "center") {
        position = "overlap";
        x = this._window.innerWidth / 2;
        y = this._window.innerHeight / 2;
      }
      this._panel.openPopup(elem, step.position || "after_start", x, y, false, false);
    }
    hide() {
      this._panel.hidePopup();
    }
    abort() {
      this._closed = true;
      this.hide();
      this._steps = void 0;
    }
    moveTo(stepIndex) {
      if (!this._steps) {
        this.hide();
        return;
      }
      if (stepIndex < 0) stepIndex = 0;
      if (!this._steps[stepIndex]) {
        this._currentIndex = this._steps.length;
        this.hide();
        return;
      }
      this._autoNext = false;
      this._noClose = true;
      this.hide();
      this._noClose = false;
      this._autoNext = true;
      this._currentIndex = stepIndex;
      this.show();
    }
    moveNext() {
      this.moveTo(this._currentIndex + 1);
    }
    movePrevious() {
      this.moveTo(this._currentIndex - 1);
    }
    _handleShown() {
      if (!this._steps) return;
      const step = this.currentStep;
      if (!step) return;
      this._header.innerHTML = step.title || "";
      this._body.innerHTML = step.description || "";
      this._panel.querySelectorAll(".guide-panel-button").forEach((elem) => {
        elem.hidden = true;
        elem.disabled = false;
      });
      let showButtons = step.showButtons;
      if (!showButtons) {
        showButtons = [];
        if (this.hasPrevious) showButtons.push("prev");
        if (this.hasNext) showButtons.push("next");
        else showButtons.push("close");
      }
      if (showButtons?.length) showButtons.forEach((btn) => {
        this._panel.querySelector(`#${btn}-button`).hidden = false;
      });
      if (step.disableButtons) step.disableButtons.forEach((btn) => {
        this._panel.querySelector(`#${btn}-button`).disabled = true;
      });
      if (step.showProgress) {
        this._progress.hidden = false;
        this._progress.textContent = step.progressText || `${this._currentIndex + 1}/${this._steps.length}`;
      } else this._progress.hidden = true;
      this._closeButton.label = step.closeBtnText || "Done";
      this._nextButton.label = step.nextBtnText || "Next";
      this._prevButton.label = step.prevBtnText || "Previous";
      if (step.onRender) step.onRender(this.hookProps);
      if (step.position === "center") {
        this._centerPanel();
        this._window.setTimeout(this._centerPanel, 10);
      }
    }
    async _handleHidden() {
      this._removeMask();
      this._header.innerHTML = "";
      this._body.innerHTML = "";
      this._progress.textContent = "";
      if (!this._steps) return;
      const step = this.currentStep;
      if (step && step.onExit) await step.onExit(this.hookProps);
      if (!this._noClose && (this._closed || !this.hasNext)) {
        this._panel.dispatchEvent(new this._window.CustomEvent("guide-finished"));
        this._panel.remove();
        this._window.removeEventListener("resize", this._centerPanel);
        return;
      }
      if (this._autoNext) this.moveNext();
    }
    _centerPanel = () => {
      const win = this._window;
      this._panel.moveTo(win.screenX + win.innerWidth / 2 - this._panel.clientWidth / 2, win.screenY + win.innerHeight / 2 - this._panel.clientHeight / 2);
    };
    _createMask(targetElement) {
      const doc = targetElement?.ownerDocument || this._window.document;
      const NS = "http://www.w3.org/2000/svg";
      const svg = doc.createElementNS(NS, "svg");
      svg.id = "guide-panel-mask";
      svg.style.position = "fixed";
      svg.style.top = "0";
      svg.style.left = "0";
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.zIndex = "9999";
      const mask = doc.createElementNS(NS, "mask");
      mask.id = "mask";
      const fullRect = doc.createElementNS(NS, "rect");
      fullRect.setAttribute("x", "0");
      fullRect.setAttribute("y", "0");
      fullRect.setAttribute("width", "100%");
      fullRect.setAttribute("height", "100%");
      fullRect.setAttribute("fill", "white");
      mask.appendChild(fullRect);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const targetRect = doc.createElementNS(NS, "rect");
        targetRect.setAttribute("x", rect.left.toString());
        targetRect.setAttribute("y", rect.top.toString());
        targetRect.setAttribute("width", rect.width.toString());
        targetRect.setAttribute("height", rect.height.toString());
        targetRect.setAttribute("fill", "black");
        mask.appendChild(targetRect);
      }
      const maskedRect = doc.createElementNS(NS, "rect");
      maskedRect.setAttribute("x", "0");
      maskedRect.setAttribute("y", "0");
      maskedRect.setAttribute("width", "100%");
      maskedRect.setAttribute("height", "100%");
      maskedRect.setAttribute("mask", "url(#mask)");
      maskedRect.setAttribute("opacity", "0.7");
      svg.appendChild(mask);
      svg.appendChild(maskedRect);
      this._cachedMasks.push(new WeakRef(svg));
      doc.documentElement?.appendChild(svg);
    }
    _removeMask() {
      this._cachedMasks.forEach((ref) => {
        const mask = ref.deref();
        if (mask) mask.remove();
      });
      this._cachedMasks = [];
    }
  };
  var LargePrefHelper = class extends BasicTool {
    keyPref;
    valuePrefPrefix;
    innerObj;
    hooks;
    /**
    *
    * @param keyPref The preference name for storing the keys of the data.
    * @param valuePrefPrefix The preference name prefix for storing the values of the data.
    * @param hooks Hooks for parsing the values of the data.
    * - `afterGetValue`: A function that takes the value of the data as input and returns the parsed value.
    * - `beforeSetValue`: A function that takes the key and value of the data as input and returns the parsed key and value.
    * If `hooks` is `"default"`, no parsing will be done.
    * If `hooks` is `"parser"`, the values will be parsed as JSON.
    * If `hooks` is an object, the values will be parsed by the hooks.
    */
    constructor(keyPref, valuePrefPrefix, hooks = "default") {
      super();
      this.keyPref = keyPref;
      this.valuePrefPrefix = valuePrefPrefix;
      if (hooks === "default") this.hooks = defaultHooks;
      else if (hooks === "parser") this.hooks = parserHooks;
      else this.hooks = {
        ...defaultHooks,
        ...hooks
      };
      this.innerObj = {};
    }
    /**
    * Get the object that stores the data.
    * @returns The object that stores the data.
    */
    asObject() {
      return this.constructTempObj();
    }
    /**
    * Get the Map that stores the data.
    * @returns The Map that stores the data.
    */
    asMapLike() {
      const mapLike = {
        get: (key) => this.getValue(key),
        set: (key, value) => {
          this.setValue(key, value);
          return mapLike;
        },
        has: (key) => this.hasKey(key),
        delete: (key) => this.deleteKey(key),
        clear: () => {
          for (const key of this.getKeys()) this.deleteKey(key);
        },
        forEach: (callback) => {
          return this.constructTempMap().forEach(callback);
        },
        get size() {
          return this._this.getKeys().length;
        },
        entries: () => {
          return this.constructTempMap().values();
        },
        keys: () => {
          const keys = this.getKeys();
          return keys[Symbol.iterator]();
        },
        values: () => {
          return this.constructTempMap().values();
        },
        [Symbol.iterator]: () => {
          return this.constructTempMap()[Symbol.iterator]();
        },
        [Symbol.toStringTag]: "MapLike",
        _this: this
      };
      return mapLike;
    }
    /**
    * Get the keys of the data.
    * @returns The keys of the data.
    */
    getKeys() {
      const rawKeys = Zotero.Prefs.get(this.keyPref, true);
      const keys = rawKeys ? JSON.parse(rawKeys) : [];
      for (const key of keys) {
        const value = "placeholder";
        this.innerObj[key] = value;
      }
      return keys;
    }
    /**
    * Set the keys of the data.
    * @param keys The keys of the data.
    */
    setKeys(keys) {
      keys = [...new Set(keys.filter((key) => key))];
      Zotero.Prefs.set(this.keyPref, JSON.stringify(keys), true);
      for (const key of keys) {
        const value = "placeholder";
        this.innerObj[key] = value;
      }
    }
    /**
    * Get the value of a key.
    * @param key The key of the data.
    * @returns The value of the key.
    */
    getValue(key) {
      const value = Zotero.Prefs.get(`${this.valuePrefPrefix}${key}`, true);
      if (typeof value === "undefined") return;
      const { value: newValue } = this.hooks.afterGetValue({ value });
      this.innerObj[key] = newValue;
      return newValue;
    }
    /**
    * Set the value of a key.
    * @param key The key of the data.
    * @param value The value of the key.
    */
    setValue(key, value) {
      const { key: newKey, value: newValue } = this.hooks.beforeSetValue({
        key,
        value
      });
      this.setKey(newKey);
      Zotero.Prefs.set(`${this.valuePrefPrefix}${newKey}`, newValue, true);
      this.innerObj[newKey] = newValue;
    }
    /**
    * Check if a key exists.
    * @param key The key of the data.
    * @returns Whether the key exists.
    */
    hasKey(key) {
      return this.getKeys().includes(key);
    }
    /**
    * Add a key.
    * @param key The key of the data.
    */
    setKey(key) {
      const keys = this.getKeys();
      if (!keys.includes(key)) {
        keys.push(key);
        this.setKeys(keys);
      }
    }
    /**
    * Delete a key.
    * @param key The key of the data.
    */
    deleteKey(key) {
      const keys = this.getKeys();
      const index = keys.indexOf(key);
      if (index > -1) {
        keys.splice(index, 1);
        delete this.innerObj[key];
        this.setKeys(keys);
      }
      Zotero.Prefs.clear(`${this.valuePrefPrefix}${key}`, true);
      return true;
    }
    constructTempObj() {
      return new Proxy(this.innerObj, {
        get: (target, prop, receiver) => {
          this.getKeys();
          if (typeof prop === "string" && prop in target) this.getValue(prop);
          return Reflect.get(target, prop, receiver);
        },
        set: (target, p, newValue, receiver) => {
          if (typeof p === "string") {
            if (newValue === void 0) {
              this.deleteKey(p);
              return true;
            }
            this.setValue(p, newValue);
            return true;
          }
          return Reflect.set(target, p, newValue, receiver);
        },
        has: (target, p) => {
          this.getKeys();
          return Reflect.has(target, p);
        },
        deleteProperty: (target, p) => {
          if (typeof p === "string") {
            this.deleteKey(p);
            return true;
          }
          return Reflect.deleteProperty(target, p);
        }
      });
    }
    constructTempMap() {
      const map = /* @__PURE__ */ new Map();
      for (const key of this.getKeys()) map.set(key, this.getValue(key));
      return map;
    }
  };
  var defaultHooks = {
    afterGetValue: ({ value }) => ({ value }),
    beforeSetValue: ({ key, value }) => ({
      key,
      value
    })
  };
  var parserHooks = {
    afterGetValue: ({ value }) => {
      try {
        value = JSON.parse(value);
      } catch {
        return { value };
      }
      return { value };
    },
    beforeSetValue: ({ key, value }) => {
      value = JSON.stringify(value);
      return {
        key,
        value
      };
    }
  };
  var PatchHelper = class extends BasicTool {
    options;
    constructor() {
      super();
      this.options = void 0;
    }
    setData(options) {
      this.options = options;
      const Zotero$1 = this.getGlobal("Zotero");
      const { target, funcSign, patcher } = options;
      const origin = target[funcSign];
      this.log("patching ", funcSign);
      target[funcSign] = function(...args) {
        if (options.enabled) try {
          return patcher(origin).apply(this, args);
        } catch (e) {
          Zotero$1.logError(e);
        }
        return origin.apply(this, args);
      };
      return this;
    }
    enable() {
      if (!this.options) throw new Error("No patch data set");
      this.options.enabled = true;
      return this;
    }
    disable() {
      if (!this.options) throw new Error("No patch data set");
      this.options.enabled = false;
      return this;
    }
  };
  var icons = {
    success: "chrome://zotero/skin/tick.png",
    fail: "chrome://zotero/skin/cross.png"
  };
  var ProgressWindowHelper = class {
    win;
    lines;
    closeTime;
    /**
    *
    * @param header window header
    * @param options
    * @param options.window
    * @param options.closeOnClick
    * @param options.closeTime
    * @param options.closeOtherProgressWindows
    */
    constructor(header, options = {
      closeOnClick: true,
      closeTime: 5e3
    }) {
      this.win = new (BasicTool.getZotero()).ProgressWindow(options);
      this.lines = [];
      this.closeTime = options.closeTime || 5e3;
      this.win.changeHeadline(header);
      if (options.closeOtherProgressWindows) BasicTool.getZotero().ProgressWindowSet.closeAll();
    }
    /**
    * Create a new line
    * @param options
    * @param options.type
    * @param options.icon
    * @param options.text
    * @param options.progress
    * @param options.idx
    */
    createLine(options) {
      const icon = this.getIcon(options.type, options.icon);
      const line = new this.win.ItemProgress(icon || "", options.text || "");
      if (typeof options.progress === "number") line.setProgress(options.progress);
      this.lines.push(line);
      this.updateIcons();
      return this;
    }
    /**
    * Change the line content
    * @param options
    * @param options.type
    * @param options.icon
    * @param options.text
    * @param options.progress
    * @param options.idx
    */
    changeLine(options) {
      if (this.lines?.length === 0) return this;
      const idx = typeof options.idx !== "undefined" && options.idx >= 0 && options.idx < this.lines.length ? options.idx : 0;
      const icon = this.getIcon(options.type, options.icon);
      if (icon) this.lines[idx].setItemTypeAndIcon(icon);
      options.text && this.lines[idx].setText(options.text);
      typeof options.progress === "number" && this.lines[idx].setProgress(options.progress);
      this.updateIcons();
      return this;
    }
    show(closeTime = void 0) {
      this.win.show();
      typeof closeTime !== "undefined" && (this.closeTime = closeTime);
      if (this.closeTime && this.closeTime > 0) this.win.startCloseTimer(this.closeTime);
      setTimeout(this.updateIcons.bind(this), 50);
      return this;
    }
    /**
    * Set custom icon uri for progress window
    * @param key
    * @param uri
    */
    static setIconURI(key, uri) {
      icons[key] = uri;
    }
    getIcon(type, defaultIcon) {
      return type && type in icons ? icons[type] : defaultIcon;
    }
    updateIcons() {
      try {
        this.lines.forEach((line) => {
          const box = line._image;
          const icon = box.dataset.itemType;
          if (icon && !box.style.backgroundImage.includes("progress_arcs")) box.style.backgroundImage = `url(${box.dataset.itemType})`;
        });
      } catch {
      }
    }
    changeHeadline(text, icon, postText) {
      this.win.changeHeadline(text, icon, postText);
      return this;
    }
    addLines(labels, icons$1) {
      this.win.addLines(labels, icons$1);
      return this;
    }
    addDescription(text) {
      this.win.addDescription(text);
      return this;
    }
    startCloseTimer(ms, requireMouseOver) {
      this.win.startCloseTimer(ms, requireMouseOver);
      return this;
    }
    close() {
      this.win.close();
      return this;
    }
  };
  var VirtualizedTableHelper = class extends BasicTool {
    props;
    localeStrings;
    containerId;
    treeInstance;
    window;
    React;
    ReactDOM;
    VirtualizedTable;
    IntlProvider;
    constructor(win) {
      super();
      this.window = win;
      const Zotero$1 = this.getGlobal("Zotero");
      const _require = win.require;
      this.React = _require("react");
      this.ReactDOM = _require("react-dom");
      this.VirtualizedTable = _require("components/virtualized-table");
      this.IntlProvider = _require("react-intl").IntlProvider;
      this.props = {
        id: `vtable-${Zotero$1.Utilities.randomString()}-${(/* @__PURE__ */ new Date()).getTime()}`,
        getRowCount: () => 0
      };
      this.localeStrings = Zotero$1.Intl.strings;
    }
    setProp(...args) {
      if (args.length === 1) Object.assign(this.props, args[0]);
      else if (args.length === 2) this.props[args[0]] = args[1];
      return this;
    }
    /**
    * Set locale strings, which replaces the table header's label if matches. Default it's `Zotero.Intl.strings`
    * @param localeStrings
    */
    setLocale(localeStrings) {
      Object.assign(this.localeStrings, localeStrings);
      return this;
    }
    /**
    * Set container element id that the table will be rendered on.
    * @param id element id
    */
    setContainerId(id) {
      this.containerId = id;
      return this;
    }
    /**
    * Render the table.
    * @param selectId Which row to select after rendering
    * @param onfulfilled callback after successfully rendered
    * @param onrejected callback after rendering with error
    */
    render(selectId, onfulfilled, onrejected) {
      const refreshSelection = () => {
        this.treeInstance.invalidate();
        if (typeof selectId !== "undefined" && selectId >= 0) this.treeInstance.selection.select(selectId);
        else this.treeInstance.selection.clearSelection();
      };
      if (!this.treeInstance) new Promise((resolve) => {
        const vtableProps = Object.assign({}, this.props, { ref: (ref) => {
          this.treeInstance = ref;
          resolve(void 0);
        } });
        if (vtableProps.getRowData && !vtableProps.renderItem) Object.assign(vtableProps, { renderItem: this.VirtualizedTable.makeRowRenderer(vtableProps.getRowData) });
        const elem = this.React.createElement(this.IntlProvider, {
          locale: Zotero.locale,
          messages: Zotero.Intl.strings
        }, this.React.createElement(this.VirtualizedTable, vtableProps));
        const container = this.window.document.getElementById(this.containerId);
        this.ReactDOM.createRoot(container).render(elem);
      }).then(() => {
        this.getGlobal("setTimeout")(() => {
          refreshSelection();
        });
      }).then(onfulfilled, onrejected);
      else refreshSelection();
      return this;
    }
  };
  var FieldHookManager = class extends ManagerTool {
    data = {
      getField: {},
      setField: {},
      isFieldOfBase: {}
    };
    patchHelpers = {
      getField: new PatchHelper(),
      setField: new PatchHelper(),
      isFieldOfBase: new PatchHelper()
    };
    constructor(base) {
      super(base);
      const _thisHelper = this;
      for (const type of Object.keys(this.patchHelpers)) {
        const helper = this.patchHelpers[type];
        helper.setData({
          target: this.getGlobal("Zotero").Item.prototype,
          funcSign: type,
          patcher: (original) => function(field, ...args) {
            const originalThis = this;
            const handler = _thisHelper.data[type][field];
            if (typeof handler === "function") try {
              return handler(field, args[0], args[1], originalThis, original);
            } catch (e) {
              return field + String(e);
            }
            return original.apply(originalThis, [field, ...args]);
          },
          enabled: true
        });
      }
    }
    register(type, field, hook) {
      this.data[type][field] = hook;
    }
    unregister(type, field) {
      delete this.data[type][field];
    }
    unregisterAll() {
      this.data.getField = {};
      this.data.setField = {};
      this.data.isFieldOfBase = {};
      this.patchHelpers.getField.disable();
      this.patchHelpers.setField.disable();
      this.patchHelpers.isFieldOfBase.disable();
    }
  };
  var wait_exports = {};
  __export(wait_exports, {
    waitForReader: () => waitForReader,
    waitUntil: () => waitUntil,
    waitUntilAsync: () => waitUntilAsync,
    waitUtilAsync: () => waitUtilAsync
  });
  var basicTool = new BasicTool();
  function waitUntil(condition, callback, interval = 100, timeout = 1e4) {
    const start = Date.now();
    const intervalId = basicTool.getGlobal("setInterval")(() => {
      if (condition()) {
        basicTool.getGlobal("clearInterval")(intervalId);
        callback();
      } else if (Date.now() - start > timeout) basicTool.getGlobal("clearInterval")(intervalId);
    }, interval);
  }
  var waitUtilAsync = waitUntilAsync;
  function waitUntilAsync(condition, interval = 100, timeout = 1e4) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const intervalId = basicTool.getGlobal("setInterval")(() => {
        if (condition()) {
          basicTool.getGlobal("clearInterval")(intervalId);
          resolve();
        } else if (Date.now() - start > timeout) {
          basicTool.getGlobal("clearInterval")(intervalId);
          reject(/* @__PURE__ */ new Error("timeout"));
        }
      }, interval);
    });
  }
  async function waitForReader(reader) {
    await reader._initPromise;
    await reader._lastView.initializedPromise;
    if (reader.type === "pdf") await reader._lastView._iframeWindow.PDFViewerApplication.initializedPromise;
  }
  var KeyboardManager = class extends ManagerTool {
    _keyboardCallbacks = /* @__PURE__ */ new Set();
    _cachedKey;
    id;
    constructor(base) {
      super(base);
      this.id = `kbd-${Zotero.Utilities.randomString()}`;
      this._ensureAutoUnregisterAll();
      this.addListenerCallback("onMainWindowLoad", this.initKeyboardListener);
      this.addListenerCallback("onMainWindowUnload", this.unInitKeyboardListener);
      this.initReaderKeyboardListener();
      for (const win of Zotero.getMainWindows()) this.initKeyboardListener(win);
    }
    /**
    * Register a keyboard event listener.
    * @param callback The callback function.
    */
    register(callback) {
      this._keyboardCallbacks.add(callback);
    }
    /**
    * Unregister a keyboard event listener.
    * @param callback The callback function.
    */
    unregister(callback) {
      this._keyboardCallbacks.delete(callback);
    }
    /**
    * Unregister all keyboard event listeners.
    */
    unregisterAll() {
      this._keyboardCallbacks.clear();
      this.removeListenerCallback("onMainWindowLoad", this.initKeyboardListener);
      this.removeListenerCallback("onMainWindowUnload", this.unInitKeyboardListener);
      for (const win of Zotero.getMainWindows()) this.unInitKeyboardListener(win);
    }
    initKeyboardListener = this._initKeyboardListener.bind(this);
    unInitKeyboardListener = this._unInitKeyboardListener.bind(this);
    initReaderKeyboardListener() {
      Zotero.Reader.registerEventListener("renderToolbar", (event) => this.addReaderKeyboardCallback(event), this._basicOptions.api.pluginID);
      Zotero.Reader._readers.forEach((reader) => this.addReaderKeyboardCallback({ reader }));
    }
    async addReaderKeyboardCallback(event) {
      const reader = event.reader;
      const initializedKey = `_ztoolkitKeyboard${this.id}Initialized`;
      await waitForReader(reader);
      if (!reader._iframeWindow) return;
      if (reader._iframeWindow[initializedKey]) return;
      this._initKeyboardListener(reader._iframeWindow);
      waitUntil(() => !Components.utils.isDeadWrapper(reader._internalReader) && reader._internalReader?._primaryView?._iframeWindow, () => this._initKeyboardListener(reader._internalReader._primaryView?._iframeWindow));
      reader._iframeWindow[initializedKey] = true;
    }
    _initKeyboardListener(win) {
      if (!win) return;
      win.addEventListener("keydown", this.triggerKeydown);
      win.addEventListener("keyup", this.triggerKeyup);
    }
    _unInitKeyboardListener(win) {
      if (!win) return;
      win.removeEventListener("keydown", this.triggerKeydown);
      win.removeEventListener("keyup", this.triggerKeyup);
    }
    triggerKeydown = (e) => {
      if (!this._cachedKey) this._cachedKey = new KeyModifier(e);
      else this._cachedKey.merge(new KeyModifier(e), { allowOverwrite: false });
      this.dispatchCallback(e, { type: "keydown" });
    };
    triggerKeyup = async (e) => {
      if (!this._cachedKey) return;
      const currentShortcut = new KeyModifier(this._cachedKey);
      this._cachedKey = void 0;
      this.dispatchCallback(e, {
        keyboard: currentShortcut,
        type: "keyup"
      });
    };
    dispatchCallback(...args) {
      this._keyboardCallbacks.forEach((cbk) => cbk(...args));
    }
  };
  var KeyModifier = class KeyModifier2 {
    accel = false;
    shift = false;
    control = false;
    meta = false;
    alt = false;
    key = "";
    useAccel = false;
    constructor(raw, options) {
      this.useAccel = options?.useAccel || false;
      if (typeof raw === "undefined") {
      } else if (typeof raw === "string") {
        raw = raw || "";
        raw = this.unLocalized(raw);
        this.accel = raw.includes("accel");
        this.shift = raw.includes("shift");
        this.control = raw.includes("control");
        this.meta = raw.includes("meta");
        this.alt = raw.includes("alt");
        this.key = raw.replace(/(accel|shift|control|meta|alt|[ ,\-])/g, "").toLocaleLowerCase();
        if (!this.key && (raw.includes(",,") || raw === ",")) this.key = ",";
      } else if (raw instanceof KeyModifier2) this.merge(raw, { allowOverwrite: true });
      else {
        if (options?.useAccel) if (Zotero.isMac) this.accel = raw.metaKey;
        else this.accel = raw.ctrlKey;
        this.shift = raw.shiftKey;
        this.control = raw.ctrlKey;
        this.meta = raw.metaKey;
        this.alt = raw.altKey;
        if (![
          "Shift",
          "Meta",
          "Ctrl",
          "Alt",
          "Control"
        ].includes(raw.key)) this.key = raw.key;
      }
    }
    /**
    * Merge another KeyModifier into this one.
    * @param newMod the new KeyModifier
    * @param options
    * @param options.allowOverwrite
    * @returns KeyModifier
    */
    merge(newMod, options) {
      const allowOverwrite = options?.allowOverwrite || false;
      this.mergeAttribute("accel", newMod.accel, allowOverwrite);
      this.mergeAttribute("shift", newMod.shift, allowOverwrite);
      this.mergeAttribute("control", newMod.control, allowOverwrite);
      this.mergeAttribute("meta", newMod.meta, allowOverwrite);
      this.mergeAttribute("alt", newMod.alt, allowOverwrite);
      this.mergeAttribute("key", newMod.key, allowOverwrite);
      return this;
    }
    /**
    * Check if the current KeyModifier equals to another KeyModifier.
    * @param newMod the new KeyModifier
    * @returns true if equals
    */
    equals(newMod) {
      if (typeof newMod === "string") newMod = new KeyModifier2(newMod);
      if (this.shift !== newMod.shift || this.alt !== newMod.alt || this.key.toLowerCase() !== newMod.key.toLowerCase()) return false;
      if (this.accel || newMod.accel) {
        if (Zotero.isMac) {
          if ((this.accel || this.meta) !== (newMod.accel || newMod.meta) || this.control !== newMod.control) return false;
        } else if ((this.accel || this.control) !== (newMod.accel || newMod.control) || this.meta !== newMod.meta) return false;
      } else if (this.control !== newMod.control || this.meta !== newMod.meta) return false;
      return true;
    }
    /**
    * Get the raw string representation of the KeyModifier.
    */
    getRaw() {
      const enabled = [];
      this.accel && enabled.push("accel");
      this.shift && enabled.push("shift");
      this.control && enabled.push("control");
      this.meta && enabled.push("meta");
      this.alt && enabled.push("alt");
      this.key && enabled.push(this.key);
      return enabled.join(",");
    }
    /**
    * Get the localized string representation of the KeyModifier.
    */
    getLocalized() {
      const raw = this.getRaw();
      if (Zotero.isMac) return raw.replaceAll("control", "\u2303").replaceAll("alt", "\u2325").replaceAll("shift", "\u21E7").replaceAll("meta", "\u2318");
      else return raw.replaceAll("control", "Ctrl").replaceAll("alt", "Alt").replaceAll("shift", "Shift").replaceAll("meta", "Win");
    }
    /**
    * Get the un-localized string representation of the KeyModifier.
    */
    unLocalized(raw) {
      if (Zotero.isMac) return raw.replaceAll("\u2303", "control").replaceAll("\u2325", "alt").replaceAll("\u21E7", "shift").replaceAll("\u2318", "meta");
      else return raw.replaceAll("Ctrl", "control").replaceAll("Alt", "alt").replaceAll("Shift", "shift").replaceAll("Win", "meta");
    }
    mergeAttribute(attribute, value, allowOverwrite) {
      if (allowOverwrite || !this[attribute]) this[attribute] = value;
    }
  };
  var MenuManager = class extends ManagerTool {
    ui;
    constructor(base) {
      super(base);
      this.ui = new UITool(this);
    }
    /**
    * Insert an menu item/menu(with popup)/menuseprator into a menupopup
    * @remarks
    * options:
    * ```ts
    * export interface MenuitemOptions {
    *   tag: "menuitem" | "menu" | "menuseparator";
    *   id?: string;
    *   label?: string;
    *   // data url (chrome://xxx.png) or base64 url (data:image/png;base64,xxx)
    *   icon?: string;
    *   class?: string;
    *   styles?: { [key: string]: string };
    *   hidden?: boolean;
    *   disabled?: boolean;
    *   oncommand?: string;
    *   commandListener?: EventListenerOrEventListenerObject;
    *   // Attributes below are used when type === "menu"
    *   popupId?: string;
    *   onpopupshowing?: string;
    *   subElementOptions?: Array<MenuitemOptions>;
    * }
    * ```
    * @param menuPopup
    * @param options
    * @param insertPosition
    * @param anchorElement The menuitem will be put before/after `anchorElement`. If not set, put at start/end of the menupopup.
    * @example
    * Insert menuitem with icon into item menupopup
    * ```ts
    * // base64 or chrome:// url
    * const menuIcon = "chrome://addontemplate/content/icons/favicon@0.5x.png";
    * ztoolkit.Menu.register("item", {
    *   tag: "menuitem",
    *   id: "zotero-itemmenu-addontemplate-test",
    *   label: "Addon Template: Menuitem",
    *   oncommand: "alert('Hello World! Default Menuitem.')",
    *   icon: menuIcon,
    * });
    * ```
    * @example
    * Insert menu into file menupopup
    * ```ts
    * ztoolkit.Menu.register(
    *   "menuFile",
    *   {
    *     tag: "menu",
    *     label: "Addon Template: Menupopup",
    *     subElementOptions: [
    *       {
    *         tag: "menuitem",
    *         label: "Addon Template",
    *         oncommand: "alert('Hello World! Sub Menuitem.')",
    *       },
    *     ],
    *   },
    *   "before",
    *   Zotero.getMainWindow().document.querySelector(
    *     "#zotero-itemmenu-addontemplate-test"
    *   )
    * );
    * ```
    */
    register(menuPopup, options, insertPosition = "after", anchorElement) {
      let popup;
      if (typeof menuPopup === "string") popup = this.getGlobal("document").querySelector(MenuSelector[menuPopup]);
      else popup = menuPopup;
      if (!popup) return false;
      const doc = popup.ownerDocument;
      const genMenuElement = (menuitemOption) => {
        const elementOption = {
          tag: menuitemOption.tag,
          id: menuitemOption.id,
          namespace: "xul",
          attributes: {
            label: menuitemOption.label || "",
            hidden: Boolean(menuitemOption.hidden),
            disabled: Boolean(menuitemOption.disabled),
            class: menuitemOption.class || "",
            oncommand: menuitemOption.oncommand || ""
          },
          classList: menuitemOption.classList,
          styles: menuitemOption.styles || {},
          listeners: [],
          children: []
        };
        if (menuitemOption.icon) {
          if (!this.getGlobal("Zotero").isMac) if (menuitemOption.tag === "menu") elementOption.attributes.class += " menu-iconic";
          else elementOption.attributes.class += " menuitem-iconic";
          elementOption.styles["list-style-image"] = `url(${menuitemOption.icon})`;
        }
        if (menuitemOption.commandListener) elementOption.listeners?.push({
          type: "command",
          listener: menuitemOption.commandListener
        });
        if (menuitemOption.tag === "menuitem") {
          elementOption.attributes.type = menuitemOption.type || "";
          elementOption.attributes.checked = menuitemOption.checked || false;
        }
        const menuItem = this.ui.createElement(doc, menuitemOption.tag, elementOption);
        if (menuitemOption.isHidden || menuitemOption.getVisibility) popup?.addEventListener("popupshowing", async (ev) => {
          let hidden;
          if (menuitemOption.isHidden) hidden = await menuitemOption.isHidden(menuItem, ev);
          else if (menuitemOption.getVisibility) {
            const visible = await menuitemOption.getVisibility(menuItem, ev);
            hidden = typeof visible === "undefined" ? void 0 : !visible;
          }
          if (typeof hidden === "undefined") return;
          if (hidden) menuItem.setAttribute("hidden", "true");
          else menuItem.removeAttribute("hidden");
        });
        if (menuitemOption.isDisabled) popup?.addEventListener("popupshowing", async (ev) => {
          const disabled = await menuitemOption.isDisabled(menuItem, ev);
          if (typeof disabled === "undefined") return;
          if (disabled) menuItem.setAttribute("disabled", "true");
          else menuItem.removeAttribute("disabled");
        });
        if ((menuitemOption.tag === "menuitem" || menuitemOption.tag === "menuseparator") && menuitemOption.onShowing) popup?.addEventListener("popupshowing", async (ev) => {
          await menuitemOption.onShowing(menuItem, ev);
        });
        if (menuitemOption.tag === "menu") {
          const subPopup = this.ui.createElement(doc, "menupopup", {
            id: menuitemOption.popupId,
            attributes: { onpopupshowing: menuitemOption.onpopupshowing || "" }
          });
          menuitemOption.children?.forEach((childOption) => {
            subPopup.append(genMenuElement(childOption));
          });
          menuItem.append(subPopup);
        }
        return menuItem;
      };
      const topMenuItem = genMenuElement(options);
      if (popup.childElementCount) {
        if (!anchorElement) anchorElement = insertPosition === "after" ? popup.lastElementChild : popup.firstElementChild;
        anchorElement[insertPosition](topMenuItem);
      } else popup.appendChild(topMenuItem);
    }
    unregister(menuId) {
      this.getGlobal("document").querySelector(`#${menuId}`)?.remove();
    }
    unregisterAll() {
      this.ui.unregisterAll();
    }
  };
  var MenuSelector = /* @__PURE__ */ (function(MenuSelector$1) {
    MenuSelector$1["menuFile"] = "#menu_FilePopup";
    MenuSelector$1["menuEdit"] = "#menu_EditPopup";
    MenuSelector$1["menuView"] = "#menu_viewPopup";
    MenuSelector$1["menuGo"] = "#menu_goPopup";
    MenuSelector$1["menuTools"] = "#menu_ToolsPopup";
    MenuSelector$1["menuHelp"] = "#menu_HelpPopup";
    MenuSelector$1["collection"] = "#zotero-collectionmenu";
    MenuSelector$1["item"] = "#zotero-itemmenu";
    return MenuSelector$1;
  })(MenuSelector || {});
  var Prompt = class {
    ui;
    base;
    get document() {
      return this.base.getGlobal("document");
    }
    /**
    * Record the last text entered
    */
    lastInputText = "";
    /**
    * Default text
    */
    defaultText = {
      placeholder: "Select a command...",
      empty: "No commands found."
    };
    /**
    * It controls the max line number of commands displayed in `commandsNode`.
    */
    maxLineNum = 12;
    /**
    * It controls the max number of suggestions.
    */
    maxSuggestionNum = 100;
    /**
    * The top-level HTML div node of `Prompt`
    */
    promptNode;
    /**
    * The HTML input node of `Prompt`.
    */
    inputNode;
    /**
    * Save all commands registered by all addons.
    */
    commands = [];
    /**
    * Initialize `Prompt` but do not create UI.
    */
    constructor() {
      this.base = new BasicTool();
      this.ui = new UITool();
      this.initializeUI();
    }
    /**
    * Initialize `Prompt` UI and then bind events on it.
    */
    initializeUI() {
      this.addStyle();
      this.createHTML();
      this.initInputEvents();
      this.registerShortcut();
    }
    createHTML() {
      this.promptNode = this.ui.createElement(this.document, "div", {
        styles: { display: "none" },
        children: [{
          tag: "div",
          styles: {
            position: "fixed",
            left: "0",
            top: "0",
            backgroundColor: "transparent",
            width: "100%",
            height: "100%"
          },
          listeners: [{
            type: "click",
            listener: () => {
              this.promptNode.style.display = "none";
            }
          }]
        }]
      });
      this.promptNode.appendChild(this.ui.createElement(this.document, "div", {
        id: `zotero-plugin-toolkit-prompt`,
        classList: ["prompt-container"],
        children: [
          {
            tag: "div",
            classList: ["input-container"],
            children: [{
              tag: "input",
              classList: ["prompt-input"],
              attributes: {
                type: "text",
                placeholder: this.defaultText.placeholder
              }
            }, {
              tag: "div",
              classList: ["cta"]
            }]
          },
          {
            tag: "div",
            classList: ["commands-containers"]
          },
          {
            tag: "div",
            classList: ["instructions"],
            children: [
              {
                tag: "div",
                classList: ["instruction"],
                children: [{
                  tag: "span",
                  classList: ["key"],
                  properties: { innerText: "\u2191\u2193" }
                }, {
                  tag: "span",
                  properties: { innerText: "to navigate" }
                }]
              },
              {
                tag: "div",
                classList: ["instruction"],
                children: [{
                  tag: "span",
                  classList: ["key"],
                  properties: { innerText: "enter" }
                }, {
                  tag: "span",
                  properties: { innerText: "to trigger" }
                }]
              },
              {
                tag: "div",
                classList: ["instruction"],
                children: [{
                  tag: "span",
                  classList: ["key"],
                  properties: { innerText: "esc" }
                }, {
                  tag: "span",
                  properties: { innerText: "to exit" }
                }]
              }
            ]
          }
        ]
      }));
      this.inputNode = this.promptNode.querySelector("input");
      this.document.documentElement.appendChild(this.promptNode);
    }
    /**
    * Show commands in a new `commandsContainer`
    * All other `commandsContainer` is hidden
    * @param commands Command[]
    * @param clear remove all `commandsContainer` if true
    */
    showCommands(commands, clear = false) {
      if (clear) this.promptNode.querySelectorAll(".commands-container").forEach((e) => e.remove());
      this.inputNode.placeholder = this.defaultText.placeholder;
      const commandsContainer = this.createCommandsContainer();
      for (const command of commands) {
        try {
          if (!command.name || command.when && !command.when()) continue;
        } catch {
          continue;
        }
        commandsContainer.appendChild(this.createCommandNode(command));
      }
    }
    /**
    * Create a `commandsContainer` div element, append to `commandsContainer` and hide others.
    * @returns commandsNode
    */
    createCommandsContainer() {
      const commandsContainer = this.ui.createElement(this.document, "div", { classList: ["commands-container"] });
      this.promptNode.querySelectorAll(".commands-container").forEach((e) => {
        e.style.display = "none";
      });
      this.promptNode.querySelector(".commands-containers").appendChild(commandsContainer);
      return commandsContainer;
    }
    /**
    * Return current displayed `commandsContainer`
    * @returns
    */
    getCommandsContainer() {
      return [...Array.from(this.promptNode.querySelectorAll(".commands-container"))].find((e) => {
        return e.style.display !== "none";
      });
    }
    /**
    * Create a command item for `Prompt` UI.
    * @param command
    * @returns
    */
    createCommandNode(command) {
      const commandNode = this.ui.createElement(this.document, "div", {
        classList: ["command"],
        children: [{
          tag: "div",
          classList: ["content"],
          children: [{
            tag: "div",
            classList: ["name"],
            children: [{
              tag: "span",
              properties: { innerText: command.name }
            }]
          }, {
            tag: "div",
            classList: ["aux"],
            children: command.label ? [{
              tag: "span",
              classList: ["label"],
              properties: { innerText: command.label }
            }] : []
          }]
        }],
        listeners: [{
          type: "mousemove",
          listener: () => {
            this.selectItem(commandNode);
          }
        }, {
          type: "click",
          listener: async () => {
            await this.execCallback(command.callback);
          }
        }]
      });
      commandNode.command = command;
      return commandNode;
    }
    /**
    * Called when `enter` key is pressed.
    */
    trigger() {
      [...Array.from(this.promptNode.querySelectorAll(".commands-container"))].find((e) => e.style.display !== "none").querySelector(".selected").click();
    }
    /**
    * Called when `escape` key is pressed.
    */
    exit() {
      this.inputNode.placeholder = this.defaultText.placeholder;
      if (this.promptNode.querySelectorAll(".commands-containers .commands-container").length >= 2) {
        this.promptNode.querySelector(".commands-container:last-child").remove();
        const commandsContainer = this.promptNode.querySelector(".commands-container:last-child");
        commandsContainer.style.display = "";
        commandsContainer.querySelectorAll(".commands").forEach((e) => e.style.display = "flex");
        this.inputNode.focus();
      } else this.promptNode.style.display = "none";
    }
    async execCallback(callback) {
      if (Array.isArray(callback)) this.showCommands(callback);
      else await callback(this);
    }
    /**
    * Match suggestions for user's entered text.
    */
    async showSuggestions(inputText) {
      const _w = /[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-./:;<=>?@[\]^_`{|}~]/;
      const jw = /\s/;
      const Ww = /[\u0F00-\u0FFF\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF66-\uFF9F]/;
      function Yw(e$1, t, n, i) {
        if (e$1.length === 0) return 0;
        let r = 0;
        r -= Math.max(0, e$1.length - 1), r -= i / 10;
        const o = e$1[0][0];
        return r -= (e$1[e$1.length - 1][1] - o + 1 - t) / 100, r -= o / 1e3, r -= n / 1e4;
      }
      function $w(e$1, t, n, i) {
        if (e$1.length === 0) return null;
        for (var r = n.toLowerCase(), o = 0, a = 0, s = [], l = 0; l < e$1.length; l++) {
          const c = e$1[l];
          const u = r.indexOf(c, a);
          if (u === -1) return null;
          const h = n.charAt(u);
          if (u > 0 && !_w.test(h) && !Ww.test(h)) {
            const p = n.charAt(u - 1);
            if (h.toLowerCase() !== h && p.toLowerCase() !== p || h.toUpperCase() !== h && !_w.test(p) && !jw.test(p) && !Ww.test(p)) if (i) {
              if (u !== a) {
                a += c.length, l--;
                continue;
              }
            } else o += 1;
          }
          if (s.length === 0) s.push([u, u + c.length]);
          else {
            const d = s[s.length - 1];
            d[1] < u ? s.push([u, u + c.length]) : d[1] = u + c.length;
          }
          a = u + c.length;
        }
        return {
          matches: s,
          score: Yw(s, t.length, r.length, o)
        };
      }
      function Gw(e$1) {
        for (var t = e$1.toLowerCase(), n = [], i = 0, r = 0; r < t.length; r++) {
          const o = t.charAt(r);
          jw.test(o) ? (i !== r && n.push(t.substring(i, r)), i = r + 1) : (_w.test(o) || Ww.test(o)) && (i !== r && n.push(t.substring(i, r)), n.push(o), i = r + 1);
        }
        return i !== t.length && n.push(t.substring(i, t.length)), {
          query: e$1,
          tokens: n,
          fuzzy: t.split("")
        };
      }
      function Xw(e$1, t) {
        if (e$1.query === "") return {
          score: 0,
          matches: []
        };
        const n = $w(e$1.tokens, e$1.query, t, false);
        return n || $w(e$1.fuzzy, e$1.query, t, true);
      }
      const e = Gw(inputText);
      let container = this.getCommandsContainer();
      if (container.classList.contains("suggestions")) this.exit();
      if (inputText.trim() == "") return true;
      const suggestions = [];
      this.getCommandsContainer().querySelectorAll(".command").forEach((commandNode) => {
        const spanNode = commandNode.querySelector(".name span");
        const spanText = spanNode.innerText;
        const res = Xw(e, spanText);
        if (res) {
          commandNode = this.createCommandNode(commandNode.command);
          let spanHTML = "";
          let i = 0;
          for (let j = 0; j < res.matches.length; j++) {
            const [start, end] = res.matches[j];
            if (start > i) spanHTML += spanText.slice(i, start);
            spanHTML += `<span class="highlight">${spanText.slice(start, end)}</span>`;
            i = end;
          }
          if (i < spanText.length) spanHTML += spanText.slice(i, spanText.length);
          commandNode.querySelector(".name span").innerHTML = spanHTML;
          suggestions.push({
            score: res.score,
            commandNode
          });
        }
      });
      if (suggestions.length > 0) {
        suggestions.sort((a, b) => b.score - a.score).slice(this.maxSuggestionNum);
        container = this.createCommandsContainer();
        container.classList.add("suggestions");
        suggestions.forEach((suggestion) => {
          container.appendChild(suggestion.commandNode);
        });
        return true;
      } else {
        const anonymousCommand = this.commands.find((c) => !c.name && (!c.when || c.when()));
        if (anonymousCommand) await this.execCallback(anonymousCommand.callback);
        else this.showTip(this.defaultText.empty);
        return false;
      }
    }
    /**
    * Bind events of pressing `keydown` and `keyup` key.
    */
    initInputEvents() {
      this.promptNode.addEventListener("keydown", (event) => {
        if (["ArrowUp", "ArrowDown"].includes(event.key)) {
          event.preventDefault();
          let selectedIndex;
          const allItems = [...Array.from(this.getCommandsContainer().querySelectorAll(".command"))].filter((e) => e.style.display != "none");
          selectedIndex = allItems.findIndex((e) => e.classList.contains("selected"));
          if (selectedIndex != -1) {
            allItems[selectedIndex].classList.remove("selected");
            selectedIndex += event.key == "ArrowUp" ? -1 : 1;
          } else if (event.key == "ArrowUp") selectedIndex = allItems.length - 1;
          else selectedIndex = 0;
          if (selectedIndex == -1) selectedIndex = allItems.length - 1;
          else if (selectedIndex == allItems.length) selectedIndex = 0;
          allItems[selectedIndex].classList.add("selected");
          const commandsContainer = this.getCommandsContainer();
          commandsContainer.scrollTo(0, commandsContainer.querySelector(".selected").offsetTop - commandsContainer.offsetHeight + 7.5);
          allItems[selectedIndex].classList.add("selected");
        }
      });
      this.promptNode.addEventListener("keyup", async (event) => {
        if (event.key == "Enter") this.trigger();
        else if (event.key == "Escape") if (this.inputNode.value.length > 0) this.inputNode.value = "";
        else this.exit();
        else if (["ArrowUp", "ArrowDown"].includes(event.key)) return;
        const currentInputText = this.inputNode.value;
        if (currentInputText == this.lastInputText) return;
        this.lastInputText = currentInputText;
        window.setTimeout(async () => {
          await this.showSuggestions(currentInputText);
        });
      });
    }
    /**
    * Create a commandsContainer and display a text
    */
    showTip(text) {
      const tipNode = this.ui.createElement(this.document, "div", {
        classList: ["tip"],
        properties: { innerText: text }
      });
      const container = this.createCommandsContainer();
      container.classList.add("suggestions");
      container.appendChild(tipNode);
      return tipNode;
    }
    /**
    * Mark the selected item with class `selected`.
    * @param item HTMLDivElement
    */
    selectItem(item) {
      this.getCommandsContainer().querySelectorAll(".command").forEach((e) => e.classList.remove("selected"));
      item.classList.add("selected");
    }
    addStyle() {
      const style$1 = this.ui.createElement(this.document, "style", {
        namespace: "html",
        id: "prompt-style"
      });
      style$1.innerText = `
      .prompt-container * {
        box-sizing: border-box;
      }
      .prompt-container {
        ---radius---: 10px;
        position: fixed;
        left: 25%;
        top: 10%;
        width: 50%;
        border-radius: var(---radius---);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-size: 18px;
        box-shadow: 0px 1.8px 7.3px rgba(0, 0, 0, 0.071),
                    0px 6.3px 24.7px rgba(0, 0, 0, 0.112),
                    0px 30px 90px rgba(0, 0, 0, 0.2);
        font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Microsoft YaHei Light", sans-serif;
        background-color: var(--material-background) !important;
        border: var(--material-border-quarternary) !important;
      }
      
      /* input */
      .prompt-container .input-container  {
        width: 100%;
      }

      .input-container input {
        width: -moz-available;
        height: 40px;
        padding: 24px;
        border: none;
        outline: none;
        font-size: 18px;
        margin: 0 !important;
        border-radius: var(---radius---);
        background-color: var(--material-background);
      }
      
      .input-container .cta {
        border-bottom: var(--material-border-quarternary);
        margin: 5px auto;
      }
      
      /* results */
      .commands-containers {
        width: 100%;
        height: 100%;
      }
      .commands-container {
        max-height: calc(${this.maxLineNum} * 35.5px);
        width: calc(100% - 12px);
        margin-left: 12px;
        margin-right: 0%;
        overflow-y: auto;
        overflow-x: hidden;
      }
      
      .commands-container .command {
        display: flex;
        align-content: baseline;
        justify-content: space-between;
        border-radius: 5px;
        padding: 6px 12px;
        margin-right: 12px;
        margin-top: 2px;
        margin-bottom: 2px;
      }
      .commands-container .command .content {
        display: flex;
        width: 100%;
        justify-content: space-between;
        flex-direction: row;
        overflow: hidden;
      }
      .commands-container .command .content .name {
        white-space: nowrap; 
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .commands-container .command .content .aux {
        display: flex;
        align-items: center;
        align-self: center;
        flex-shrink: 0;
      }
      
      .commands-container .command .content .aux .label {
        font-size: 15px;
        color: var(--fill-primary);
        padding: 2px 6px;
        background-color: var(--color-background);
        border-radius: 5px;
      }
      
      .commands-container .selected {
          background-color: var(--material-mix-quinary);
      }

      .commands-container .highlight {
        font-weight: bold;
      }

      .tip {
        color: var(--fill-primary);
        text-align: center;
        padding: 12px 12px;
        font-size: 18px;
      }

      /* instructions */
      .instructions {
        display: flex;
        align-content: center;
        justify-content: center;
        font-size: 15px;
        height: 2.5em;
        width: 100%;
        border-top: var(--material-border-quarternary);
        color: var(--fill-secondary);
        margin-top: 5px;
      }
      
      .instructions .instruction {
        margin: auto .5em;  
      }
      
      .instructions .key {
        margin-right: .2em;
        font-weight: 600;
      }
    `;
      this.document.documentElement.appendChild(style$1);
    }
    registerShortcut() {
      this.document.addEventListener("keydown", (event) => {
        if (event.shiftKey && event.key.toLowerCase() == "p") {
          if (event.originalTarget.isContentEditable || "value" in event.originalTarget || this.commands.length == 0) return;
          event.preventDefault();
          event.stopPropagation();
          if (this.promptNode.style.display == "none") {
            this.promptNode.style.display = "flex";
            if (this.promptNode.querySelectorAll(".commands-container").length == 1) this.showCommands(this.commands, true);
            this.promptNode.focus();
            this.inputNode.focus();
          } else this.promptNode.style.display = "none";
        }
      }, true);
    }
  };
  var PromptManager = class extends ManagerTool {
    prompt;
    /**
    * Save the commands registered from this manager
    */
    commands = [];
    constructor(base) {
      super(base);
      const globalCache = toolkitGlobal_default.getInstance()?.prompt;
      if (!globalCache) throw new Error("Prompt is not initialized.");
      if (!globalCache._ready) {
        globalCache._ready = true;
        globalCache.instance = new Prompt();
      }
      this.prompt = globalCache.instance;
    }
    /**
    * Register commands. Don't forget to call `unregister` on plugin exit.
    * @param commands Command[]
    * @example
    * ```ts
    * let getReader = () => {
    *   return BasicTool.getZotero().Reader.getByTabID(
    *     (Zotero.getMainWindow().Zotero_Tabs).selectedID
    *   )
    * }
    *
    * register([
    *   {
    *     name: "Split Horizontally",
    *     label: "Zotero",
    *     when: () => getReader() as boolean,
    *     callback: (prompt: Prompt) => getReader().menuCmd("splitHorizontally")
    *   },
    *   {
    *     name: "Split Vertically",
    *     label: "Zotero",
    *     when: () => getReader() as boolean,
    *     callback: (prompt: Prompt) => getReader().menuCmd("splitVertically")
    *   }
    * ])
    * ```
    */
    register(commands) {
      commands.forEach((c) => c.id ??= c.name);
      this.prompt.commands = [...this.prompt.commands, ...commands];
      this.commands = [...this.commands, ...commands];
      this.prompt.showCommands(this.commands, true);
    }
    /**
    * You can delete a command registed before by its name.
    * @remarks
    * There is a premise here that the names of all commands registered by a single plugin are not duplicated.
    * @param id Command.name
    */
    unregister(id) {
      this.prompt.commands = this.prompt.commands.filter((c) => c.id != id);
      this.commands = this.commands.filter((c) => c.id != id);
    }
    /**
    * Call `unregisterAll` on plugin exit.
    */
    unregisterAll() {
      this.prompt.commands = this.prompt.commands.filter((c) => {
        return this.commands.every((_c) => _c.id != c.id);
      });
      this.commands = [];
    }
  };
  var ExtraFieldTool = class extends BasicTool {
    getExtraFields(item, parser = "enhanced") {
      const extraFiledRaw = item.getField("extra");
      if (parser === "classical") return this.getGlobal("Zotero").Utilities.Internal.extractExtraFields(extraFiledRaw).fields;
      else {
        const map = /* @__PURE__ */ new Map();
        const nonStandardFields = [];
        extraFiledRaw.split("\n").forEach((line) => {
          if (!line) return;
          const split = line.split(": ");
          if (split.length >= 2 && split[0]) {
            const key = split[0];
            const value = split.slice(1).join(": ");
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(value);
          } else nonStandardFields.push(line);
        });
        if (nonStandardFields.length > 0) map.set("__nonStandard__", [nonStandardFields.join("\n")]);
        return map;
      }
    }
    getExtraField(item, key, all = false) {
      const fields = this.getExtraFields(item, "enhanced");
      const values = fields.get(key);
      if (!values) return void 0;
      return all ? values : values[0];
    }
    /**
    * Replace extra field of an item.
    * @param item
    * @param fields
    * @param [options] Additional options.
    * @param [options.save] Whether to save the item, default to true.
    */
    async replaceExtraFields(item, fields, options = {}) {
      const { save = true } = options;
      const kvs = [];
      fields.forEach((values, key) => {
        key === "__nonStandard__" ? kvs.push(...fields.get("__nonStandard__")) : values.forEach((v) => kvs.push(`${key}: ${v}`));
      });
      item.setField("extra", kvs.join("\n"));
      if (save) await item.saveTx();
    }
    /**
    * Set a key-value pair in the item's extra field.
    * If the key already exists, it can be overwritten or appended.
    * @param item Zotero item
    * @param key Field key
    * @param value Field value or list of values
    * @param options Additional options
    * @param [options.append] Whether to append to existing values, default to false
    * @param [options.save] Whether to save the item, default to true
    */
    async setExtraField(item, key, value, options = {}) {
      const { append = false, save = true } = options;
      const fields = this.getExtraFields(item, "enhanced");
      if (value === "" || typeof value === "undefined") fields.delete(key);
      else {
        const values = Array.isArray(value) ? value : [value];
        if (append && fields.has(key)) fields.get(key).push(...values);
        else fields.set(key, values);
      }
      await this.replaceExtraFields(item, fields, { save });
    }
  };
  var ReaderTool = class extends BasicTool {
    /**
    * Get the selected tab reader.
    * @param waitTime Wait for n MS until the reader is ready
    */
    async getReader(waitTime = 5e3) {
      const Zotero_Tabs = this.getGlobal("Zotero_Tabs");
      if (Zotero_Tabs.selectedType !== "reader") return void 0;
      let reader = Zotero.Reader.getByTabID(Zotero_Tabs.selectedID);
      let delayCount = 0;
      const checkPeriod = 50;
      while (!reader && delayCount * checkPeriod < waitTime) {
        await new Promise((resolve) => setTimeout(resolve, checkPeriod));
        reader = Zotero.Reader.getByTabID(Zotero_Tabs.selectedID);
        delayCount++;
      }
      await reader?._initPromise;
      return reader;
    }
    /**
    * Get all window readers.
    */
    getWindowReader() {
      const Zotero_Tabs = this.getGlobal("Zotero_Tabs");
      const windowReaders = [];
      const tabs = Zotero_Tabs._tabs.map((e) => e.id);
      for (let i = 0; i < Zotero.Reader._readers.length; i++) {
        let flag = false;
        for (let j = 0; j < tabs.length; j++) if (Zotero.Reader._readers[i].tabID === tabs[j]) {
          flag = true;
          break;
        }
        if (!flag) windowReaders.push(Zotero.Reader._readers[i]);
      }
      return windowReaders;
    }
    /**
    * Get Reader tabpanel deck element.
    * @deprecated - use item pane api
    * @alpha
    */
    getReaderTabPanelDeck() {
      const deck = this.getGlobal("window").document.querySelector(".notes-pane-deck")?.previousElementSibling;
      return deck;
    }
    /**
    * Add a reader tabpanel deck selection change observer.
    * @deprecated - use item pane api
    * @alpha
    * @param callback
    */
    async addReaderTabPanelDeckObserver(callback) {
      await waitUtilAsync(() => !!this.getReaderTabPanelDeck());
      const deck = this.getReaderTabPanelDeck();
      const observer = new (this.getGlobal("MutationObserver"))(async (mutations) => {
        mutations.forEach(async (mutation) => {
          const target = mutation.target;
          if (target.classList.contains("zotero-view-tabbox") || target.tagName === "deck") callback();
        });
      });
      observer.observe(deck, {
        attributes: true,
        attributeFilter: ["selectedIndex"],
        subtree: true
      });
      return observer;
    }
    /**
    * Get the selected annotation data.
    * @param reader Target reader
    * @returns The selected annotation data.
    */
    getSelectedAnnotationData(reader) {
      const annotation = reader?._internalReader._lastView._selectionPopup?.annotation;
      return annotation;
    }
    /**
    * Get the text selection of reader.
    * @param reader Target reader
    * @returns The text selection of reader.
    */
    getSelectedText(reader) {
      return this.getSelectedAnnotationData(reader)?.text ?? "";
    }
  };
  var ZoteroToolkit = class extends BasicTool {
    static _version = BasicTool._version;
    UI = new UITool(this);
    Reader = new ReaderTool(this);
    ExtraField = new ExtraFieldTool(this);
    FieldHooks = new FieldHookManager(this);
    Keyboard = new KeyboardManager(this);
    Prompt = new PromptManager(this);
    Menu = new MenuManager(this);
    Clipboard = makeHelperTool(ClipboardHelper, this);
    FilePicker = makeHelperTool(FilePickerHelper, this);
    Patch = makeHelperTool(PatchHelper, this);
    ProgressWindow = makeHelperTool(ProgressWindowHelper, this);
    VirtualizedTable = makeHelperTool(VirtualizedTableHelper, this);
    Dialog = makeHelperTool(DialogHelper, this);
    LargePrefObject = makeHelperTool(LargePrefHelper, this);
    Guide = makeHelperTool(GuideHelper, this);
    constructor() {
      super();
    }
    /**
    * Unregister everything created by managers.
    */
    unregisterAll() {
      unregister(this);
    }
  };

  // package.json
  var config = {
    addonName: "AI Assistant (Markdown)",
    addonID: "zotero-ai-assistant-improved@steppp1.github.io",
    addonRef: "ai-assistant",
    addonInstance: "AIAssistant",
    prefsPrefix: "extensions.zotero.aiassistant"
  };

  // src/utils/locale.ts
  function initLocale() {
    const l10n = new (typeof Localization === "undefined" ? ztoolkit.getGlobal("Localization") : Localization)([`${config.addonRef}-addon.ftl`], true);
    addon.data.locale = {
      current: l10n
    };
  }
  function getString(...inputs) {
    if (inputs.length === 1) {
      return _getString(inputs[0]);
    } else if (inputs.length === 2) {
      if (typeof inputs[1] === "string") {
        return _getString(inputs[0], { branch: inputs[1] });
      } else {
        return _getString(inputs[0], inputs[1]);
      }
    } else {
      throw new Error("Invalid arguments");
    }
  }
  function _getString(localeString, options = {}) {
    const localStringWithPrefix = `${config.addonRef}-${localeString}`;
    const { branch, args } = options;
    const pattern = addon.data.locale?.current.formatMessagesSync([
      { id: localStringWithPrefix, args }
    ])[0];
    if (!pattern) {
      return localStringWithPrefix;
    }
    if (branch && pattern.attributes) {
      return pattern.attributes.find((attr) => attr.name === branch)?.value || localStringWithPrefix;
    } else {
      return pattern.value || localStringWithPrefix;
    }
  }
  function getLocaleID(id) {
    return `${config.addonRef}-${id}`;
  }

  // src/utils/prefs.ts
  var PREFS_PREFIX = config.prefsPrefix;
  function getPref(key) {
    return Zotero.Prefs.get(`${PREFS_PREFIX}.${key}`, true);
  }

  // src/modules/chat.ts
  var StorageManager = class {
    static async getSessions(parentItem) {
      if (!parentItem.isRegularItem()) return [];
      const attachmentIDs = parentItem.getAttachments();
      const sessions = [];
      for (const id of attachmentIDs) {
        const attachment = Zotero.Items.get(id);
        const title = attachment.getField("title");
        if (title.startsWith("AI-Assistant-")) {
          try {
            if (!await attachment.fileExists()) continue;
            const path = attachment.getFilePath();
            if (!path) continue;
            const content = await Zotero.File.getContentsAsync(path);
            if (content) {
              const session = JSON.parse(content);
              session.attachmentID = attachment.id;
              sessions.push(session);
            }
          } catch (e) {
            Zotero.debug(
              `[AI Assistant] Failed to load session from attachment ${id}: ${e}`
            );
          }
        }
      }
      return sessions;
    }
    static async saveSession(parentItem, session) {
      try {
        const jsonString = JSON.stringify(session, null, 2);
        if (session.attachmentID) {
          const attachment2 = Zotero.Items.get(session.attachmentID);
          if (attachment2) {
            const path = attachment2.getFilePath();
            if (path) {
              await Zotero.File.putContentsAsync(path, jsonString);
              return;
            }
          }
        }
        const d = new Date(session.createdAt);
        const pad = (n) => n.toString().padStart(2, "0");
        const dateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
        const title = `AI-Assistant-${dateStr}`;
        const tempDir = Zotero.getTempDirectory().path;
        const sep = Zotero.isWin ? "\\" : "/";
        const tempPath = `${tempDir}${sep}${title}.json`;
        await Zotero.File.putContentsAsync(tempPath, jsonString);
        Zotero.debug(`[AI Assistant] Created temp file at: ${tempPath}`);
        Zotero.debug(`[AI Assistant] Importing attachment from file...`);
        const attachment = await Zotero.Attachments.importFromFile({
          file: tempPath,
          parentItemID: parentItem.id,
          title,
          contentType: "application/json"
        });
        if (attachment) {
          session.attachmentID = attachment.id;
        }
      } catch (e) {
        Zotero.debug("[AI Assistant] Save Session Error: " + e);
        throw e;
      }
    }
  };
  var ChatManager = class _ChatManager {
    static selectedSessionIDs = /* @__PURE__ */ new Map();
    static onAction = null;
    static triggerClick(el) {
      if (!el) return;
      let current = el;
      let depth = 0;
      while (current && depth < 3) {
        try {
          Zotero.debug(`[AI Assistant] Triggering click on ${current.tagName} (id: ${current.id}, class: ${current.className})`);
          const doc = current.ownerDocument || Zotero.getMainWindow().document;
          const evt = doc.createEvent("MouseEvents");
          evt.initMouseEvent(
            "click",
            true,
            // bubbles
            true,
            // cancelable
            doc.defaultView || Zotero.getMainWindow(),
            1,
            0,
            0,
            0,
            0,
            false,
            false,
            false,
            false,
            0,
            null
          );
          current.dispatchEvent(evt);
          if (typeof current.click === "function") {
            current.click();
          }
        } catch (e) {
          Zotero.debug("[AI Assistant] Click attempt failed: " + e);
        }
        current = current.parentElement;
        depth++;
      }
    }
    static openChatSidebar() {
      try {
        const win = Zotero.getMainWindow();
        if (!win) return;
        const docs = [win.document];
        if (typeof Zotero.Reader.getActiveReader === "function") {
          const activeReader = Zotero.Reader.getActiveReader();
          if (activeReader) {
            const iframeDoc = activeReader._iframeWindow?.document;
            if (iframeDoc && !docs.includes(iframeDoc)) {
              docs.push(iframeDoc);
            }
            const readerWinDoc = activeReader.window?.document;
            if (readerWinDoc && !docs.includes(readerWinDoc)) {
              docs.push(readerWinDoc);
            }
          }
        }
        if (typeof Zotero.Reader.getInstances === "function") {
          const instances = Zotero.Reader.getInstances();
          for (const r of instances) {
            const iframeDoc = r._iframeWindow?.document;
            if (iframeDoc && !docs.includes(iframeDoc)) {
              docs.push(iframeDoc);
            }
            const readerWinDoc = r.window?.document;
            if (readerWinDoc && !docs.includes(readerWinDoc)) {
              docs.push(readerWinDoc);
            }
          }
        }
        Zotero.debug(`[AI Assistant] Scanning ${docs.length} documents for chat sidebar/sidenav elements...`);
        for (const doc of docs) {
          try {
            const splitters = doc.querySelectorAll("splitter, #zotero-context-splitter, #zotero-items-splitter, #zotero-right-splitter");
            for (let i = 0; i < splitters.length; i++) {
              const splitter = splitters[i];
              if (splitter.getAttribute("state") === "collapsed" || splitter.getAttribute("collapsed") === "true") {
                Zotero.debug("[AI Assistant] Expanding collapsed pane splitter: " + splitter.id);
                splitter.setAttribute("state", "");
                splitter.removeAttribute("collapsed");
              }
            }
          } catch (err) {
            Zotero.debug("[AI Assistant] Error checking splitters: " + err);
          }
        }
        const selectors = [
          '[data-pane-id="zotero-llm-chat"]',
          '[pane-id="zotero-llm-chat"]',
          "#zotero-llm-chat",
          ".zotero-llm-chat",
          "#zotero-item-pane-sidenav-zotero-llm-chat"
        ];
        for (const doc of docs) {
          for (const selector of selectors) {
            const el = doc.querySelector(selector);
            if (el) {
              Zotero.debug(`[AI Assistant] Found element by selector ${selector} in document: ${el.tagName}`);
              if (el.tagName.toLowerCase() === "details" && !el.hasAttribute("open")) {
                el.setAttribute("open", "true");
              }
              this.triggerClick(el);
              const details = el.closest("details") || el.querySelector("details");
              if (details && !details.hasAttribute("open")) {
                details.setAttribute("open", "true");
              }
              return;
            }
          }
          const allElements = doc.querySelectorAll("*");
          for (const el of allElements) {
            const htmlEl = el;
            const attributes = htmlEl.attributes;
            if (attributes) {
              for (let i = 0; i < attributes.length; i++) {
                const attr = attributes[i];
                if (attr.value && attr.value.includes("zotero-llm-chat")) {
                  Zotero.debug(`[AI Assistant] Found element by attribute ${attr.name}=${attr.value}: ${htmlEl.tagName}`);
                  this.triggerClick(htmlEl);
                  const details = htmlEl.closest("details") || htmlEl.querySelector("details");
                  if (details && !details.hasAttribute("open")) {
                    details.setAttribute("open", "true");
                  }
                  return;
                }
              }
            }
            if (htmlEl.tagName.toLowerCase() === "image" || htmlEl.tagName.toLowerCase() === "img") {
              const src = htmlEl.getAttribute("src");
              if (src && src.includes("robot.svg") && src.includes("ai-assistant")) {
                Zotero.debug(`[AI Assistant] Found element by icon src ${src}: ${htmlEl.tagName}`);
                this.triggerClick(htmlEl);
                return;
              }
            }
          }
        }
        Zotero.debug("[AI Assistant] Completed scan of all documents but could not find chat sidebar button.");
      } catch (e) {
        Zotero.debug("[AI Assistant] Error opening chat sidebar: " + e);
      }
    }
    static async handleExternalAction(text, action) {
      if (!this.onAction) {
        Zotero.debug("[AI Assistant] Sidebar not open, attempting to open it programmatically...");
        this.openChatSidebar();
        let attempts = 0;
        while (!this.onAction && attempts < 20) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          attempts++;
        }
      }
      if (this.onAction) {
        await this.onAction(text, action);
      } else {
        ztoolkit.getGlobal("alert")(
          "Please open the AI Assistant sidebar first."
        );
      }
    }
    static registerPrefs() {
      Zotero.PreferencePanes.register({
        pluginID: addon.data.config.addonID,
        src: rootURI + "content/preferences.xhtml",
        label: getString("prefs-title"),
        image: `chrome://${addon.data.config.addonRef}/content/icons/robot.svg`
      });
    }
    static registerChatSection() {
      const ROBOT_ICON = `chrome://${addon.data.config.addonRef}/content/icons/robot.svg`;
      Zotero.ItemPaneManager.registerSection({
        paneID: "zotero-llm-chat",
        pluginID: addon.data.config.addonID,
        header: {
          l10nID: getLocaleID("item-section-chat-header"),
          icon: ROBOT_ICON
        },
        sidenav: {
          l10nID: getLocaleID("item-section-chat-sidenav"),
          icon: ROBOT_ICON
        },
        bodyXHTML: "",
        onRender: async ({ body, item }) => {
          const doc = body.ownerDocument;
          ensureChatStyles(doc);
          const NS = "http://www.w3.org/1999/xhtml";
          let container = body.querySelector(
            "#zotero-llm-chat-main"
          );
          if (!container) {
            body.style.display = "flex";
            body.style.flexDirection = "column";
            body.style.height = "100%";
            body.style.minHeight = "400px";
            container = doc.createElementNS(NS, "div");
            container.id = "zotero-llm-chat-main";
            container.style.display = "flex";
            container.style.flexDirection = "column";
            container.style.height = "calc(100vh - 160px)";
            container.style.width = "100%";
            container.style.padding = "5px";
            container.style.boxSizing = "border-box";
            container.style.overflow = "hidden";
            body.appendChild(container);
            const toolbar = doc.createElementNS(NS, "div");
            toolbar.id = "zotero-llm-chat-toolbar";
            toolbar.style.display = "flex";
            toolbar.style.flexShrink = "0";
            toolbar.style.justifyContent = "space-between";
            toolbar.style.alignItems = "center";
            toolbar.style.flexWrap = "wrap";
            toolbar.style.gap = "5px";
            toolbar.style.paddingBottom = "5px";
            toolbar.style.borderBottom = "1px solid var(--material-divider, #ccc)";
            toolbar.style.marginBottom = "5px";
            container.appendChild(toolbar);
            const sessionSelect2 = doc.createElementNS(
              NS,
              "select"
            );
            sessionSelect2.id = "zotero-llm-chat-session-select";
            sessionSelect2.style.flex = "1 1 120px";
            sessionSelect2.style.minWidth = "0";
            toolbar.appendChild(sessionSelect2);
            const newBtn2 = doc.createElementNS(NS, "button");
            newBtn2.id = "zotero-llm-chat-new-btn";
            newBtn2.textContent = "New Chat";
            newBtn2.style.minWidth = "60px";
            newBtn2.style.cursor = "pointer";
            toolbar.appendChild(newBtn2);
            const messagesContainer2 = doc.createElementNS(
              NS,
              "div"
            );
            messagesContainer2.id = "zotero-llm-chat-messages";
            messagesContainer2.style.flex = "1";
            messagesContainer2.style.minHeight = "0";
            messagesContainer2.style.overflowY = "auto";
            messagesContainer2.style.marginBottom = "5px";
            messagesContainer2.style.border = "1px solid var(--material-divider, #ccc)";
            messagesContainer2.style.padding = "10px";
            messagesContainer2.style.borderRadius = "4px";
            messagesContainer2.style.backgroundColor = "var(--material-background, #f9f9f9)";
            messagesContainer2.style.color = "var(--material-on-surface, black)";
            messagesContainer2.style.display = "flex";
            messagesContainer2.style.flexDirection = "column";
            messagesContainer2.style.gap = "10px";
            messagesContainer2.style.userSelect = "text";
            messagesContainer2.style.MozUserSelect = "text";
            container.appendChild(messagesContainer2);
            messagesContainer2.addEventListener("click", (e) => {
              const target = e.target;
              const a = target && typeof target.closest === "function" ? target.closest("a[href]") : null;
              if (!a) return;
              const href = a.getAttribute("href");
              if (!href || href.indexOf("javascript:") === 0) return;
              e.preventDefault();
              e.stopPropagation();
              try {
                Zotero.launchURL(href);
              } catch (err) {
                Zotero.debug("[AI Assistant] Failed to open link: " + err);
              }
            });
            const inputArea = doc.createElementNS(NS, "div");
            inputArea.style.display = "flex";
            inputArea.style.flexShrink = "0";
            inputArea.style.gap = "5px";
            inputArea.style.alignItems = "stretch";
            inputArea.style.paddingTop = "5px";
            inputArea.style.backgroundColor = "transparent";
            container.appendChild(inputArea);
            const input2 = doc.createElementNS(
              NS,
              "textarea"
            );
            input2.id = "zotero-llm-chat-input";
            input2.placeholder = "Ask a question...";
            input2.rows = 4;
            input2.style.flex = "1";
            input2.style.resize = "none";
            input2.style.padding = "5px";
            input2.style.borderRadius = "4px";
            input2.style.border = "1px solid var(--material-divider, #ccc)";
            input2.style.backgroundColor = "var(--material-side-bar-background, #fff)";
            input2.style.color = "var(--material-on-surface, black)";
            inputArea.appendChild(input2);
            const rightControls = doc.createElementNS(NS, "div");
            rightControls.style.display = "flex";
            rightControls.style.flexDirection = "column";
            rightControls.style.gap = "5px";
            rightControls.style.minWidth = "60px";
            inputArea.appendChild(rightControls);
            const fullTextContainer = doc.createElementNS(
              NS,
              "div"
            );
            fullTextContainer.style.display = "flex";
            fullTextContainer.style.alignItems = "center";
            fullTextContainer.style.justifyContent = "center";
            const fullTextCheckbox2 = doc.createElementNS(
              NS,
              "input"
            );
            fullTextCheckbox2.type = "checkbox";
            fullTextCheckbox2.id = "zotero-llm-chat-fulltext-checkbox";
            fullTextCheckbox2.style.cursor = "pointer";
            fullTextCheckbox2.style.margin = "0";
            const fullTextLabel = doc.createElementNS(
              NS,
              "label"
            );
            fullTextLabel.textContent = "Full Text";
            fullTextLabel.htmlFor = "zotero-llm-chat-fulltext-checkbox";
            fullTextLabel.style.fontSize = "10px";
            fullTextLabel.style.cursor = "pointer";
            fullTextLabel.style.marginLeft = "3px";
            fullTextContainer.appendChild(fullTextCheckbox2);
            fullTextContainer.appendChild(fullTextLabel);
            rightControls.appendChild(fullTextContainer);
            const sendBtn2 = doc.createElementNS(
              NS,
              "button"
            );
            sendBtn2.id = "zotero-llm-chat-send";
            sendBtn2.textContent = "Send";
            sendBtn2.style.flex = "1";
            sendBtn2.style.cursor = "pointer";
            sendBtn2.style.backgroundColor = "var(--material-side-bar-background, #eee)";
            sendBtn2.style.border = "1px solid var(--material-divider, #ccc)";
            sendBtn2.style.borderRadius = "4px";
            rightControls.appendChild(sendBtn2);
          }
          // The setup below (state closures, event handlers, loadSessions)
          // must run only once per item. onRender is re-fired by Zotero during
          // normal use; re-running it cleared the message list mid-stream and
          // made streaming text vanish. Re-wire only when the item changes.
          if (container._aiAssistantWired === item.id) return;
          container._aiAssistantWired = item.id;
          const sendBtn = body.querySelector(
            "#zotero-llm-chat-send"
          );
          const newBtn = body.querySelector(
            "#zotero-llm-chat-new-btn"
          );
          const sessionSelect = body.querySelector(
            "#zotero-llm-chat-session-select"
          );
          const fullTextCheckbox = body.querySelector(
            "#zotero-llm-chat-fulltext-checkbox"
          );
          const input = body.querySelector(
            "#zotero-llm-chat-input"
          );
          const messagesContainer = body.querySelector(
            "#zotero-llm-chat-messages"
          );
          let currentSession = null;
          let currentSessions = [];
          let isProcessing = false;
          const renderMessages = (messages) => {
            messagesContainer.innerHTML = "";
            const streamingActive = _activeStream && _activeStream.itemID === item.id;
            if (messages.length === 0 && !streamingActive) {
              messagesContainer.innerHTML = '<div id="zotero-llm-chat-placeholder" style="opacity: 0.7; font-style: italic; text-align: center; margin-top: 10px;">Start a new conversation!</div>';
              return;
            }
            messages.forEach(
              (msg) => appendMessageUI(
                messagesContainer,
                msg.role,
                msg.content,
                msg.tokenCount,
                msg.promptTokenCount
              )
            );
            if (streamingActive) {
              appendMessageUI(messagesContainer, "assistant", _activeStream.text || "");
            }
          };
          const loadSessions = async () => {
            currentSessions = await StorageManager.getSessions(item);
            sessionSelect.innerHTML = "";
            currentSessions.sort((a, b) => b.createdAt - a.createdAt);
            if (currentSessions.length > 0) {
              currentSessions.forEach((s) => {
                const option = body.ownerDocument.createElement("option");
                option.value = s.id;
                const dateStr = new Date(s.createdAt).toLocaleString();
                option.text = `[${dateStr}] ${s.title.substring(0, 30)}`;
                sessionSelect.appendChild(option);
              });
              const lastId = _ChatManager.selectedSessionIDs.get(item.id);
              currentSession = currentSessions.find((s) => s.id === lastId) || currentSessions[0];
              _ChatManager.selectedSessionIDs.set(item.id, currentSession.id);
              sessionSelect.value = currentSession.id;
              renderMessages(currentSession.messages);
            } else {
              const option = body.ownerDocument.createElement("option");
              option.text = "No history";
              sessionSelect.appendChild(option);
              sessionSelect.disabled = true;
              currentSession = null;
              renderMessages([]);
            }
            sessionSelect.disabled = currentSessions.length === 0;
          };
          const createNewSession = async () => {
            const newSession = {
              id: Zotero.Utilities.randomString(10),
              createdAt: Date.now(),
              title: "New Chat",
              messages: []
            };
            currentSession = newSession;
            _ChatManager.selectedSessionIDs.set(item.id, newSession.id);
            try {
              await StorageManager.saveSession(item, newSession);
              await loadSessions();
            } catch (e) {
              renderMessages([]);
            }
            input.focus();
          };
          const getFullText = async (item2) => {
            const attachmentsToTry = [];
            if (item2.isRegularItem()) {
              const attachmentIDs = item2.getAttachments();
              for (const id of attachmentIDs) {
                const att = Zotero.Items.get(id);
                if (att && !att.getField("title").startsWith("AI-Assistant-")) {
                  attachmentsToTry.push(att);
                }
              }
            } else if (item2.isAttachment()) {
              attachmentsToTry.push(item2);
            }
            const fullTexts = [];
            for (const attachment of attachmentsToTry) {
              try {
                const indexedState = await Zotero.Fulltext.getIndexedState(attachment);
                if (indexedState !== 3) {
                  Zotero.debug(
                    `[AI Assistant] Attachment ${attachment.id}, ${attachment.getField("title")}, not indexed, indexing now...`
                  );
                  await Zotero.Fulltext.indexItems([attachment.id]);
                }
                const cacheFile = Zotero.Fulltext.getItemCacheFile(attachment);
                if (cacheFile.exists()) {
                  const content = await Zotero.File.getContentsAsync(
                    cacheFile.path
                  );
                  if (content) {
                    fullTexts.push(content);
                  }
                }
              } catch (e) {
                Zotero.debug(
                  `[AI Assistant] getFullText error for attachment ${attachment.id}: ${e}`
                );
              }
            }
            return fullTexts.join("\n");
          };
          _ChatManager.onAction = async (text, action) => {
            const defaultTranslatePrompt = "Please translate the following text into Chinese:";
            const defaultExplainPrompt = "Please explain the following text:";
            let template = "";
            if (action === "translate") {
              template = getPref("promptTranslate") || defaultTranslatePrompt;
            } else if (action === "explain") {
              template = getPref("promptExplain") || defaultExplainPrompt;
            }
            if (!template || template === "undefined") {
              template = action === "translate" ? defaultTranslatePrompt : defaultExplainPrompt;
            }
            input.value = `${template}

"${text}"`;
            sendBtn.click();
          };
          newBtn.onclick = async () => {
            await createNewSession();
          };
          sessionSelect.onchange = (e) => {
            const sessionId = e.target.value;
            _ChatManager.selectedSessionIDs.set(item.id, sessionId);
            const session = currentSessions.find((s) => s.id === sessionId);
            if (session) {
              currentSession = session;
              renderMessages(session.messages);
            }
          };
          input.onkeydown = (e) => {
            const keyEvent = e;
            if (keyEvent.key === "Enter" && !keyEvent.shiftKey) {
              e.preventDefault();
              sendBtn.click();
            }
          };
          sendBtn.onclick = async () => {
            if (isProcessing) return;
            const question = input.value;
            if (!question.trim()) return;
            isProcessing = true;
            let loadingBubble = null;
            try {
              if (!currentSession) {
                await createNewSession();
              }
              input.value = "";
              appendMessageUI(messagesContainer, "user", question);
              const userMsg = { role: "user", content: question };
              currentSession.messages.push(userMsg);
              if (currentSession.messages.length === 1) {
                currentSession.title = question.substring(0, 20) + (question.length > 20 ? "..." : "");
                await StorageManager.saveSession(item, currentSession);
                await loadSessions();
              }
              const itemTitle = item.getField("title");
              const abstract = item.getField("abstractNote");
              let context = `Title: ${itemTitle}
Abstract: ${abstract}`;
              const selectedText = getSelectedText();
              if (selectedText) {
                context += `

[User Selected Text]:
"${selectedText}"`;
                userMsg.content += `

(Context: ${selectedText})`;
              }
              if (fullTextCheckbox && fullTextCheckbox.checked) {
                const fullText = await getFullText(item);
                if (fullText) {
                  const limit = getPref("fullTextLimit") || 1e5;
                  context += `

[Full Text Content]:
${fullText.substring(0, limit)}`;
                }
              }
              loadingBubble = appendMessageUI(
                messagesContainer,
                "assistant",
                "Thinking..."
              );
              _activeStream = { itemID: item.id, text: "" };
              const { content: response, usage } = await callLLM(
                currentSession.messages,
                context,
                (currentText) => {
                  _activeStream = { itemID: item.id, text: currentText };
                  if (loadingBubble) {
                    loadingBubble.innerHTML = '<div class="md-content">' + renderMarkdown(currentText) + "</div>";
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                  }
                }
              );
              const assistantMsg = {
                role: "assistant",
                content: response,
                tokenCount: usage?.completion_tokens,
                promptTokenCount: usage?.prompt_tokens
              };
              currentSession.messages.push(assistantMsg);
              await StorageManager.saveSession(item, currentSession);
              _activeStream = null;
              renderMessages(currentSession.messages);
            } catch (error) {
              const errorMsg = "Error: " + String(error);
              if (loadingBubble) {
                loadingBubble.innerHTML = '<div class="md-content">' + renderMarkdown(errorMsg) + "</div>";
                loadingBubble.style.color = "red";
              } else {
                ztoolkit.getGlobal("alert")(errorMsg);
              }
            } finally {
              _activeStream = null;
              isProcessing = false;
              input.focus();
            }
          };
          await loadSessions();
        }
      });
    }
  };
  function getSelectedText() {
    const reader = Zotero.Reader.getByTabID(
      Zotero.getMainWindow().Zotero_Tabs.selectedID
    );
    if (!reader) return "";
    const internalReader = reader._internalReader;
    if (internalReader?.lastSelectedText) {
      return internalReader.lastSelectedText;
    }
    const iframeWindow = reader._iframeWindow;
    if (iframeWindow) {
      const selection = iframeWindow.getSelection();
      if (selection && selection.toString()) {
        return selection.toString();
      }
    }
    return "";
  }
  function _renderLib(name) {
    const globals = [];
    try {
      globals.push(globalThis);
    } catch (e) {}
    try {
      if (typeof _globalThis !== "undefined") globals.push(_globalThis);
    } catch (e) {}
    try {
      if (typeof self !== "undefined") globals.push(self);
    } catch (e) {}
    for (const g of globals) {
      try {
        if (g && g[name]) return g[name];
      } catch (e) {}
    }
    return void 0;
  }
  function escapeHtml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function _katexMathPlugin(katex) {
    return function (md) {
      const isValidDelim = (state, pos) => {
        const max = state.posMax;
        const prevChar = pos > 0 ? state.src.charCodeAt(pos - 1) : -1;
        const nextChar = pos + 1 <= max ? state.src.charCodeAt(pos + 1) : -1;
        let can_open = true;
        let can_close = true;
        if (prevChar === 32 || prevChar === 9 || nextChar >= 48 && nextChar <= 57) can_close = false;
        if (nextChar === 32 || nextChar === 9) can_open = false;
        return { can_open, can_close };
      };
      const math_inline = (state, silent) => {
        if (state.src[state.pos] !== "$") return false;
        const openDelim = isValidDelim(state, state.pos);
        if (!openDelim.can_open) {
          if (!silent) state.pending += "$";
          state.pos += 1;
          return true;
        }
        const start = state.pos + 1;
        let match = start;
        let pos;
        while ((match = state.src.indexOf("$", match)) !== -1) {
          pos = match - 1;
          while (state.src[pos] === "\\") pos -= 1;
          if ((match - pos) % 2 === 1) break;
          match += 1;
        }
        if (match === -1) {
          if (!silent) state.pending += "$";
          state.pos = start;
          return true;
        }
        if (match - start === 0) {
          if (!silent) state.pending += "$$";
          state.pos = start + 1;
          return true;
        }
        const closeDelim = isValidDelim(state, match);
        if (!closeDelim.can_close) {
          if (!silent) state.pending += "$";
          state.pos = start;
          return true;
        }
        if (!silent) {
          const token = state.push("math_inline", "math", 0);
          token.markup = "$";
          token.content = state.src.slice(start, match);
        }
        state.pos = match + 1;
        return true;
      };
      const math_inline_paren = (state, silent) => {
        if (state.src[state.pos] !== "\\" || state.src[state.pos + 1] !== "(") return false;
        const start = state.pos + 2;
        let match = start;
        let pos;
        while ((match = state.src.indexOf("\\)", match)) !== -1) {
          pos = match - 1;
          while (state.src[pos] === "\\") pos -= 1;
          if ((match - pos) % 2 === 1) break;
          match += 2;
        }
        if (match === -1) {
          if (!silent) state.pending += "\\(";
          state.pos = start;
          return true;
        }
        if (match - start === 0) {
          if (!silent) state.pending += "\\(\\)";
          state.pos = start + 2;
          return true;
        }
        if (!silent) {
          const token = state.push("math_inline", "math", 0);
          token.markup = "\\(";
          token.content = state.src.slice(start, match);
        }
        state.pos = match + 2;
        return true;
      };
      const math_block = (state, startLine, endLine, silent) => {
        let pos = state.bMarks[startLine] + state.tShift[startLine];
        let max = state.eMarks[startLine];
        if (pos + 2 > max) return false;
        if (state.src.slice(pos, pos + 2) !== "$$") return false;
        pos += 2;
        let firstLine = state.src.slice(pos, max);
        if (silent) return true;
        let found = false;
        if (firstLine.trim().slice(-2) === "$$") {
          firstLine = firstLine.trim().slice(0, -2);
          found = true;
        }
        let lastLine = "";
        let nextLine = startLine;
        for (; !found; ) {
          nextLine += 1;
          if (nextLine >= endLine) break;
          pos = state.bMarks[nextLine] + state.tShift[nextLine];
          max = state.eMarks[nextLine];
          if (pos < max && state.tShift[nextLine] < state.blkIndent) break;
          if (state.src.slice(pos, max).trim().slice(-2) === "$$") {
            const lastPos = state.src.slice(0, max).lastIndexOf("$$");
            lastLine = state.src.slice(pos, lastPos);
            found = true;
          }
        }
        state.line = nextLine + 1;
        const token = state.push("math_block", "math", 0);
        token.block = true;
        token.content = (firstLine && firstLine.trim() ? firstLine + "\n" : "") + state.getLines(startLine + 1, nextLine, state.tShift[startLine], true) + (lastLine && lastLine.trim() ? lastLine : "");
        token.map = [startLine, state.line];
        token.markup = "$$";
        return true;
      };
      const math_block_bracket = (state, startLine, endLine, silent) => {
        let pos = state.bMarks[startLine] + state.tShift[startLine];
        let max = state.eMarks[startLine];
        if (pos + 2 > max) return false;
        if (state.src.slice(pos, pos + 2) !== "\\[") return false;
        pos += 2;
        let firstLine = state.src.slice(pos, max);
        if (silent) return true;
        let found = false;
        if (firstLine.trim().slice(-2) === "\\]") {
          firstLine = firstLine.trim().slice(0, -2);
          found = true;
        }
        let lastLine = "";
        let nextLine = startLine;
        for (; !found; ) {
          nextLine += 1;
          if (nextLine >= endLine) break;
          pos = state.bMarks[nextLine] + state.tShift[nextLine];
          max = state.eMarks[nextLine];
          if (pos < max && state.tShift[nextLine] < state.blkIndent) break;
          if (state.src.slice(pos, max).trim().slice(-2) === "\\]") {
            const lastPos = state.src.slice(0, max).lastIndexOf("\\]");
            lastLine = state.src.slice(pos, lastPos);
            found = true;
          }
        }
        state.line = nextLine + 1;
        const token = state.push("math_block", "math", 0);
        token.block = true;
        token.content = (firstLine && firstLine.trim() ? firstLine + "\n" : "") + state.getLines(startLine + 1, nextLine, state.tShift[startLine], true) + (lastLine && lastLine.trim() ? lastLine : "");
        token.map = [startLine, state.line];
        token.markup = "\\[\\]";
        return true;
      };
      const katexInline = (latex) => {
        try {
          return katex.renderToString(latex, { displayMode: false, throwOnError: false });
        } catch (e) {
          return latex;
        }
      };
      const katexBlock = (latex) => {
        try {
          return katex.renderToString(latex, { displayMode: true, throwOnError: false });
        } catch (e) {
          return latex;
        }
      };
      md.inline.ruler.before("escape", "math_inline_paren", math_inline_paren);
      md.inline.ruler.after("escape", "math_inline", math_inline);
      md.block.ruler.after("blockquote", "math_block", math_block, { alt: ["paragraph", "reference", "blockquote", "list"] });
      md.block.ruler.after("blockquote", "math_block_bracket", math_block_bracket, { alt: ["paragraph", "reference", "blockquote", "list"] });
      md.renderer.rules.math_inline = (tokens, idx) => katexInline(tokens[idx].content);
      md.renderer.rules.math_block = (tokens, idx) => katexBlock(tokens[idx].content) + "\n";
    };
  }
  let _mdInstance = null;
  let _activeStream = null;
  function renderMarkdown(text) {
    if (text == null) return "";
    const mdLib = _renderLib("markdownit");
    const katex = _renderLib("katex");
    if (mdLib) {
      try {
        if (!_mdInstance) {
          _mdInstance = new mdLib({ html: false, linkify: true, breaks: true, typographer: false, xhtmlOut: true });
          if (katex) _mdInstance.use(_katexMathPlugin(katex));
        }
        return _mdInstance.render(String(text));
      } catch (e) {
        Zotero.debug("[AI Assistant] Markdown render failed: " + e);
      }
    }
    return escapeHtml(String(text)).replace(/\n/g, "<br>");
  }
  const MARKDOWN_CSS = `
#zotero-llm-chat-messages .md-content { word-break: break-word; overflow-wrap: anywhere; }
#zotero-llm-chat-messages .md-content > *:first-child { margin-top: 0; }
#zotero-llm-chat-messages .md-content > *:last-child { margin-bottom: 0; }
#zotero-llm-chat-messages .md-content p { margin: 0 0 0.6em 0; }
#zotero-llm-chat-messages .md-content h1, #zotero-llm-chat-messages .md-content h2, #zotero-llm-chat-messages .md-content h3,
#zotero-llm-chat-messages .md-content h4, #zotero-llm-chat-messages .md-content h5, #zotero-llm-chat-messages .md-content h6 {
  margin: 0.8em 0 0.4em 0; font-weight: 600; line-height: 1.3;
}
#zotero-llm-chat-messages .md-content h1 { font-size: 1.5em; }
#zotero-llm-chat-messages .md-content h2 { font-size: 1.35em; }
#zotero-llm-chat-messages .md-content h3 { font-size: 1.2em; }
#zotero-llm-chat-messages .md-content h4 { font-size: 1.1em; }
#zotero-llm-chat-messages .md-content h5, #zotero-llm-chat-messages .md-content h6 { font-size: 1em; }
#zotero-llm-chat-messages .md-content ul, #zotero-llm-chat-messages .md-content ol { margin: 0 0 0.6em 0; padding-left: 1.5em; }
#zotero-llm-chat-messages .md-content li { margin: 0.2em 0; }
#zotero-llm-chat-messages .md-content code {
  font-family: ui-monospace, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 0.9em; background: rgba(127, 127, 127, 0.18); padding: 0.1em 0.35em; border-radius: 4px;
}
#zotero-llm-chat-messages .md-content pre {
  background: #2b2b2b; color: #f8f8f2; padding: 0.7em 0.9em; border-radius: 6px; overflow-x: auto; margin: 0 0 0.6em 0;
}
#zotero-llm-chat-messages .md-content pre code { background: transparent; padding: 0; color: inherit; font-size: 0.9em; }
#zotero-llm-chat-messages .md-content blockquote {
  border-left: 3px solid rgba(127, 127, 127, 0.4); margin: 0 0 0.6em 0; padding-left: 0.8em; opacity: 0.9;
}
#zotero-llm-chat-messages .md-content blockquote p { margin-bottom: 0.3em; }
#zotero-llm-chat-messages .md-content table { border-collapse: collapse; margin: 0 0 0.6em 0; display: block; overflow-x: auto; }
#zotero-llm-chat-messages .md-content th, #zotero-llm-chat-messages .md-content td {
  border: 1px solid rgba(127, 127, 127, 0.4); padding: 0.3em 0.7em;
}
#zotero-llm-chat-messages .md-content th { background: rgba(127, 127, 127, 0.15); }
#zotero-llm-chat-messages .md-content a { color: inherit; text-decoration: underline; cursor: pointer; }
#zotero-llm-chat-messages .md-content hr { border: none; border-top: 1px solid rgba(127, 127, 127, 0.4); margin: 0.8em 0; }
#zotero-llm-chat-messages .md-content img { max-width: 100%; }
#zotero-llm-chat-messages .md-content .katex-display { margin: 0.6em 0; overflow-x: auto; overflow-y: hidden; }
#zotero-llm-chat-messages .md-content .katex { font-size: 1.05em; }
`;
  function ensureChatStyles(doc) {
    const head = doc.head || doc.documentElement;
    if (!head || doc.getElementById("ai-assistant-katex-css")) return;
    try {
      const link = doc.createElementNS("http://www.w3.org/1999/xhtml", "link");
      link.id = "ai-assistant-katex-css";
      link.rel = "stylesheet";
      link.setAttribute("href", "chrome://ai-assistant/content/katex.min.css");
      head.appendChild(link);
    } catch (e) {}
    try {
      const style = doc.createElementNS("http://www.w3.org/1999/xhtml", "style");
      style.id = "ai-assistant-markdown-css";
      style.textContent = MARKDOWN_CSS;
      head.appendChild(style);
    } catch (e) {}
  }
  function appendMessageUI(container, role, text, tokenCount, promptTokenCount) {
    const doc = container.ownerDocument;
    const wrapper = doc.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "div"
    );
    wrapper.style.display = "flex";
    wrapper.style.flexDirection = "column";
    wrapper.style.width = "100%";
    wrapper.style.marginBottom = "15px";
    wrapper.style.userSelect = "text";
    wrapper.style.MozUserSelect = "text";
    const now = /* @__PURE__ */ new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const timestamp = doc.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "div"
    );
    timestamp.style.fontSize = "0.75em";
    timestamp.style.color = "#8e8e93";
    timestamp.style.marginBottom = "2px";
    timestamp.textContent = timeStr;
    const bubble = doc.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "div"
    );
    bubble.style.maxWidth = "85%";
    bubble.style.padding = "8px 12px";
    bubble.style.borderRadius = "12px";
    bubble.style.wordWrap = "break-word";
    bubble.style.fontSize = "1em";
    bubble.style.lineHeight = "1.4";
    bubble.style.userSelect = "text";
    bubble.style.MozUserSelect = "text";
    if (role === "user") {
      wrapper.style.alignItems = "flex-end";
      timestamp.style.marginRight = "4px";
      bubble.style.backgroundColor = "#007AFF";
      bubble.style.color = "white";
      bubble.style.borderBottomRightRadius = "2px";
    } else {
      wrapper.style.alignItems = "flex-start";
      timestamp.style.marginLeft = "4px";
      bubble.style.backgroundColor = "#F2F2F7";
      bubble.style.color = "black";
      bubble.style.borderBottomLeftRadius = "2px";
      bubble.style.border = "1px solid #E5E5EA";
    }
    let displayText = text;
    if (role === "user" && text.includes("\n\n(Context:")) {
      displayText = text.split("\n\n(Context:")[0];
    }
    bubble.innerHTML = '<div class="md-content">' + renderMarkdown(displayText) + "</div>";
    wrapper.appendChild(timestamp);
    wrapper.appendChild(bubble);
    if (role === "assistant" && (tokenCount !== void 0 || promptTokenCount !== void 0)) {
      const tokenDisplay = doc.createElementNS(
        "http://www.w3.org/1999/xhtml",
        "div"
      );
      tokenDisplay.style.fontSize = "0.7em";
      tokenDisplay.style.color = "#aaa";
      tokenDisplay.style.marginTop = "2px";
      tokenDisplay.style.marginLeft = "4px";
      const inputStr = promptTokenCount !== void 0 ? `Input: ${promptTokenCount}` : "";
      const outputStr = tokenCount !== void 0 ? `Output: ${tokenCount}` : "";
      tokenDisplay.textContent = [inputStr, outputStr].filter((s) => s).join(" | ") + " tokens";
      wrapper.appendChild(tokenDisplay);
    }
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;
    return bubble;
  }
  async function callLLM(history, context, onUpdate) {
    const apiUrl = getPref("apiUrl");
    const apiKey = getPref("apiKey");
    const model = getPref("model");
    if (!apiUrl || !apiKey) {
      throw new Error("Please check API configuration (URL or Key missing).");
    }
    const systemPrompt = `You are a helpful research assistant. Answer questions based on the provided paper abstract and any selected text context. If selected text is provided, prioritize it.
Paper Context:
${context}`;
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((m) => ({ role: m.role, content: m.content }))
    ];
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
        stream_options: { include_usage: true }
      })
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API Error: ${response.status} - ${text}`);
    }
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = "";
    let usage = void 0;
    let buffer = "";
    const handleDataLine = (dataStr) => {
      if (!dataStr || dataStr === "[DONE]") return;
      try {
        const data = JSON.parse(dataStr);
        if (data.choices?.[0]?.delta?.content) {
          fullContent += data.choices[0].delta.content;
          onUpdate(fullContent);
        }
        if (data.usage) {
          usage = data.usage;
        }
      } catch (e) {
      }
    };
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      // Append decoded bytes and process only complete lines, keeping any
      // trailing partial line buffered so a JSON chunk split across network
      // reads is never lost.
      buffer += decoder.decode(value, { stream: true });
      let newlineIndex;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        const line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        if (line.startsWith("data:")) {
          handleDataLine(line.slice(5).trim());
        }
      }
    }
    // Flush any buffered partial multibyte sequence and a final data line.
    buffer += decoder.decode();
    if (buffer.startsWith("data:")) {
      handleDataLine(buffer.slice(5).trim());
    }
    return { content: fullContent, usage };
  }

  // src/modules/reader.ts
  var ReaderManager = class {
    static init() {
      Zotero.Reader.registerEventListener(
        "renderTextSelectionPopup",
        (event) => {
          const { doc, append, reader, params } = event;
          const text = params.annotation.text;
          Zotero.debug(
            `[AI Assistant] Popup rendered. Text from params: "${text?.substring(0, 30)}..."`
          );
          const btnGroup = doc.createElement("div");
          btnGroup.className = "ai-assistant-btn-group";
          btnGroup.style.display = "flex";
          btnGroup.style.gap = "5px";
          btnGroup.style.marginTop = "5px";
          btnGroup.style.padding = "5px";
          btnGroup.style.borderTop = "1px solid #ccc";
          const createBtn = (label, action) => {
            const btn = doc.createElement("button");
            btn.textContent = label;
            btn.style.fontSize = "12px";
            btn.style.padding = "2px 5px";
            btn.style.cursor = "pointer";
            btn.style.backgroundColor = "#f0f0f0";
            btn.style.border = "1px solid #ccc";
            btn.style.borderRadius = "3px";
            btn.onclick = async (e) => {
              Zotero.debug(`[AI Assistant] Button clicked: ${action}`);
              try {
                if (text) {
                  Zotero.debug(
                    `[AI Assistant] Calling ChatManager.handleExternalAction...`
                  );
                  if (typeof ChatManager === "undefined") {
                    Zotero.debug(
                      `[AI Assistant] Error: ChatManager is undefined!`
                    );
                  } else {
                    await ChatManager.handleExternalAction(text, action);
                  }
                } else {
                  Zotero.debug(`[AI Assistant] Error: No text found in params.`);
                }
              } catch (error) {
                Zotero.debug(
                  `[AI Assistant] Error in button click handler: ${error}`
                );
                Zotero.debug(String(error));
              }
            };
            return btn;
          };
          btnGroup.appendChild(createBtn("AI Translate", "translate"));
          btnGroup.appendChild(createBtn("AI Explain", "explain"));
          append(btnGroup);
        },
        addon.data.config.addonID
      );
    }
    static getSelectedText(reader) {
      const internalReader = reader._internalReader;
      if (internalReader?.lastSelectedText) {
        return internalReader.lastSelectedText;
      }
      const iframeWindow = reader._iframeWindow;
      if (iframeWindow) {
        const selection = iframeWindow.getSelection();
        if (selection && selection.toString()) {
          return selection.toString();
        }
      }
      return "";
    }
  };

  // src/utils/ztoolkit.ts
  function createZToolkit() {
    const _ztoolkit = new ZoteroToolkit();
    initZToolkit(_ztoolkit);
    return _ztoolkit;
  }
  function initZToolkit(_ztoolkit) {
    const env = "production";
    _ztoolkit.basicOptions.log.prefix = `[${config.addonName}]`;
    _ztoolkit.basicOptions.log.disableConsole = env === "production";
    _ztoolkit.UI.basicOptions.ui.enableElementJSONLog = false;
    _ztoolkit.UI.basicOptions.ui.enableElementDOMLog = false;
    _ztoolkit.basicOptions.api.pluginID = config.addonID;
    _ztoolkit.ProgressWindow.setIconURI(
      "default",
      `chrome://${config.addonRef}/content/icons/favicon.png`
    );
  }

  // src/hooks.ts
  async function onStartup() {
    await Promise.all([
      Zotero.initializationPromise,
      Zotero.unlockPromise,
      Zotero.uiReadyPromise
    ]);
    initLocale();
    ChatManager.registerPrefs();
    ChatManager.registerChatSection();
    ReaderManager.init();
    await Promise.all(
      Zotero.getMainWindows().map((win) => onMainWindowLoad(win))
    );
    addon.data.initialized = true;
  }
  async function onMainWindowLoad(win) {
    addon.data.ztoolkit = createZToolkit();
    win.MozXULElement.insertFTLIfNeeded(
      `${addon.data.config.addonRef}-mainWindow.ftl`
    );
  }
  async function onMainWindowUnload(win) {
    ztoolkit.unregisterAll();
  }
  function onShutdown() {
    ztoolkit.unregisterAll();
    addon.data.alive = false;
    delete Zotero[addon.data.config.addonInstance];
  }
  async function onNotify(event, type, ids, extraData) {
  }
  async function onPrefsEvent(type, data) {
  }
  var hooks_default = {
    onStartup,
    onShutdown,
    onMainWindowLoad,
    onMainWindowUnload,
    onNotify,
    onPrefsEvent
  };

  // src/addon.ts
  var Addon = class {
    data;
    // Lifecycle hooks
    hooks;
    // APIs
    api;
    constructor() {
      this.data = {
        alive: true,
        config,
        env: "production",
        initialized: false,
        ztoolkit: createZToolkit()
      };
      this.hooks = hooks_default;
      this.api = {};
    }
  };
  var addon_default = Addon;

  // src/index.ts
  var basicTool2 = new BasicTool();
  if (!basicTool2.getGlobal("Zotero")[config.addonInstance]) {
    _globalThis.addon = new addon_default();
    defineGlobal("ztoolkit", () => {
      return _globalThis.addon.data.ztoolkit;
    });
    Zotero[config.addonInstance] = addon;
  }
  function defineGlobal(name, getter) {
    Object.defineProperty(_globalThis, name, {
      get() {
        return getter ? getter() : basicTool2.getGlobal(name);
      }
    });
  }
})();
