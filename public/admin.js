'use strict';
const $ = s => document.querySelector(s),
    form = $('#editor-form');
let entries = [],
    editing = null,
    dirty = false,
    saving = false;
const status = (message, error = false) => {
    $('#save-status').textContent = message;
    $('#save-status').classList.toggle('error', error)
};
const el = (tag, text, className) => {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node
};
async function api(data) {
    const response = await fetch('/api/admin', {
        method: data ? 'POST' : 'GET',
        cache: 'no-store',
        headers: data ? {
            'Content-Type': 'application/json'
        } : undefined,
        body: data ? JSON.stringify(data) : undefined
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed. Please try again.');
    return result;
}
async function load() {
    try {
        const result = await api();
        entries = result.entries;
        $('#list-state').classList.remove('error');
        render();
    } catch (e) {
        $('#list-state').textContent = e.message;
        $('#list-state').classList.add('error');
    }
}

function render() {
    $('#total').textContent = entries.length;
    $('#published').textContent = entries.filter(e => e.status === 'published').length;
    $('#drafts').textContent = entries.filter(e => e.status === 'draft').length;
    const query = $('#search').value.trim().toLowerCase(),
        kind = $('#kind-filter').value,
        visibility = $('#status-filter').value;
    const visible = entries.filter(e => (kind === 'all' || e.kind === kind) && (visibility === 'all' || e.status === visibility) && e.title.toLowerCase().includes(query));
    $('#entry-list').replaceChildren();
    $('#list-state').textContent = entries.length ? (visible.length ? '' : 'No entries match these filters.') : 'Your library is empty. Create your first approved post or event.';
    visible.forEach(entry => {
        const row = el('article', undefined, 'entry-row'),
            meta = el('div', undefined, 'meta');
        meta.append(el('span', `${entry.kind.toUpperCase()} · ${entry.category}`), el('span', entry.status.toUpperCase()));
        row.append(meta, el('h3', entry.title), el('p', entry.summary.length > 140 ? entry.summary.slice(0, 140) + '…' : entry.summary));
        const edit = el('button', 'Edit', 'quiet');
        edit.type = 'button';
        edit.addEventListener('click', () => openEntry(entry));
        row.append(edit);
        $('#entry-list').append(row)
    });
}

function dateField() {
    const event = $('#kind').value === 'event';
    $('#date-field').hidden = !event;
    $('#event-date').required = event;
}

function canLeave() {
    return !dirty || confirm('Discard unsaved changes?');
}

function openEntry(entry) {
    if (saving || !canLeave()) return;
    editing = entry ? {
        ...entry
    } : null;
    form.reset();
    $('#entry-id').value = entry?.id || '';
    for (const key of ['kind', 'category', 'title', 'summary', 'body', 'link', 'image', 'status'])
        if (entry) $('#' + key).value = entry[key];
    $('#event-date').value = entry?.event_date || '';
    $('#editor-heading').textContent = entry ? 'Edit entry' : 'New entry';
    $('#editing-status').textContent = entry ? entry.status.toUpperCase() : 'NOT SAVED';
    $('#delete').hidden = !entry;
    dirty = false;
    status('');
    dateField();
    if (matchMedia('(max-width:900px)').matches) $('#editor-heading').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}
form.addEventListener('input', () => {
    dirty = true;
    $('#editing-status').textContent = 'UNSAVED CHANGES'
});
$('#kind').addEventListener('change', dateField);
form.addEventListener('submit', async event => {
    event.preventDefault();
    if (saving || !form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    data.id = editing?.id || '';
    data.updated_at = editing?.updated_at || '';
    data.action = 'save';
    saving = true;
    $('#save').disabled = true;
    $('#delete').disabled = true;
    status('Saving…');
    try {
        const saved = await api(data);
        dirty = false;
        await load();
        const updated = entries.find(e => e.id === saved.id);
        saving = false;
        if (updated) openEntry(updated);
        status(data.status === 'published' ? 'Saved and published. Open or refresh the website to see it.' : 'Draft saved. It is only visible in this dashboard.');
    } catch (e) {
        status(e.message, true)
    } finally {
        saving = false;
        $('#save').disabled = false;
        $('#delete').disabled = false;
    }
});
$('#delete').addEventListener('click', async () => {
    if (!editing || saving || !confirm(`Permanently delete “${editing.title}”? This cannot be undone.`)) return;
    saving = true;
    $('#delete').disabled = true;
    try {
        await api({
            action: 'delete',
            id: editing.id
        });
        dirty = false;
        saving = false;
        openEntry(null);
        await load();
        status('Entry deleted.');
    } catch (e) {
        status(e.message, true)
    } finally {
        saving = false;
        $('#delete').disabled = false
    }
});
$('#new-entry').addEventListener('click', () => openEntry(null));
$('#refresh').addEventListener('click', load);
['#search', '#kind-filter', '#status-filter'].forEach(s => $(s).addEventListener('input', render));
$('#preview-button').addEventListener('click', () => {
    $('#preview-label').textContent = `${$('#kind').value.toUpperCase()} · ${$('#category').value.toUpperCase()}${$('#kind').value==='event'?' · '+$('#event-date').value:''}`;
    $('#preview-title').textContent = $('#title').value || 'Untitled';
    $('#preview-summary').textContent = $('#summary').value;
    $('#preview-body').textContent = $('#body').value;
    $('#preview').showModal()
});
$('#close-preview').addEventListener('click', () => $('#preview').close());
$('#export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({
        exported_at: new Date().toISOString(),
        entries
    }, null, 2)], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob),
        a = el('a');
    a.href = url;
    a.download = 'lavender-content-backup.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000)
});
window.addEventListener('beforeunload', event => {
    if (dirty) {
        event.preventDefault();
        event.returnValue = ''
    }
});
dateField();
load();