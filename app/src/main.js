// Vice Cover v4 entry point.
//
// The editor boots first, so the page is usable on its own, and then a
// fixed scene is staged when the URL carries a ?shot= parameter — that is
// how the screenshots in screenshots/ were produced. A scene that fails
// still marks the page ready, so a screenshot tool never waits forever.
// Presets can also be staged from the URL (?preset=heist) without a
// screenshot scene, which is how the preset buttons are smoke-tested.

import { startEditor } from './editor.js';
import { stageShot } from './scenes.js';

const editor = startEditor();
const params = new URLSearchParams(window.location.search);

if (params.get('shot')) {
  stageShot(params, editor).catch((error) => {
    console.error('Scene failed:', error);
    window.__shotReady = true;
  });
} else if (params.get('preset')) {
  editor.applyPreset(params.get('preset'));
  window.__shotReady = true;
}
