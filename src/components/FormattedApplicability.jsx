const inlineTokenPattern = /(\*\*.+?\*\*|\[big\].+?\[\/big\]|\[small\].+?\[\/small\])/g;

export const stripApplicabilityFormatting = (value) => String(value || '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\[big\](.*?)\[\/big\]/g, '$1')
    .replace(/\[small\](.*?)\[\/small\]/g, '$1')
    .replace(/^#{1,3}\s+/gm, '');

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
        {String(value || '').split(/\r?\n/).map(renderLine)}
    </div>
);

export default FormattedApplicability;
