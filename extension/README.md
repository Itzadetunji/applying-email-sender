# React Chrome Extension Starter

A modern Chrome extension starter template built with React, TypeScript, Vite, and Bun. Features hot reload for a smooth development experience.

## 📁 Project Structure

```
react-chrome-extension-starter/
├── public/
│   └── icons/              # Extension icons
├── src/
│   ├── assets/            # Static assets
│   ├── pages/
│   │   ├── background/    # Background script
│   │   │   └── index.ts
│   │   ├── content/       # Content script
│   │   │   └── index.ts
│   │   └── popup/         # Extension popup
│   │       ├── index.html
│   │       └── index.tsx
│   └── style.css          # Global styles
├── manifest.json          # Extension manifest
├── vite.config.ts         # Vite configuration
└── package.json
```

## 🚀 Getting Started

### Installation

```bash
bun install
```

### For Development / Production

```bash
bun run build
```

## 🔧 Loading the Extension in Chrome

1. **Build the extension**:

   ```bash
   bun run build
   ```

   This creates a `dist/` folder with your compiled extension.

2. **Open Chrome Extensions page**:

   - Navigate to `chrome://extensions/`
   - Or go to Menu → More Tools → Extensions

3. **Enable Developer Mode**:

   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the extension**:

   - Click "Load unpacked"
   - Select the `dist/` folder from your project directory

5. **Test your extension**:
   - The extension should now appear in your extensions list
   - Click the extension icon in the toolbar to open the popup
   - Visit any webpage to test content scripts

## 🔥 Features

- ⚡️ **Vite** - Lightning fast build tool
- ⚛️ **React** - Framework or Library (I am not sure)
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📦 **Bun** - Fast all-in-one JavaScript runtime
- 🔄 **Hot Reload** - Automatic extension reload during development
- 🎯 **TypeScript** - Type-safe code

## 📝 Development Tips

- **Popup**: Located in `src/pages/popup/` - The UI that appears when clicking the extension icon
- **Content Script**: Located in `src/pages/content/` - Runs in the context of web pages
- **Background Script**: Located in `src/pages/background/` - Runs in the background, handles events

## 🛠️ Built With

- [Bun](https://bun.sh) - JavaScript runtime & package manager
- [Vite](https://vitejs.dev) - Build tool
- [React](https://react.dev) - Framework or Library (I am not sure)
- [TypeScript](https://www.typescriptlang.org) - Type safety
