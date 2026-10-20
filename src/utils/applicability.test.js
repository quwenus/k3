import test from 'node:test';
import assert from 'node:assert/strict';
import { filterApplicability, stripApplicabilityFormatting } from './applicability.js';

const hondaRows = '**Honda**\nCB 500 F, объем 500куб.см, 13-20г.в., перед\nCB 250, объем 250куб.см, 12-15г.в., зад';
const yamahaRows = 'Yamaha\nMT, объем 125куб.см, 14-19г.в., перед';
const applicability = `${hondaRows}\n${yamahaRows}`;

test('applicability accepts the same Russian brand aliases as catalogue search', () => {
    assert.equal(filterApplicability(applicability, 'Хонда'), hondaRows);
    assert.equal(filterApplicability(applicability, 'Ямаха'), yamahaRows);
    assert.equal(filterApplicability('Lada Vesta\nLada Granta', 'Лада Веста'), 'Lada Vesta');
});

test('compact model names preserve their brand and match imported volume labels', () => {
    assert.equal(filterApplicability(applicability, 'Хонда CB500'), hondaRows.split('\n').slice(0, 2).join('\n'));
    assert.equal(filterApplicability(applicability, 'Ямаха MT125'), yamahaRows);
    assert.equal(filterApplicability(applicability, 'Honda MT125'), '');
    assert.equal(filterApplicability(applicability, 'Honda Yamaha'), '');
});

test('plain and markdown brand headers survive filtering without unrelated models', () => {
    const value = 'CF MOTO\r\nNK 800, объем 800куб.см, перед\r\n## INDIAN\r\nChief, 22-23 г.в., зад';
    assert.equal(filterApplicability(value, 'CF MOTO NK800'), 'CF MOTO\nNK 800, объем 800куб.см, перед');
    assert.equal(filterApplicability(value, 'Indian Chief'), '## INDIAN\nChief, 22-23 г.в., зад');
});

test('empty queries, punctuation, missing data and formatting are handled safely', () => {
    assert.equal(filterApplicability(applicability, ' '), applicability);
    assert.equal(filterApplicability(applicability, '!!!'), '');
    assert.equal(filterApplicability(null, 'Honda'), '');
    assert.equal(stripApplicabilityFormatting('## **Honda**\n[big]CB500[/big]\n[small]2019[/small]'), 'Honda\nCB500\n2019');
});
