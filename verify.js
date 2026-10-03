(() => {
    if (location.hostname !== '127.0.0.1' ||
        !['/before/', '/after/'].includes(location.pathname)) {
        throw new Error('Run only against the local regression fixture');
    }
    const before = location.pathname === '/before/';
    const original = structuredClone(S.activity);
    S.sessionsOpen = true;
    stopMeshPolling();
    renderContextMesh();
    renderSessionList();
    const mesh = () => document.querySelector('.mesh-node');
    const icon = () => document.querySelector('.sess-tools span');
    const attributes = {
        mesh: mesh().getAttribute('data-probe'),
        session: icon().getAttribute('data-probe'),
        sessionTitle: icon().title,
    };
    if (before) {
        if (attributes.mesh === null || attributes.session !== '1') {
            throw new Error('Baseline attribute injection was not reproduced');
        }
    } else if (attributes.mesh !== null || attributes.session !== null ||
               attributes.sessionTitle !== original.tools[0].display) {
        throw new Error('Persisted label escaped its attribute after the fix');
    }

    // Harmless, local-only event handler: writes a marker on its own element.
    S.activity.tools[0].display =
        `x" onpointerenter="this.dataset.probe='ran'" data-note="`;
    renderContextMesh();
    renderSessionList();
    mesh().dispatchEvent(new Event('pointerenter'));
    icon().dispatchEvent(new Event('pointerenter'));
    const events = {
        mesh: mesh().getAttribute('data-probe'),
        session: icon().getAttribute('data-probe'),
    };
    if (before ? events.mesh !== 'ran' || events.session !== 'ran'
               : events.mesh !== null || events.session !== null) {
        throw new Error('Unexpected local event-handler result');
    }

    const values = [
        `O'Reilly "Review" & Co.`,
        '<b>literal text</b>',
        '&quot; &#39; &amp;',
        '日本語 · café',
        '',
    ];
    if (!before) {
        for (const value of values) {
            for (const quote of ['"', "'"]) {
                const holder = document.createElement('div');
                holder.innerHTML = `<span title=${quote}${escHtml(value)}${quote}>${escHtml(value)}</span>`;
                const element = holder.firstElementChild;
                if (holder.children.length !== 1 || element.attributes.length !== 1 ||
                    element.title !== value || element.textContent !== value) {
                    throw new Error('Round-trip failed: ' + JSON.stringify(value));
                }
            }
        }
    }
    S.activity = original;
    renderContextMesh();
    renderSessionList();
    return {case: before ? 'before' : 'after', attributes, events,
            roundTrips: before ? 'not asserted on baseline' : 10};
})();
