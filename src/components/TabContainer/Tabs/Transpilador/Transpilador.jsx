import { Button, Grid2 as Grid, TextField, Typography } from "@mui/material";
import { Parser } from "node-sql-parser";
import React from "react";
import { Tabelas } from "../../../../data/constants";
import useTranspiladorContext from "../../../../hooks/useTranspiladorContext";
import { juntaArrays, mapearCampos } from "../../../../utils/functions";

const selectRegex = /^Select\s+(.*?)(?=\s+from\s+)/is;
const fromRegex = /\bfrom\s+(.*?)(?=\s+where\s+|\s*;?$)/is;
const whereRegex = /\bwhere\s+(.*?);?$/is;

const Transpilador = () => {
    const {
        showAlert,
        sqlCommand,
        setSqlCommand,
        error,
        setError,
        isSqlCommandaValid,
        setIsSqlCommandValid,
        sqlCommandParsed,
        setSqlCommandParsed,
        stringJuncao,
        setStringJuncao,
        stringReducaoTuplas,
        setStringReducaoTuplas,
        stringReducaoCampos,
        setStringReducaoCampos,
        setStringAlgebraRelacional,
    } = useTranspiladorContext();
    const parser = new Parser();

    const formatErrorMessage = error => {
        if (!error.expected || !error.location) return "Erro desconhecido na consulta SQL.";

        // Mensagem de erro formatada
        return `Erro de sintaxe SQL perto de '${error.found}' na linha ${error.location.start.line}, coluna ${error.location.start.column}.`;
    };

    const handleChangeSqlCommand = event => {
        const newValue = event.target.value;
        setSqlCommand(newValue);

        try {
            parser.parse(newValue); // Tenta analisar a consulta SQL
            setError(""); // Limpa erros anteriores se a nova consulta é válida
        } catch (e) {
            console.log(e);
            setIsSqlCommandValid(false);
            setError(formatErrorMessage(e)); // Define a mensagem de erro
        }
    };

    const handleValidarConsultarSql = () => {
        try {
            const ast = parser.astify(sqlCommand); // Converte o comando SQL em uma árvore sintática abstrata (AST)

            console.log("arvore sintatica", ast);
            const validateTableAndFields = ast => {
                const tables = ast.from.map(table => table.table); // Coleta todas as tabelas da consulta
                //console.log('tabelas', tables)
                tables.forEach(table => {
                    //console.log('tipo da tabela', typeof table)
                    //console.log('tabela da vez', Tabelas[table.toLowerCase()])
                    if (!!!Tabelas[table.toLowerCase()]) {
                        // Verifica se a tabela existe
                        setIsSqlCommandValid(false);
                        throw new Error(`A tabela '${table}' não existe no banco de dados.`);
                    }

                    // Verifica os campos selecionados
                    ast.columns.forEach(column => {
                        if (column.expr.type === "column_ref") {
                            const field = column.expr.column.toLowerCase().trim();
                            const tableRef = column.expr.table || table; // Usa a tabela de referência ou a tabela principal se não especificada
                            console.log(Tabelas[tableRef.toLowerCase()].nome);
                            console.log(Tabelas[tableRef.toLowerCase()][field]);
                            if (!!!Tabelas[tableRef.toLowerCase()] || !!!Tabelas[tableRef.toLowerCase()][field]) {
                                setIsSqlCommandValid(false);
                                throw new Error(`O campo '${field}' não existe na tabela '${tableRef}'.`);
                            }
                        }
                    });
                });
            };

            if (Array.isArray(ast)) {
                // Verifica se a AST é um array (várias consultas)
                ast.forEach(singleAst => validateTableAndFields(singleAst));
            } else {
                // Caso único
                validateTableAndFields(ast);
            }

            setIsSqlCommandValid(true);
            showAlert("Código foi validado com sucesso!", "success");
            setError(""); // Se tudo estiver correto
        } catch (e) {
            console.error(e);
            setIsSqlCommandValid(false);
            setError(e.message); // Mostra o erro encontrado
        }
    };

    const handleHeuristicaJuncao = comandoSql => {
        const selectString = comandoSql.match(selectRegex)[1];
        const fromString = comandoSql.match(fromRegex)[1];
        const whereString = comandoSql.match(whereRegex)[1];
        console.log("Clausula Select:", selectString);
        console.log("Clausula From:", fromString);
        console.log("Clausula Where:", whereString);
        console.log("");

        const tabelas = fromString.split("on")[0].trim();
        const igualdade = fromString.split("on")[1].trim();
        const tabela1 = tabelas.split("Join")[0].trim();
        const tabela2 = tabelas.split("Join")[1].trim();
        //console.log(`(${tabela1} |X| ${igualdade} ${tabela2})`)
        const algebreRelacionalFrom = `(${tabela1} |X| ${igualdade} ${tabela2}))`;

        const comparacao1 = whereString.split("and")[0].trim();
        const comparacao2 = whereString.split("and")[1].trim();
        //console.log(`(σ ${comparacao1} ^ ${comparacao2}`)
        const algebraRelacionalWhere = `(σ ${comparacao1} ^ ${comparacao2} `;

        const select = selectString;
        //console.log(`π ${select} `)
        const algebraRelacionalSelect = `π ${select} `;

        const stringAlgebraRelacionalJuncao = algebraRelacionalSelect + algebraRelacionalWhere + algebreRelacionalFrom;
        console.log("Heuristica Junção: ", "\n", stringAlgebraRelacionalJuncao);
        console.log("");
        return stringAlgebraRelacionalJuncao;
    };

    const handleReducaoTuplas = (comandoSql, juncao) => {
        const selectString = comandoSql.match(selectRegex)[1];
        const fromString = comandoSql.match(fromRegex)[1];
        const whereString = comandoSql.match(whereRegex)[1];

        const tabelas = fromString.split("on")[0].trim();
        const igualdade = fromString.split("on")[1].trim();
        const tabela1 = tabelas.split("Join")[0].trim();
        const tabela2 = tabelas.split("Join")[1].trim();

        const comparacao1 = whereString.split("and")[0].trim();
        const comparacao2 = whereString.split("and")[1].trim();
        const algebraRelacionalWhere = `σ ${comparacao1} ^ ${comparacao2} `;

        let regexTabela1 = new RegExp(`\\b${tabela1}\\b(?=\\s*\\|X\\|)|\\b${tabela1}\\b(?=\\s*\\))`, "g");
        let regexTabela2 = new RegExp(`\\b${tabela2}\\b(?=\\s*\\|X\\|)|\\b${tabela2}\\b(?=\\s*\\))`, "g");

        console.log("Heuristica Juncao sem clausula WHERE ", "\n", juncao.replace(algebraRelacionalWhere, "").replace(/\(\(([^()]+)\)\)/g, "($1)"), "\n");
        const whereRemoved = juncao.replace(algebraRelacionalWhere, "").replace(/\(\(([^()]+)\)\)/g, "($1)");
        //console.log(whereRemoved.replace(regexTabela1, `(${comparacao1}(${tabela1}))`))
        const firstTableChanged = whereRemoved.replace(regexTabela1, `(${comparacao1}(${tabela1}))`);
        //console.log(firstTableChanged.replace(regexTabela2, `(${comparacao2}(${tabela2}))`))
        const secondTableChanged = firstTableChanged.replace(regexTabela2, `(${comparacao2}(${tabela2})`);

        console.log("Heuristica Redução Tuplas: ", "\n", secondTableChanged);
        console.log("");
        return secondTableChanged;
    };

    const handleReducaoCampos = (comandoSql, reducaoTuplas, juncao) => {
        const selectString = comandoSql.match(selectRegex)[1];
        const fromString = comandoSql.match(fromRegex)[1];
        const whereString = comandoSql.match(whereRegex)[1];

        const tabelas = fromString.split("on")[0].trim();
        const tabela1 = tabelas.split("Join")[0].trim().toLowerCase();
        const tabela2 = tabelas.split("Join")[1].trim().toLowerCase();

        const comparacao1 = whereString.split("and")[0].trim();
        const comparacao2 = whereString.split("and")[1].trim();
        const algebraRelacionalWhere = `σ ${comparacao1} ^ ${comparacao2} `;
        const whereRemoved = juncao.replace(algebraRelacionalWhere, "").replace(/\(\(([^()]+)\)\)/g, "($1)");

        let regexTabela1 = new RegExp(`\\b${tabela1}\\b(?=\\s*\\|X\\|)|\\b${tabela1}\\b(?=\\s*\\))`, "gi");
        let regexTabela2 = new RegExp(`\\b${tabela2}\\b(?=\\s*\\|X\\|)|\\b${tabela2}\\b(?=\\s*\\))`, "gi");

        const camposSelect = selectString.split(",");
        const camposFromJoin = fromString.split("on")[1].trim().split("=");
        const todosCampos = mapearCampos(juntaArrays(camposSelect, camposFromJoin));

        const firstTableChanged = whereRemoved.replace(regexTabela1, `(π ${todosCampos[tabela1]?.join(", ")}(${comparacao1}(${tabela1})))`);
        const secondTableChanged = firstTableChanged.replace(regexTabela2, `(π ${todosCampos[tabela2]?.join(", ")}(${comparacao2}(${tabela2})))`);
        console.log("Heuristica Redução Campos: ", "\n", secondTableChanged);
        console.log("");

        return secondTableChanged;
    };

    const handleTransiplateSqlCommand = () => {
        const juncao = handleHeuristicaJuncao(sqlCommand);
        const reducaoTuplas = handleReducaoTuplas(sqlCommand, juncao);
        const reducaoCampos = handleReducaoCampos(sqlCommand, reducaoTuplas, juncao);
        setStringJuncao(juncao);
        setStringReducaoTuplas(reducaoTuplas);
        setStringReducaoCampos(reducaoCampos);

        setStringAlgebraRelacional(reducaoCampos);
        return setSqlCommandParsed(reducaoCampos);
    };

    return (
        <Grid container spacing={2} marginTop={2}>
            <Grid size={{ md: 12 }}>
                <Typography sx={{ width: "100%", textAlign: "center" }}>
                    É necessário validar o comando SQL para poder fazer a transpilação!
                    <br />
                    Para conseguir fazer a transpilação o comando SQL precisa estar correto.
                </Typography>
            </Grid>
            <Grid size={{ md: 5.5 }}>
                <TextField
                    id="text-field-sql-code"
                    label="Linha de comando SQL"
                    variant="outlined"
                    fullWidth
                    spellCheck={false}
                    multiline
                    rows={10}
                    value={sqlCommand}
                    onChange={handleChangeSqlCommand}
                    helperText={error}
                    error={!!error}
                />
            </Grid>
            <Grid
                size={{ md: 1 }}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                    justifyContent: "center",
                }}
            >
                <Button id="button-validar-sql" variant="contained" onClick={handleValidarConsultarSql}>
                    VALIDAR
                </Button>
                <Button id="button-transpilate-sql" variant="contained" disabled={!isSqlCommandaValid} onClick={handleTransiplateSqlCommand}>
                    TRANSPILAR
                </Button>
            </Grid>
            <Grid size={{ md: 5.5 }}>
                <TextField
                    id="text-field-transpilated-code"
                    label="Código transpilado em Álgebra Relacional"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={10}
                    focused
                    slotProps={{
                        input: {
                            readOnly: true,
                        },
                    }}
                    value={sqlCommandParsed}
                />
            </Grid>
            <Grid size={{ md: 12 }}>
                <TextField
                    id="text-field-heuristica-juncao"
                    label="Heurística Junção"
                    variant="outlined"
                    fullWidth
                    focused
                    slotProps={{
                        input: {
                            readOnly: true,
                        },
                    }}
                    value={stringJuncao}
                />
            </Grid>
            <Grid size={{ md: 12 }}>
                <TextField
                    id="text-field-reducao-tuplas"
                    label="Redução Tuplas"
                    variant="outlined"
                    fullWidth
                    focused
                    slotProps={{
                        input: {
                            readOnly: true,
                        },
                    }}
                    value={stringReducaoTuplas}
                />
            </Grid>
            <Grid size={{ md: 12 }}>
                <TextField
                    id="text-field-reducao-campos"
                    label="Redução Campos"
                    variant="outlined"
                    fullWidth
                    focused
                    slotProps={{
                        input: {
                            readOnly: true,
                        },
                    }}
                    value={stringReducaoCampos}
                />
            </Grid>
        </Grid>
    );
};

export default Transpilador;
