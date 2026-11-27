import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { bloqueadoPorTentativas, limparTentativas, registrarTentativaErrada } from './tentativas.ts';

const MINUTO = 60 * 1000;

describe('tentativas de login', () => {
    it('trava o usuário depois de 5 erros, mesmo vindo de endereços diferentes', () => {
        for (let vez = 1; vez <= 5; vez++) registrarTentativaErrada(`10.0.0.${vez}`, 'Rafael', 0);
        assert.equal(bloqueadoPorTentativas('10.0.0.99', 'rafael', MINUTO), true);
        assert.equal(bloqueadoPorTentativas('10.0.0.99', 'narciso', MINUTO), false);
    });

    it('trava o endereço depois de 10 erros, mesmo em usuários diferentes', () => {
        for (let vez = 1; vez <= 10; vez++) registrarTentativaErrada('10.1.1.1', `usuario${vez}`, 0);
        assert.equal(bloqueadoPorTentativas('10.1.1.1', 'outro', MINUTO), true);
    });

    it('libera depois de 15 minutos e ao acertar a senha', () => {
        for (let vez = 1; vez <= 5; vez++) registrarTentativaErrada('10.2.2.2', 'tiago', 0);
        assert.equal(bloqueadoPorTentativas('10.2.2.3', 'tiago', 16 * MINUTO), false);
        limparTentativas('10.2.2.2', 'tiago');
        assert.equal(bloqueadoPorTentativas('10.2.2.2', 'tiago', MINUTO), false);
    });
});
