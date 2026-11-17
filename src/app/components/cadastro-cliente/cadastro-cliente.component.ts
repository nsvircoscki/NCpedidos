import { Component, EventEmitter, Output, inject, input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FieldTree, FormField } from '@angular/forms/signals';
import { DadosPreCadastro, TipoCadastro } from '../../models/cliente.model';
import { ErroCampoComponent } from '../erro-campo/erro-campo.component';

type CampoTexto = Exclude<keyof DadosPreCadastro, 'perfil' | 'observacoes'>;

@Component({
  selector: 'app-cadastro-cliente',
  standalone: true,
  imports: [FormField, ErroCampoComponent],
  templateUrl: './cadastro-cliente.component.html'
})
export class CadastroClienteComponent implements OnInit {
  private http = inject(HttpClient);

  readonly formulario = input.required<FieldTree<DadosPreCadastro>>();
  @Output() proximo = new EventEmitter<void>();
  @Output() voltar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();


  carregandoCEP = false;
  mensagemErroCEP = '';

  consultarCEP(): void {
    const cep = this.formulario().cep().value().replace(/\D/g, '');

    if (cep.length !== 8) {
      this.mensagemErroCEP = 'CEP inválido. Deve conter 8 dígitos.';
      return;
    }

    this.carregandoCEP = true;
    this.mensagemErroCEP = '';

    //VIACEP
    this.http.get<any>(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
      next: (dados) => {

        if (dados.erro) {
          this.consultarCepify(cep);
          return;
        }

        this.preencherEndereco({
          logradouro: dados.logradouro,
          bairro: dados.bairro,
          cidade: dados.localidade,
          uf: dados.uf,
        });
      },
      error: () => {
        this.consultarCepify(cep);
      }
    });
  }

  private consultarCepify(cep:string): void {
    this.http.get<any>(`https://cepify.com.br/api/v1/cep/${cep}`).subscribe({
      next: (dados) => {
        this.preencherEndereco({
          logradouro: dados.logradouro || dados.street,
          bairro: dados.bairro || dados.neighborhood,
          cidade: dados.cidade || dados.localidade || dados.city,
          uf: dados.estado || dados.state,
        });
      },
      error: () => {
        this.carregandoCEP = false;
        this.mensagemErroCEP = 'Erro ao consultar o CEP. Tente novamente.';
      }
    });
  }
  
     private preencherEndereco(dados: { logradouro?: string; bairro?: string; cidade?: string; uf?: string }): void {
        this.carregandoCEP = false;

        if (dados.logradouro) {
          this.definirValor('endereco', dados.logradouro); 
        }
        if (dados.bairro) {
          this.definirValor('bairro', dados.bairro);
        }
        if (dados.cidade) {
          this.definirValor('cidade', dados.cidade);
          this.adicionarCidade(dados.cidade);
        }
        if (dados.uf) {
          this.definirValor('uf', dados.uf);
        }
      }

  /** PJ ou PF: vem da página, que pergunta antes de abrir o formulário. Aqui não muda. */
  readonly tipoCadastro = input.required<TipoCadastro>();
  carregandoCNPJ = false;
  mensagemErroCNPJ = '';

  consultarCNPJ(): void {
    const cnpj = this.formulario().cnpj().value().replace(/\D/g, '');

    if (cnpj.length !== 14) {
      this.mensagemErroCNPJ = 'CNPJ inválido. Digite os 14 dígitos.';
      return;
    }

    this.carregandoCNPJ = true;
    this.mensagemErroCNPJ = '';

    this.http.get<any>(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`).subscribe({
      next: (dados) => {
        this.carregandoCNPJ = false;

        if (dados.razao_social) {
          this.definirValor('razaoSocial', dados.razao_social);
        }
        if (dados.nome_fantasia) {
          this.definirValor('nomeFantasia', dados.nome_fantasia);
        }
        if (dados.cep) {
          this.definirValor('cep', dados.cep);
        }
        if (dados.logradouro) {
          this.definirValor('endereco', dados.logradouro);
        }
        if (dados.numero) {
          this.definirValor('numero', dados.numero);
        }
        if (dados.bairro) {
          this.definirValor('bairro', dados.bairro);
        }
        if (dados.municipio) {
          this.definirValor('cidade', dados.municipio);
          this.adicionarCidade(dados.municipio);
        }
        if (dados.uf) {
          this.definirValor('uf', dados.uf);
        }
        if (dados.ddd_telefone_1) {
          this.definirValor('telefone', dados.ddd_telefone_1);
        }
        if (dados.email) {
          this.definirValor('email', dados.email.toLowerCase());
        }
      },
      error: () => {
        this.carregandoCNPJ = false;
        this.mensagemErroCNPJ = 'CNPJ não encontrado ou instabilidade na consulta.';
      }
    });
  }

  private definirValor(campo: CampoTexto, valor: string): void {
    this.formulario()[campo]().value.set(valor);

    if (campo === 'uf' && valor) {
      this.cidadesFiltradas = this.todasCidades
        .filter(c => c.uf === valor)
        .slice(0, 100);
    }
  }

    irParaProximaEtapa(): void {
      this.formulario()().markAsTouched();
      if (this.formulario()().valid()) {
        this.proximo.emit();
      }
    }

    cancelarCadastro(): void {
      this.cancelar.emit();
    }


  ngOnInit(): void {
    this.carregarTodasCidades();
  }

  readonly ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  ufsFiltradas: string[] = [...this.ufs];

  filtrarUfs(event: Event): void {
    const termo = (event.target as HTMLInputElement).value.toUpperCase();

    if(!termo) {
      this.ufsFiltradas = [...this.ufs];
      return;
    }

    this.ufsFiltradas = this.ufs.filter(uf => uf.includes(termo));
  }

  cidades: string[] = [];

  adicionarCidade(cidade:string): void {
    if (cidade && !this.cidades.includes(cidade)) {
      this.cidades.push(cidade);
    }
  }

  dropdownUfAberto = false;
  dropdownCidadeAberto = false;
  carregandoCidades = false;

  todasCidades: { nome: string, uf: string }[] = [];
  cidadesFiltradas: { nome: string, uf: string }[] = [];

  carregarTodasCidades(): void {
    this.carregandoCidades = true;
    
    // Traz todos os municípios do Brasil de uma vez
    this.http.get<any[]>('https://servicodados.ibge.gov.br/api/v1/localidades/municipios')
      .subscribe({
        next: (dados) => {
          // Salva o nome da cidade e a sigla do estado
          this.todasCidades = dados.map(c => ({
            nome: c.nome,
            uf: c.microrregiao?.mesorregiao?.UF.sigla || ''
          }));
          
          // Mostra apenas 100 resultados por vez para não travar o navegador
          this.cidadesFiltradas = this.todasCidades.slice(0, 100);
          this.carregandoCidades = false;
        },
        error: () => {
          this.carregandoCidades = false;
          console.error('Erro ao buscar cidades do IBGE');
        }
      });
  }

  filtrarCidades(event: Event): void {
    const termo = (event.target as HTMLInputElement).value.toLowerCase();
    
    if (!termo) {
      this.cidadesFiltradas = this.todasCidades.slice(0, 100);
      return;
    }

    // Filtra pelo que o usuário digitou
    this.cidadesFiltradas = this.todasCidades
      .filter(c => c.nome.toLowerCase().includes(termo))
      .slice(0, 100);
  }

  selecionarCidade(cidade: { nome: string, uf: string }): void {
    this.definirValor('cidade', cidade.nome);
    this.definirValor('uf', cidade.uf); // Autopreenchimento Mágico da UF!
    this.dropdownCidadeAberto = false;
  }

  selecionarOpcao(campo: CampoTexto, valor: string): void {
    this.definirValor(campo, valor);
    this.dropdownUfAberto = false;

    if (campo === 'uf') {
      this.cidadesFiltradas = this.todasCidades
        .filter(c => c.uf === valor)
        .slice(0, 100);
    }
  }
}
