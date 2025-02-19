'use strict';

// This is main process of Electron, started as first thing when app starts.
// This script is running through entire life of the application.
// It doesn't have any windows which you can see on screen, opens the main window from here.

import { app, protocol, BrowserWindow, shell, screen } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import path from 'path';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';


const isDevelopment = process.env.NODE_ENV !== 'production';
declare const __static: string; // https://github.com/electron-userland/electron-webpack/issues/172

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

// Setup logging
autoUpdater.logger = log; // https://www.electron.build/auto-update#debugging
log.transports.file.level = 'silly';
if (!process.env.IS_TEST) {
  Object.assign(console, log.functions);  // override console.log, console.warn etc.
}


function createWindow() {
  // Create the browser window.
  const size = getWindowSize(1350, 955);
  win = new BrowserWindow({
    width: size.width,
    height: size.height,
    webPreferences: {
      contextIsolation: false, // To reach node https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/1285
      // Use pluginOptions.nodeIntegration, leave this alone
      // See https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration
      nodeIntegration: (process.env
          .ELECTRON_NODE_INTEGRATION as unknown) as boolean,
    },
    // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/recipes.html#set-tray-icon
    icon: path.join(__static, 'icon.png'),
  });

  win.setMenuBarVisibility(false);
  configureExternalsUrlsOpenBrowser(win);
  loadApplication(win);

  win.on('closed', () => {
    win = null;
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString()); // tslint:disable-line:no-console
    }
  }
  createWindow();
});

// See electron-builder issue "checkForUpdatesAndNotify updates but does not notify on Windows 10"
// https://github.com/electron-userland/electron-builder/issues/2700
// https://github.com/electron/electron/issues/10864
if (process.platform === 'win32') {
  // https://docs.microsoft.com/en-us/windows/win32/shell/appid#how-to-form-an-application-defined-appusermodelid
  app.setAppUserModelId('Undergroundwires.PrivacySexy');
}

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

function loadApplication(window: BrowserWindow) {
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    loadUrlWithNodeWorkaround(win, process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) {
      win.webContents.openDevTools();
    }
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    loadUrlWithNodeWorkaround(win, 'app://./index.html');
    // tslint:disable-next-line:max-line-length
    autoUpdater.checkForUpdatesAndNotify(); // https://nklayman.github.io/vue-cli-plugin-electron-builder/guide/recipes.html#check-for-updates-in-background-js-ts
  }
}

function configureExternalsUrlsOpenBrowser(window: BrowserWindow) {
  window.webContents.on('new-window', (event, url) => { // handle redirect
    if (url !== win.webContents.getURL()) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
}

// Workaround for https://github.com/electron/electron/issues/19554 otherwise fs does not work
function loadUrlWithNodeWorkaround(window: BrowserWindow, url: string) {
  setTimeout(() => {
    window.loadURL(url);
  }, 10);
}

function getWindowSize(idealWidth: number, idealHeight: number) {
  let { width, height } = screen.getPrimaryDisplay().workAreaSize;
  // To ensure not creating a screen bigger than current screen size
  // Not using "enableLargerThanScreen" as it's macOS only (see https://www.electronjs.org/docs/api/browser-window)
  width = Math.min(width, idealWidth);
  height = Math.min(height, idealHeight);
  return { width, height };
}
