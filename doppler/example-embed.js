// The worked example is precomputed and independent of a visitor's upload.
const frame = document.getElementById('worked-example-frame');
if (frame) {
  let observer;
  frame.addEventListener('load', () => {
    observer?.disconnect();
    const document = frame.contentDocument;
    if (!document) return;
    const fit = () => {
      const inner = document.getElementById('codex-visualization');
      const height = Math.ceil((inner?.getBoundingClientRect().height || document.body.getBoundingClientRect().height || 1300) + 32);
      if (Math.abs(frame.getBoundingClientRect().height - height) > 2) frame.style.height = `${height}px`;
    };
    observer = new ResizeObserver(fit);
    observer.observe(document.body);
    const inner = document.getElementById('codex-visualization');
    if (inner) observer.observe(inner);
    fit();
  });
}
