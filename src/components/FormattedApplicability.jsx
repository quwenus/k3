const inlineTokenPattern = /(\*\*.+?\*\*|\[big\].+?\[\/big\]|\[small\].+?\[\/small\])/g;

const vehicleBrands = [
    'Piaggio (incl. Vespa)', 'Harley-Davidson', 'MV Agusta', 'Moto Guzzi', 'Moto Morini',
    'Gas Gas', 'CF MOTO', 'CZ/JAWA', 'Volkswagen', 'Mitsubishi', 'Chevrolet',
    'Husqvarna', 'Kawasaki', 'Bombardier', 'Aprilia', 'Benelli',
    'Husaberg', 'Highland', 'Malaguti', 'Peugeot', 'Renault', 'Hyundai', 'Suzuki',
    'Triumph', 'Vectrix', 'Victory', 'Yamaha', 'Toyota', 'Nissan', 'Daelim', 'Gilera',
    'Cagiva', 'Ducati', 'Bimota', 'Kram-it', 'Sherco', 'ENERGICA', 'BRAMMO',
    'ZONTES', 'Indian', 'Piaggio', 'Linhai', 'Kymco', 'Maico', 'Rieju', 'Derbi',
    'Honda', 'Mazda', 'Skoda', 'Škoda', 'Vespa', 'Voxan', 'Bajaj', 'Alfer',
    'Beta', 'Lada', 'Ford', 'Opel', 'Audi', 'BMW', 'KTM', 'Kia', 'VOGE',
    'AJP', 'BSA', 'CCM', 'CPI', 'HRD', 'MBK', 'MUZ', 'SYM', 'VOR', 'VW', 'TM',
    'Лада', 'ВАЗ', 'Хонда', 'Ямаха', 'Сузуки', 'Кавасаки', 'Рено', 'Киа', 'Хендай',
].sort((a, b) => b.length - a.length);

const emphasizeBrands = value => {
    const lines = String(value || '').split(/\r?\n/);
    return lines.map((line, index) => {
        const text = line.trim();
        if (!text || /^(?:\*\*|#{1,3}\s|\[big\]|\[small\])/.test(text)) return line;

        const brand = vehicleBrands.find(name => {
            const start = text.slice(0, name.length);
            return start.toLocaleLowerCase() === name.toLocaleLowerCase()
                && (text.length === name.length || /[\s,:]/.test(text[name.length]));
        });
        if (brand) return `**${text.slice(0, brand.length)}**${text.slice(brand.length)}`;

        if (text.length < 60 && !/[\d,;]/.test(text)) {
            const nextLine = lines.slice(index + 1).find(next => next.trim()) || '';
            if (/об[ъь][её]м/i.test(nextLine)) return `**${text}**`;
        }
        return line;
    }).join('\n');
};

const renderInlineText = (text, lineIndex) => {
    const parts = [];
    let lastIndex = 0;
    let tokenIndex = 0;

    String(text || '').replace(inlineTokenPattern, (match, _token, offset) => {
        if (offset > lastIndex) {
            parts.push(text.slice(lastIndex, offset));
        }

        const key = `${lineIndex}-${tokenIndex}`;

        if (match.startsWith('**') && match.endsWith('**')) {
            parts.push(
                <strong key={key} className="font-bold text-gray-900">
                    {match.slice(2, -2)}
                </strong>
            );
        } else if (match.startsWith('[big]') && match.endsWith('[/big]')) {
            parts.push(
                <span key={key} className="text-base font-semibold text-gray-900 md:text-lg">
                    {match.slice(5, -6)}
                </span>
            );
        } else if (match.startsWith('[small]') && match.endsWith('[/small]')) {
            parts.push(
                <span key={key} className="text-xs text-gray-500">
                    {match.slice(7, -8)}
                </span>
            );
        }

        lastIndex = offset + match.length;
        tokenIndex += 1;
        return match;
    });

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts;
};

const renderLine = (line, index) => {
    if (!line.trim()) {
        return <div key={index} className="h-3" />;
    }

    if (line.startsWith('# ')) {
        return (
            <div key={index} className="mt-2 text-lg font-bold leading-snug text-gray-900 first:mt-0 md:text-xl">
                {renderInlineText(line.slice(2), index)}
            </div>
        );
    }

    if (line.startsWith('## ')) {
        return (
            <div key={index} className="mt-2 text-base font-bold leading-snug text-gray-900 first:mt-0 md:text-lg">
                {renderInlineText(line.slice(3), index)}
            </div>
        );
    }

    if (line.startsWith('### ')) {
        return (
            <div key={index} className="mt-1 text-sm font-bold leading-snug text-gray-800 first:mt-0">
                {renderInlineText(line.slice(4), index)}
            </div>
        );
    }

    return (
        <div key={index} className="text-sm leading-relaxed text-gray-700">
            {renderInlineText(line, index)}
        </div>
    );
};

const FormattedApplicability = ({ value }) => (
    <div className="space-y-0.5">
        {emphasizeBrands(value).split(/\r?\n/).map(renderLine)}
    </div>
);

export const ApplicabilityPreview = ({ value }) => (
    emphasizeBrands(value).split(/\r?\n/).map((line, index) => (
        <span key={index}>
            {index > 0 && '\n'}
            {renderInlineText(line.replace(/^#{1,3}\s+(.+)$/, '**$1**'), index)}
        </span>
    ))
);

export default FormattedApplicability;
