import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { problemaNaSenhaNova, senhaDaEmpresa } from './senhas.ts';

describe('senhaDaEmpresa', () => {
    it('é Nc + primeiro nome sem acento + 4 números', () => {
        assert.match(senhaDaEmpresa('André Nascimento'), /^NcAndre\d{4}$/);
        assert.match(senhaDaEmpresa('WILSON SP'), /^NcWilson\d{4}$/);
    });
});

describe('problemaNaSenhaNova', () => {
    it('aceita senha boa', () => {
        assert.equal(problemaNaSenhaNova('girassol-azul-77', 'NcRafael1234', 'rafael'), null);
    });

    it('recusa curta, igual à atual e com o nome de usuário', () => {
        assert.match(problemaNaSenhaNova('curta', 'x', 'rafael') ?? '', /8 a 72/);
        assert.match(problemaNaSenhaNova('NcRafael1234', 'NcRafael1234', 'rafael') ?? '', /diferente/);
        assert.match(problemaNaSenhaNova('MinhaSenhaRAFAEL9', 'x', 'rafael') ?? '', /nome de usuário/);
        assert.match(problemaNaSenhaNova('wilson-2026!', 'x', 'wilson.sp') ?? '', /nome de usuário/);
    });
});
