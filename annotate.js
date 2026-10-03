(() => {
    document.getElementById('evidence-readout')?.remove();
    const before = location.pathname === '/before/';
    const node = document.querySelector('.mesh-node');
    const icon = document.querySelector('.sess-tools span');
    const panel = document.createElement('section');
    panel.id = 'evidence-readout';
    panel.style.cssText = 'position:fixed;bottom:24px;left:250px;right:28px;padding:24px 28px;background:#fafafa;color:#151515;border:1px solid #ccc;border-radius:10px;z-index:9999;box-shadow:0 10px 45px #0005;font-family:Arial,sans-serif';
    const title = document.createElement('h2');
    title.style.cssText = 'font-size:24px;line-height:1.25;margin:0 0 12px;color:' + (before ? '#ad2525' : '#186335');
    title.textContent = before ? 'BEFORE: stored label creates new attributes' : 'AFTER: the same stored label stays literal text';
    const pre = document.createElement('pre');
    pre.style.cssText = 'font:16px/1.8 monospace;white-space:pre-wrap;margin:0;color:#151515';
    pre.textContent = [
        'Stored display label: ' + S.activity.tools[0].display,
        'Mesh data-probe:      ' + JSON.stringify(node.getAttribute('data-probe')),
        'Session data-probe:   ' + JSON.stringify(icon.getAttribute('data-probe')),
        'Session title:        ' + JSON.stringify(icon.title),
    ].join('\n');
    const note = document.createElement('p');
    note.style.cssText = 'font-size:13px;line-height:1.5;margin:12px 0 0;color:#555';
    note.textContent = 'Test overlay reads the live DOM. Real dashboard source, synthetic activity fixture, local Chromium only. ' +
        (before ? 'Baseline: c421ab8.' : 'null means no injected attribute. The saved activity was not rewritten.');
    panel.append(title, pre, note);
    document.body.appendChild(panel);
    return pre.textContent;
})();
