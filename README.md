# Description

Balabol is a Google Chrome extension that shows how much people speak during a Google Meet conference.

## Installation

1. Open [chrome://extensions](chrome://extensions).
2. In the top right corner, enable _Developer mode_.
3. In the top left corner, use the _Load unpacked_ button.
4. Choose the `extension` directory.

## Implementation details

The extension uses the session storage to persist data meaning that names and corresponding timestamps are removed as soon as one closes a browser tab. In the meantime, they survive a page reload.

## Acknowledgement

Inspired by [Fugiman/google-meet-grid-view](https://github.com/Fugiman/google-meet-grid-view).
