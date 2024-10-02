export const Tabelas = {
    'endereco': {
        idendereco: 'INT',
        enderecoeadrao: 'TINYINT',
        eogradouro: 'VARCHAR(45)',
        num: 'VARCHAR(45)',
        complemento: 'VARCHAR(45)',
        bairro: 'VARCHAR(45)',
        cidade: 'VARCHAR(45)',
        uf: 'VARCHAR(2)',
        cep: 'VARCHAR(8)',
        tipoendereco_idtipoendereco: 'INT',
        cliente_idcliente: 'INT'
    },
    'cliente': {
        idcliente: 'INT',
        nome: 'VARCHAR(45)',
        email: 'VARCHAR(100)',
        nascimento: 'DATETIME',
        senha: 'VARCHAR(200)',
        tipocliente_idtipocliente: 'INT',
        dataregistro: 'DATETIME'
    },
    'pedido': {
        idpedido: 'INT',
        status_idstatus: 'INT',
        datapedido: 'DATETIME',
        valortotalpedido: 'DECIMAL(18,2)',
        cliente_idcliente: 'INT'
    },
    'produto': {
        idproduto: 'INT',
        nome: 'VARCHAR(45)',
        descricao: 'VARCHAR(200)',
        preco: 'DECIMAL(18,2)',
        quantestoque: 'DECIMAL(10,2)',
        categoria_idcategoria: 'INT'
    },
    'tipoendereco': {
        idtipoEndereco: 'INT',
        descricao: 'VARCHAR(45)'
    },
    'tipocliente': {
        idtipocliente: 'INT',
        descricao: 'VARCHAR(45)'
    },
    'telefone': {
        idtelefone: 'INT',
        num: 'VARCHAR(42)',
        cliente_idcliente: 'INT'
    },
    'status': {
        idstatus: 'INT',
        descricao: 'VARCHAR(45)'
    },
    'pedido_has_produto': {
        pedido_idpedido: 'INT',
        produto_idproduto: 'INT',
        quantidade: 'DECIMAL(10,2)',
        precounitario: 'DECIMAL(18,2)'
    },
    'categoria': {
        idcategoria: 'INT',
        descricao: 'VARCHAR(45)'
    },
}