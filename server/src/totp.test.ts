import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { chaveDe, cifrar, decifrar } from './cifra.ts';
import { codigoDoPasso, linkDoAutenticador, novoSegredo, passoDoCodigo } from './totp.ts';

// Segredo "12345678901234567890" do exemplo oficial da RFC 6238, em base32.
const SEGREDO_RFC = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

describe('código da verificação em duas etapas', () => {
    it('bate com os exemplos da RFC 6238 (os 6 últimos números)', () => {
        assert.equal(codigoDoPasso(SEGREDO_RFC, Math.floor(59 / 30)), '287082');
        assert.equal(codigoDoPasso(SEGREDO_RFC, Math.floor(1111111109 / 30)), '081804');
    });

    it('aceita 30 s de diferença no relógio do celular, e não mais', () => {
        const agora = 1111111109 * 1000;
        const passo = Math.floor(1111111109 / 30);
        assert.equal(passoDoCodigo(SEGREDO_RFC, codigoDoPasso(SEGREDO_RFC, passo - 1), agora), passo - 1);
        assert.equal(passoDoCodigo(SEGREDO_RFC, codigoDoPasso(SEGREDO_RFC, passo + 1), agora), passo + 1);
        assert.equal(passoDoCodigo(SEGREDO_RFC, codigoDoPasso(SEGREDO_RFC, passo + 3), agora), null);
        assert.equal(passoDoCodigo(SEGREDO_RFC, '12345', agora), null);
        assert.equal(passoDoCodigo(SEGREDO_RFC, 123456, agora), null);
    });

    it('gera segredo em base32 e o link do app', () => {
        const segredo = novoSegredo();
        assert.match(segredo, /^[A-Z2-7]{32}$/);
        assert.equal(linkDoAutenticador(segredo, 'rafael'), `otpauth://totp/NC%20Pedidos%3Arafael?secret=${segredo}&issuer=NC%20Pedidos`);
    });
});

describe('cifra', () => {
    const chave = chaveDe('segredo-de-teste-com-tamanho-suficiente', 'teste');

    it('decifra o que cifrou, e cada cifra sai diferente', () => {
        const cifrado = cifrar('GEZDGNBV', chave);
        assert.equal(decifrar(cifrado, chave), 'GEZDGNBV');
        assert.notEqual(cifrar('GEZDGNBV', chave), cifrado);
    });

    it('recusa texto alterado ou chave errada', () => {
        const [iv, etiqueta, dados] = cifrar('GEZDGNBV', chave).split('.');
        const alterado = [iv, etiqueta, Buffer.from('outra coisa').toString('base64')].join('.');
        assert.throws(() => decifrar(alterado, chave));
        assert.throws(() => decifrar([iv, etiqueta, dados].join('.'), chaveDe('outro', 'teste')));
    });
});
