import { BrowserWindow } from "electron";

import { IPCMain } from "@constants/ipc";

export const schemeHandler = async (url: string) => {
  const wins = BrowserWindow.getAllWindows();

  const { protocol, hostname, search: searchRaw } = new URL(url);
  const search = new URLSearchParams(searchRaw);

  if (protocol !== "wakmusic:") return;

  for (const win of wins) {
    if (win.isMinimized()) win.restore();
    win.focus();

    switch (hostname) {
      case "login": {
        await win.webContents.session.cookies.set({
          url: import.meta.env.VITE_API_URL,
          name: "token",
          value: search.get("token") || "",
          sameSite: "no_restriction",
          expirationDate: 9999999999999,
        });

        break;
      }
    }

    win.webContents.send(IPCMain.SCHEME, url);
  }
};
