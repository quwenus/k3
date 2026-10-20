import { normalizePartNumber, normalizeSearchText } from './productSearch.js';

export const stripApplicabilityFormatting = value => String(value || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\[big\](.*?)\[\/big\]/g, '$1')
    .replace(/\[small\](.*?)\[\/small\]/g, '$1')
    .replace(/^#{1,3}\s+/gm, '');

const normalizeModel = value => normalizePartNumber(
    normalizeSearchText(stripApplicabilityFormatting(value)).replace(/объем\s+/g, '')
);

// Retain the original brand heading for every matching model.
export const filterApplicability = (value, query) => {
    const text = String(value || '');
    if (!String(query || '').trim()) return text;
    const words = normalizeSearchText(query).split(/\s+/).map(normalizeModel).filter(Boolean);
    if (!words.length) return '';
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    const groups = [{ heading: '', rows: [] }];
    lines.forEach((line, index) => {
        const plain = stripApplicabilityFormatting(line).trim();
        const heading = !/[\d,;]/.test(plain) && plain.length < 60
            && (/^\s*(?:\*\*.+\*\*|#{1,3}\s+.+)\s*$/.test(line)
                || /об[ъь][её]м|г\.\s*в\./i.test(lines[index + 1] || ''));
        if (heading) groups.push({ heading: line, rows: [] });
        else groups[groups.length - 1].rows.push(line);
    });
    return groups.flatMap(group => {
        const rows = group.rows.filter(row => {
            const normalized = normalizeModel(`${group.heading} ${row}`);
            return words.every(word => normalized.includes(word));
        });
        return rows.length ? [group.heading, ...rows].filter(Boolean) : [];
    }).join('\n');
};
