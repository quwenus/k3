import test from 'node:test';
import assert from 'node:assert/strict';
import { createProductSearchIndex, searchProducts } from './productSearch.js';

const products = [
    { id: 1, sku: 'К1842', title: 'Тормозные колодки Niva', compatible_cars: ['Lada Niva'], oem_numbers: ['2121-3501090'] },
    { id: 2, sku: 'K18121', title: 'Тормозные колодки передние Lada Vesta/Granta', oem_numbers: ['1118-3501080', '8450102948'] },
    { id: 3, sku: 'KM1191', title: 'Тормозные колодки KM1191', oem_numbers: ['MCB 671, FD.0404\tFA181; 58101 3XA20'], applicability_text: '**Honda**\nCB 500 F, 2013-2020\n**Yamaha**\nMT 125, 2014-2019' },
    { id: 4, sku: 'K1841', title: 'Колодки Renault (Daster/Captur)', oem_numbers: ['AB123', '456CD'] },
    { id: 5, sku: 'K10', title: 'Тормозные колодки', oem_numbers: ['К1842'], compatible_cars: ['Honda CB 250', 'Yamaha MT 700'] },
];
const index = createProductSearchIndex(products);
const ids = (query, sort) => searchProducts(index, query, sort).map(product => product.id);

test('K3 and OEM identifiers accept Latin/Cyrillic lookalikes and separators', () => {
    for (const query of ['K1842', 'К1842', 'к-1842', 'Ｋ１８４２', ' K 1842 ']) assert.equal(ids(query)[0], 1, query);
    for (const query of ['КМ1191', 'KM 1191', 'км-1191']) assert.equal(ids(query)[0], 3, query);
    for (const query of ['11183501080', '1118-3501080', '1118 3501080']) assert.deepEqual(ids(query), [2], query);
});

test('OEM lists accept commas, tabs and semicolons without merging separate identifiers', () => {
    for (const query of ['MCB671', 'МСВ 671', 'FD0404', 'FA181', '581013XA20']) assert.deepEqual(ids(query), [3], query);
    for (const query of ['AB123456CD', '123456', 'FA181581013XA20']) assert.deepEqual(ids(query), [], query);
});

test('Russian brand/model aliases match the existing Latin catalogue', () => {
    assert.deepEqual(ids('Лада Веста'), [2]);
    assert.deepEqual(ids('ВАЗ Нива'), [1]);
    assert.deepEqual(ids('Хонда'), ids('Honda'));
    assert.deepEqual(ids('Ямаха'), ids('Yamaha'));
    assert.deepEqual(ids('Рено Дастер'), [4]);
    assert.deepEqual(ids('Renault Duster'), [4]);
    assert.equal(ids('колодка').length, products.length);
});

test('brand headings stay attached to their models, not to another brand or line', () => {
    assert.deepEqual(ids('Honda CB 500'), [3]);
    assert.deepEqual(ids('Хонда CB500'), [3]);
    assert.deepEqual(ids('Yamaha MT125'), [3]);
    assert.deepEqual(ids('Honda MT125'), []);
    assert.deepEqual(ids('Honda Yamaha'), []);
    assert.deepEqual(ids('CB500 2019'), []); // A year range is not an exact year lookup.
    assert.deepEqual(ids('Honda MT700'), []);
});

test('plain brand headings in older applicability text are supported', () => {
    const plainIndex = createProductSearchIndex([{ id: 10, sku: 'KM1', title: 'Колодки', applicability_text: 'Honda\nCB 500 F\nYamaha\nMT 125' }]);
    assert.equal(searchProducts(plainIndex, 'Хонда CB500').length, 1);
    assert.equal(searchProducts(plainIndex, 'Хонда MT125').length, 0);
});

test('legacy volume labels, unknown headings and inline brands keep model context', () => {
    const legacyIndex = createProductSearchIndex([{
        id: 11, sku: 'KM2', title: 'Колодки',
        applicability_text: 'Yamaha\nMT, объем 125куб.см\nCF MOTO\nNK 800, объем 800куб.см\nBimota, DBX, объем 1100куб.см',
    }]);
    for (const query of ['Ямаха MT125', 'CF MOTO NK800', 'Bimota DBX']) {
        assert.equal(searchProducts(legacyIndex, query).length, 1, query);
    }
    for (const query of ['Yamaha NK800', 'CF MOTO DBX']) {
        assert.equal(searchProducts(legacyIndex, query).length, 0, query);
    }
});

test('exact SKU ranks above an OEM match; explicit sorting overrides relevance', () => {
    assert.deepEqual(ids('К1842'), [1, 5]);
    assert.deepEqual(ids('К1842', 'asc'), [5, 1]);
    assert.deepEqual(ids('К1842', 'desc'), [1, 5]);
    const ranked = createProductSearchIndex([
        { id: 20, sku: 'K1', title: 'Колодки FA181', oem_numbers: ['FA1810'] },
        { id: 21, sku: 'K999', title: 'Колодки', oem_numbers: ['FA181'] },
    ]);
    assert.deepEqual(searchProducts(ranked, 'FA181').map(p => p.id), [21, 20]);
});

test('empty input shows the catalogue, punctuation and unknown input show no matches', () => {
    assert.equal(ids('').length, products.length);
    assert.equal(ids('   ').length, products.length);
    assert.deepEqual(ids('!!!'), []);
    assert.deepEqual(ids('несуществующаядеталь'), []);
    assert.deepEqual(ids('Лада   Веста'), [2]);
});

test('search accepts missing fields and does not rewrite product records', () => {
    const snapshot = JSON.stringify(products);
    ids('Лада');
    ids('MCB671');
    assert.equal(JSON.stringify(products), snapshot);
    assert.deepEqual(searchProducts(createProductSearchIndex([{ id: 99 }]), 'Honda'), []);
});
