# Fazenda API - Bruno Collection

Esta coleção contém todos os principais endpoints da API Fazenda migrada para Java/Spring Boot.

## Como usar

1. Abra o Bruno
2. Importe esta pasta como uma coleção
3. Configure o ambiente "Local" se necessário
4. Comece pelo endpoint de **Register** para criar um usuário
5. Use o endpoint de **Login** para obter o token de autenticação
6. O token será automaticamente salvo na variável `{{token}}` e usado nos demais requests

## Estrutura

- **Auth**: Login e registro de usuários
- **Fazendas**: CRUD de fazendas
- **Animais**: CRUD de animais
- **Lotes**: CRUD de lotes
- **Pais**: CRUD de reprodutores
- **Pesagens**: CRUD de pesagens
- **Financeiro**: Despesas e receitas

## Variáveis de ambiente

- `baseUrl`: URL base da API (padrão: http://localhost:8080/api)
- `token`: Token de autenticação (preenchido automaticamente após login)

## Ordem recomendada

1. Register (criar usuário)
2. Login (obter token)
3. Create Fazenda
4. Create Lote
5. Create Pai
6. Create Animal
7. Create Pesagem
8. Create Despesa/Receita

## Enums disponíveis

### Cargo
- ADMIN
- GERENTE
- VETERINARIO
- OPERADOR

### StatusAnimal
- ATIVO
- MORTO
- VENDIDO
- DOENTE

### Sexo
- MACHO
- FEMEA
- DESCONHECIDO

### CategoriaDespesa
- PESSOAL
- COMBUSTIVEL
- RACAO
- MANUTENCAO
- MEDICAMENTOS
- OUTROS

### CategoriaReceita
- VENDA_ANIMAIS
- LEITE
- SERVICOS
- OUTROS
