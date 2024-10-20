export const extrairJoins = fromClause => {
    // Regex para capturar a tabela antes do primeiro JOIN e cada JOIN com suas condições até o próximo JOIN ou o fim da string
    const regex = /(\w+)\s+(?=JOIN)|JOIN\s+\w+\s+ON\s+\w+\.\w+\s*=\s*\w+\.\w+(?=\s+JOIN|$)/gi;

    let matches = [];
    let match;
    // Processando a string em partes para capturar corretamente as tabelas e JOINS
    while ((match = regex.exec(fromClause)) !== null) {
        matches.push(match[0]);
    }

    // Condicional para ajustar a inclusão da primeira tabela no primeiro JOIN
    if (matches.length > 1) {
        matches[0] = matches[0] + matches[1];
        matches.splice(1, 1); // Remove o segundo elemento que agora está combinado com o primeiro
    }

    return matches;
};

export const removeUnmatchedParentheses = input => {
    let balanced = "";
    let openCount = 0;

    for (const char of input) {
        if (char === "(") {
            openCount++;
            balanced += char;
        } else if (char === ")") {
            if (openCount > 0) {
                balanced += char;
                openCount--;
            }
        } else {
            balanced += char;
        }
    }

    let result = "";
    openCount = 0;

    let closeCount = [...balanced].filter(c => c === ")").length;

    for (const char of balanced) {
        if (char === "(") {
            if (closeCount > 0) {
                result += char;
                openCount++;
                closeCount--;
            }
        } else if (char === ")") {
            if (openCount > 0) {
                result += char;
                openCount--;
            }
        } else {
            result += char;
        }
    }

    return result;
};

export const extractTablesFromWhereClause = whereClause => {
    const regex = /(\w+)\.(\w+)\s*(=|!=|>|<|>=|<=)\s*(['"]?[\w\d.]+['"]?)/g;

    let tableMap = {};

    let match;
    while ((match = regex.exec(whereClause)) !== null) {
        const [, table, field, operator, value] = match;

        const valueMatch = /^\d+$/.test(value) ? value : `${value}`;

        const expression = `${table}.${field} ${operator} ${valueMatch}`;
        if (!tableMap[table]) {
            tableMap[table] = [];
        }
        tableMap[table].push(expression);
    }

    return Object.keys(tableMap).map(tableName => [tableName, tableMap[tableName].join(" AND ")]);
};

export const getCamposFromJoin = fromString => {
    const arrayJoins = extrairJoins(fromString);
    let arrCamposFromJoin = [];

    arrayJoins.forEach((joinString, index) => {
        const campos = joinString.split("on")[1].trim().split("=");
        arrCamposFromJoin.push(campos);
    });

    return arrCamposFromJoin;
};

export const juntaArrays = (arrCamposSelect, arrCamposFromJoin) => {
    const arrayMesclado = [...arrCamposSelect];

    arrCamposFromJoin.forEach(arrInfo => {
        arrInfo.forEach(campo => {
            if (!arrCamposSelect.includes(campo.trim())) {
                arrayMesclado.push(campo.trim());
            }
        });
    });

    return arrayMesclado;
};

export const mapearCampos = arrayTabelaCampo => {
    const camposMapeados = {};

    arrayTabelaCampo.forEach(item => {
        const [tabelaDoArray, campo] = item.trim().split(".");
        const tabela = tabelaDoArray.toLowerCase();

        if (!camposMapeados[tabela]) {
            camposMapeados[tabela] = [];
        }

        camposMapeados[tabela].push(campo);
    });

    return camposMapeados;
};

export const extrairExpressao = (input, tabela) => {
    const regex = new RegExp(`\\b${tabela}\\b(?=\\s*\\|X\\|)|\\b${tabela}\\b(?=\\s*\\))`, "gi");
    const match = regex.exec(input);

    if (match) {
        const tabelaIndex = match.index;

        // Verifica se há um '(' imediatamente antes da tabela
        if (input[tabelaIndex - 1] === "(" && input[tabelaIndex + tabela.length] === ")") {
            // Encontrar o segundo '(' à esquerda da tabela
            let count = 0;
            let startIndex = -1;
            for (let i = tabelaIndex - 2; i >= 0; i--) {
                if (input[i] === "(") {
                    count++;
                    if (count === 1) {
                        startIndex = i + 1; // Começar após este parêntese
                        break;
                    }
                }
            }

            if (startIndex !== -1) {
                // Encontrar o primeiro ')' após o startIndex encontrado
                let depth = 1;
                let endIndex = startIndex;
                while (endIndex < input.length && depth > 0) {
                    endIndex++;
                    if (input[endIndex] === "(") {
                        depth++;
                    } else if (input[endIndex] === ")") {
                        depth--;
                    }
                }

                if (endIndex !== -1 && depth === 0) {
                    // Retorna a string entre o segundo '(' à esquerda da tabela até o primeiro ')' que fecha completamente
                    return input.substring(startIndex, endIndex); // endIndex já é o índice do parêntese fechado que queremos incluir
                }
            }
        }

        // Se não há '(' imediatamente antes ou se não encontramos o segundo '(', retorna apenas o nome da tabela
        return tabela;
    }

    return ""; // Caso a tabela não seja encontrada
};

export const parseToTreeStructure = expr => {
    const stack = [];
    let current = { name: "", children: [], order: 0 };
    let buffer = "";

    for (let i = 0; i < expr.length; i++) {
        const char = expr[i];

        if (char === "(") {
            if (buffer.trim()) {
                current.name = buffer.trim();
                buffer = "";
            }
            stack.push(current);
            current = { name: "", children: [], order: 0 };
        } else if (char === ")") {
            if (buffer.trim()) {
                current.name = buffer.trim();
                buffer = "";
            }
            const completed = current;
            current = stack.pop();

            current.children?.push(completed);
        } else {
            buffer += char;
        }
    }

    if (buffer.trim()) {
        current.name = buffer.trim();
    }

    let order = 1;
    const assignOrder = node => {
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => assignOrder(child));
        }
        node.order = order++;
        node.name += ` (${node.order})`;
    };
    assignOrder(current);

    //console.log(current);
    return current;
};
