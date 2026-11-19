// Vice Cover entry point: builds the editor, then, when the page carries a
// ?shot= query, stages a fixed scene for a screenshot instead.

import { initEditor } from './editor.js';
import { runScene } from './scenes.js';

const editor = initEditor();
const query = new URLSearchParams(location.search);

if (query.get('shot')) {
  runScene(query, editor).catch((err) => {
    console.error('Scene failed:', err);
    window.__shotReady = true;
  });
}
