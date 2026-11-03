import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopHeaderComponent } from '../../components/top-header/top-header.component';
import { SidebarService } from '../../services/sidebar';
import {
  Configuracoes,
  ConfiguracoesSelecionadas
} from '../../models/configuracoes.model';

type ConfiguracoesSecao =
  | 'Geral'
  | 'Usuários e acessos'
  | 'Pedidos'
  | 'Clientes'
  | 'Produtos e preços';

interface SectionConfig {
  description: string;
  options: Configuracoes[];
  selects: ConfiguracoesSelecionadas[];
}

type SettingSection = ConfiguracoesSecao;

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, TopHeaderComponent],
  templateUrl: './configuracoes.component.html',
})
export class ConfiguracoesComponent {
  private readonly sidebarService = inject(SidebarService);

  activeSection: SettingSection = 'Geral';
  saved = false;
  sidebarMinimizada = false;

  readonly sections: Array<{
    name: SettingSection;
    description: string;
    initials: string;
  }> = [
    {
      name: 'Geral',
      description: 'Dados da empresa',
      initials: 'GE',
    },
    {
      name: 'Usuários e acessos',
      description: 'Equipe e permissões',
      initials: 'UA',
    },
    {
      name: 'Pedidos',
      description: 'Regras comerciais',
      initials: 'PE',
    },
    {
      name: 'Clientes',
      description: 'Cadastro e aprovação',
      initials: 'CL',
    },
    {
      name: 'Produtos e preços',
      description: 'Catálogo e tabelas',
      initials: 'PP',
    },
  ];

  company = {
    companyName: '',
    tradeName: '',
    document: '',
    stateRegistration: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  };

  constructor() {
    this.sidebarService.minimizada$.subscribe((estado) => {
      this.sidebarMinimizada = estado;
    });
  }

  readonly configurations: Record<
    Exclude<SettingSection, 'Geral'>,
    SectionConfig
  > = {
    'Usuários e acessos': {
      description:
        'Configure membros da equipe, perfis administrativos e permissões.',
      options: [
        {
          id: 'user-invitations',
          title: 'Permitir convite de novos usuários',
          description:
            'Administradores poderão enviar convites para novos membros.',
          enabled: true,
        },
        {
          id: 'inactive-users',
          title: 'Bloquear usuários inativos',
          description:
            'Bloqueie automaticamente usuários sem acesso por mais de 90 dias.',
          enabled: false,
        },
        {
          id: 'representative-access',
          title: 'Representantes podem consultar preços',
          description:
            'Permita o acesso ao catálogo e às tabelas comerciais vigentes.',
          enabled: true,
        },
        {
          id: 'margin-access',
          title: 'Restringir visualização de margem',
          description:
            'Apenas administradores poderão visualizar margens comerciais.',
          enabled: true,
        },
      ],
      selects: [
        {
          id: 'default-role',
          label: 'Perfil padrão para novos usuários',
          value: 'Representante',
          options: [
            'Representante',
            'Administrador',
            'Faturamento',
            'Expedição',
          ],
        },
        {
          id: 'inactive-period',
          label: 'Prazo para considerar usuário inativo',
          value: '90 dias',
          options: ['30 dias', '60 dias', '90 dias', '180 dias'],
        },
      ],
    },

    Pedidos: {
      description:
        'Defina limites, aprovações e condições comerciais dos pedidos.',
      options: [
        {
          id: 'order-approval',
          title: 'Aprovação obrigatória de pedidos',
          description:
            'Pedidos acima do limite configurado deverão ser analisados.',
          enabled: true,
        },
        {
          id: 'stock-order',
          title: 'Permitir pedidos sem estoque',
          description:
            'Representantes poderão enviar pedidos de produtos indisponíveis.',
          enabled: false,
        },
        {
          id: 'order-edit',
          title: 'Permitir edição após envio',
          description:
            'Pedidos ainda não aprovados poderão ser alterados.',
          enabled: true,
        },
        {
          id: 'free-shipping',
          title: 'Aplicar frete grátis automaticamente',
          description:
            'Aplique frete grátis quando o pedido atingir o valor mínimo.',
          enabled: true,
        },
      ],
      selects: [
        {
          id: 'approval-value',
          label: 'Aprovação obrigatória acima de',
          value: 'R$ 10.000,00',
          options: [
            'R$ 5.000,00',
            'R$ 10.000,00',
            'R$ 20.000,00',
            'R$ 50.000,00',
          ],
        },
        {
          id: 'discount-limit',
          label: 'Limite de desconto do representante',
          value: '5%',
          options: ['3%', '5%', '8%', '10%'],
        },
        {
          id: 'default-payment',
          label: 'Condição de pagamento padrão',
          value: '28 dias',
          options: ['À vista', '28 dias', '28/56 dias', '28/56/84 dias'],
        },
        {
          id: 'default-delivery',
          label: 'Prazo padrão de entrega',
          value: '3 dias úteis',
          options: [
            '1 dia útil',
            '2 dias úteis',
            '3 dias úteis',
            '5 dias úteis',
          ],
        },
      ],
    },

    Clientes: {
      description:
        'Configure as regras de pré-cadastro, aprovação e gestão da carteira.',
      options: [
        {
          id: 'client-approval',
          title: 'Aprovação manual de novos clientes',
          description:
            'Todo pré-cadastro deverá ser revisado por um administrador.',
          enabled: true,
        },
        {
          id: 'document-query',
          title: 'Consultar CPF ou CNPJ automaticamente',
          description:
            'Preencha os dados do cliente usando o documento informado.',
          enabled: true,
        },
        {
          id: 'duplicate-client',
          title: 'Detectar cadastros duplicados',
          description:
            'Avise quando já existir um cliente com o mesmo CPF ou CNPJ.',
          enabled: true,
        },
        {
          id: 'credit-analysis',
          title: 'Exigir análise de crédito',
          description:
            'Novos clientes deverão passar por análise antes do primeiro pedido.',
          enabled: false,
        },
      ],
      selects: [
        {
          id: 'client-reviewer',
          label: 'Responsável padrão pela aprovação',
          value: 'Ana Carvalho',
          options: [
            'Ana Carvalho',
            'Mariana Alves',
            'Rafael Costa',
          ],
        },
        {
          id: 'approval-deadline',
          label: 'Prazo para análise',
          value: '1 dia útil',
          options: ['1 dia útil', '2 dias úteis', '3 dias úteis'],
        },
        {
          id: 'inactive-client',
          label: 'Considerar cliente inativo após',
          value: '90 dias sem pedido',
          options: [
            '30 dias sem pedido',
            '60 dias sem pedido',
            '90 dias sem pedido',
            '180 dias sem pedido',
          ],
        },
        {
          id: 'default-credit',
          label: 'Limite de crédito inicial',
          value: 'R$ 5.000,00',
          options: [
            'R$ 2.000,00',
            'R$ 5.000,00',
            'R$ 10.000,00',
            'Definido manualmente',
          ],
        },
      ],
    },

    'Produtos e preços': {
      description:
        'Gerencie catálogo, estoque, margens e tabelas comerciais.',
      options: [
        {
          id: 'stock-control',
          title: 'Ativar controle de estoque',
          description:
            'Atualize a disponibilidade dos produtos conforme as movimentações.',
          enabled: true,
        },
        {
          id: 'critical-stock',
          title: 'Alertar sobre estoque crítico',
          description:
            'Notifique administradores quando um produto atingir o mínimo.',
          enabled: true,
        },
        {
          id: 'minimum-margin',
          title: 'Bloquear preço abaixo da margem mínima',
          description:
            'Impeça alterações que reduzam a margem abaixo do valor definido.',
          enabled: true,
        },
        {
          id: 'scheduled-prices',
          title: 'Permitir preços agendados',
          description:
            'Tabelas poderão ser configuradas para entrar em vigor no futuro.',
          enabled: true,
        },
      ],
      selects: [
        {
          id: 'default-table',
          label: 'Tabela de preço padrão',
          value: 'Varejo padrão',
          options: [
            'Varejo padrão',
            'Distribuidores',
            'Grandes contas',
          ],
        },
        {
          id: 'minimum-margin-value',
          label: 'Margem mínima permitida',
          value: '25%',
          options: ['20%', '25%', '30%', '35%'],
        },
        {
          id: 'critical-stock-value',
          label: 'Limite de estoque crítico',
          value: '10 unidades',
          options: [
            '5 unidades',
            '10 unidades',
            '15 unidades',
            '20 unidades',
          ],
        },
        {
          id: 'price-rounding',
          label: 'Arredondamento de preços',
          value: 'Duas casas decimais',
          options: [
            'Sem arredondamento',
            'Duas casas decimais',
            'Final em ,90',
            'Final em ,99',
          ],
        },
      ],
    },
  };

  get currentConfiguration(): SectionConfig | null {
    if (this.activeSection === 'Geral') {
      return null;
    }

    return this.configurations[this.activeSection];
  }

  selectSection(section: SettingSection): void {
    this.activeSection = section;
    this.saved = false;
  }

  toggleOption(option: Configuracoes): void {
    option.enabled = !option.enabled;
    this.saved = false;
  }

  save(): void {
    this.saved = true;
  }
}