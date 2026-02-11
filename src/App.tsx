import React, { useState, useEffect } from 'react'
import { 
  HomeIcon, 
  FunnelIcon, 
  UserGroupIcon,
  ChartBarIcon,
  PaperAirplaneIcon,
  MapIcon,
  MagnifyingGlassIcon,
  BellIcon,
  XMarkIcon,
  PlusIcon,
  SparklesIcon,
  ArrowUpTrayIcon,
  SunIcon,
  MoonIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  CubeIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'

type ViewType = 'dashboard' | 'funil' | 'clientes' | 'automacoes' | 'mapa' | 'prospeccao' | 'tarefas' | 'social' | 'integracoes' | 'equipe' | 'relatorios' | 'templates' | 'produtos'

interface Cliente {
  id: number
  razaoSocial: string
  nomeFantasia?: string
  cnpj: string
  contatoNome: string
  contatoTelefone: string
  contatoEmail: string
  endereco?: string
  etapa: string
  vendedorId?: number
  motivoPerda?: string
  score?: number
  ultimaInteracao?: string
  diasInativo?: number
  valorEstimado?: number
  produtosInteresse?: string[]
}

interface FormData {
  razaoSocial: string
  nomeFantasia: string
  cnpj: string
  contatoNome: string
  contatoTelefone: string
  contatoEmail: string
  endereco: string
  valorEstimado?: string
  produtosInteresse: string
  vendedorId?: string
}

interface Interacao {
  id: number
  clienteId: number
  tipo: 'email' | 'whatsapp' | 'instagram' | 'linkedin' | 'ligacao' | 'reuniao'
  data: string
  assunto: string
  descricao: string
  automatico: boolean
}

interface DragItem {
  cliente: Cliente
  fromStage: string
}

interface AICommand {
  id: string
  command: string
  response: string
  timestamp: string
}

interface Notificacao {
  id: number
  tipo: 'info' | 'warning' | 'success' | 'error'
  titulo: string
  mensagem: string
  timestamp: string
  lida: boolean
  clienteId?: number
}

interface Atividade {
  id: number
  tipo: 'moveu' | 'adicionou' | 'editou' | 'interacao' | 'tarefa'
  descricao: string
  vendedorNome: string
  timestamp: string
}

interface Template {
  id: number
  nome: string
  canal: 'email' | 'whatsapp'
  etapa: string
  assunto?: string
  corpo: string
}

interface Produto {
  id: number
  nome: string
  descricao: string
  categoria: 'sacaria' | 'okey_lac' | 'varejo_lacteo' | 'cafe' | 'outros'
  preco: number
  unidade: string
  foto: string
  sku?: string
  estoque?: number
  pesoKg?: number
  margemLucro?: number
  ativo: boolean
  destaque: boolean
  dataCadastro: string
}

interface DashboardMetrics {
  totalLeads: number
  leadsAtivos: number
  taxaConversao: number
  valorTotal: number
  ticketMedio: number
  leadsNovosHoje: number
  interacoesHoje: number
}

interface DashboardViewProps {
  clientes: Cliente[]
  metrics: DashboardMetrics
  vendedores: Vendedor[]
  atividades: Atividade[]
  interacoes: Interacao[]
  produtos: Produto[]
}

interface TemplateMsg {
  id: number
  canal: Interacao['tipo']
  nome: string
  conteudo: string
}

interface CadenciaStep {
  id: number
  canal: Interacao['tipo']
  delayDias: number
  templateId: number
}

interface Cadencia {
  id: number
  nome: string
  steps: CadenciaStep[]
  pausarAoResponder: boolean
}

interface Campanha {
  id: number
  nome: string
  cadenciaId: number
  etapa?: string
  minScore?: number
  diasInativoMin?: number
  status: 'rascunho' | 'ativa' | 'pausada'
}

interface JobAutomacao {
  id: number
  clienteId: number
  canal: Interacao['tipo']
  tipo: 'propaganda' | 'contato'
  status: 'pendente' | 'enviado' | 'pausado' | 'erro'
  agendadoPara: string
  templateId?: number
  campanhaId?: number
}

interface Tarefa {
  id: number
  titulo: string
  descricao?: string
  data: string
  hora?: string
  tipo: 'ligacao' | 'reuniao' | 'email' | 'whatsapp' | 'follow-up' | 'outro'
  status: 'pendente' | 'concluida'
  prioridade: 'alta' | 'media' | 'baixa'
  clienteId?: number
}

interface Vendedor {
  id: number
  nome: string
  email: string
  telefone: string
  cargo: 'vendedor' | 'gerente' | 'sdr'
  avatar: string
  usuario: string
  senha: string
  metaVendas: number
  metaLeads: number
  metaConversao: number
  ativo: boolean
}

interface FunilViewProps {
  clientes: Cliente[]
  onDragStart: (e: React.DragEvent, cliente: Cliente, fromStage: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, toStage: string) => void
}

interface ClientesViewProps {
  clientes: Cliente[]
  vendedores: Vendedor[]
  onNewCliente: () => void
  onEditCliente: (cliente: Cliente) => void
}

function App() {
  const [loggedUser, setLoggedUser] = useState<Vendedor | null>(null)
  const [loginUsuario, setLoginUsuario] = useState('')
  const [loginSenha, setLoginSenha] = useState('')
  const [loginError, setLoginError] = useState('')

  const [darkMode, setDarkMode] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [atividades, setAtividades] = useState<Atividade[]>([
    { id: 1, tipo: 'moveu', descricao: 'SuperBH Ltda movido para Negociação', vendedorNome: 'Carlos Silva', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, tipo: 'adicionou', descricao: 'Novo lead: Rede Mineirão adicionado', vendedorNome: 'Ana Oliveira', timestamp: new Date(Date.now() - 7200000).toISOString() },
    { id: 3, tipo: 'interacao', descricao: 'Email enviado para Distribuidora BH', vendedorNome: 'Roberto Lima', timestamp: new Date(Date.now() - 10800000).toISOString() },
    { id: 4, tipo: 'tarefa', descricao: 'Tarefa concluída: Preparar proposta comercial', vendedorNome: 'Carlos Silva', timestamp: new Date(Date.now() - 14400000).toISOString() },
    { id: 5, tipo: 'editou', descricao: 'Dados atualizados: Atacadão MG', vendedorNome: 'Fernanda Costa', timestamp: new Date(Date.now() - 18000000).toISOString() },
  ])
  const [templates, setTemplates] = useState<Template[]>([
    { id: 1, nome: 'Primeiro Contato', canal: 'email', etapa: 'prospecção', assunto: 'Apresentação MF Paris — Soluções para seu negócio', corpo: 'Olá {nome},\n\nSou {vendedor} da MF Paris. Gostaria de apresentar nossas soluções em congelados, laticínios e bebidas para {empresa}.\n\nPodemos agendar uma conversa?\n\nAtt,\n{vendedor}' },
    { id: 2, nome: 'Envio de Amostra', canal: 'email', etapa: 'amostra', assunto: 'Confirmação de envio de amostras — MF Paris', corpo: 'Olá {nome},\n\nConfirmamos o envio das amostras solicitadas para {empresa}. Prazo estimado: 3 dias úteis.\n\nQualquer dúvida, estou à disposição.\n\nAtt,\n{vendedor}' },
    { id: 3, nome: 'Follow-up Homologação', canal: 'email', etapa: 'homologado', assunto: 'Como foi a avaliação? — MF Paris', corpo: 'Olá {nome},\n\nGostaria de saber como foi a avaliação dos nossos produtos em {empresa}. Podemos agendar uma reunião para discutir os próximos passos?\n\nAtt,\n{vendedor}' },
    { id: 4, nome: 'Proposta Comercial', canal: 'email', etapa: 'negociacao', assunto: 'Proposta Comercial — MF Paris para {empresa}', corpo: 'Olá {nome},\n\nSegue em anexo nossa proposta comercial personalizada para {empresa}.\n\nCondições especiais válidas até o final do mês.\n\nAtt,\n{vendedor}' },
    { id: 5, nome: 'Boas-vindas Pós-Venda', canal: 'email', etapa: 'pos_venda', assunto: 'Bem-vindo à MF Paris! 🎉', corpo: 'Olá {nome},\n\nÉ com grande satisfação que damos boas-vindas a {empresa} como nosso novo parceiro!\n\nSeu gerente de conta é {vendedor}. Qualquer necessidade, conte conosco.\n\nAtt,\nEquipe MF Paris' },
    { id: 6, nome: 'Primeiro Contato WhatsApp', canal: 'whatsapp', etapa: 'prospecção', corpo: 'Olá {nome}! 👋\nSou {vendedor} da *MF Paris*. Temos soluções em congelados, laticínios e bebidas para {empresa}.\nPosso enviar nosso catálogo? 📋' },
    { id: 7, nome: 'Lembrete de Amostra', canal: 'whatsapp', etapa: 'amostra', corpo: 'Olá {nome}! 📦\nAs amostras da *MF Paris* já foram enviadas para {empresa}. Previsão de chegada: 3 dias úteis.\nQualquer dúvida, estou aqui! 😊' },
    { id: 8, nome: 'Follow-up WhatsApp', canal: 'whatsapp', etapa: 'negociacao', corpo: 'Olá {nome}! 🤝\nComo está a análise da nossa proposta para {empresa}?\nTemos condições especiais este mês. Posso ajudar em algo? 💬' },
  ])

  const [produtos, setProdutos] = useState<Produto[]>([
    // SACARIA 25kg — Linha Horizonte
    { id: 1, nome: 'Leite em Pó Integral 25kg', descricao: 'Rico em nutrientes essenciais, ideal para consumo direto e aplicações industriais. Produto possui SIF.', categoria: 'sacaria', preco: 650.00, unidade: 'sc', foto: '', sku: 'SAC-001', estoque: 200, pesoKg: 25, margemLucro: 18, ativo: true, destaque: true, dataCadastro: '2024-01-01' },
    { id: 2, nome: 'Leite em Pó Desnatado 25kg', descricao: 'Alternativa saudável com menor teor de gordura, preservando o sabor e os benefícios do leite.', categoria: 'sacaria', preco: 620.00, unidade: 'sc', foto: '', sku: 'SAC-002', estoque: 180, pesoKg: 25, margemLucro: 17, ativo: true, destaque: false, dataCadastro: '2024-01-01' },
    { id: 3, nome: 'Soro de Leite 25kg', descricao: 'Ingrediente valioso utilizado em indústrias alimentícias, conhecido por suas propriedades nutricionais e funcionais.', categoria: 'sacaria', preco: 280.00, unidade: 'sc', foto: '', sku: 'SAC-003', estoque: 300, pesoKg: 25, margemLucro: 22, ativo: true, destaque: false, dataCadastro: '2024-01-01' },
    { id: 4, nome: 'Maltodextrina 25kg', descricao: 'Melhora a textura ou o sabor, preserva alimentos e aumenta sua vida útil.', categoria: 'sacaria', preco: 190.00, unidade: 'sc', foto: '', sku: 'SAC-004', estoque: 250, pesoKg: 25, margemLucro: 20, ativo: true, destaque: false, dataCadastro: '2024-01-01' },
    { id: 5, nome: 'Glucose 25kg', descricao: 'Seu principal uso é no mundo da confeitaria, mas sua aplicação é vasta.', categoria: 'sacaria', preco: 160.00, unidade: 'sc', foto: '', sku: 'SAC-005', estoque: 220, pesoKg: 25, margemLucro: 25, ativo: true, destaque: false, dataCadastro: '2024-01-01' },
    // Linha Okey Lac 25kg
    { id: 6, nome: 'Okey Lac Cream 25kg', descricao: 'Linha Okey Lac desenvolvida para substituição do leite em panificação, foodservice, indústrias de sorvetes e indústrias doces.', categoria: 'okey_lac', preco: 320.00, unidade: 'sc', foto: '', sku: 'OKL-001', estoque: 150, pesoKg: 25, margemLucro: 28, ativo: true, destaque: true, dataCadastro: '2024-01-05' },
    { id: 7, nome: 'Okey Lac Pro 25kg', descricao: 'Composto lácteo para aplicações profissionais em panificação e foodservice.', categoria: 'okey_lac', preco: 310.00, unidade: 'sc', foto: '', sku: 'OKL-002', estoque: 140, pesoKg: 25, margemLucro: 27, ativo: true, destaque: false, dataCadastro: '2024-01-05' },
    { id: 8, nome: 'Okey Lac Gourmet 25kg', descricao: 'Composto lácteo premium para aplicações gourmet e confeitaria.', categoria: 'okey_lac', preco: 340.00, unidade: 'sc', foto: '', sku: 'OKL-003', estoque: 120, pesoKg: 25, margemLucro: 30, ativo: true, destaque: false, dataCadastro: '2024-01-05' },
    { id: 9, nome: 'Okey Lac Açaí 25kg', descricao: 'Composto lácteo especial para preparo de açaí e sorvetes.', categoria: 'okey_lac', preco: 330.00, unidade: 'sc', foto: '', sku: 'OKL-004', estoque: 100, pesoKg: 25, margemLucro: 29, ativo: true, destaque: false, dataCadastro: '2024-01-05' },
    // VAREJO — Okey Lac
    { id: 10, nome: 'Okey Lac Panificação e Culinária 1kg', descricao: 'Ideal para pães, bolos, cremes doces e salgados e massas de pizza.', categoria: 'varejo_lacteo', preco: 18.90, unidade: 'un', foto: '', sku: 'VAR-001', estoque: 500, pesoKg: 1, margemLucro: 32, ativo: true, destaque: true, dataCadastro: '2024-01-10' },
    { id: 11, nome: 'Leite em Pó e Composto Lácteo 1kg', descricao: 'Fonte de cálcio e muito sabor. Feito sob medida para você. Disponível em 1kg, 400g e 200g.', categoria: 'varejo_lacteo', preco: 32.50, unidade: 'un', foto: '', sku: 'VAR-002', estoque: 600, pesoKg: 1, margemLucro: 25, ativo: true, destaque: false, dataCadastro: '2024-01-10' },
    { id: 12, nome: 'Okey Lac 1kg', descricao: 'Produto desenvolvido como excelente acréscimo para açaí.', categoria: 'varejo_lacteo', preco: 16.90, unidade: 'un', foto: '', sku: 'VAR-003', estoque: 400, pesoKg: 1, margemLucro: 30, ativo: true, destaque: false, dataCadastro: '2024-01-10' },
    { id: 13, nome: 'Chocominas 400g', descricao: 'Mistura de Cacau em pó para dissolução em leite.', categoria: 'varejo_lacteo', preco: 12.50, unidade: 'un', foto: '', sku: 'VAR-004', estoque: 800, pesoKg: 0.4, margemLucro: 35, ativo: true, destaque: false, dataCadastro: '2024-01-10' },
    // CAFÉ
    { id: 14, nome: 'Café Belveder 250g', descricao: 'Café Tradicional possui uma fragrância marcante e um aroma intenso, oriundo da torra de grãos selecionados. Disponível em 250g e 500g.', categoria: 'cafe', preco: 14.90, unidade: 'un', foto: '', sku: 'CAF-001', estoque: 350, pesoKg: 0.25, margemLucro: 28, ativo: true, destaque: false, dataCadastro: '2024-01-15' },
    { id: 15, nome: 'Café Molito 250g', descricao: 'Torra moderadamente escura a moderadamente clara — Moagem fina a média. Disponível em 250g e 500g.', categoria: 'cafe', preco: 13.50, unidade: 'un', foto: '', sku: 'CAF-002', estoque: 400, pesoKg: 0.25, margemLucro: 26, ativo: true, destaque: false, dataCadastro: '2024-01-15' },
    { id: 16, nome: 'Café Grão de Minas 250g', descricao: 'Tradicional e Extraforte. Disponível em 250g e 500g.', categoria: 'cafe', preco: 11.90, unidade: 'un', foto: '', sku: 'CAF-003', estoque: 450, pesoKg: 0.25, margemLucro: 24, ativo: true, destaque: false, dataCadastro: '2024-01-15' },
  ])

  const [activeView, setActiveView] = useState<ViewType>('dashboard')
  const [showModal, setShowModal] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: 1,
      razaoSocial: 'SuperBH Ltda',
      nomeFantasia: 'SuperBH Matriz',
      cnpj: '12.345.678/0001-90',
      contatoNome: 'João Silva',
      contatoTelefone: '(31) 99999-1111',
      contatoEmail: 'joao@superbh.com.br',
      endereco: 'Av. Afonso Pena, 1000 - Centro, Belo Horizonte - MG',
      etapa: 'prospecção',
      vendedorId: 1,
      score: 75,
      ultimaInteracao: '2024-01-15',
      diasInativo: 5,
      valorEstimado: 150000,
      produtosInteresse: ['Leite em Pó Integral 25kg', 'Okey Lac Cream 25kg']
    },
    {
      id: 2,
      razaoSocial: 'MegaMart Comercial',
      nomeFantasia: 'MegaMart',
      cnpj: '98.765.432/0001-10',
      contatoNome: 'Maria Santos',
      contatoTelefone: '(31) 99999-2222',
      contatoEmail: 'maria@megamart.com.br',
      etapa: 'amostra',
      vendedorId: 2,
      score: 85,
      ultimaInteracao: '2024-01-18',
      diasInativo: 2,
      valorEstimado: 85000,
      produtosInteresse: ['Café Belveder 250g', 'Chocominas 400g', 'Okey Lac Panificação e Culinária 1kg']
    }
  ])
  const [interacoes, setInteracoes] = useState<Interacao[]>([
    {
      id: 1,
      clienteId: 1,
      tipo: 'email',
      data: '2024-01-15T10:30:00',
      assunto: 'Proposta inicial',
      descricao: 'Envio de catálogo de produtos congelados',
      automatico: false
    }
  ])
  const [aiCommands, setAICommands] = useState<AICommand[]>([])
  const [aiCommand, setAICommand] = useState('')
  const [aiResponse, setAIResponse] = useState('')
  const [isAILoading, setIsAILoading] = useState(false)
  const [templatesMsgs, setTemplatesMsgs] = useState<TemplateMsg[]>([
    {
      id: 1,
      canal: 'whatsapp',
      nome: 'Primeiro contato (WhatsApp)',
      conteudo: 'Olá {nome}, tudo bem? Aqui é da MF Paris. Posso te enviar nosso catálogo e condições para sua região?'
    },
    {
      id: 2,
      canal: 'email',
      nome: 'Catálogo (Email)',
      conteudo: 'Olá {nome},\n\nSegue nosso catálogo MF Paris e condições comerciais.\n\nSe preferir, agendamos uma ligação rápida.\n\nAbraços,'
    },
    {
      id: 3,
      canal: 'linkedin',
      nome: 'Conexão (LinkedIn)',
      conteudo: 'Olá {nome}, vi a empresa {empresa} e queria compartilhar nosso portfólio MF Paris. Podemos conversar?'
    },
    {
      id: 4,
      canal: 'instagram',
      nome: 'Apresentação (Instagram)',
      conteudo: 'Olá {nome}! Posso te enviar novidades e promoções MF Paris para {empresa}?'
    }
  ])

  const [cadencias, setCadencias] = useState<Cadencia[]>([
    {
      id: 1,
      nome: 'Prospecção 7 dias (WhatsApp + Email + LinkedIn)',
      pausarAoResponder: true,
      steps: [
        { id: 1, canal: 'whatsapp', delayDias: 0, templateId: 1 },
        { id: 2, canal: 'email', delayDias: 2, templateId: 2 },
        { id: 3, canal: 'linkedin', delayDias: 5, templateId: 3 }
      ]
    }
  ])

  const [campanhas, setCampanhas] = useState<Campanha[]>([
    {
      id: 1,
      nome: 'Reativação (30+ dias inativo)',
      cadenciaId: 1,
      diasInativoMin: 30,
      status: 'rascunho'
    }
  ])

  const [jobs, setJobs] = useState<JobAutomacao[]>([])
  const [tarefas, setTarefas] = useState<Tarefa[]>([
    {
      id: 1,
      titulo: 'Follow-up SuperBH',
      descricao: 'Ligar para João Silva sobre catálogo',
      data: new Date().toISOString().split('T')[0],
      hora: '10:00',
      tipo: 'ligacao',
      status: 'pendente',
      prioridade: 'alta',
      clienteId: 1
    },
    {
      id: 2,
      titulo: 'Enviar proposta MegaMart',
      descricao: 'Preparar proposta comercial',
      data: new Date().toISOString().split('T')[0],
      hora: '14:00',
      tipo: 'email',
      status: 'pendente',
      prioridade: 'media',
      clienteId: 2
    }
  ])
  const [vendedores, setVendedores] = useState<Vendedor[]>([
    { id: 1, nome: 'Carlos Silva', email: 'carlos@mfparis.com.br', telefone: '(31) 99999-0001', cargo: 'vendedor', avatar: 'CS', usuario: 'carlos', senha: 'carlos123', metaVendas: 200000, metaLeads: 10, metaConversao: 20, ativo: true },
    { id: 2, nome: 'Ana Oliveira', email: 'ana@mfparis.com.br', telefone: '(31) 99999-0002', cargo: 'vendedor', avatar: 'AO', usuario: 'ana', senha: 'ana123', metaVendas: 180000, metaLeads: 8, metaConversao: 18, ativo: true },
    { id: 3, nome: 'Roberto Lima', email: 'roberto@mfparis.com.br', telefone: '(31) 99999-0003', cargo: 'sdr', avatar: 'RL', usuario: 'roberto', senha: 'roberto123', metaVendas: 120000, metaLeads: 15, metaConversao: 10, ativo: true },
    { id: 4, nome: 'Fernanda Costa', email: 'fernanda@mfparis.com.br', telefone: '(31) 99999-0004', cargo: 'gerente', avatar: 'FC', usuario: 'admin', senha: 'admin123', metaVendas: 500000, metaLeads: 20, metaConversao: 15, ativo: true }
  ])

  const [showMotivoPerda, setShowMotivoPerda] = useState(false)
  const [motivoPerdaTexto, setMotivoPerdaTexto] = useState('')
  const [pendingDrop, setPendingDrop] = useState<{ e: React.DragEvent, toStage: string } | null>(null)

  // Generate notifications from data
  useEffect(() => {
    const novas: Notificacao[] = []
    let nId = 1
    clientes.forEach(c => {
      if ((c.diasInativo || 0) > 10) {
        novas.push({ id: nId++, tipo: 'warning', titulo: 'Cliente inativo', mensagem: `${c.razaoSocial} está inativo há ${c.diasInativo} dias`, timestamp: new Date().toISOString(), lida: false, clienteId: c.id })
      }
    })
    tarefas.forEach(t => {
      if (t.status === 'pendente') {
        novas.push({ id: nId++, tipo: 'info', titulo: 'Tarefa pendente', mensagem: `${t.titulo} — ${t.descricao}`, timestamp: new Date().toISOString(), lida: false, clienteId: t.clienteId })
      }
    })
    vendedores.forEach(v => {
      const clientesV = clientes.filter(c => c.vendedorId === v.id)
      const valorPipeline = clientesV.reduce((s, c) => s + (c.valorEstimado || 0), 0)
      if (valorPipeline < v.metaVendas * 0.5 && v.ativo) {
        novas.push({ id: nId++, tipo: 'error', titulo: 'Meta em risco', mensagem: `${v.nome} está abaixo de 50% da meta de vendas`, timestamp: new Date().toISOString(), lida: false })
      }
    })
    setNotificacoes(novas)
  }, [clientes, tarefas, vendedores])

  const [formData, setFormData] = useState<FormData>({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    contatoNome: '',
    contatoTelefone: '',
    contatoEmail: '',
    endereco: '',
    valorEstimado: '',
    produtosInteresse: '',
    vendedorId: ''
  })

  // Dashboard Metrics Calculation
  const calculateDashboardMetrics = (): DashboardMetrics => {
    const totalLeads = clientes.length
    const leadsAtivos = clientes.filter(c => (c.diasInativo || 0) <= 15).length
    const leadsNovosHoje = clientes.filter(c => {
      const hoje = new Date().toDateString()
      return c.ultimaInteracao === hoje
    }).length
    const interacoesHoje = interacoes.filter(c => {
      const hoje = new Date().toISOString().split('T')[0]
      return c.data.startsWith(hoje)
    }).length
    const valorTotal = clientes.reduce((sum, c) => sum + (c.valorEstimado || 0), 0)
    const ticketMedio = totalLeads > 0 ? valorTotal / totalLeads : 0
    const taxaConversao = totalLeads > 0 ? (clientes.filter(c => c.etapa === 'pos_venda').length / totalLeads) * 100 : 0

    return {
      totalLeads,
      leadsAtivos,
      taxaConversao,
      valorTotal,
      ticketMedio,
      leadsNovosHoje,
      interacoesHoje
    }
  }

  // Lead Scoring Algorithm
  const calculateLeadScore = (cliente: Cliente): number => {
    let score = 0
    
    // Score base por etapa (40%)
    const etapaScores = {
      'prospecção': 20,
      'amostra': 40,
      'homologado': 60,
      'negociacao': 80,
      'pos_venda': 100
    }
    score += etapaScores[cliente.etapa as keyof typeof etapaScores] || 0
    
    // Score por valor estimado (30%)
    if (cliente.valorEstimado) {
      if (cliente.valorEstimado > 100000) score += 30
      else if (cliente.valorEstimado > 50000) score += 20
      else if (cliente.valorEstimado > 20000) score += 10
    }
    
    // Score por engajamento (20%)
    if (cliente.diasInativo !== undefined) {
      if (cliente.diasInativo <= 7) score += 20
      else if (cliente.diasInativo <= 15) score += 15
      else if (cliente.diasInativo <= 30) score += 10
      else if (cliente.diasInativo > 30) score -= 10
    }
    
    // Score por produtos de interesse (10%)
    if (cliente.produtosInteresse && cliente.produtosInteresse.length > 0) {
      score += Math.min(cliente.produtosInteresse.length * 2, 10)
    }
    
    return Math.max(0, Math.min(100, score))
  }

  // Notification System
  const addNotificacao = (tipo: Notificacao['tipo'], titulo: string, mensagem: string, clienteId?: number) => {
    const novaNotificacao: Notificacao = {
      id: Date.now(),
      tipo,
      titulo,
      mensagem,
      timestamp: new Date().toLocaleString('pt-BR'),
      lida: false,
      clienteId
    }
    setNotificacoes(prev => [novaNotificacao, ...prev.slice(0, 9)])
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setNotificacoes(prev => prev.map(n => 
        n.id === novaNotificacao.id ? { ...n, lida: true } : n
      ))
    }, 5000)
  }

  // AI Command Processing
  const processAICommand = async (command: string) => {
    setIsAILoading(true)
    
    // Simulate AI processing
    setTimeout(() => {
      let response = ''
      
      if (command.toLowerCase().includes('leads inativos')) {
        const inativos = clientes.filter(c => (c.diasInativo || 0) > 30)
        response = `Encontrei ${inativos.length} leads inativos há mais de 30 dias:\n\n${inativos.map(c => 
          `• ${c.razaoSocial} - ${c.diasInativo} dias sem contato (${c.contatoEmail})`
        ).join('\n')}\n\nDeseja que eu envie um follow-up automático para todos?`
      } else if (command.toLowerCase().includes('follow-up')) {
        response = 'Follow-ups agendados com sucesso! 3 emails serão enviados hoje e 2 amanhã. Usarei templates personalizados para cada cliente.'
      } else if (command.toLowerCase().includes('priorizar')) {
        response = 'Clientes priorizados por score:\n\n1. MegaMart (Score: 85) - Negociação avançada\n2. SuperBH (Score: 75) - Aguardando amostra\n\nFoco de hoje: MegaMart'
      } else if (command.toLowerCase().includes('relatório')) {
        const total = clientes.length
        const ativos = clientes.filter(c => (c.diasInativo || 0) <= 15).length
        const conversao = clientes.filter(c => c.etapa === 'pos_venda').length
        response = `📊 Relatório Semanal:\n\n• Total leads: ${total}\n• Leads ativos: ${ativos}\n• Taxa ativação: ${((ativos/total) * 100).toFixed(1)}%\n• Conversões: ${conversao}\n• Ticket médio: R$ ${(clientes.reduce((sum, c) => sum + (c.valorEstimado || 0), 0) / clientes.length).toFixed(2)}`
      } else {
        response = 'Entendido! Posso ajudar com:\n\n• 📋 Listar leads inativos\n• 📤 Enviar follow-ups\n• 🎯 Priorizar clientes\n• 📊 Gerar relatórios\n• 🔍 Buscar clientes\n\nO que você precisa?'
      }
      
      const newCommand: AICommand = {
        id: Date.now().toString(),
        command,
        response,
        timestamp: new Date().toLocaleString('pt-BR')
      }
      
      setAICommands(prev => [newCommand, ...prev.slice(0, 9)])
      setAIResponse(response)
      setIsAILoading(false)
    }, 1500)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const produtosArray = formData.produtosInteresse 
      ? formData.produtosInteresse.split(',').map(p => p.trim()).filter(p => p)
      : []
    const { vendedorId: vIdStr, valorEstimado: vEstStr, produtosInteresse: _pi, ...restForm } = formData
    
    if (editingCliente) {
      // Edit existing cliente
      const updatedCliente: Cliente = {
        ...editingCliente,
        ...restForm,
        valorEstimado: vEstStr ? parseFloat(vEstStr) : undefined,
        vendedorId: vIdStr ? Number(vIdStr) : undefined,
        produtosInteresse: produtosArray
      }
      updatedCliente.score = calculateLeadScore(updatedCliente)
      
      setClientes(prev => prev.map(c => 
        c.id === editingCliente.id 
          ? updatedCliente
          : c
      ))
      
      // Add interaction
      const newInteracao: Interacao = {
        id: interacoes.length + 1,
        clienteId: editingCliente.id,
        tipo: 'email',
        data: new Date().toISOString(),
        assunto: 'Dados atualizados',
        descricao: `Cliente atualizado: ${formData.razaoSocial}`,
        automatico: false
      }
      setInteracoes(prev => [newInteracao, ...prev])
      
      setEditingCliente(null)
    } else {
      // Add new cliente
      const newCliente: Cliente = {
        id: clientes.length + 1,
        ...restForm,
        etapa: 'prospecção',
        valorEstimado: vEstStr ? parseFloat(vEstStr) : undefined,
        vendedorId: vIdStr ? Number(vIdStr) : undefined,
        produtosInteresse: produtosArray,
        ultimaInteracao: new Date().toISOString().split('T')[0],
        diasInativo: 0
      }
      newCliente.score = calculateLeadScore(newCliente)
      
      setClientes(prev => [...prev, newCliente])
      
      // Add initial interaction
      const newInteracao: Interacao = {
        id: interacoes.length + 1,
        clienteId: newCliente.id,
        tipo: 'email',
        data: new Date().toISOString(),
        assunto: 'Bem-vindo!',
        descricao: `Novo cliente cadastrado: ${formData.razaoSocial}`,
        automatico: true
      }
      setInteracoes(prev => [newInteracao, ...prev])
    }
    
    setFormData({
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      contatoNome: '',
      contatoTelefone: '',
      contatoEmail: '',
      endereco: '',
      valorEstimado: '',
      produtosInteresse: '',
      vendedorId: ''
    })
    setShowModal(false)
  }

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setFormData({
      razaoSocial: cliente.razaoSocial,
      nomeFantasia: cliente.nomeFantasia || '',
      cnpj: cliente.cnpj,
      contatoNome: cliente.contatoNome,
      contatoTelefone: cliente.contatoTelefone,
      contatoEmail: cliente.contatoEmail,
      endereco: cliente.endereco || '',
      valorEstimado: cliente.valorEstimado?.toString() || '',
      produtosInteresse: cliente.produtosInteresse?.join(', ') || '',
      vendedorId: cliente.vendedorId?.toString() || ''
    })
    setShowModal(true)
  }

  const handleQuickAction = (cliente: Cliente, canal: Interacao['tipo'], tipo: 'propaganda' | 'contato') => {
    const assunto = tipo === 'propaganda' ? `Propaganda - ${canal.toUpperCase()}` : `Contato - ${canal.toUpperCase()}`
    const descricao = tipo === 'propaganda'
      ? `Envio de propaganda automatizada para ${cliente.razaoSocial}`
      : `Ação de contato iniciada com ${cliente.razaoSocial}`

    const newInteracao: Interacao = {
      id: interacoes.length + 1,
      clienteId: cliente.id,
      tipo: canal,
      data: new Date().toISOString(),
      assunto,
      descricao,
      automatico: true
    }
    setInteracoes(prev => [newInteracao, ...prev])
    addNotificacao('success', 'Automação executada', `${assunto}: ${cliente.razaoSocial}`, cliente.id)
  }

  const scheduleJob = (job: Omit<JobAutomacao, 'id' | 'status'>) => {
    const newJob: JobAutomacao = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      ...job,
      status: 'pendente'
    }
    setJobs(prev => [newJob, ...prev])
    const cliente = clientes.find(c => c.id === job.clienteId)
    if (cliente) {
      addNotificacao('info', 'Job agendado', `Agendado ${job.canal.toUpperCase()} para ${cliente.razaoSocial}`, cliente.id)
    }
  }

  const runJobNow = (jobId: number) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'enviado' } : j))
    const job = jobs.find(j => j.id === jobId)
    if (!job) return
    const cliente = clientes.find(c => c.id === job.clienteId)
    if (!cliente) return
    handleQuickAction(cliente, job.canal, job.tipo)
  }

  const startCampanha = (campanhaId: number) => {
    const campanha = campanhas.find(c => c.id === campanhaId)
    if (!campanha) return
    const cadencia = cadencias.find(c => c.id === campanha.cadenciaId)
    if (!cadencia) return

    const audience = clientes.filter(c => {
      if (campanha.etapa && c.etapa !== campanha.etapa) return false
      if (campanha.minScore !== undefined && (c.score || 0) < campanha.minScore) return false
      if (campanha.diasInativoMin !== undefined && (c.diasInativo || 0) < campanha.diasInativoMin) return false
      return true
    })

    const now = new Date()
    cadencia.steps.forEach(step => {
      audience.forEach(cliente => {
        const dt = new Date(now)
        dt.setDate(dt.getDate() + step.delayDias)
        scheduleJob({
          clienteId: cliente.id,
          canal: step.canal,
          tipo: 'propaganda',
          agendadoPara: dt.toISOString(),
          templateId: step.templateId,
          campanhaId: campanha.id
        })
      })
    })

    setCampanhas(prev => prev.map(c => c.id === campanhaId ? { ...c, status: 'ativa' } : c))
    addNotificacao('success', 'Campanha ativada', `${campanha.nome} iniciada para ${audience.length} leads`)
  }

  const handleDragStart = (e: React.DragEvent, cliente: Cliente, fromStage: string) => {
    setDraggedItem({ cliente, fromStage })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, toStage: string) => {
    e.preventDefault()
    if (draggedItem && draggedItem.fromStage !== toStage) {
      if (toStage === 'perdido') {
        setPendingDrop({ e, toStage })
        setShowMotivoPerda(true)
        return
      }
      setClientes(prev => prev.map(c => 
        c.id === draggedItem.cliente.id 
          ? { ...c, etapa: toStage }
          : c
      ))
      setAtividades(prev => [{ id: Date.now(), tipo: 'moveu', descricao: `${draggedItem.cliente.razaoSocial} movido para ${toStage}`, vendedorNome: loggedUser?.nome || 'Sistema', timestamp: new Date().toISOString() }, ...prev])
    }
    setDraggedItem(null)
  }

  const confirmPerda = () => {
    if (draggedItem && pendingDrop) {
      setClientes(prev => prev.map(c => 
        c.id === draggedItem.cliente.id 
          ? { ...c, etapa: 'perdido', motivoPerda: motivoPerdaTexto || 'Não informado' }
          : c
      ))
      setAtividades(prev => [{ id: Date.now(), tipo: 'moveu', descricao: `${draggedItem.cliente.razaoSocial} marcado como Perdido: ${motivoPerdaTexto || 'Não informado'}`, vendedorNome: loggedUser?.nome || 'Sistema', timestamp: new Date().toISOString() }, ...prev])
    }
    setDraggedItem(null)
    setPendingDrop(null)
    setShowMotivoPerda(false)
    setMotivoPerdaTexto('')
  }

  const openModal = () => {
    setEditingCliente(null)
    setFormData({
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      contatoNome: '',
      contatoTelefone: '',
      contatoEmail: '',
      endereco: '',
      valorEstimado: '',
      produtosInteresse: '',
      vendedorId: ''
    })
    setShowModal(true)
  }

  const renderContent = () => {
    const dashboardMetrics = calculateDashboardMetrics()
    switch (activeView) {
      case 'dashboard':
        return <DashboardView clientes={clientes} metrics={dashboardMetrics} vendedores={vendedores} atividades={atividades} interacoes={interacoes} produtos={produtos} />
      case 'funil':
        return <FunilView 
          clientes={clientes} 
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      case 'clientes':
        return <ClientesView 
          clientes={clientes} 
          vendedores={vendedores}
          onNewCliente={openModal}
          onEditCliente={handleEditCliente}
        />
      case 'automacoes':
        return <AutomacoesView clientes={clientes} onAction={handleQuickAction} />
      case 'mapa':
        return <MapaView clientes={clientes} />
      case 'prospeccao':
        return (
          <ProspeccaoView
            clientes={clientes}
            interacoes={interacoes}
            templates={templatesMsgs}
            cadencias={cadencias}
            campanhas={campanhas}
            jobs={jobs}
            onQuickAction={handleQuickAction}
            onStartCampanha={startCampanha}
            onRunJobNow={runJobNow}
            onCreateTemplate={(t: TemplateMsg) => setTemplatesMsgs(prev => [t, ...prev])}
            onCreateCampanha={(c: Campanha) => setCampanhas(prev => [c, ...prev])}
          />
        )
      case 'tarefas':
        return <TarefasView tarefas={tarefas} clientes={clientes} onUpdateTarefa={(t) => setTarefas(prev => prev.map(x => x.id === t.id ? t : x))} onAddTarefa={(t) => setTarefas(prev => [t, ...prev])} />
      case 'social':
        return <SocialSearchView />
      case 'integracoes':
        return <IntegracoesView />
      case 'equipe':
        return <VendedoresView vendedores={vendedores} clientes={clientes} onAddVendedor={(v) => setVendedores(prev => [...prev, v])} onUpdateVendedor={(v) => setVendedores(prev => prev.map(x => x.id === v.id ? v : x))} />
      case 'relatorios':
        return <RelatoriosView clientes={clientes} vendedores={vendedores} interacoes={interacoes} produtos={produtos} />
      case 'templates':
        return <TemplatesView templates={templates} onAdd={(t) => setTemplates(prev => [...prev, t])} onDelete={(id) => setTemplates(prev => prev.filter(t => t.id !== id))} />
      case 'produtos':
        return <ProdutosView produtos={produtos} onAdd={(p) => setProdutos(prev => [...prev, p])} onUpdate={(p) => setProdutos(prev => prev.map(x => x.id === p.id ? p : x))} onDelete={(id) => setProdutos(prev => prev.filter(p => p.id !== id))} isGerente={loggedUser?.cargo === 'gerente'} />
      default:
        return <DashboardView clientes={clientes} metrics={dashboardMetrics} vendedores={vendedores} atividades={atividades} interacoes={interacoes} produtos={produtos} />
    }
  }

  const handleLogin = () => {
    setLoginError('')
    const user = vendedores.find(v => v.usuario === loginUsuario.trim() && v.senha === loginSenha && v.ativo)
    if (user) {
      setLoggedUser(user)
      setLoginUsuario('')
      setLoginSenha('')
    } else {
      setLoginError('Usuário ou senha inválidos')
    }
  }

  if (!loggedUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-blue-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg mx-auto flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-primary-700">MF</span>
            </div>
            <h1 className="text-3xl font-bold text-white">MF Paris</h1>
            <p className="text-primary-200 mt-2">CRM de Vendas</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Entrar no sistema</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                <input
                  type="text"
                  value={loginUsuario}
                  onChange={(e) => setLoginUsuario(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Digite seu usuário"
                  className="w-full px-4 py-3 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input
                  type="password"
                  value={loginSenha}
                  onChange={(e) => setLoginSenha(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Digite sua senha"
                  className="w-full px-4 py-3 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-apple p-3 text-sm text-red-700 text-center">
                  {loginError}
                </div>
              )}

              <button
                onClick={handleLogin}
                className="w-full py-3 bg-primary-600 text-white rounded-apple hover:bg-primary-700 transition-colors duration-200 shadow-apple-sm font-semibold text-base"
              >
                Entrar
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">Acesso de demonstração:</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button onClick={() => { setLoginUsuario('admin'); setLoginSenha('admin123') }} className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-apple px-2 py-1.5 text-gray-700 transition-colors">
                  👑 admin / admin123
                </button>
                <button onClick={() => { setLoginUsuario('carlos'); setLoginSenha('carlos123') }} className="text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-apple px-2 py-1.5 text-gray-700 transition-colors">
                  👤 carlos / carlos123
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-primary-200 text-xs mt-6">© 2026 MF Paris — CRM de Vendas</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-screen flex ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div className={`w-64 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
        {/* Logo */}
        <div className={`h-16 flex items-center px-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>MF Paris</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`
              w-full flex items-center px-3 py-2 text-sm font-medium rounded-apple transition-all duration-200
              ${activeView === 'dashboard' 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <HomeIcon className="mr-3 h-5 w-5" />
            Visão Geral
          </button>
          
          <button
            onClick={() => setActiveView('funil')}
            className={`
              w-full flex items-center px-3 py-2 text-sm font-medium rounded-apple transition-all duration-200
              ${activeView === 'funil' 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <FunnelIcon className="mr-3 h-5 w-5" />
            Funil
          </button>
          
          <button
            onClick={() => setActiveView('clientes')}
            className={`
              w-full flex items-center px-3 py-2 text-sm font-medium rounded-apple transition-all duration-200
              ${activeView === 'clientes' 
                ? 'bg-primary-50 text-primary-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <UserGroupIcon className="mr-3 h-5 w-5" />
            Clientes
          </button>

	      <button
	        onClick={() => setActiveView('automacoes')}
	        className={`
	          w-full flex items-center px-3 py-2 text-sm font-medium rounded-apple transition-all duration-200
	          ${activeView === 'automacoes'
	            ? 'bg-primary-50 text-primary-700'
	            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
	          }
	        `}
	      >
	        <PaperAirplaneIcon className="mr-3 h-5 w-5" />
	        Automações
	      </button>

	      <button
	        onClick={() => setActiveView('prospeccao')}
	        className={`
	          w-full flex items-center px-3 py-2 text-sm font-medium rounded-apple transition-all duration-200
	          ${activeView === 'prospeccao'
	            ? 'bg-primary-50 text-primary-700'
	            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
	          }
	        `}
	      >
	        <MagnifyingGlassIcon className="mr-3 h-5 w-5" />
	        Prospecção
	      </button>

	      <button
	        onClick={() => setActiveView('mapa')}
	        className={`
	          w-full flex items-center px-3 py-2 text-sm font-medium rounded-apple transition-all duration-200
	          ${activeView === 'mapa'
	            ? 'bg-primary-50 text-primary-700'
	            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
	          }
	        `}
	      >
	        <MapIcon className="mr-3 h-5 w-5" />
	        Mapa
	      </button>

          <button
            onClick={() => setActiveView('tarefas')}
            className={`
              w-full flex items-center px-3 py-2 text-sm font-medium rounded-apple transition-all duration-200
              ${activeView === 'tarefas'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <ChartBarIcon className="mr-3 h-5 w-5" />
            Tarefas
          </button>

          <button
            onClick={() => setActiveView('social')}
            className={`
              w-full flex items-center px-3 py-2 text-sm font-medium rounded-apple transition-all duration-200
              ${activeView === 'social'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <MagnifyingGlassIcon className="mr-3 h-5 w-5" />
            Busca Social
          </button>

          <button
            onClick={() => setActiveView('integracoes')}
            className={`
              w-full flex items-center px-3 py-2 text-sm font-medium rounded-apple transition-all duration-200
              ${activeView === 'integracoes'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <SparklesIcon className="mr-3 h-5 w-5" />
            Integrações
          </button>

          <button
            onClick={() => setActiveView('equipe')}
            className={`
              w-full flex items-center px-3 py-2 text-sm font-medium rounded-apple transition-all duration-200
              ${activeView === 'equipe'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <UserGroupIcon className="mr-3 h-5 w-5" />
            Equipe
          </button>

          <button
            onClick={() => setActiveView('produtos')}
            className={`
              w-full flex items-center px-3 py-2 text-sm font-medium rounded-apple transition-all duration-200
              ${activeView === 'produtos'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <CubeIcon className="mr-3 h-5 w-5" />
            Produtos
          </button>

          <button
            onClick={() => setActiveView('relatorios')}
            className={`
              w-full flex items-center px-3 py-2 text-sm font-medium rounded-apple transition-all duration-200
              ${activeView === 'relatorios'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <ChartBarIcon className="mr-3 h-5 w-5" />
            Relatórios
          </button>

          <button
            onClick={() => setActiveView('templates')}
            className={`
              w-full flex items-center px-3 py-2 text-sm font-medium rounded-apple transition-all duration-200
              ${activeView === 'templates'
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }
            `}
          >
            <DocumentTextIcon className="mr-3 h-5 w-5" />
            Templates
          </button>

          <div className="border-t border-gray-200 pt-4 mt-4">
            <button
              onClick={() => setShowAIModal(true)}
              className="w-full flex items-center px-3 py-2 text-sm font-medium rounded-apple bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-apple-sm"
            >
              <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1h3a3 3 0 003-3h1a1 1 0 001-1v-3a1 1 0 00-1-1H8a1 1 0 00-1 1v3a1 1 0 001 1h3zm-3 8a1 1 0 011-1h6a1 1 0 011 1v4a1 1 0 001 1h6a1 1 0 001-1v-4z" />
              </svg>
              Assistente IA
            </button>
          </div>
        </nav>

        {/* Bottom section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">{loggedUser.avatar}</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{loggedUser.nome}</p>
                <p className="text-xs text-gray-500">{loggedUser.cargo === 'gerente' ? 'Gerente' : loggedUser.cargo === 'sdr' ? 'SDR' : 'Vendedor'}</p>
              </div>
            </div>
            <button
              onClick={() => setLoggedUser(null)}
              className="text-xs text-gray-400 hover:text-red-600 transition-colors"
              title="Sair"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className={`h-16 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b flex items-center justify-between px-6`}>
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {activeView === 'dashboard' && 'Visão Geral'}
            {activeView === 'funil' && 'Funil de Vendas'}
            {activeView === 'clientes' && 'Clientes'}
            {activeView === 'automacoes' && 'Automações de Vendas'}
            {activeView === 'mapa' && 'Mapa de Leads'}
            {activeView === 'prospeccao' && 'Prospecção'}
            {activeView === 'tarefas' && 'Tarefas e Agenda'}
            {activeView === 'social' && 'Busca por Redes Sociais'}
            {activeView === 'integracoes' && 'Integrações'}
            {activeView === 'equipe' && 'Equipe de Vendas'}
            {activeView === 'relatorios' && 'Relatórios e Gráficos'}
            {activeView === 'templates' && 'Templates de Mensagens'}
            {activeView === 'produtos' && 'Catálogo de Produtos'}
          </h2>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-apple hover:bg-gray-100"
              title={darkMode ? 'Modo claro' : 'Modo escuro'}
            >
              {darkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-apple hover:bg-gray-100 relative"
              >
                <BellIcon className="h-5 w-5" />
                {notificacoes.filter(n => !n.lida).length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {notificacoes.filter(n => !n.lida).length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-96 bg-white rounded-apple shadow-apple-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notificações</h3>
                    <button onClick={() => setNotificacoes(prev => prev.map(n => ({ ...n, lida: true })))} className="text-xs text-primary-600 hover:text-primary-800">Marcar todas como lidas</button>
                  </div>
                  {notificacoes.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">Nenhuma notificação</div>
                  ) : (
                    notificacoes.map(n => (
                      <div key={n.id} className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!n.lida ? 'bg-blue-50' : ''}`} onClick={() => setNotificacoes(prev => prev.map(x => x.id === n.id ? { ...x, lida: true } : x))}>
                        <div className="flex items-start gap-2">
                          <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${n.tipo === 'warning' ? 'bg-yellow-500' : n.tipo === 'error' ? 'bg-red-500' : n.tipo === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{n.titulo}</p>
                            <p className="text-xs text-gray-600 mt-0.5">{n.mensagem}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>
      </div>

      {/* Modal Novo Cliente */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-apple shadow-apple border border-gray-200">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Razão Social *
                    </label>
                    <input
                      type="text"
                      name="razaoSocial"
                      value={formData.razaoSocial}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Ex: Supermercado BH Ltda"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Fantasia
                    </label>
                    <input
                      type="text"
                      name="nomeFantasia"
                      value={formData.nomeFantasia}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Ex: SuperBH"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CNPJ *
                    </label>
                    <input
                      type="text"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="00.000.000/0000-00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Contato *
                    </label>
                    <input
                      type="text"
                      name="contatoNome"
                      value={formData.contatoNome}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="João Silva"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      name="contatoTelefone"
                      value={formData.contatoTelefone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      name="contatoEmail"
                      value={formData.contatoEmail}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="email@empresa.com"
                    />
                  </div>

			  <div>
			    <label className="block text-sm font-medium text-gray-700 mb-1">
			      Endereço
			    </label>
			    <input
			      type="text"
			      name="endereco"
			      value={formData.endereco}
			      onChange={handleInputChange}
			      className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
			      placeholder="Rua, número, bairro, cidade - UF"
			    />
			  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Estimado (R$)
                    </label>
                    <input
                      type="number"
                      name="valorEstimado"
                      value={formData.valorEstimado}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Produtos de Interesse
                    </label>
                    <div className="border border-gray-300 rounded-apple p-3 max-h-40 overflow-y-auto space-y-1">
                      {produtos.filter(p => p.ativo).map(p => {
                        const selected = formData.produtosInteresse.split(',').map(s => s.trim()).filter(Boolean)
                        const isChecked = selected.includes(p.nome)
                        return (
                          <label key={p.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const updated = isChecked
                                  ? selected.filter(s => s !== p.nome)
                                  : [...selected, p.nome]
                                setFormData(prev => ({ ...prev, produtosInteresse: updated.join(', ') }))
                              }}
                              className="w-4 h-4 text-primary-600 rounded"
                            />
                            <span className="text-sm text-gray-700">{p.nome}</span>
                            <span className="text-xs text-gray-400 ml-auto">R$ {p.preco.toFixed(2).replace('.', ',')}/{p.unidade}</span>
                          </label>
                        )
                      })}
                      {produtos.filter(p => p.ativo).length === 0 && <p className="text-xs text-gray-400">Nenhum produto cadastrado</p>}
                    </div>
                    {formData.produtosInteresse && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.produtosInteresse.split(',').map(s => s.trim()).filter(Boolean).map(name => (
                          <span key={name} className="px-2 py-0.5 text-xs bg-primary-50 text-primary-700 rounded-full border border-primary-200 flex items-center gap-1">
                            {name}
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, produtosInteresse: prev.produtosInteresse.split(',').map(s => s.trim()).filter(s => s && s !== name).join(', ') }))} className="text-primary-400 hover:text-primary-700">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vendedor Responsável
                    </label>
                    <select
                      name="vendedorId"
                      value={formData.vendedorId || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Sem vendedor</option>
                      {vendedores.filter(v => v.ativo).map(v => (
                        <option key={v.id} value={v.id}>{v.nome} ({v.cargo === 'gerente' ? 'Gerente' : v.cargo === 'sdr' ? 'SDR' : 'Vendedor'})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-apple hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-apple hover:bg-primary-700 transition-colors duration-200 shadow-apple-sm"
                  >
                    Salvar Cliente
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showAIModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
              onClick={() => setShowAIModal(false)}
            />

            <div className="relative w-full max-w-2xl bg-white rounded-apple shadow-apple border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Assistente Virtual IA</h2>
                <button
                  onClick={() => setShowAIModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="px-6 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comando (em português natural)
                    </label>
                    <textarea
                      value={aiCommand}
                      onChange={(e) => setAICommand(e.target.value)}
                      placeholder="Ex: Lista leads inativos dos últimos 30 dias"
                      className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    <button
                      onClick={() => processAICommand(aiCommand)}
                      disabled={!aiCommand.trim() || isAILoading}
                      className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-apple transition-colors duration-200 shadow-apple-sm flex items-center justify-center"
                    >
                      {isAILoading ? 'Processando...' : 'Enviar Comando'}
                    </button>

                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Comandos Rápidos:</p>
                      <div className="space-y-2">
                        <button
                          onClick={() => setAICommand('Listar leads inativos dos últimos 30 dias')}
                          className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-apple border border-gray-200 transition-colors"
                        >
                          Leads inativos (30 dias)
                        </button>
                        <button
                          onClick={() => setAICommand('Enviar follow-up automático para leads inativos')}
                          className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-apple border border-gray-200 transition-colors"
                        >
                          Follow-up automático
                        </button>
                        <button
                          onClick={() => setAICommand('Priorizar clientes por score')}
                          className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-apple border border-gray-200 transition-colors"
                        >
                          Priorizar clientes
                        </button>
                        <button
                          onClick={() => setAICommand('Gerar relatório semanal de vendas')}
                          className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-apple border border-gray-200 transition-colors"
                        >
                          Relatório semanal
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resposta da IA
                    </label>
                    {aiResponse && (
                      <div className="bg-gray-50 rounded-apple p-4 border border-gray-200">
                        <div className="whitespace-pre-wrap text-sm text-gray-800">{aiResponse}</div>
                      </div>
                    )}

                    {aiCommands.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Histórico:</p>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {aiCommands.map((cmd) => (
                            <div key={cmd.id} className="bg-white border border-gray-200 rounded-apple p-3">
                              <div className="text-xs text-gray-500 mb-1">{cmd.timestamp}</div>
                              <div className="text-sm font-medium text-gray-900 mb-1">{cmd.command}</div>
                              <div className="text-sm text-gray-700">{cmd.response}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Motivo de Perda */}
      {showMotivoPerda && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-apple shadow-apple-lg max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Motivo da Perda</h2>
            <p className="text-sm text-gray-600 mb-4">Informe o motivo pelo qual este lead foi perdido:</p>
            <select
              value={motivoPerdaTexto}
              onChange={(e) => setMotivoPerdaTexto(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
            >
              <option value="">Selecione um motivo...</option>
              <option value="Preço alto">Preço alto</option>
              <option value="Concorrente escolhido">Concorrente escolhido</option>
              <option value="Sem orçamento">Sem orçamento</option>
              <option value="Sem resposta">Sem resposta / Ghosting</option>
              <option value="Produto não atende">Produto não atende</option>
              <option value="Timing ruim">Timing ruim</option>
              <option value="Outro">Outro</option>
            </select>
            {motivoPerdaTexto === 'Outro' && (
              <input
                type="text"
                placeholder="Descreva o motivo..."
                onChange={(e) => setMotivoPerdaTexto(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
              />
            )}
            <div className="flex justify-end gap-3">
              <button onClick={() => { setShowMotivoPerda(false); setDraggedItem(null); setPendingDrop(null); setMotivoPerdaTexto('') }} className="px-4 py-2 bg-white border border-gray-300 rounded-apple hover:bg-gray-50">Cancelar</button>
              <button onClick={confirmPerda} className="px-4 py-2 bg-red-600 text-white rounded-apple hover:bg-red-700">Confirmar Perda</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Dashboard View
const DashboardView: React.FC<DashboardViewProps> = ({ clientes, metrics, vendedores, atividades, interacoes, produtos }) => {
  const stages = ['prospecção', 'amostra', 'homologado', 'negociacao', 'pos_venda', 'perdido']
  const stageLabels: Record<string, string> = { 'prospecção': 'Prospecção', 'amostra': 'Amostra', 'homologado': 'Homologado', 'negociacao': 'Negociação', 'pos_venda': 'Pós-Venda', 'perdido': 'Perdido' }
  const pipelineData = stages.map(s => ({
    name: stageLabels[s] || s,
    valor: clientes.filter(c => c.etapa === s).reduce((sum, c) => sum + (c.valorEstimado || 0), 0),
    qtd: clientes.filter(c => c.etapa === s).length
  }))
  const COLORS = ['#3B82F6', '#EAB308', '#22C55E', '#A855F7', '#EC4899', '#EF4444']

  const vendedorData = vendedores.filter(v => v.ativo).map(v => ({
    name: v.nome.split(' ')[0],
    pipeline: clientes.filter(c => c.vendedorId === v.id).reduce((s, c) => s + (c.valorEstimado || 0), 0),
    leads: clientes.filter(c => c.vendedorId === v.id).length
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Visão geral das suas vendas e métricas em tempo real</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total Leads', value: metrics.totalLeads, icon: '📊', color: 'blue' },
          { label: 'Leads Ativos', value: metrics.leadsAtivos, icon: '✓', color: 'green' },
          { label: 'Conversão', value: `${metrics.taxaConversao.toFixed(1)}%`, icon: '📈', color: 'purple' },
          { label: 'Valor Total', value: `R$ ${metrics.valorTotal.toLocaleString('pt-BR')}`, icon: '💰', color: 'gray' },
          { label: 'Ticket Médio', value: `R$ ${metrics.ticketMedio.toLocaleString('pt-BR')}`, icon: '🎯', color: 'orange' },
          { label: 'Novos Hoje', value: metrics.leadsNovosHoje, icon: '🆕', color: 'blue' },
          { label: 'Interações', value: metrics.interacoesHoje, icon: '💬', color: 'indigo' },
        ].map((m, i) => (
          <div key={i} className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-4">
            <p className="text-xs font-medium text-gray-500">{m.label}</p>
            <p className="text-lg font-bold text-gray-900 mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Metas de Vendas */}
      {(() => {
        const metaVendasMensal = 500000
        const metaLeadsMensal = 20
        const metaConversaoMensal = 15
        const metaTicketMedio = 80000

        const progressoVendas = Math.min((metrics.valorTotal / metaVendasMensal) * 100, 100)
        const progressoLeads = Math.min((metrics.totalLeads / metaLeadsMensal) * 100, 100)
        const progressoConversao = Math.min((metrics.taxaConversao / metaConversaoMensal) * 100, 100)
        const progressoTicket = Math.min((metrics.ticketMedio / metaTicketMedio) * 100, 100)

        const faltaVendas = Math.max(metaVendasMensal - metrics.valorTotal, 0)
        const diasRestantesMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - new Date().getDate()

        const getBarColor = (pct: number) => {
          if (pct >= 100) return 'bg-green-500'
          if (pct >= 75) return 'bg-blue-500'
          if (pct >= 50) return 'bg-yellow-500'
          return 'bg-red-500'
        }

        const getStatusLabel = (pct: number) => {
          if (pct >= 100) return { text: '✅ Meta atingida!', color: 'text-green-700 bg-green-50 border-green-200' }
          if (pct >= 75) return { text: '🔥 Quase lá!', color: 'text-blue-700 bg-blue-50 border-blue-200' }
          if (pct >= 50) return { text: '⚡ No caminho', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' }
          return { text: '⚠️ Atenção', color: 'text-red-700 bg-red-50 border-red-200' }
        }

        const statusVendas = getStatusLabel(progressoVendas)

        return (
          <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">🎯 Metas do Mês</h3>
                <p className="text-sm text-gray-500 mt-1">{diasRestantesMes} dias restantes no mês</p>
              </div>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${statusVendas.color}`}>
                {statusVendas.text}
              </span>
            </div>

            {/* Meta Principal - Vendas */}
            <div className="mb-6 p-4 bg-gray-50 rounded-apple border border-gray-200">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">Meta de Vendas Mensal</p>
                  <p className="text-3xl font-bold text-gray-900">R$ {metrics.valorTotal.toLocaleString('pt-BR')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">de R$ {metaVendasMensal.toLocaleString('pt-BR')}</p>
                  <p className="text-2xl font-bold text-primary-600">{progressoVendas.toFixed(1)}%</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div className={`h-4 rounded-full transition-all duration-500 ${getBarColor(progressoVendas)}`} style={{ width: `${progressoVendas}%` }}></div>
              </div>
              {faltaVendas > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Faltam <span className="font-semibold text-gray-700">R$ {faltaVendas.toLocaleString('pt-BR')}</span> para bater a meta
                  {diasRestantesMes > 0 && <> — média de <span className="font-semibold text-gray-700">R$ {Math.ceil(faltaVendas / diasRestantesMes).toLocaleString('pt-BR')}</span>/dia</>}
                </p>
              )}
            </div>

            {/* Metas Secundárias */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-apple border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">📋 Leads</p>
                  <p className="text-sm font-bold text-gray-900">{metrics.totalLeads}/{metaLeadsMensal}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div className={`h-2.5 rounded-full transition-all duration-500 ${getBarColor(progressoLeads)}`} style={{ width: `${progressoLeads}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{progressoLeads.toFixed(0)}% da meta</p>
              </div>

              <div className="p-4 rounded-apple border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">🔄 Conversão</p>
                  <p className="text-sm font-bold text-gray-900">{metrics.taxaConversao.toFixed(1)}%/{metaConversaoMensal}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div className={`h-2.5 rounded-full transition-all duration-500 ${getBarColor(progressoConversao)}`} style={{ width: `${progressoConversao}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{progressoConversao.toFixed(0)}% da meta</p>
              </div>

              <div className="p-4 rounded-apple border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">💰 Ticket Médio</p>
                  <p className="text-sm font-bold text-gray-900">R$ {metrics.ticketMedio.toLocaleString('pt-BR')}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div className={`h-2.5 rounded-full transition-all duration-500 ${getBarColor(progressoTicket)}`} style={{ width: `${progressoTicket}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{progressoTicket.toFixed(0)}% da meta (R$ {metaTicketMedio.toLocaleString('pt-BR')})</p>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline por Etapa */}
        <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Pipeline por Etapa (R$)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']} />
              <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                {pipelineData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pipeline por Vendedor */}
        <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Pipeline por Vendedor (R$)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={vendedorData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={70} />
              <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Pipeline']} />
              <Bar dataKey="pipeline" fill="#6366F1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Produtos Ranking + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Produtos Mais Procurados</h3>
          <div className="space-y-3">
            {(() => {
              const prodCount: Record<string, number> = {}
              clientes.forEach(c => (c.produtosInteresse || []).forEach(p => { prodCount[p] = (prodCount[p] || 0) + 1 }))
              const ranked = Object.entries(prodCount).sort((a, b) => b[1] - a[1]).slice(0, 5)
              const maxCount = ranked.length > 0 ? ranked[0][1] : 1
              if (ranked.length === 0) return <p className="text-sm text-gray-500">Nenhum produto vinculado a leads ainda</p>
              return ranked.map(([name, count], i) => {
                const prod = produtos.find(p => p.nome === name)
                return (
                  <div key={name} className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400 w-5">{i + 1}.</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">{name}</p>
                        <span className="text-xs text-gray-500">{count} leads</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-primary-500 transition-all" style={{ width: `${(count / maxCount) * 100}%` }}></div>
                      </div>
                      {prod && <p className="text-xs text-gray-400 mt-0.5">R$ {prod.preco.toFixed(2).replace('.', ',')} / {prod.unidade}</p>}
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">⚡ Atividades Recentes</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {atividades.slice(0, 8).map((a) => (
            <div key={a.id} className="px-6 py-3 flex items-center gap-3 hover:bg-gray-50">
              <span className="text-lg flex-shrink-0">
                {a.tipo === 'moveu' && '🔄'}
                {a.tipo === 'adicionou' && '➕'}
                {a.tipo === 'editou' && '✏️'}
                {a.tipo === 'interacao' && '💬'}
                {a.tipo === 'tarefa' && '✅'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{a.descricao}</p>
                <p className="text-xs text-gray-500">{a.vendedorNome} — {new Date(a.timestamp).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</p>
              </div>
            </div>
          ))}
          {atividades.length === 0 && <div className="p-6 text-center text-gray-500 text-sm">Nenhuma atividade registrada</div>}
        </div>
      </div>
      </div>
    </div>
  )
}
// Funil View
const FunilView: React.FC<FunilViewProps> = ({ clientes, onDragStart, onDragOver, onDrop }) => {
  const stages = [
    { title: 'Prospecção', key: 'prospecção', color: 'blue' },
    { title: 'Amostra', key: 'amostra', color: 'yellow' },
    { title: 'Homologado', key: 'homologado', color: 'green' },
    { title: 'Negociação', key: 'negociacao', color: 'purple' },
    { title: 'Pós-Venda', key: 'pos_venda', color: 'pink' },
    { title: 'Perdido', key: 'perdido', color: 'red' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
      {stages.map((stage) => (
        <div 
          key={stage.title} 
          className="bg-white rounded-apple shadow-apple-sm border border-gray-200"
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, stage.key)}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">{stage.title}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${stage.color}-100 text-${stage.color}-800`}>
                {clientes.filter(c => c.etapa === stage.key).length}
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-500 mb-3">R$ {clientes.filter(c => c.etapa === stage.key).reduce((s, c) => s + (c.valorEstimado || 0), 0).toLocaleString('pt-BR')}</p>
            <div className="space-y-2 min-h-[300px]">
              {clientes
                .filter(c => c.etapa === stage.key)
                .map((cliente) => (
                  <div 
                    key={cliente.id} 
                    className="p-3 bg-gray-50 rounded-apple border border-gray-200 cursor-move hover:bg-gray-100 hover:shadow-apple transition-all duration-200"
                    draggable
                    onDragStart={(e) => onDragStart(e, cliente, stage.key)}
                  >
                    <h4 className="font-medium text-sm text-gray-900">{cliente.razaoSocial}</h4>
                    <p className="text-xs text-gray-500">{cliente.contatoNome}</p>
                    {cliente.valorEstimado && <p className="text-xs font-semibold text-primary-600 mt-1">R$ {cliente.valorEstimado.toLocaleString('pt-BR')}</p>}
                    {cliente.produtosInteresse && cliente.produtosInteresse.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {cliente.produtosInteresse.slice(0, 2).map(p => (
                          <span key={p} className="px-1.5 py-0.5 text-[10px] bg-primary-50 text-primary-700 rounded-full border border-primary-100 truncate max-w-[100px]">{p}</span>
                        ))}
                        {cliente.produtosInteresse.length > 2 && <span className="text-[10px] text-gray-400">+{cliente.produtosInteresse.length - 2}</span>}
                      </div>
                    )}
                  </div>
                ))}
              {clientes.filter(c => c.etapa === stage.key).length === 0 && (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Arraste clientes aqui
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Clientes View
const ClientesView: React.FC<ClientesViewProps> = ({ clientes, vendedores, onNewCliente, onEditCliente }) => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [showFilters, setShowFilters] = React.useState(false)
  const [filterEtapa, setFilterEtapa] = React.useState('')
  const [filterVendedor, setFilterVendedor] = React.useState('')
  const [filterScoreMin, setFilterScoreMin] = React.useState('')
  const [filterValorMin, setFilterValorMin] = React.useState('')
  const [selectedClienteId, setSelectedClienteId] = React.useState<number | null>(null)
  
  const filteredClientes = clientes.filter(cliente => {
    const matchSearch = cliente.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.contatoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cnpj.includes(searchTerm)
    const matchEtapa = !filterEtapa || cliente.etapa === filterEtapa
    const matchVendedor = !filterVendedor || String(cliente.vendedorId) === filterVendedor
    const matchScore = !filterScoreMin || (cliente.score || 0) >= Number(filterScoreMin)
    const matchValor = !filterValorMin || (cliente.valorEstimado || 0) >= Number(filterValorMin)
    return matchSearch && matchEtapa && matchVendedor && matchScore && matchValor
  })

  const getEtapaColor = (etapa: string) => {
    switch (etapa) {
      case 'prospecção': return 'bg-blue-100 text-blue-800'
      case 'amostra': return 'bg-yellow-100 text-yellow-800'
      case 'homologado': return 'bg-green-100 text-green-800'
      case 'negociacao': return 'bg-purple-100 text-purple-800'
      case 'pos_venda': return 'bg-pink-100 text-pink-800'
      case 'perdido': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-96"
        />
        <div className="flex gap-2">
          <label className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-apple transition-colors duration-200 shadow-apple-sm border border-gray-300 flex items-center cursor-pointer">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = (ev) => {
                  const text = ev.target?.result as string
                  const lines = text.split('\n').filter(l => l.trim())
                  if (lines.length < 2) { alert('CSV vazio ou sem dados'); return }
                  alert(`✅ ${lines.length - 1} clientes importados com sucesso!\n\n(MVP: dados mockados - integração real em breve)`)
                }
                reader.readAsText(file)
                e.target.value = ''
              }}
            />
            📥 Importar CSV
          </label>
          <button
            onClick={() => {
              const csv = 'razaoSocial,cnpj,contatoNome,contatoTelefone,contatoEmail,endereco,valorEstimado,etapa,score\n' +
                clientes.map(c => `"${c.razaoSocial}","${c.cnpj}","${c.contatoNome}","${c.contatoTelefone}","${c.contatoEmail}","${c.endereco || ''}","${c.valorEstimado || ''}","${c.etapa}","${c.score || 0}"`).join('\n')
              const blob = new Blob([csv], { type: 'text/csv' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-apple transition-colors duration-200 shadow-apple-sm border border-gray-300 flex items-center"
          >
            📤 Exportar CSV
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`py-2 px-4 rounded-apple transition-colors duration-200 shadow-apple-sm border flex items-center font-medium ${showFilters ? 'bg-primary-50 text-primary-700 border-primary-300' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300'}`}
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
            Filtros
          </button>
          <button 
            onClick={onNewCliente}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-apple transition-colors duration-200 shadow-apple-sm flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Novo Cliente
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Etapa</label>
              <select value={filterEtapa} onChange={(e) => setFilterEtapa(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-apple text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Todas</option>
                <option value="prospecção">Prospecção</option>
                <option value="amostra">Amostra</option>
                <option value="homologado">Homologado</option>
                <option value="negociacao">Negociação</option>
                <option value="pos_venda">Pós-Venda</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Vendedor</label>
              <select value={filterVendedor} onChange={(e) => setFilterVendedor(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-apple text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Todos</option>
                {vendedores.filter(v => v.ativo).map(v => <option key={v.id} value={v.id}>{v.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Score mínimo</label>
              <input type="number" value={filterScoreMin} onChange={(e) => setFilterScoreMin(e.target.value)} placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-apple text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Valor mínimo (R$)</label>
              <input type="number" value={filterValorMin} onChange={(e) => setFilterValorMin(e.target.value)} placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-apple text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div className="flex justify-between items-center mt-3">
            <p className="text-xs text-gray-500">{filteredClientes.length} de {clientes.length} clientes</p>
            <button onClick={() => { setFilterEtapa(''); setFilterVendedor(''); setFilterScoreMin(''); setFilterValorMin('') }} className="text-xs text-primary-600 hover:text-primary-800 font-medium">Limpar filtros</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Contato</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Etapa</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Vendedor</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Score</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{cliente.razaoSocial}</p>
                      <p className="text-sm text-gray-500">{cliente.cnpj}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-gray-900">{cliente.contatoNome}</p>
                      <p className="text-sm text-gray-500">{cliente.contatoTelefone}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEtapaColor(cliente.etapa)}`}>
                      {cliente.etapa.charAt(0).toUpperCase() + cliente.etapa.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {(() => {
                      const v = vendedores.find(v => v.id === cliente.vendedorId)
                      return v ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-primary-700">{v.avatar}</span>
                          </div>
                          <span className="text-sm text-gray-900">{v.nome}</span>
                        </div>
                      ) : <span className="text-xs text-gray-400">—</span>
                    })()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="text-gray-900">{cliente.score}</span>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${cliente.score}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button 
                      onClick={() => onEditCliente(cliente)}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const ProspeccaoView: React.FC<{
  clientes: Cliente[]
  interacoes: Interacao[]
  templates: TemplateMsg[]
  cadencias: Cadencia[]
  campanhas: Campanha[]
  jobs: JobAutomacao[]
  onQuickAction: (cliente: Cliente, canal: Interacao['tipo'], tipo: 'propaganda' | 'contato') => void
  onStartCampanha: (campanhaId: number) => void
  onRunJobNow: (jobId: number) => void
  onCreateTemplate: (t: TemplateMsg) => void
  onCreateCampanha: (c: Campanha) => void
}> = ({
  clientes,
  interacoes,
  templates,
  cadencias,
  campanhas,
  jobs,
  onQuickAction,
  onStartCampanha,
  onRunJobNow,
  onCreateTemplate,
  onCreateCampanha
}) => {
  const [tab, setTab] = React.useState<'painel' | 'fila' | 'campanhas' | 'cadencias' | 'templates'>('painel')
  const [query, setQuery] = React.useState('')
  const [selectedLeadId, setSelectedLeadId] = React.useState<number>(clientes[0]?.id ?? 0)
  const selectedLead = clientes.find((c) => c.id === selectedLeadId) ?? null

  const [newTemplateNome, setNewTemplateNome] = React.useState('')
  const [newTemplateCanal, setNewTemplateCanal] = React.useState<Interacao['tipo']>('whatsapp')
  const [newTemplateConteudo, setNewTemplateConteudo] = React.useState('')

  const [newCampanhaNome, setNewCampanhaNome] = React.useState('')
  const [newCampanhaCadenciaId, setNewCampanhaCadenciaId] = React.useState<number>(cadencias[0]?.id ?? 1)
  const [newCampanhaEtapa, setNewCampanhaEtapa] = React.useState<string>('')
  const [newCampanhaMinScore, setNewCampanhaMinScore] = React.useState<string>('')
  const [newCampanhaDiasInativo, setNewCampanhaDiasInativo] = React.useState<string>('')

  const filteredLeads = clientes.filter((c) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      c.razaoSocial.toLowerCase().includes(q) ||
      c.contatoNome.toLowerCase().includes(q) ||
      c.cnpj.includes(q)
    )
  })

  const leadInteracoes = selectedLead
    ? interacoes.filter((i) => i.clienteId === selectedLead.id)
    : []

  const topLeads = [...clientes]
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 10)

  const badge = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'bg-green-100 text-green-800'
      case 'pausada':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const jobBadge = (status: JobAutomacao['status']) => {
    switch (status) {
      case 'pendente':
        return 'bg-blue-100 text-blue-800'
      case 'enviado':
        return 'bg-green-100 text-green-800'
      case 'pausado':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-red-100 text-red-800'
    }
  }

  const TabButton: React.FC<{ id: typeof tab; label: string }> = ({ id, label }) => (
    <button
      onClick={() => setTab(id)}
      className={`px-3 py-2 text-sm font-medium rounded-apple transition-colors duration-200 ${
        tab === id
          ? 'bg-primary-600 text-white'
          : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )

  const createTemplate = () => {
    if (!newTemplateNome.trim() || !newTemplateConteudo.trim()) return
    onCreateTemplate({
      id: Date.now(),
      canal: newTemplateCanal,
      nome: newTemplateNome.trim(),
      conteudo: newTemplateConteudo
    })
    setNewTemplateNome('')
    setNewTemplateConteudo('')
  }

  const createCampanha = () => {
    if (!newCampanhaNome.trim()) return
    onCreateCampanha({
      id: Date.now(),
      nome: newCampanhaNome.trim(),
      cadenciaId: newCampanhaCadenciaId,
      etapa: newCampanhaEtapa.trim() ? newCampanhaEtapa.trim() : undefined,
      minScore: newCampanhaMinScore.trim() ? Number(newCampanhaMinScore) : undefined,
      diasInativoMin: newCampanhaDiasInativo.trim() ? Number(newCampanhaDiasInativo) : undefined,
      status: 'rascunho'
    })
    setNewCampanhaNome('')
    setNewCampanhaEtapa('')
    setNewCampanhaMinScore('')
    setNewCampanhaDiasInativo('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Prospecção</h1>
          <p className="mt-1 text-sm text-gray-600">Painel operacional para cadências, campanhas, templates e fila do dia.</p>
        </div>
        <button
          onClick={() => {
            const sugestoes = clientes.map(cliente => {
              let acao = ''
              let prioridade = 'media'
              if ((cliente.diasInativo || 0) > 30) {
                acao = `Urgente: Reativar ${cliente.razaoSocial} - ${cliente.diasInativo} dias inativo`
                prioridade = 'alta'
              } else if (cliente.etapa === 'negociacao' && (cliente.score || 0) > 70) {
                acao = `Enviar proposta para ${cliente.razaoSocial} - Alta chance de conversão`
                prioridade = 'alta'
              } else if (cliente.etapa === 'prospecção' && (cliente.score || 0) < 40) {
                acao = `Qualificar melhor ${cliente.razaoSocial} - Score baixo`
                prioridade = 'baixa'
              } else if (cliente.etapa === 'amostra') {
                acao = `Follow-up amostra com ${cliente.razaoSocial}`
                prioridade = 'media'
              } else {
                acao = `Manter contato com ${cliente.razaoSocial}`
                prioridade = 'media'
              }
              return { cliente: cliente.razaoSocial, acao, prioridade }
            })
            const alta = sugestoes.filter(s => s.prioridade === 'alta').length
            const media = sugestoes.filter(s => s.prioridade === 'media').length
            const baixa = sugestoes.filter(s => s.prioridade === 'baixa').length
            const resumo = sugestoes.slice(0, 5).map(s =>
              `• ${s.prioridade === 'alta' ? '🔴' : s.prioridade === 'media' ? '🟡' : '⚪'} ${s.acao}`
            ).join('\n')
            alert(`✨ IA analisou ${clientes.length} clientes!\n\nPrioridades:\n🔴 Alta: ${alta}\n🟡 Média: ${media}\n⚪ Baixa: ${baixa}\n\nTOP 5 Ações Sugeridas:\n${resumo}\n\nDica: Execute as ações de alta prioridade primeiro!`)
          }}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-apple hover:from-purple-700 hover:to-blue-700 shadow-apple-sm flex items-center text-sm font-semibold"
        >
          <SparklesIcon className="h-4 w-4 mr-2" />
          IA Automatizar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <TabButton id="painel" label="Painel do Lead" />
        <TabButton id="fila" label="Fila do dia" />
        <TabButton id="campanhas" label="Campanhas" />
        <TabButton id="cadencias" label="Cadências" />
        <TabButton id="templates" label="Templates" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-4 xl:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-900">Leads</div>
            <div className="text-xs text-gray-500">Top por score</div>
          </div>
          <div className="space-y-2">
            {topLeads.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedLeadId(c.id)}
                className={`w-full text-left p-3 rounded-apple border transition-colors ${
                  c.id === selectedLeadId
                    ? 'border-primary-300 bg-primary-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900 truncate">{c.razaoSocial}</div>
                  <div className="text-xs font-semibold text-gray-700">{c.score || 0}</div>
                </div>
                <div className="text-xs text-gray-600 mt-1 truncate">{c.contatoNome}</div>
              </button>
            ))}
          </div>

          <div className="mt-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar lead..."
              className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <div className="mt-2 max-h-56 overflow-y-auto space-y-1">
              {filteredLeads.slice(0, 20).map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedLeadId(c.id)}
                  className="w-full text-left px-3 py-2 text-sm rounded-apple hover:bg-gray-50 border border-transparent"
                >
                  {c.razaoSocial}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 space-y-6">
          {tab === 'painel' && (
            <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold text-gray-900">{selectedLead?.razaoSocial || 'Selecione um lead'}</div>
                  {selectedLead && (
                    <div className="text-sm text-gray-600 mt-1">
                      {selectedLead.contatoNome} • {selectedLead.contatoEmail} • {selectedLead.contatoTelefone}
                    </div>
                  )}
                </div>
                {selectedLead && (
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Score</div>
                    <div className="text-lg font-bold text-gray-900">{selectedLead.score || 0}</div>
                  </div>
                )}
              </div>

              {selectedLead && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="rounded-apple border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-900">Ações rápidas</div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button onClick={() => onQuickAction(selectedLead, 'whatsapp', 'contato')} className="px-3 py-2 bg-white border border-gray-300 rounded-apple hover:bg-gray-50 text-sm">Contato WhatsApp</button>
                      <button onClick={() => onQuickAction(selectedLead, 'email', 'contato')} className="px-3 py-2 bg-white border border-gray-300 rounded-apple hover:bg-gray-50 text-sm">Contato Email</button>
                      <button onClick={() => onQuickAction(selectedLead, 'linkedin', 'contato')} className="px-3 py-2 bg-white border border-gray-300 rounded-apple hover:bg-gray-50 text-sm">Contato LinkedIn</button>
                      <button onClick={() => onQuickAction(selectedLead, 'instagram', 'contato')} className="px-3 py-2 bg-white border border-gray-300 rounded-apple hover:bg-gray-50 text-sm">Contato Instagram</button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button onClick={() => onQuickAction(selectedLead, 'whatsapp', 'propaganda')} className="px-3 py-2 bg-primary-600 text-white rounded-apple hover:bg-primary-700 text-sm">Propaganda WhatsApp</button>
                      <button onClick={() => onQuickAction(selectedLead, 'email', 'propaganda')} className="px-3 py-2 bg-primary-600 text-white rounded-apple hover:bg-primary-700 text-sm">Propaganda Email</button>
                      <button onClick={() => onQuickAction(selectedLead, 'linkedin', 'propaganda')} className="px-3 py-2 bg-primary-600 text-white rounded-apple hover:bg-primary-700 text-sm">Propaganda LinkedIn</button>
                      <button onClick={() => onQuickAction(selectedLead, 'instagram', 'propaganda')} className="px-3 py-2 bg-primary-600 text-white rounded-apple hover:bg-primary-700 text-sm">Propaganda Instagram</button>
                    </div>
                  </div>

                  <div className="rounded-apple border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-gray-900">Próxima ação sugerida</div>
                    <div className="text-sm text-gray-700 mt-3">
                      {(selectedLead.diasInativo || 0) > 15
                        ? 'Lead inativo: sugerido follow-up por WhatsApp + Email.'
                        : 'Lead ativo: sugerido contato consultivo e envio de catálogo.'}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Inatividade: {selectedLead.diasInativo ?? '-'} dias • Etapa: {selectedLead.etapa}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <div className="text-sm font-semibold text-gray-900">Timeline</div>
                <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
                  {leadInteracoes.length === 0 && (
                    <div className="text-sm text-gray-500">Sem interações ainda.</div>
                  )}
                  {leadInteracoes.map((i) => (
                    <div key={i.id} className="p-3 rounded-apple border border-gray-200 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-medium text-gray-700">{i.tipo.toUpperCase()} • {i.assunto}</div>
                        <div className="text-xs text-gray-500">{new Date(i.data).toLocaleString('pt-BR')}</div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{i.descricao}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'fila' && (
            <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
              <div className="text-lg font-semibold text-gray-900">Fila do dia</div>
              <div className="text-sm text-gray-600 mt-1">Jobs pendentes para execução (MVP: executar agora).</div>
              <div className="mt-4 space-y-2">
                {jobs.length === 0 && <div className="text-sm text-gray-500">Sem jobs agendados ainda.</div>}
                {jobs.slice(0, 30).map((j) => {
                  const lead = clientes.find((c) => c.id === j.clienteId)
                  return (
                    <div key={j.id} className="flex items-center justify-between p-3 rounded-apple border border-gray-200">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead?.razaoSocial || `Lead ${j.clienteId}`}</div>
                        <div className="text-xs text-gray-600">{j.tipo} • {j.canal.toUpperCase()} • {new Date(j.agendadoPara).toLocaleString('pt-BR')}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${jobBadge(j.status)}`}>{j.status}</span>
                        <button
                          disabled={j.status !== 'pendente'}
                          onClick={() => onRunJobNow(j.id)}
                          className="px-3 py-2 text-sm bg-primary-600 text-white rounded-apple hover:bg-primary-700 disabled:bg-gray-300"
                        >
                          Executar
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {tab === 'campanhas' && (
            <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-semibold text-gray-900">Campanhas</div>
                  <div className="text-sm text-gray-600 mt-1">Defina audiência e inicie uma cadência automaticamente.</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="rounded-apple border border-gray-200 p-4">
                  <div className="text-sm font-semibold text-gray-900">Nova campanha</div>
                  <div className="mt-3 space-y-3">
                    <input value={newCampanhaNome} onChange={(e) => setNewCampanhaNome(e.target.value)} placeholder="Nome" className="w-full px-3 py-2 border border-gray-300 rounded-apple" />
                    <select value={newCampanhaCadenciaId} onChange={(e) => setNewCampanhaCadenciaId(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-apple">
                      {cadencias.map((c) => (<option key={c.id} value={c.id}>{c.nome}</option>))}
                    </select>
                    <input value={newCampanhaEtapa} onChange={(e) => setNewCampanhaEtapa(e.target.value)} placeholder="Filtro etapa (opcional)" className="w-full px-3 py-2 border border-gray-300 rounded-apple" />
                    <input value={newCampanhaMinScore} onChange={(e) => setNewCampanhaMinScore(e.target.value)} placeholder="Score mínimo (opcional)" className="w-full px-3 py-2 border border-gray-300 rounded-apple" />
                    <input value={newCampanhaDiasInativo} onChange={(e) => setNewCampanhaDiasInativo(e.target.value)} placeholder="Dias inativo mínimo (opcional)" className="w-full px-3 py-2 border border-gray-300 rounded-apple" />
                    <button onClick={createCampanha} className="w-full px-4 py-2 bg-primary-600 text-white rounded-apple hover:bg-primary-700">Criar</button>
                  </div>
                </div>

                <div className="rounded-apple border border-gray-200 p-4">
                  <div className="text-sm font-semibold text-gray-900">Campanhas existentes</div>
                  <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                    {campanhas.map((c) => (
                      <div key={c.id} className="p-3 rounded-apple border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">{c.nome}</div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${badge(c.status)}`}>{c.status}</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Cadência: {cadencias.find(x => x.id === c.cadenciaId)?.nome || c.cadenciaId}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <button onClick={() => onStartCampanha(c.id)} className="px-3 py-2 text-sm bg-primary-600 text-white rounded-apple hover:bg-primary-700">Iniciar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'cadencias' && (
            <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
              <div className="text-lg font-semibold text-gray-900">Cadências</div>
              <div className="text-sm text-gray-600 mt-1">Sequências de prospecção (layout). Edição avançada pode vir depois.</div>
              <div className="mt-4 space-y-3">
                {cadencias.map((c) => (
                  <div key={c.id} className="rounded-apple border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">{c.nome}</div>
                      <div className="text-xs text-gray-500">Pausa ao responder: {c.pausarAoResponder ? 'sim' : 'não'}</div>
                    </div>
                    <div className="mt-3 space-y-2">
                      {c.steps.map((s) => (
                        <div key={s.id} className="flex items-center justify-between text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-apple px-3 py-2">
                          <div>Dia +{s.delayDias} • {s.canal.toUpperCase()}</div>
                          <div className="text-gray-500">Template: {templates.find(t => t.id === s.templateId)?.nome || s.templateId}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'templates' && (
            <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-apple border border-gray-200 p-4">
                  <div className="text-sm font-semibold text-gray-900">Novo template</div>
                  <div className="mt-3 space-y-3">
                    <input value={newTemplateNome} onChange={(e) => setNewTemplateNome(e.target.value)} placeholder="Nome" className="w-full px-3 py-2 border border-gray-300 rounded-apple" />
                    <select value={newTemplateCanal} onChange={(e) => setNewTemplateCanal(e.target.value as Interacao['tipo'])} className="w-full px-3 py-2 border border-gray-300 rounded-apple">
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Email</option>
                      <option value="instagram">Instagram</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                    <textarea value={newTemplateConteudo} onChange={(e) => setNewTemplateConteudo(e.target.value)} rows={6} placeholder="Conteúdo (use {nome}, {empresa})" className="w-full px-3 py-2 border border-gray-300 rounded-apple" />
                    <button onClick={createTemplate} className="w-full px-4 py-2 bg-primary-600 text-white rounded-apple hover:bg-primary-700">Criar</button>
                  </div>
                </div>

                <div className="rounded-apple border border-gray-200 p-4">
                  <div className="text-sm font-semibold text-gray-900">Templates existentes</div>
                  <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                    {templates.map((t) => (
                      <div key={t.id} className="p-3 rounded-apple border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-gray-900">{t.nome}</div>
                          <div className="text-xs text-gray-500">{t.canal.toUpperCase()}</div>
                        </div>
                        <div className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">{t.conteudo}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const AutomacoesView: React.FC<{
  clientes: Cliente[]
  onAction: (cliente: Cliente, canal: Interacao['tipo'], tipo: 'propaganda' | 'contato') => void
}> = ({ clientes, onAction }) => {
  const [selectedClienteId, setSelectedClienteId] = React.useState<number>(clientes[0]?.id ?? 0)
  const selectedCliente = clientes.find((c) => c.id === selectedClienteId) ?? null

  const disabled = !selectedCliente

  const actionButtonClass = (variant: 'primary' | 'secondary') =>
    variant === 'primary'
      ? 'px-4 py-2 bg-primary-600 text-white rounded-apple hover:bg-primary-700 transition-colors duration-200 shadow-apple-sm'
      : 'px-4 py-2 bg-white text-gray-800 border border-gray-300 rounded-apple hover:bg-gray-50 transition-colors duration-200'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Automações de Vendas</h1>
        <p className="mt-1 text-sm text-gray-600">Dispare ações rápidas (MVP) por canal e registre no histórico.</p>
      </div>

      <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Lead / Empresa</label>
            <select
              value={selectedClienteId}
              onChange={(e) => setSelectedClienteId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.razaoSocial}
                </option>
              ))}
            </select>

            {selectedCliente && (
              <div className="mt-4 rounded-apple border border-gray-200 bg-gray-50 p-4">
                <div className="text-sm font-medium text-gray-900">{selectedCliente.razaoSocial}</div>
                <div className="text-xs text-gray-600 mt-1">Contato: {selectedCliente.contatoNome}</div>
                <div className="text-xs text-gray-600">Email: {selectedCliente.contatoEmail}</div>
                <div className="text-xs text-gray-600">WhatsApp: {selectedCliente.contatoTelefone}</div>
                <div className="text-xs text-gray-600">Etapa: {selectedCliente.etapa}</div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-apple border border-gray-200 p-4">
                <div className="text-sm font-semibold text-gray-900">Propaganda automática</div>
                <div className="text-xs text-gray-600 mt-1">Disparo rápido por canal (registrado no histórico).</div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button disabled={disabled} onClick={() => selectedCliente && onAction(selectedCliente, 'whatsapp', 'propaganda')} className={actionButtonClass('primary')}>WhatsApp</button>
                  <button disabled={disabled} onClick={() => selectedCliente && onAction(selectedCliente, 'email', 'propaganda')} className={actionButtonClass('primary')}>Email</button>
                  <button disabled={disabled} onClick={() => selectedCliente && onAction(selectedCliente, 'instagram', 'propaganda')} className={actionButtonClass('primary')}>Instagram</button>
                  <button disabled={disabled} onClick={() => selectedCliente && onAction(selectedCliente, 'linkedin', 'propaganda')} className={actionButtonClass('primary')}>LinkedIn</button>
                </div>
              </div>

              <div className="rounded-apple border border-gray-200 p-4">
                <div className="text-sm font-semibold text-gray-900">Entrar em contato</div>
                <div className="text-xs text-gray-600 mt-1">Ação de contato (registrada no histórico).</div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button disabled={disabled} onClick={() => selectedCliente && onAction(selectedCliente, 'whatsapp', 'contato')} className={actionButtonClass('secondary')}>WhatsApp</button>
                  <button disabled={disabled} onClick={() => selectedCliente && onAction(selectedCliente, 'email', 'contato')} className={actionButtonClass('secondary')}>Email</button>
                  <button disabled={disabled} onClick={() => selectedCliente && onAction(selectedCliente, 'instagram', 'contato')} className={actionButtonClass('secondary')}>Instagram</button>
                  <button disabled={disabled} onClick={() => selectedCliente && onAction(selectedCliente, 'linkedin', 'contato')} className={actionButtonClass('secondary')}>LinkedIn</button>
                </div>
              </div>
            </div>

            <div className="rounded-apple border border-gray-200 p-4">
              <div className="text-sm font-semibold text-gray-900">Templates (layout MVP)</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="bg-gray-50 border border-gray-200 rounded-apple p-3">
                  <div className="text-xs font-medium text-gray-700">Template: Propaganda</div>
                  <div className="text-xs text-gray-600 mt-1">Olá {selectedCliente?.contatoNome || '[Nome]'}, temos condições especiais em produtos MF Paris. Quer receber o catálogo?</div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-apple p-3">
                  <div className="text-xs font-medium text-gray-700">Template: Follow-up</div>
                  <div className="text-xs text-gray-600 mt-1">Oi {selectedCliente?.contatoNome || '[Nome]'}, passando para confirmar se você conseguiu analisar nossa proposta. Posso ajudar em algo?</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
        <div className="text-sm font-semibold text-gray-900">Campanhas (layout)</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="rounded-apple border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-900">Recuperação de inativos</div>
            <div className="text-xs text-gray-600 mt-1">Sequência WhatsApp + Email</div>
            <div className="text-xs text-gray-500 mt-2">Status: rascunho</div>
          </div>
          <div className="rounded-apple border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-900">Lançamento de catálogo</div>
            <div className="text-xs text-gray-600 mt-1">Email + LinkedIn</div>
            <div className="text-xs text-gray-500 mt-2">Status: rascunho</div>
          </div>
          <div className="rounded-apple border border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-900">Novos leads</div>
            <div className="text-xs text-gray-600 mt-1">Instagram + WhatsApp</div>
            <div className="text-xs text-gray-500 mt-2">Status: rascunho</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const TarefasView: React.FC<{
  tarefas: Tarefa[]
  clientes: Cliente[]
  onUpdateTarefa: (t: Tarefa) => void
  onAddTarefa: (t: Tarefa) => void
}> = ({ tarefas, clientes, onUpdateTarefa, onAddTarefa }) => {
  const [showModal, setShowModal] = React.useState(false)
  const [filterStatus, setFilterStatus] = React.useState<'todas' | 'pendente' | 'concluida'>('pendente')
  const [newTitulo, setNewTitulo] = React.useState('')
  const [newDescricao, setNewDescricao] = React.useState('')
  const [newData, setNewData] = React.useState(new Date().toISOString().split('T')[0])
  const [newHora, setNewHora] = React.useState('')
  const [newTipo, setNewTipo] = React.useState<Tarefa['tipo']>('ligacao')
  const [newPrioridade, setNewPrioridade] = React.useState<Tarefa['prioridade']>('media')
  const [newClienteId, setNewClienteId] = React.useState<number | ''>(clientes[0]?.id ?? '')

  const hoje = new Date().toISOString().split('T')[0]

  const filteredTarefas = tarefas.filter(t => {
    return filterStatus === 'todas' || t.status === filterStatus
  })

  const tarefasPorData = filteredTarefas.reduce((acc, t) => {
    if (!acc[t.data]) acc[t.data] = []
    acc[t.data].push(t)
    return acc
  }, {} as Record<string, Tarefa[]>)

  const datasOrdenadas = Object.keys(tarefasPorData).sort()

  const handleAddTarefa = () => {
    if (!newTitulo.trim()) return
    onAddTarefa({
      id: Date.now(),
      titulo: newTitulo.trim(),
      descricao: newDescricao.trim() || undefined,
      data: newData,
      hora: newHora.trim() || undefined,
      tipo: newTipo,
      status: 'pendente',
      prioridade: newPrioridade,
      clienteId: typeof newClienteId === 'number' ? newClienteId : undefined
    })
    setNewTitulo('')
    setNewDescricao('')
    setNewHora('')
    setShowModal(false)
  }

  const toggleStatus = (tarefa: Tarefa) => {
    onUpdateTarefa({ ...tarefa, status: tarefa.status === 'pendente' ? 'concluida' : 'pendente' })
  }

  const getTipoIcon = (tipo: Tarefa['tipo']) => {
    switch (tipo) {
      case 'ligacao': return '📞'
      case 'reuniao': return '🤝'
      case 'email': return '📧'
      case 'whatsapp': return '💬'
      case 'follow-up': return '🔄'
      default: return '📋'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tarefas e Agenda</h1>
          <p className="mt-1 text-sm text-gray-600">Organize suas atividades e nunca perca um follow-up</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              const sugeridas: Tarefa[] = [
                { id: Date.now() + 1, clienteId: clientes.find(c => c.diasInativo && c.diasInativo > 7)?.id, titulo: 'Follow-up com leads inativos', descricao: 'Entrar em contato com clientes sem interação há mais de 7 dias', data: hoje, hora: '10:00', tipo: 'ligacao', status: 'pendente', prioridade: 'alta' },
                { id: Date.now() + 2, clienteId: clientes.find(c => c.etapa === 'negociacao')?.id, titulo: 'Enviar proposta comercial', descricao: 'Preparar e enviar proposta para leads em negociação', data: hoje, hora: '14:00', tipo: 'email', status: 'pendente', prioridade: 'alta' },
                { id: Date.now() + 3, titulo: 'Revisar pipeline de vendas', descricao: 'Analisar funil e identificar gargalos', data: amanha, hora: '09:00', tipo: 'outro', status: 'pendente', prioridade: 'media' },
                { id: Date.now() + 4, clienteId: clientes.find(c => c.etapa === 'amostra')?.id, titulo: 'Agendar reunião de apresentação', descricao: 'Marcar reunião para apresentar produtos', data: amanha, hora: '15:00', tipo: 'reuniao', status: 'pendente', prioridade: 'media' },
                { id: Date.now() + 5, titulo: 'Atualizar CRM e registros', descricao: 'Revisar e atualizar informações de clientes', data: amanha, tipo: 'outro', status: 'pendente', prioridade: 'baixa' }
              ]
              sugeridas.forEach(t => onAddTarefa(t))
              alert(`✨ IA adicionou ${sugeridas.length} tarefas sugeridas!`)
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-apple hover:from-purple-700 hover:to-blue-700 shadow-apple-sm flex items-center"
          >
            <SparklesIcon className="h-4 w-4 mr-2" />
            IA Sugerir Tarefas
          </button>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-primary-600 text-white rounded-apple hover:bg-primary-700 shadow-apple-sm flex items-center">
            <PlusIcon className="h-4 w-4 mr-2" />
            Nova Tarefa
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)} className="px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="todas">Todas</option>
          <option value="pendente">Pendentes</option>
          <option value="concluida">Concluídas</option>
        </select>
      </div>

      <div className="space-y-6">
        {datasOrdenadas.length === 0 && (
          <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Nenhuma tarefa encontrada</p>
          </div>
        )}
        {datasOrdenadas.map(data => {
          const tarefasDia = tarefasPorData[data].sort((a, b) => {
            if (a.hora && b.hora) return a.hora.localeCompare(b.hora)
            if (a.hora) return -1
            if (b.hora) return 1
            return 0
          })
          const isHoje = data === hoje
          return (
            <div key={data} className="bg-white rounded-apple shadow-apple-sm border border-gray-200">
              <div className={`px-6 py-4 border-b border-gray-200 ${isHoje ? 'bg-primary-50' : ''}`}>
                <h3 className={`text-lg font-semibold ${isHoje ? 'text-primary-700' : 'text-gray-900'}`}>
                  {isHoje ? '🔥 Hoje' : new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{tarefasDia.length} tarefa(s)</p>
              </div>
              <div className="p-6 space-y-3">
                {tarefasDia.map(tarefa => {
                  const cliente = clientes.find(c => c.id === tarefa.clienteId)
                  return (
                    <div key={tarefa.id} className={`p-4 rounded-apple border-2 transition-all ${tarefa.status === 'concluida' ? 'bg-gray-50 border-gray-200 opacity-60' : tarefa.prioridade === 'alta' ? 'bg-red-50 border-red-200' : tarefa.prioridade === 'media' ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-start gap-4">
                        <button onClick={() => toggleStatus(tarefa)} className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${tarefa.status === 'concluida' ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-primary-500'}`}>
                          {tarefa.status === 'concluida' && <span className="text-white text-xs">✓</span>}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getTipoIcon(tarefa.tipo)}</span>
                                <h4 className={`font-semibold text-gray-900 ${tarefa.status === 'concluida' ? 'line-through' : ''}`}>{tarefa.titulo}</h4>
                              </div>
                              {tarefa.descricao && <p className="text-sm text-gray-600 mt-1">{tarefa.descricao}</p>}
                              {cliente && <p className="text-xs text-gray-500 mt-2">👤 {cliente.razaoSocial}</p>}
                            </div>
                            <div className="text-right">
                              {tarefa.hora && <p className="text-sm font-semibold text-gray-900">🕐 {tarefa.hora}</p>}
                              <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${tarefa.prioridade === 'alta' ? 'bg-red-100 text-red-700' : tarefa.prioridade === 'media' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{tarefa.prioridade}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-apple shadow-apple-lg max-w-2xl w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Nova Tarefa</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <input value={newTitulo} onChange={(e) => setNewTitulo(e.target.value)} placeholder="Ex: Ligar para SuperBH" className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea value={newDescricao} onChange={(e) => setNewDescricao(e.target.value)} rows={2} placeholder="Detalhes..." className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                  <input type="date" value={newData} onChange={(e) => setNewData(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                  <input type="time" value={newHora} onChange={(e) => setNewHora(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select value={newTipo} onChange={(e) => setNewTipo(e.target.value as Tarefa['tipo'])} className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="ligacao">📞 Ligação</option>
                    <option value="reuniao">🤝 Reunião</option>
                    <option value="email">📧 Email</option>
                    <option value="whatsapp">💬 WhatsApp</option>
                    <option value="follow-up">🔄 Follow-up</option>
                    <option value="outro">📋 Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                  <select value={newPrioridade} onChange={(e) => setNewPrioridade(e.target.value as Tarefa['prioridade'])} className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (opcional)</label>
                <select value={newClienteId} onChange={(e) => setNewClienteId(e.target.value ? Number(e.target.value) : '')} className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">Sem cliente</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.razaoSocial}</option>)}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-apple hover:bg-gray-50">Cancelar</button>
              <button onClick={handleAddTarefa} disabled={!newTitulo.trim()} className="px-4 py-2 bg-primary-600 text-white rounded-apple hover:bg-primary-700 disabled:bg-gray-400 shadow-apple-sm">Criar Tarefa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const SocialSearchView: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [searchType, setSearchType] = React.useState<'instagram' | 'linkedin' | 'google' | 'facebook' | 'painel'>('painel')
  const [location, setLocation] = React.useState('Belo Horizonte - MG')
  const [isSearching, setIsSearching] = React.useState(false)
  const [results, setResults] = React.useState<Array<{ id: number; nome: string; descricao: string; endereco: string; telefone: string; site?: string; instagram?: string; linkedin?: string; facebook?: string; fonte?: string }>>([])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    await new Promise(r => setTimeout(r, 1500))
    let mockResults: typeof results = []
    if (searchType === 'painel' || searchType === 'google') {
      mockResults = [
        { id: 1, nome: 'SuperMercado Central BH', descricao: 'Supermercado de médio porte no centro de BH. 3 lojas.', endereco: 'Av. Afonso Pena, 1500 - Centro, BH - MG', telefone: '(31) 3333-4444', site: 'www.supercentralbh.com.br', instagram: '@supercentralbh', facebook: 'SuperCentralBH', fonte: searchType === 'painel' ? 'Google + Redes Sociais' : 'Google' },
        { id: 2, nome: 'Mercado Família BH', descricao: 'Rede familiar com 5 unidades em BH.', endereco: 'Rua da Bahia, 890 - Centro, BH - MG', telefone: '(31) 3222-5555', instagram: '@mercadofamiliabh', facebook: 'MercadoFamiliaBH', fonte: searchType === 'painel' ? 'Google + Redes Sociais' : 'Google' },
        { id: 3, nome: 'SuperCompras Pampulha', descricao: 'Supermercado premium na Pampulha.', endereco: 'Av. Portugal, 3200 - Pampulha, BH - MG', telefone: '(31) 3444-6666', site: 'www.supercompraspampulha.com.br', linkedin: 'SuperCompras Pampulha', fonte: searchType === 'painel' ? 'Google + Redes Sociais' : 'Google' }
      ]
    } else if (searchType === 'instagram') {
      mockResults = [
        { id: 1, nome: 'Empório Gourmet BH', descricao: 'Produtos premium. 12k seguidores.', endereco: 'Rua Pernambuco, 550 - Savassi, BH - MG', telefone: '(31) 99888-7777', instagram: '@emporiogourmetbh', fonte: 'Instagram' },
        { id: 2, nome: 'Açougue Premium BH', descricao: 'Carnes nobres. 8k seguidores.', endereco: 'Av. Raja Gabaglia, 2000 - Luxemburgo, BH - MG', telefone: '(31) 99777-6666', instagram: '@acouguepremiumbh', fonte: 'Instagram' }
      ]
    } else if (searchType === 'facebook') {
      mockResults = [
        { id: 1, nome: 'Distribuidora Alimentos BH', descricao: 'Atacadista. 5.000 curtidas.', endereco: 'Av. Cristiano Machado, 1500 - Cidade Nova, BH - MG', telefone: '(31) 3555-4444', facebook: 'DistribuidoraAlimentosBH', fonte: 'Facebook' },
        { id: 2, nome: 'Padaria Pão Quente BH', descricao: 'Rede de padarias. 3 unidades.', endereco: 'Rua Curitiba, 800 - Centro, BH - MG', telefone: '(31) 3222-3333', facebook: 'PadariasPaoQuente', fonte: 'Facebook' }
      ]
    } else if (searchType === 'linkedin') {
      mockResults = [
        { id: 1, nome: 'Rede Supermercados Mineiros S.A.', descricao: 'Rede com 15 lojas em MG. 500+ funcionários.', endereco: 'Av. do Contorno, 5000 - Funcionários, BH - MG', telefone: '(31) 3000-9000', linkedin: 'Rede Supermercados Mineiros', site: 'www.redesupermineiros.com.br', fonte: 'LinkedIn' }
      ]
    }
    setResults(mockResults)
    setIsSearching(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Busca por Redes Sociais</h1>
        <p className="mt-1 text-sm text-gray-600">Encontre potenciais clientes através de buscas em redes sociais e Google (MVP - mock)</p>
      </div>
      <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">O que você procura?</label>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Ex: supermercados, restaurantes, hotéis..." className="w-full px-4 py-3 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Região</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Cidade - UF" className="w-full px-4 py-3 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fonte de busca</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { id: 'painel', label: '🎯 Painel', desc: 'Busca completa' },
                { id: 'google', label: '🔍 Google', desc: 'Busca geral' },
                { id: 'instagram', label: '📸 Instagram', desc: 'Perfis comerciais' },
                { id: 'facebook', label: '👥 Facebook', desc: 'Páginas e grupos' },
                { id: 'linkedin', label: '💼 LinkedIn', desc: 'Empresas B2B' }
              ].map((source) => (
                <button key={source.id} onClick={() => setSearchType(source.id as any)} className={`p-3 rounded-apple border-2 transition-all ${searchType === source.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="text-center">
                    <div className="text-base font-semibold text-gray-900">{source.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{source.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleSearch} disabled={!searchQuery.trim() || isSearching} className="w-full px-6 py-3 bg-primary-600 text-white rounded-apple hover:bg-primary-700 disabled:bg-gray-400 shadow-apple-sm font-semibold">
            {isSearching ? '🔍 Buscando...' : '🔍 Buscar Potenciais Clientes'}
          </button>
        </div>
      </div>
      {results.length > 0 && (
        <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Resultados ({results.length})</h3>
          </div>
          <div className="p-6 space-y-4">
            {results.map((result) => (
              <div key={result.id} className="p-4 border-2 border-gray-200 rounded-apple hover:border-primary-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900">{result.nome}</h4>
                    <p className="text-sm text-gray-600 mt-1">{result.descricao}</p>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm text-gray-700">📍 {result.endereco}</p>
                      <p className="text-sm text-gray-700">📞 {result.telefone}</p>
                      {result.site && <p className="text-sm text-primary-600">🌐 {result.site}</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {result.fonte && <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-semibold">🎯 {result.fonte}</span>}
                        {result.instagram && <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full">📸 {result.instagram}</span>}
                        {result.facebook && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">👥 {result.facebook}</span>}
                        {result.linkedin && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">💼 {result.linkedin}</span>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => alert(`Importar: ${result.nome}\n${result.telefone}\n${result.endereco}`)} className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-apple hover:bg-primary-700 shadow-apple-sm whitespace-nowrap">➕ Adicionar Lead</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!isSearching && results.length === 0 && (
        <div className="bg-gray-50 rounded-apple border-2 border-dashed border-gray-300 p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-600">Digite sua busca e clique em "Buscar" para encontrar potenciais clientes</p>
          <p className="text-sm text-gray-500 mt-2">MVP: Demonstração com dados mockados</p>
        </div>
      )}
    </div>
  )
}

const IntegracoesView: React.FC = () => {
  const [integracoes, setIntegracoes] = React.useState([
    { id: 1, nome: 'WhatsApp Business', tipo: 'whatsapp', status: 'conectado', icon: '💬' },
    { id: 2, nome: 'Gmail', tipo: 'email', status: 'conectado', icon: '📧' },
    { id: 3, nome: 'LinkedIn', tipo: 'linkedin', status: 'desconectado', icon: '💼' },
    { id: 4, nome: 'Instagram Business', tipo: 'instagram', status: 'desconectado', icon: '📸' },
    { id: 5, nome: 'Facebook Pages', tipo: 'facebook', status: 'desconectado', icon: '👥' },
    { id: 6, nome: 'Google Sheets', tipo: 'sheets', status: 'conectado', icon: '📊' },
    { id: 7, nome: 'Zapier', tipo: 'zapier', status: 'desconectado', icon: '⚡' },
    { id: 8, nome: 'Webhook Personalizado', tipo: 'webhook', status: 'desconectado', icon: '🔗' }
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Integrações</h1>
        <p className="mt-1 text-sm text-gray-600">Conecte o CRM com suas ferramentas favoritas</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integracoes.map((int) => (
          <div key={int.id} className="bg-white rounded-apple shadow-apple-sm border-2 border-gray-200 p-6 hover:border-primary-300 transition-all">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{int.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{int.nome}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${int.status === 'conectado' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  <span className="text-xs text-gray-600">{int.status === 'conectado' ? 'Conectado' : 'Desconectado'}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              {int.tipo === 'whatsapp' && 'Envie mensagens automáticas via WhatsApp Business API'}
              {int.tipo === 'email' && 'Sincronize emails e envie campanhas automatizadas'}
              {int.tipo === 'linkedin' && 'Conecte com leads e envie mensagens pelo LinkedIn'}
              {int.tipo === 'instagram' && 'Gerencie DMs e interações do Instagram Business'}
              {int.tipo === 'facebook' && 'Integre com Facebook Pages e Messenger'}
              {int.tipo === 'sheets' && 'Exporte e importe dados via Google Sheets'}
              {int.tipo === 'zapier' && 'Conecte com 5000+ apps via Zapier'}
              {int.tipo === 'webhook' && 'Configure webhooks personalizados'}
            </p>
            <button
              onClick={() => {
                const novoStatus = int.status === 'conectado' ? 'desconectado' : 'conectado'
                setIntegracoes(prev => prev.map(i => i.id === int.id ? {...i, status: novoStatus} : i))
                alert(`${int.nome} ${novoStatus === 'conectado' ? 'conectado' : 'desconectado'} com sucesso!`)
              }}
              className={`mt-4 w-full px-4 py-2 rounded-apple shadow-apple-sm font-semibold transition-colors ${int.status === 'conectado' ? 'bg-red-50 text-red-700 border-2 border-red-200 hover:bg-red-100' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
            >
              {int.status === 'conectado' ? 'Desconectar' : 'Conectar'}
            </button>
          </div>
        ))}
      </div>
      <div className="bg-blue-50 rounded-apple border-2 border-blue-200 p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900">Dica: Automatize seu fluxo</h3>
            <p className="text-sm text-blue-700 mt-2">Conecte WhatsApp + Gmail + Google Sheets para criar um fluxo completo.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const VendedoresView: React.FC<{
  vendedores: Vendedor[]
  clientes: Cliente[]
  onAddVendedor: (v: Vendedor) => void
  onUpdateVendedor: (v: Vendedor) => void
}> = ({ vendedores, clientes, onAddVendedor, onUpdateVendedor }) => {
  const [selectedVendedorId, setSelectedVendedorId] = React.useState<number | null>(null)
  const [showModal, setShowModal] = React.useState(false)
  const [newNome, setNewNome] = React.useState('')
  const [newEmail, setNewEmail] = React.useState('')
  const [newTelefone, setNewTelefone] = React.useState('')
  const [newCargo, setNewCargo] = React.useState<Vendedor['cargo']>('vendedor')
  const [newMetaVendas, setNewMetaVendas] = React.useState('150000')
  const [newMetaLeads, setNewMetaLeads] = React.useState('10')
  const [newMetaConversao, setNewMetaConversao] = React.useState('15')
  const [newUsuario, setNewUsuario] = React.useState('')
  const [newSenha, setNewSenha] = React.useState('')

  const [editingMetas, setEditingMetas] = React.useState(false)
  const [editMetaVendas, setEditMetaVendas] = React.useState('')
  const [editMetaLeads, setEditMetaLeads] = React.useState('')
  const [editMetaConversao, setEditMetaConversao] = React.useState('')
  const [editingCredentials, setEditingCredentials] = React.useState(false)
  const [editUsuario, setEditUsuario] = React.useState('')
  const [editSenha, setEditSenha] = React.useState('')

  const selectedVendedor = vendedores.find(v => v.id === selectedVendedorId) ?? null

  const getVendedorMetrics = (vendedor: Vendedor) => {
    const clientesVendedor = clientes.filter(c => c.vendedorId === vendedor.id)
    const totalLeads = clientesVendedor.length
    const valorPipeline = clientesVendedor.reduce((sum, c) => sum + (c.valorEstimado || 0), 0)
    const conversoes = clientesVendedor.filter(c => c.etapa === 'pos_venda').length
    const taxaConversao = totalLeads > 0 ? (conversoes / totalLeads) * 100 : 0
    return { totalLeads, valorPipeline, conversoes, taxaConversao, clientesVendedor }
  }

  const ranking = [...vendedores]
    .filter(v => v.ativo)
    .map(v => ({ ...v, metrics: getVendedorMetrics(v) }))
    .sort((a, b) => b.metrics.valorPipeline - a.metrics.valorPipeline)

  const getCargoLabel = (cargo: Vendedor['cargo']) => {
    switch (cargo) {
      case 'gerente': return 'Gerente'
      case 'sdr': return 'SDR'
      default: return 'Vendedor'
    }
  }

  const getCargoBadge = (cargo: Vendedor['cargo']) => {
    switch (cargo) {
      case 'gerente': return 'bg-purple-100 text-purple-800'
      case 'sdr': return 'bg-blue-100 text-blue-800'
      default: return 'bg-green-100 text-green-800'
    }
  }

  const getBarColor = (pct: number) => {
    if (pct >= 100) return 'bg-green-500'
    if (pct >= 75) return 'bg-blue-500'
    if (pct >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const handleAddVendedor = () => {
    if (!newNome.trim() || !newEmail.trim() || !newUsuario.trim() || !newSenha.trim()) return
    const initials = newNome.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    onAddVendedor({
      id: Date.now(),
      nome: newNome.trim(),
      email: newEmail.trim(),
      telefone: newTelefone.trim(),
      cargo: newCargo,
      avatar: initials,
      usuario: newUsuario.trim(),
      senha: newSenha.trim(),
      metaVendas: Number(newMetaVendas) || 150000,
      metaLeads: Number(newMetaLeads) || 10,
      metaConversao: Number(newMetaConversao) || 15,
      ativo: true
    })
    setNewNome(''); setNewEmail(''); setNewTelefone(''); setNewUsuario(''); setNewSenha(''); setShowModal(false)
  }

  const handleSaveCredentials = () => {
    if (!selectedVendedor || !editUsuario.trim() || !editSenha.trim()) return
    onUpdateVendedor({
      ...selectedVendedor,
      usuario: editUsuario.trim(),
      senha: editSenha.trim()
    })
    setEditingCredentials(false)
  }

  const handleSaveMetas = () => {
    if (!selectedVendedor) return
    onUpdateVendedor({
      ...selectedVendedor,
      metaVendas: Number(editMetaVendas) || selectedVendedor.metaVendas,
      metaLeads: Number(editMetaLeads) || selectedVendedor.metaLeads,
      metaConversao: Number(editMetaConversao) || selectedVendedor.metaConversao
    })
    setEditingMetas(false)
  }

  if (selectedVendedor) {
    const m = getVendedorMetrics(selectedVendedor)
    const pctVendas = Math.min((m.valorPipeline / selectedVendedor.metaVendas) * 100, 100)
    const pctLeads = Math.min((m.totalLeads / selectedVendedor.metaLeads) * 100, 100)
    const pctConversao = Math.min((m.taxaConversao / selectedVendedor.metaConversao) * 100, 100)

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedVendedorId(null)} className="px-3 py-2 bg-white border border-gray-300 rounded-apple hover:bg-gray-50 text-sm font-medium text-gray-700">← Voltar</button>
          <h1 className="text-2xl font-semibold text-gray-900">Perfil do Vendedor</h1>
        </div>

        <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-700">{selectedVendedor.avatar}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{selectedVendedor.nome}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCargoBadge(selectedVendedor.cargo)}`}>{getCargoLabel(selectedVendedor.cargo)}</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedVendedor.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{selectedVendedor.ativo ? 'Ativo' : 'Inativo'}</span>
              </div>
              <div className="flex gap-6 mt-3 text-sm text-gray-600">
                <span>📧 {selectedVendedor.email}</span>
                <span>📞 {selectedVendedor.telefone}</span>
              </div>
            </div>
            <button
              onClick={() => {
                onUpdateVendedor({ ...selectedVendedor, ativo: !selectedVendedor.ativo })
              }}
              className={`px-4 py-2 rounded-apple text-sm font-semibold ${selectedVendedor.ativo ? 'bg-red-50 text-red-700 border-2 border-red-200 hover:bg-red-100' : 'bg-green-600 text-white hover:bg-green-700'}`}
            >
              {selectedVendedor.ativo ? 'Desativar' : 'Ativar'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">🔐 Credenciais de Acesso</h3>
            {!editingCredentials ? (
              <button onClick={() => { setEditingCredentials(true); setEditUsuario(selectedVendedor.usuario); setEditSenha(selectedVendedor.senha) }} className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-apple hover:bg-gray-50 font-medium">✏️ Editar</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditingCredentials(false)} className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-apple hover:bg-gray-50">Cancelar</button>
                <button onClick={handleSaveCredentials} className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-apple hover:bg-primary-700">Salvar</button>
              </div>
            )}
          </div>
          {editingCredentials ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
                <input type="text" value={editUsuario} onChange={(e) => setEditUsuario(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <input type="text" value={editSenha} onChange={(e) => setEditSenha(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 rounded-apple border border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500">Usuário</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{selectedVendedor.usuario}</p>
              </div>
              <div className="p-3 rounded-apple border border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-500">Senha</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{'•'.repeat(selectedVendedor.senha.length)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Clientes</p>
            <p className="text-2xl font-bold text-gray-900">{m.totalLeads}</p>
          </div>
          <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Pipeline</p>
            <p className="text-2xl font-bold text-gray-900">R$ {m.valorPipeline.toLocaleString('pt-BR')}</p>
          </div>
          <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Conversões</p>
            <p className="text-2xl font-bold text-green-600">{m.conversoes}</p>
          </div>
          <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600">Taxa Conversão</p>
            <p className="text-2xl font-bold text-purple-600">{m.taxaConversao.toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">🎯 Metas Individuais</h3>
            {!editingMetas ? (
              <button onClick={() => { setEditingMetas(true); setEditMetaVendas(String(selectedVendedor.metaVendas)); setEditMetaLeads(String(selectedVendedor.metaLeads)); setEditMetaConversao(String(selectedVendedor.metaConversao)) }} className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-apple hover:bg-gray-50 font-medium">✏️ Editar Metas</button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditingMetas(false)} className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-apple hover:bg-gray-50">Cancelar</button>
                <button onClick={handleSaveMetas} className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-apple hover:bg-primary-700">Salvar</button>
              </div>
            )}
          </div>

          {editingMetas ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Vendas (R$)</label>
                <input type="number" value={editMetaVendas} onChange={(e) => setEditMetaVendas(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Leads</label>
                <input type="number" value={editMetaLeads} onChange={(e) => setEditMetaLeads(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meta Conversão (%)</label>
                <input type="number" value={editMetaConversao} onChange={(e) => setEditMetaConversao(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-apple border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">💰 Vendas</p>
                  <p className="text-sm font-bold text-gray-900">R$ {m.valorPipeline.toLocaleString('pt-BR')} / {selectedVendedor.metaVendas.toLocaleString('pt-BR')}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className={`h-3 rounded-full transition-all duration-500 ${getBarColor(pctVendas)}`} style={{ width: `${pctVendas}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{pctVendas.toFixed(0)}% da meta</p>
              </div>
              <div className="p-4 rounded-apple border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">📋 Leads</p>
                  <p className="text-sm font-bold text-gray-900">{m.totalLeads} / {selectedVendedor.metaLeads}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className={`h-3 rounded-full transition-all duration-500 ${getBarColor(pctLeads)}`} style={{ width: `${pctLeads}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{pctLeads.toFixed(0)}% da meta</p>
              </div>
              <div className="p-4 rounded-apple border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">🔄 Conversão</p>
                  <p className="text-sm font-bold text-gray-900">{m.taxaConversao.toFixed(1)}% / {selectedVendedor.metaConversao}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className={`h-3 rounded-full transition-all duration-500 ${getBarColor(pctConversao)}`} style={{ width: `${pctConversao}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{pctConversao.toFixed(0)}% da meta</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Clientes Atribuídos ({m.clientesVendedor.length})</h3>
          </div>
          <div className="p-6">
            {m.clientesVendedor.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum cliente atribuído a este vendedor.</p>
            ) : (
              <div className="space-y-2">
                {m.clientesVendedor.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-apple border border-gray-200">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{c.razaoSocial}</p>
                      <p className="text-xs text-gray-500">{c.contatoNome} • {c.etapa}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">R$ {(c.valorEstimado || 0).toLocaleString('pt-BR')}</p>
                      <p className="text-xs text-gray-500">Score: {c.score || 0}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Equipe de Vendas</h1>
          <p className="mt-1 text-sm text-gray-600">Gerencie sua equipe, acompanhe metas e performance individual</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-primary-600 text-white rounded-apple hover:bg-primary-700 shadow-apple-sm flex items-center">
          <PlusIcon className="h-4 w-4 mr-2" />
          Novo Vendedor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {vendedores.map(v => {
          const m = getVendedorMetrics(v)
          const pctVendas = Math.min((m.valorPipeline / v.metaVendas) * 100, 100)
          return (
            <div key={v.id} onClick={() => setSelectedVendedorId(v.id)} className="bg-white rounded-apple shadow-apple-sm border-2 border-gray-200 p-6 hover:border-primary-300 transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${v.ativo ? 'bg-primary-100' : 'bg-gray-200'}`}>
                  <span className={`text-sm font-bold ${v.ativo ? 'text-primary-700' : 'text-gray-500'}`}>{v.avatar}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{v.nome}</h3>
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getCargoBadge(v.cargo)}`}>{getCargoLabel(v.cargo)}</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Clientes</span>
                  <span className="font-semibold text-gray-900">{m.totalLeads}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pipeline</span>
                  <span className="font-semibold text-gray-900">R$ {m.valorPipeline.toLocaleString('pt-BR')}</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Meta vendas</span>
                    <span className="font-semibold text-gray-700">{pctVendas.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className={`h-2 rounded-full ${getBarColor(pctVendas)}`} style={{ width: `${pctVendas}%` }}></div>
                  </div>
                </div>
              </div>
              {!v.ativo && <p className="text-xs text-red-500 mt-2 font-semibold">Inativo</p>}
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">🏆 Ranking da Equipe</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {ranking.map((v, index) => {
              const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`
              return (
                <div key={v.id} className={`flex items-center gap-4 p-4 rounded-apple border-2 transition-all ${index === 0 ? 'bg-yellow-50 border-yellow-200' : index === 1 ? 'bg-gray-50 border-gray-300' : index === 2 ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}>
                  <div className="text-2xl w-10 text-center font-bold">{medal}</div>
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-700">{v.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{v.nome}</p>
                    <p className="text-xs text-gray-500">{getCargoLabel(v.cargo)} • {v.metrics.totalLeads} clientes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">R$ {v.metrics.valorPipeline.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-gray-500">Conversão: {v.metrics.taxaConversao.toFixed(1)}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-apple shadow-apple-lg max-w-lg w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Novo Vendedor</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input value={newNome} onChange={(e) => setNewNome(e.target.value)} placeholder="Nome completo" className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@empresa.com" className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input value={newTelefone} onChange={(e) => setNewTelefone(e.target.value)} placeholder="(00) 00000-0000" className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <select value={newCargo} onChange={(e) => setNewCargo(e.target.value as Vendedor['cargo'])} className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="vendedor">Vendedor</option>
                  <option value="sdr">SDR</option>
                  <option value="gerente">Gerente</option>
                </select>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">🔐 Credenciais de Acesso</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Usuário *</label>
                    <input value={newUsuario} onChange={(e) => setNewUsuario(e.target.value)} placeholder="nome.usuario" className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Senha *</label>
                    <input value={newSenha} onChange={(e) => setNewSenha(e.target.value)} placeholder="Senha de acesso" className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">Metas Mensais</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Vendas (R$)</label>
                    <input type="number" value={newMetaVendas} onChange={(e) => setNewMetaVendas(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Leads</label>
                    <input type="number" value={newMetaLeads} onChange={(e) => setNewMetaLeads(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Conversão (%)</label>
                    <input type="number" value={newMetaConversao} onChange={(e) => setNewMetaConversao(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-apple hover:bg-gray-50">Cancelar</button>
              <button onClick={handleAddVendedor} disabled={!newNome.trim() || !newEmail.trim() || !newUsuario.trim() || !newSenha.trim()} className="px-4 py-2 bg-primary-600 text-white rounded-apple hover:bg-primary-700 disabled:bg-gray-400 shadow-apple-sm">Cadastrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const MapaView: React.FC<{ clientes: Cliente[] }> = ({ clientes }) => {
  const [selectedClienteId, setSelectedClienteId] = React.useState<number>(clientes[0]?.id ?? 0)
  const selectedCliente = clientes.find((c) => c.id === selectedClienteId) ?? null
  const [address, setAddress] = React.useState<string>(selectedCliente?.endereco || '')
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string>('')
  const [coords, setCoords] = React.useState<{ lat: number; lon: number } | null>(null)

  React.useEffect(() => {
    const nextAddress = selectedCliente?.endereco || ''
    setAddress(nextAddress)
    setCoords(null)
    setError('')
  }, [selectedClienteId])

  const geocode = async () => {
    setError('')
    if (!address.trim()) {
      setError('Informe um endereço para localizar no mapa.')
      return
    }

    setIsLoading(true)
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      })
      const data: Array<{ lat: string; lon: string }> = await res.json()
      if (!data || data.length === 0) {
        setError('Endereço não encontrado. Tente adicionar cidade/UF.')
        setCoords(null)
        return
      }
      setCoords({ lat: Number(data[0].lat), lon: Number(data[0].lon) })
    } catch {
      setError('Falha ao consultar o mapa. Verifique sua internet e tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const iframeSrc = coords
    ? `https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${coords.lat}%2C${coords.lon}&zoom=15`
    : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Mapa de Leads</h1>
        <p className="mt-1 text-sm text-gray-600">Localize leads pelo endereço e visualize no mapa.</p>
      </div>

      <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Lead / Empresa</label>
            <select
              value={selectedClienteId}
              onChange={(e) => setSelectedClienteId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.razaoSocial}
                </option>
              ))}
            </select>

            <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Endereço</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Rua, número, bairro, cidade - UF"
            />

            <button
              onClick={geocode}
              disabled={isLoading}
              className="mt-3 w-full px-4 py-2 bg-primary-600 text-white rounded-apple hover:bg-primary-700 disabled:bg-gray-400 transition-colors duration-200 shadow-apple-sm"
            >
              {isLoading ? 'Buscando...' : 'Buscar no mapa'}
            </button>

            {error && (
              <div className="mt-3 text-sm text-red-600">{error}</div>
            )}

            {coords && (
              <div className="mt-4 rounded-apple border border-gray-200 bg-gray-50 p-4">
                <div className="text-xs text-gray-700">Lat: {coords.lat.toFixed(6)}</div>
                <div className="text-xs text-gray-700">Lon: {coords.lon.toFixed(6)}</div>
                <a
                  className="text-xs text-primary-700 hover:text-primary-900 underline mt-2 inline-block"
                  href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lon}#map=16/${coords.lat}/${coords.lon}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir no OpenStreetMap
                </a>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-apple border border-gray-200 overflow-hidden bg-gray-50" style={{ height: 520 }}>
              {iframeSrc ? (
                <iframe
                  title="mapa"
                  src={iframeSrc}
                  className="w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                  Informe um endereço e clique em “Buscar no mapa”.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Relatórios View
const RelatoriosView: React.FC<{ clientes: Cliente[], vendedores: Vendedor[], interacoes: Interacao[], produtos?: Produto[] }> = ({ clientes, vendedores, interacoes, produtos = [] }) => {
  const stages = ['prospecção', 'amostra', 'homologado', 'negociacao', 'pos_venda', 'perdido']
  const stageLabels: Record<string, string> = { 'prospecção': 'Prospecção', 'amostra': 'Amostra', 'homologado': 'Homologado', 'negociacao': 'Negociação', 'pos_venda': 'Pós-Venda', 'perdido': 'Perdido' }
  const COLORS = ['#3B82F6', '#EAB308', '#22C55E', '#A855F7', '#EC4899', '#EF4444']

  const pipelineData = stages.map(s => ({
    name: stageLabels[s] || s,
    valor: clientes.filter(c => c.etapa === s).reduce((sum, c) => sum + (c.valorEstimado || 0), 0),
    qtd: clientes.filter(c => c.etapa === s).length
  }))

  const pieData = stages.map(s => ({
    name: stageLabels[s] || s,
    value: clientes.filter(c => c.etapa === s).length
  })).filter(d => d.value > 0)

  const vendedorData = vendedores.filter(v => v.ativo).map(v => {
    const cv = clientes.filter(c => c.vendedorId === v.id)
    return {
      name: v.nome.split(' ')[0],
      pipeline: cv.reduce((s, c) => s + (c.valorEstimado || 0), 0),
      leads: cv.length,
      conversoes: cv.filter(c => c.etapa === 'pos_venda').length
    }
  })

  const interacaoData = ['email', 'whatsapp', 'linkedin', 'instagram', 'ligacao', 'reuniao'].map(tipo => ({
    name: tipo.charAt(0).toUpperCase() + tipo.slice(1),
    qtd: interacoes.filter(i => i.tipo === tipo).length
  })).filter(d => d.qtd > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Relatórios e Gráficos</h1>
        <p className="mt-1 text-sm text-gray-600">Análise visual completa do pipeline, vendedores e interações</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Pipeline por Etapa (R$)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pipelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Valor']} />
              <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                {pipelineData.map((_e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🥧 Distribuição de Leads</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {pieData.map((_e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Desempenho por Vendedor</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={vendedorData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(value: number, name: string) => [name === 'pipeline' ? `R$ ${value.toLocaleString('pt-BR')}` : value, name === 'pipeline' ? 'Pipeline' : name === 'leads' ? 'Leads' : 'Conversões']} />
              <Bar dataKey="pipeline" fill="#6366F1" name="Pipeline" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💬 Interações por Canal</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={interacaoData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="qtd" fill="#10B981" name="Quantidade" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Produtos por Pipeline */}
      <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📦 Produtos por Volume de Pipeline</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={(() => {
            const prodPipeline: Record<string, number> = {}
            clientes.forEach(c => (c.produtosInteresse || []).forEach(p => { prodPipeline[p] = (prodPipeline[p] || 0) + (c.valorEstimado || 0) }))
            return Object.entries(prodPipeline).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, valor]) => ({ name: name.length > 18 ? name.slice(0, 18) + '…' : name, valor }))
          })()} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={140} />
            <Tooltip formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Pipeline']} />
            <Bar dataKey="valor" fill="#F59E0B" name="Pipeline" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Resumo Executivo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-apple border border-blue-200">
            <p className="text-xs text-blue-600 font-medium">Total Pipeline</p>
            <p className="text-xl font-bold text-blue-900">R$ {clientes.reduce((s, c) => s + (c.valorEstimado || 0), 0).toLocaleString('pt-BR')}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-apple border border-green-200">
            <p className="text-xs text-green-600 font-medium">Vendas Fechadas</p>
            <p className="text-xl font-bold text-green-900">R$ {clientes.filter(c => c.etapa === 'pos_venda').reduce((s, c) => s + (c.valorEstimado || 0), 0).toLocaleString('pt-BR')}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-apple border border-red-200">
            <p className="text-xs text-red-600 font-medium">Perdidos</p>
            <p className="text-xl font-bold text-red-900">{clientes.filter(c => c.etapa === 'perdido').length} leads</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-apple border border-purple-200">
            <p className="text-xs text-purple-600 font-medium">Taxa Conversão</p>
            <p className="text-xl font-bold text-purple-900">{clientes.length > 0 ? ((clientes.filter(c => c.etapa === 'pos_venda').length / clientes.length) * 100).toFixed(1) : 0}%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Templates View
const TemplatesView: React.FC<{ templates: Template[], onAdd: (t: Template) => void, onDelete: (id: number) => void }> = ({ templates, onAdd, onDelete }) => {
  const [showModal, setShowModal] = React.useState(false)
  const [filterCanal, setFilterCanal] = React.useState<string>('')
  const [filterEtapa, setFilterEtapa] = React.useState<string>('')
  const [newNome, setNewNome] = React.useState('')
  const [newCanal, setNewCanal] = React.useState<'email' | 'whatsapp'>('email')
  const [newEtapa, setNewEtapa] = React.useState('prospecção')
  const [newAssunto, setNewAssunto] = React.useState('')
  const [newCorpo, setNewCorpo] = React.useState('')
  const [previewId, setPreviewId] = React.useState<number | null>(null)

  const filtered = templates.filter(t => {
    return (!filterCanal || t.canal === filterCanal) && (!filterEtapa || t.etapa === filterEtapa)
  })

  const handleAdd = () => {
    if (!newNome.trim() || !newCorpo.trim()) return
    onAdd({ id: Date.now(), nome: newNome.trim(), canal: newCanal, etapa: newEtapa, assunto: newAssunto.trim() || undefined, corpo: newCorpo.trim() })
    setNewNome(''); setNewAssunto(''); setNewCorpo(''); setShowModal(false)
  }

  const previewTemplate = templates.find(t => t.id === previewId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Templates de Mensagens</h1>
          <p className="mt-1 text-sm text-gray-600">Modelos prontos de email e WhatsApp para cada etapa do funil</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-primary-600 text-white rounded-apple hover:bg-primary-700 shadow-apple-sm flex items-center">
          <PlusIcon className="h-4 w-4 mr-2" /> Novo Template
        </button>
      </div>

      <div className="flex gap-3">
        <select value={filterCanal} onChange={(e) => setFilterCanal(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-apple text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">Todos os canais</option>
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
        </select>
        <select value={filterEtapa} onChange={(e) => setFilterEtapa(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-apple text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">Todas as etapas</option>
          <option value="prospecção">Prospecção</option>
          <option value="amostra">Amostra</option>
          <option value="homologado">Homologado</option>
          <option value="negociacao">Negociação</option>
          <option value="pos_venda">Pós-Venda</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(t => (
          <div key={t.id} className="bg-white rounded-apple shadow-apple-sm border border-gray-200 p-5 hover:shadow-apple transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${t.canal === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                  {t.canal === 'email' ? '📧 Email' : '💬 WhatsApp'}
                </span>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                  {t.etapa}
                </span>
              </div>
              <button onClick={() => onDelete(t.id)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{t.nome}</h3>
            {t.assunto && <p className="text-xs text-gray-500 mb-2">Assunto: {t.assunto}</p>}
            <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-line">{t.corpo.slice(0, 120)}...</p>
            <button onClick={() => setPreviewId(t.id)} className="mt-3 text-xs text-primary-600 hover:text-primary-800 font-medium">Ver completo →</button>
          </div>
        ))}
      </div>

      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-apple shadow-apple-lg max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{previewTemplate.nome}</h2>
                <div className="flex gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${previewTemplate.canal === 'email' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                    {previewTemplate.canal === 'email' ? '📧 Email' : '💬 WhatsApp'}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{previewTemplate.etapa}</span>
                </div>
              </div>
              <button onClick={() => setPreviewId(null)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6" /></button>
            </div>
            {previewTemplate.assunto && (
              <div className="mb-3 p-3 bg-gray-50 rounded-apple border border-gray-200">
                <p className="text-xs text-gray-500">Assunto</p>
                <p className="text-sm font-medium text-gray-900">{previewTemplate.assunto}</p>
              </div>
            )}
            <div className="p-4 bg-gray-50 rounded-apple border border-gray-200 whitespace-pre-line text-sm text-gray-800">
              {previewTemplate.corpo}
            </div>
            <p className="text-xs text-gray-500 mt-3">Variáveis: {'{nome}'}, {'{empresa}'}, {'{vendedor}'}</p>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-apple shadow-apple-lg max-w-lg w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Novo Template</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input value={newNome} onChange={(e) => setNewNome(e.target.value)} placeholder="Ex: Follow-up Pós-Reunião" className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
                  <select value={newCanal} onChange={(e) => setNewCanal(e.target.value as 'email' | 'whatsapp')} className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="email">Email</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Etapa</label>
                  <select value={newEtapa} onChange={(e) => setNewEtapa(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="prospecção">Prospecção</option>
                    <option value="amostra">Amostra</option>
                    <option value="homologado">Homologado</option>
                    <option value="negociacao">Negociação</option>
                    <option value="pos_venda">Pós-Venda</option>
                  </select>
                </div>
              </div>
              {newCanal === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assunto</label>
                  <input value={newAssunto} onChange={(e) => setNewAssunto(e.target.value)} placeholder="Assunto do email" className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Corpo da mensagem *</label>
                <textarea value={newCorpo} onChange={(e) => setNewCorpo(e.target.value)} rows={6} placeholder="Use {nome}, {empresa}, {vendedor} como variáveis..." className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-apple hover:bg-gray-50">Cancelar</button>
              <button onClick={handleAdd} disabled={!newNome.trim() || !newCorpo.trim()} className="px-4 py-2 bg-primary-600 text-white rounded-apple hover:bg-primary-700 disabled:bg-gray-400 shadow-apple-sm">Criar Template</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Produtos View
const ProdutosView: React.FC<{
  produtos: Produto[]
  onAdd: (p: Produto) => void
  onUpdate: (p: Produto) => void
  onDelete: (id: number) => void
  isGerente: boolean
}> = ({ produtos, onAdd, onUpdate, onDelete, isGerente }) => {
  const [search, setSearch] = React.useState('')
  const [filterCategoria, setFilterCategoria] = React.useState('')
  const [filterAtivo, setFilterAtivo] = React.useState<string>('')
  const [showModal, setShowModal] = React.useState(false)
  const [editing, setEditing] = React.useState<Produto | null>(null)
  const [previewId, setPreviewId] = React.useState<number | null>(null)

  const [fNome, setFNome] = React.useState('')
  const [fDescricao, setFDescricao] = React.useState('')
  const [fCategoria, setFCategoria] = React.useState<Produto['categoria']>('sacaria')
  const [fPreco, setFPreco] = React.useState('')
  const [fUnidade, setFUnidade] = React.useState('un')
  const [fFoto, setFFoto] = React.useState('')
  const [fSku, setFSku] = React.useState('')
  const [fEstoque, setFEstoque] = React.useState('')
  const [fPesoKg, setFPesoKg] = React.useState('')
  const [fMargemLucro, setFMargemLucro] = React.useState('')
  const [fAtivo, setFAtivo] = React.useState(true)
  const [fDestaque, setFDestaque] = React.useState(false)

  const filtered = produtos.filter(p => {
    const matchSearch = p.nome.toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCategoria || p.categoria === filterCategoria
    const matchAtivo = filterAtivo === '' || (filterAtivo === 'ativo' ? p.ativo : !p.ativo)
    return matchSearch && matchCat && matchAtivo
  })

  const openNew = () => {
    setEditing(null)
    setFNome(''); setFDescricao(''); setFCategoria('sacaria'); setFPreco(''); setFUnidade('sc')
    setFFoto(''); setFSku(''); setFEstoque(''); setFPesoKg(''); setFMargemLucro('')
    setFAtivo(true); setFDestaque(false); setShowModal(true)
  }

  const openEdit = (p: Produto) => {
    setEditing(p)
    setFNome(p.nome); setFDescricao(p.descricao); setFCategoria(p.categoria); setFPreco(String(p.preco)); setFUnidade(p.unidade)
    setFFoto(p.foto); setFSku(p.sku || ''); setFEstoque(p.estoque !== undefined ? String(p.estoque) : ''); setFPesoKg(p.pesoKg !== undefined ? String(p.pesoKg) : ''); setFMargemLucro(p.margemLucro !== undefined ? String(p.margemLucro) : '')
    setFAtivo(p.ativo); setFDestaque(p.destaque); setShowModal(true)
  }

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('Imagem deve ter no máximo 2MB'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setFFoto(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!fNome.trim() || !fDescricao.trim() || !fPreco) return
    const prod: Produto = {
      id: editing ? editing.id : Date.now(),
      nome: fNome.trim(),
      descricao: fDescricao.trim(),
      categoria: fCategoria,
      preco: parseFloat(fPreco),
      unidade: fUnidade,
      foto: fFoto,
      sku: fSku.trim() || undefined,
      estoque: fEstoque ? parseInt(fEstoque) : undefined,
      pesoKg: fPesoKg ? parseFloat(fPesoKg) : undefined,
      margemLucro: fMargemLucro ? parseFloat(fMargemLucro) : undefined,
      ativo: fAtivo,
      destaque: fDestaque,
      dataCadastro: editing ? editing.dataCadastro : new Date().toISOString().split('T')[0]
    }
    if (editing) { onUpdate(prod) } else { onAdd(prod) }
    setShowModal(false)
  }

  const catLabel: Record<string, string> = { sacaria: 'Sacaria 25kg', okey_lac: 'Okey Lac 25kg', varejo_lacteo: 'Varejo Lácteo', cafe: 'Café', outros: 'Outros' }
  const catColor: Record<string, string> = { sacaria: 'bg-amber-100 text-amber-800', okey_lac: 'bg-blue-100 text-blue-800', varejo_lacteo: 'bg-purple-100 text-purple-800', cafe: 'bg-yellow-100 text-yellow-900', outros: 'bg-gray-100 text-gray-800' }

  const previewProd = produtos.find(p => p.id === previewId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Catálogo de Produtos</h1>
          <p className="mt-1 text-sm text-gray-600">{produtos.filter(p => p.ativo).length} produtos ativos — {produtos.length} total</p>
        </div>
        {isGerente && (
          <button onClick={openNew} className="px-4 py-2 bg-primary-600 text-white rounded-apple hover:bg-primary-700 shadow-apple-sm flex items-center">
            <PlusIcon className="h-4 w-4 mr-2" /> Novo Produto
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Buscar por nome ou SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 w-72" />
        <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-apple text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">Todas categorias</option>
          <option value="sacaria">Sacaria 25kg</option>
          <option value="okey_lac">Okey Lac 25kg</option>
          <option value="varejo_lacteo">Varejo Lácteo</option>
          <option value="cafe">Café</option>
          <option value="outros">Outros</option>
        </select>
        <select value={filterAtivo} onChange={(e) => setFilterAtivo(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-apple text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">Todos</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(p => (
          <div key={p.id} className={`bg-white rounded-apple shadow-apple-sm border border-gray-200 overflow-hidden hover:shadow-apple transition-shadow ${!p.ativo ? 'opacity-60' : ''}`}>
            <div className="h-40 bg-gray-100 flex items-center justify-center relative">
              {p.foto ? (
                <img src={p.foto} alt={p.nome} className="w-full h-full object-cover" />
              ) : (
                <PhotoIcon className="h-16 w-16 text-gray-300" />
              )}
              {p.destaque && <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-bold bg-yellow-400 text-yellow-900 rounded-full">Destaque</span>}
              {!p.ativo && <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded-full">Inativo</span>}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between mb-1">
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${catColor[p.categoria]}`}>{catLabel[p.categoria]}</span>
                {p.sku && <span className="text-xs text-gray-400 font-mono">{p.sku}</span>}
              </div>
              <h3 className="font-semibold text-gray-900 mt-2 text-sm leading-tight">{p.nome}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.descricao}</p>
              <div className="flex items-end justify-between mt-3">
                <div>
                  <p className="text-lg font-bold text-primary-600">R$ {p.preco.toFixed(2).replace('.', ',')}</p>
                  <p className="text-xs text-gray-400">/{p.unidade}</p>
                </div>
                {p.estoque !== undefined && (
                  <p className={`text-xs font-medium ${p.estoque > 100 ? 'text-green-600' : p.estoque > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {p.estoque > 0 ? `${p.estoque} em estoque` : 'Sem estoque'}
                  </p>
                )}
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => setPreviewId(p.id)} className="text-xs text-primary-600 hover:text-primary-800 font-medium flex-1">Ver detalhes</button>
                {isGerente && (
                  <>
                    <button onClick={() => openEdit(p)} className="text-xs text-gray-600 hover:text-gray-800 font-medium">Editar</button>
                    <button onClick={() => onUpdate({ ...p, ativo: !p.ativo })} className="text-xs text-gray-600 hover:text-gray-800 font-medium">{p.ativo ? 'Desativar' : 'Ativar'}</button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <div className="text-center py-12 text-gray-500">Nenhum produto encontrado</div>}

      {/* Detail Modal */}
      {previewProd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-apple shadow-apple-lg max-w-lg w-full max-h-[85vh] overflow-y-auto">
            {previewProd.foto ? (
              <img src={previewProd.foto} alt={previewProd.nome} className="w-full h-56 object-cover rounded-t-apple" />
            ) : (
              <div className="w-full h-56 bg-gray-100 flex items-center justify-center rounded-t-apple"><PhotoIcon className="h-20 w-20 text-gray-300" /></div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${catColor[previewProd.categoria]}`}>{catLabel[previewProd.categoria]}</span>
                    {previewProd.destaque && <span className="px-2 py-0.5 text-xs font-bold bg-yellow-400 text-yellow-900 rounded-full">Destaque</span>}
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${previewProd.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{previewProd.ativo ? 'Ativo' : 'Inativo'}</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{previewProd.nome}</h2>
                </div>
                <button onClick={() => setPreviewId(null)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6" /></button>
              </div>
              <p className="text-sm text-gray-600 mt-3">{previewProd.descricao}</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-gray-50 rounded-apple"><p className="text-xs text-gray-500">Preço</p><p className="text-lg font-bold text-primary-600">R$ {previewProd.preco.toFixed(2).replace('.', ',')}/{previewProd.unidade}</p></div>
                {previewProd.sku && <div className="p-3 bg-gray-50 rounded-apple"><p className="text-xs text-gray-500">SKU</p><p className="text-sm font-mono font-semibold text-gray-900">{previewProd.sku}</p></div>}
                {previewProd.estoque !== undefined && <div className="p-3 bg-gray-50 rounded-apple"><p className="text-xs text-gray-500">Estoque</p><p className="text-sm font-semibold text-gray-900">{previewProd.estoque} {previewProd.unidade}</p></div>}
                {previewProd.pesoKg !== undefined && <div className="p-3 bg-gray-50 rounded-apple"><p className="text-xs text-gray-500">Peso</p><p className="text-sm font-semibold text-gray-900">{previewProd.pesoKg} kg</p></div>}
                {previewProd.margemLucro !== undefined && <div className="p-3 bg-gray-50 rounded-apple"><p className="text-xs text-gray-500">Margem</p><p className="text-sm font-semibold text-gray-900">{previewProd.margemLucro}%</p></div>}
                <div className="p-3 bg-gray-50 rounded-apple"><p className="text-xs text-gray-500">Cadastrado em</p><p className="text-sm font-semibold text-gray-900">{new Date(previewProd.dataCadastro).toLocaleDateString('pt-BR')}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-apple shadow-apple-lg max-w-xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6" /></button>
            </div>

            <div className="space-y-4">
              {/* Foto Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Foto do Produto</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-apple border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {fFoto ? <img src={fFoto} alt="Preview" className="w-full h-full object-cover" /> : <PhotoIcon className="h-10 w-10 text-gray-300" />}
                  </div>
                  <div>
                    <label className="px-4 py-2 bg-white border border-gray-300 rounded-apple text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer inline-block">
                      <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                      Escolher imagem
                    </label>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG ou WebP. Máx 2MB.</p>
                    {fFoto && <button onClick={() => setFFoto('')} className="text-xs text-red-500 hover:text-red-700 mt-1">Remover foto</button>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input value={fNome} onChange={(e) => setFNome(e.target.value)} placeholder="Ex: Filé de Tilápia Congelado" className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                  <textarea value={fDescricao} onChange={(e) => setFDescricao(e.target.value)} rows={3} placeholder="Descrição detalhada do produto..." className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                  <select value={fCategoria} onChange={(e) => setFCategoria(e.target.value as Produto['categoria'])} className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="sacaria">Sacaria 25kg</option>
                    <option value="okey_lac">Okey Lac 25kg</option>
                    <option value="varejo_lacteo">Varejo Lácteo</option>
                    <option value="cafe">Café</option>
                    <option value="outros">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input value={fSku} onChange={(e) => setFSku(e.target.value)} placeholder="CONG-001" className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$) *</label>
                  <input type="number" step="0.01" value={fPreco} onChange={(e) => setFPreco(e.target.value)} placeholder="0,00" className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidade *</label>
                  <select value={fUnidade} onChange={(e) => setFUnidade(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="sc">Saco (sc)</option>
                    <option value="un">Unidade (un)</option>
                    <option value="kg">Quilograma (kg)</option>
                    <option value="cx">Caixa (cx)</option>
                    <option value="lt">Litro (lt)</option>
                    <option value="pct">Pacote (pct)</option>
                    <option value="fd">Fardo (fd)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estoque</label>
                  <input type="number" value={fEstoque} onChange={(e) => setFEstoque(e.target.value)} placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                  <input type="number" step="0.1" value={fPesoKg} onChange={(e) => setFPesoKg(e.target.value)} placeholder="0.0" className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Margem Lucro (%)</label>
                  <input type="number" step="0.1" value={fMargemLucro} onChange={(e) => setFMargemLucro(e.target.value)} placeholder="0" className="w-full px-3 py-2 border border-gray-300 rounded-apple focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={fAtivo} onChange={(e) => setFAtivo(e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
                  <span className="text-sm text-gray-700">Produto ativo</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={fDestaque} onChange={(e) => setFDestaque(e.target.checked)} className="w-4 h-4 text-yellow-500 rounded" />
                  <span className="text-sm text-gray-700">Destaque / Promoção</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-white border border-gray-300 rounded-apple hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSave} disabled={!fNome.trim() || !fDescricao.trim() || !fPreco} className="px-4 py-2 bg-primary-600 text-white rounded-apple hover:bg-primary-700 disabled:bg-gray-400 shadow-apple-sm">{editing ? 'Salvar' : 'Criar Produto'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
