// Text aliases are intentionally explicit: similar spellings must not imply
// that two different part numbers or vehicle models are interchangeable.
const aliasGroups = {
    lada: ['лада', 'ваз', 'vaz'],
    honda: ['хонда'],
    yamaha: ['ямаха'],
    suzuki: ['сузуки'],
    kawasaki: ['кавасаки'],
    toyota: ['тойота'],
    nissan: ['ниссан'],
    hyundai: ['хендай', 'хундай', 'хенде', 'хендэ'],
    kia: ['киа', 'кия'],
    renault: ['рено'],
    vw: ['volkswagen', 'фольксваген'],
    skoda: ['шкода', 'škoda'],
    mitsubishi: ['митсубиси', 'мицубиси'],
    bmw: ['бмв'],
    ktm: ['ктм'],
    aprilia: ['априлия'],
    ducati: ['дукати'],
    benelli: ['бенелли'],
    bajaj: ['баджадж', 'баджаж'],
    peugeot: ['пежо'],
    piaggio: ['пиаджо', 'пьяджо'],
    vespa: ['веспа'],
    ford: ['форд'],
    chevrolet: ['шевроле'],
    mazda: ['мазда'],
    opel: ['опель'],
    audi: ['ауди'],
    vesta: ['веста'],
    granta: ['гранта'],
    kalina: ['калина'],
    priora: ['приора'],
    niva: ['нива'],
    solaris: ['солярис', 'соларис'],
    rio: ['рио'],
    ceed: ['сид'],
    creta: ['крета'],
    cerato: ['церато'],
    polo: ['поло'],
    octavia: ['октавия'],
    outlander: ['аутлендер'],
    lancer: ['лансер', 'ланцер'],
    duster: ['дастер', 'daster'], // Existing catalogue spelling.
    captur: ['каптюр'],
    колодки: ['колодка', 'колодок', 'колодку', 'колодками'],
    перед: ['передние', 'передний', 'передних', 'передняя'],
    зад: ['задние', 'задний', 'задних', 'задняя'],
};

const aliases = new Map(Object.entries(aliasGroups).flatMap(([canonical, values]) =>
    values.map(value => [value, canonical])
));

const plainText = value => String(value ?? '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/\[\/?(?:big|small)\]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

export const normalizeSearchText = value => plainText(value).split(/\s+/)
    .map(word => aliases.get(word) || word).join(' ');

const normalizeText = normalizeSearchText;

const lookalikes = { а: 'a', в: 'b', с: 'c', е: 'e', н: 'h', к: 'k', м: 'm', о: 'o', р: 'p', т: 't', х: 'x', у: 'y', і: 'i' };

export const normalizePartNumber = value => String(value ?? '')
    .normalize('NFKC').toLowerCase()
    .replace(/[авсенкмортхуі]/g, letter => lookalikes[letter])
    .replace(/[^\p{L}\p{N}]/gu, '');

const brandNames = new Set([
    'lada', 'honda', 'yamaha', 'suzuki', 'kawasaki', 'toyota', 'nissan', 'hyundai', 'kia',
    'renault', 'vw', 'skoda', 'mitsubishi', 'bmw', 'ktm', 'aprilia', 'ducati', 'benelli',
    'bajaj', 'peugeot', 'piaggio', 'vespa', 'ford', 'chevrolet', 'mazda', 'opel', 'audi',
    'ajp', 'alfer', 'bimota', 'bsa', 'cagiva', 'cz jawa', 'daelim', 'derbi', 'gilera',
    'husqvarna', 'husaberg', 'triumph', 'sym', 'kymco', 'gas gas', 'gasgas', 'beta',
    'sherco', 'tm', 'tm racing', 'mv agusta', 'moto guzzi', 'harley davidson', 'brammo',
]);

const asArray = value => Array.isArray(value) ? value : value ? [value] : [];

const applicabilityRecords = value => {
    let brand = '';
    const lines = String(value || '').split(/\r?\n/).filter(line => line.trim());
    return lines.flatMap((line, index) => {
        const text = normalizeText(line);
        if (!text) return [];
        const isHeading = brandNames.has(text)
            || (/^\s*(?:\*\*[^*]+\*\*|#{1,3}\s+.+)\s*$/.test(line) && !/\d/.test(text))
            // Older imports have unformatted brand headings before model rows.
            || (text.length < 60 && !/[\d,;]/.test(line) && /об[ъь][её]м/i.test(lines[index + 1] || ''));
        if (isHeading) {
            brand = text;
            return [text];
        }
        const hasOwnBrand = [...brandNames].some(name => text.startsWith(`${name} `));
        return [brand && !hasOwnBrand ? `${brand} ${text}` : text];
    });
};

const textRecord = value => {
    const text = normalizeText(value);
    return {
        text,
        words: text.split(' '),
        // Some imported model names are written as “MT, объем 125куб.см”.
        compact: normalizePartNumber(text.replace(/объем\s+/g, '')),
    };
};

export const createProductSearchIndex = products => products.map(product => ({
    product,
    sku: normalizePartNumber(product.sku),
    // Preserve spaces inside one identifier, but never join separate OEMs.
    oems: [...new Set(asArray(product.oem_numbers)
        .flatMap(value => String(value).split(/[,;\r\n\t]+/))
        .map(normalizePartNumber).filter(Boolean))],
    title: textRecord(product.title),
    compatibility: [
        ...asArray(product.compatible_cars),
        ...applicabilityRecords(product.applicability_text),
    ].map(textRecord),
}));

const matchesWord = (record, word) => record.words.some(token => token.startsWith(word))
    || (/\p{L}/u.test(word) && /\d/.test(word) && record.compact.includes(normalizePartNumber(word)));

const scoreEntry = (entry, words, partQuery, textQuery) => {
    if (entry.sku === partQuery) return 1000;
    if (entry.oems.includes(partQuery)) return 900;
    if (partQuery.length >= 3 && /\d/.test(partQuery)) {
        if (entry.sku.startsWith(partQuery)) return 800;
        if (entry.sku.includes(partQuery)) return 700;
        if (entry.oems.some(number => number.startsWith(partQuery))) return 650;
        if (entry.oems.some(number => number.includes(partQuery))) return 600;
    }
    if (words.every(word => matchesWord(entry.title, word))) {
        return 400 + (entry.title.text.includes(textQuery) ? 20 : 0);
    }
    // All model terms must belong to one compatibility record. Do not combine
    // a brand on one line with an unrelated model elsewhere in the product.
    if (entry.compatibility.some(record => words.every(word =>
        matchesWord(record, word) || matchesWord(entry.title, word)
    ))) return 300;
    return 0;
};

const skuCollator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });
const compareSku = (a, b) => {
    const aNumber = Number(a.sku.match(/\d+/)?.[0]);
    const bNumber = Number(b.sku.match(/\d+/)?.[0]);
    return (aNumber - bNumber) || skuCollator.compare(a.sku, b.sku)
        || Number(a.product.id) - Number(b.product.id);
};

export const searchProducts = (index, query, sort = 'relevance') => {
    const textQuery = normalizeText(query);
    const words = textQuery.split(' ').filter(Boolean);
    if (String(query || '').trim() && !words.length) return [];
    const partQuery = normalizePartNumber(query);
    return index.map(entry => ({
        entry,
        score: words.length ? scoreEntry(entry, words, partQuery, textQuery) : 1,
    })).filter(result => result.score > 0)
        .sort((a, b) => (sort === 'relevance' ? b.score - a.score : 0)
            || compareSku(a.entry, b.entry) * (sort === 'desc' ? -1 : 1))
        .map(result => result.entry.product);
};
