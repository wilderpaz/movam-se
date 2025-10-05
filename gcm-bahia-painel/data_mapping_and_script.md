Documentação de Implementação e Atualização de Dados
Este documento descreve o mapeamento dos campos de dados e um script (pseudocódigo) para a atualização dos dados, conforme solicitado.

1. Mapeamento de Colunas do gcm_bahia_data.json
O arquivo gcm_bahia_data.json é a fonte de dados primária para a aplicação React. Ele foi estruturado para incluir os KPIs (Key Performance Indicators) de resumo, extraídos diretamente das páginas do relatório GCM Bahia 2023, e uma seção ocorrencias_operacionais com dados simulados/sintéticos para alimentar os gráficos dinâmicos de tipologia e série temporal.

Seção/Campo no JSON

Descrição (Origem no Relatório PDF)

Uso na Aplicação

Tratamento de Dados

kpis.totalGuardas

Efetivo total (p.14)

KPI Cards (Total de Guardas)

Numérico

kpis.totalMunicipiosGCM

Total de municípios com GCM (p.14)

KPI Cards

Numérico

kpis.percentualComCorregedoria

Percentual que possui Corregedoria (p.14/38)

Resumo Executivo

Numérico (0.0 a 100.0)

kpis.percentualComPorteArma

Percentual com porte de arma (p.14/37)

Resumo Executivo

Numérico (0.0 a 100.0)

ocorrencias_operacionais[*].mes

Mês simulado da ocorrência

Eixo X do Gráfico de Série Temporal, Filtro

String (Nome do mês)

ocorrencias_operacionais[*].municipio

Município (Baseado na p.18-28)

Filtro, Gráfico de Distribuição (Donut)

String

ocorrencias_operacionais[*].tipologia

SIMULADO (Ex: Furto, Violência Doméstica, Atendimento Social, Trânsito)

Filtro, Gráfico de Barras (Top 5)

String

ocorrencias_operacionais[*].guardasEnvolvidos

Número de guardas envolvidos na ocorrência (Simulado)

Tabela, Potencial para Gráfico de Intensidade

Numérico

ocorrencias_operacionais[*].valorSalarioSM

Salário base em múltiplos de Salário Mínimo (SM) (Baseado na p.35)

Tabela, Potencial para Gráfico de Vencimento

Float

ocorrencias_operacionais[*].efetivoTotal

Efetivo total do Município (para contextualização)

Tabela

Numérico

vencimento_base

Distribuição de Vencimento-Base (p.35)

Gráfico de Barras de Vencimento

Array de Objetos

Tratamento de Dados Ausentes/Limitações:

Os dados de ocorrências operacionais por tipologia e mês foram simulados (ocorrencias_operacionais) pois o relatório original foca na estrutura da GCM (efetivo, porte, salário), e não nos registros operacionais detalhados.

Os filtros na aplicação utilizam estes dados simulados.

2. Script Automatizado de Atualização (Pseudocódigo)
Para manter o painel atualizado com novas edições do relatório da GCM de Salvador ou pesquisas do MOVAM-SE, é necessário um script de extração (ETL - Extract, Transform, Load).

Observação: A extração automática de dados de um PDF não estruturado (como o relatório) é complexa e requer bibliotecas como tabula-py ou soluções baseadas em LLM/visão computacional. Este pseudocódigo assume o uso de uma biblioteca robusta de extração de tabelas de PDF.