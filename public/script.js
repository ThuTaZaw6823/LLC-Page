'use strict';
const menu = document.querySelector('.menu'),
    nav = document.querySelector('#nav');
menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('open', open)
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open')
}));

function filterContent() {
    const selected = document.querySelector('[data-filter].active').dataset.filter;
    let count = 0;
    document.querySelectorAll('[data-category]').forEach(card => {
        card.hidden = selected !== 'all' && card.dataset.category !== selected;
        if (!card.hidden) count++
    });
    document.querySelector('#filter-status').textContent = `Showing ${count} ${count===1?'item':'items'}.`;
    document.querySelector('#no-matches').hidden = count !== 0;
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    document.querySelectorAll('[data-filter]').forEach(b => {
        const selected = b === button;
        b.classList.toggle('active', selected);
        b.setAttribute('aria-pressed', String(selected))
    });
    filterContent()
}));
const node = (tag, text, className) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    if (className) element.className = className;
    return element
};

function safeURL(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'https:' && !url.username && !url.password ? url.href : null
    } catch {
        return null
    }
}

function showDetail(entry) {
    const modal = document.querySelector('#content-detail');
    document.querySelector('#detail-category').textContent = entry.kind === 'event' ? `FREE EVENT · ${entry.event_date}` : entry.category.toUpperCase();
    document.querySelector('#detail-title').textContent = entry.title;
    document.querySelector('#detail-summary').textContent = entry.summary;
    document.querySelector('#detail-body').textContent = entry.body;
    const link = document.querySelector('#detail-link');
    link.hidden = !safeURL(entry.link);
    if (!link.hidden) {
        link.href = safeURL(entry.link);
        link.textContent = entry.kind === 'event' ? 'Event details / registration ↗' : 'Visit source ↗'
    }
    modal.showModal();
}
document.querySelector('#detail-close').addEventListener('click', () => document.querySelector('#content-detail').close());

function card(entry) {
    const article = node('article');
    if (entry.kind === 'post') article.dataset.category = entry.category;
    if (safeURL(entry.image)) {
        const img = node('img');
        img.src = safeURL(entry.image);
        img.alt = '';
        img.loading = 'lazy';
        img.referrerPolicy = 'no-referrer';
        img.className = 'content-image';
        article.append(img)
    } else {
        const tile = node('div', undefined, 'tile ' + ({
            knowledge: 'lavender',
            education: 'green',
            national: 'pink',
            international: 'blue'
        } [entry.category] || 'lavender'));
        tile.append(node('span', entry.kind === 'event' ? '✧' : '✳'), node('small', entry.kind === 'event' ? 'FREE EVENT' : entry.category.toUpperCase()));
        article.append(tile)
    }
    article.append(node('p', entry.kind === 'event' ? `FREE EVENT · ${entry.event_date}` : entry.category.toUpperCase(), 'eyebrow'), node('h3', entry.title), node('p', entry.summary));
    const button = node('button', entry.kind === 'event' ? 'View event →' : 'Read post →', 'read-entry');
    button.type = 'button';
    button.addEventListener('click', () => showDetail(entry));
    article.append(button);
    return article;
}
async function loadContent() {
    try {
        const response = await fetch('/api/content', {
            cache: 'no-store'
        });
        if (!response.ok) throw new Error();
        const {
            entries
        } = await response.json();
        const posts = entries.filter(e => e.kind === 'post'),
            events = entries.filter(e => e.kind === 'event');
        if (posts.length) {
            document.querySelector('.content-grid').replaceChildren(...posts.map(card));
            document.querySelector('.hub-note').textContent = 'Explore approved content shared by Lavender Language Center.';
        }
        if (events.length) {
            document.querySelector('#event-list').replaceChildren(...events.sort((a, b) => a.event_date.localeCompare(b.event_date)).map(card));
            document.querySelector('#events-label').hidden = false;
            const eventCard = document.querySelector('.learning-card.peach');
            eventCard.querySelector('.status').textContent = 'See published events below. Dates are shown as provided by the organizer.';
            eventCard.querySelector('p').textContent = 'Explore our published free events below. Open each event for its details and participation link.';
        }
        filterContent();
    } catch {
        document.querySelector('#content-load-status').textContent = 'Live content could not be loaded. Please refresh or check our official social channels.';
    }
}
loadContent();