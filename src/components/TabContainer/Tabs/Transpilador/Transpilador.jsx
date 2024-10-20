import { Button, Grid2 as Grid, TextField, Typography } from "@mui/material";
import { Parser } from "node-sql-parser";
import React from "react";
import { Tabelas } from "../../../../data/constants";
import useTranspiladorContext from "../../../../hooks/useTranspiladorContext";
import { extractTablesFromWhereClause, extrairExpressao, extrairJoins, getCamposFromJoin, juntaArrays, mapearCampos, removeUnmatchedParentheses } from "../../../../utils/functions";

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

    const [isValueChanged, setIsValueChanged] = React.useState(false);

    const formatErrorMessage = error => {
        if (!error.expected || !error.location) return "Erro desconhecido na consulta SQL.";

        // Mensagem de erro formatada
        return `Erro de sintaxe SQL perto de '${error.found}' na linha ${error.location.start.line}, coluna ${error.location.start.column}.`;
    };

    const handleChangeSqlCommand = event => {
        setIsValueChanged(true);
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
            setIsValueChanged(false);
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

        const select = selectString;
        const algebraRelacionalSelect = `π ${select} `;

        const whereStringAdapted = whereString.replace(/and/gi, "^");
        const algebraRelacionalWhere = `(σ ${whereStringAdapted} `;

        const arrayJoins = extrairJoins(fromString);
        const parentesesAbrindo = "(".repeat(arrayJoins.length);
        const parentesesFechando = ")".repeat(arrayJoins.length);
        let algebreRelacionalFrom = "";

        arrayJoins.forEach((joinString, index) => {
            const tabelas = joinString.split("on")[0].trim();
            const acao = joinString.split("on")[1].trim();
            const tabela1 = tabelas.split("Join")[0].trim();
            const tabela2 = tabelas.split("Join")[1].trim();
            if (index === 0) {
                algebreRelacionalFrom += `${parentesesAbrindo}${tabela1} |X| ${acao} ${tabela2})`;
                if (index + 1 === arrayJoins.length) {
                    algebreRelacionalFrom += parentesesFechando;
                }
            } else if (index < arrayJoins.length - 1) {
                algebreRelacionalFrom += ` |X| ${acao} ${tabela2})`;
            } else {
                if (arrayJoins.length === 2) {
                    algebreRelacionalFrom += ` |X| ${acao} ${tabela2}${parentesesFechando}`;
                } else {
                    algebreRelacionalFrom += ` |X| ${acao} ${tabela2}${")".repeat(arrayJoins.length - 2)}`;
                }
            }
        });

        const stringAlgebraRelacionalJuncao = algebraRelacionalSelect + algebraRelacionalWhere + algebreRelacionalFrom;
        console.log("Heuristica Junção: ", "\n", stringAlgebraRelacionalJuncao);
        console.log("");
        return stringAlgebraRelacionalJuncao;
    };

    const handleReducaoTuplas = (comandoSql, juncao) => {
        let stringAlgebraRelacionalReducaoTuplas = "";

        const whereString = comandoSql.match(whereRegex)[1];

        const stringSemWhere = removeUnmatchedParentheses(juncao.replace(/\([^()]*\(/, "("));
        const arrTabelasUsadasNoWhere = extractTablesFromWhereClause(whereString);
        console.log("Tabelas usadas no WHERE: ", "\n", arrTabelasUsadasNoWhere);

        stringAlgebraRelacionalReducaoTuplas = stringSemWhere;
        arrTabelasUsadasNoWhere.forEach(arrInfo => {
            const tabela = arrInfo[0];
            const restricaoTabela = arrInfo[1];
            const regex = new RegExp(`\\b${tabela}\\b(?=\\s*\\|X\\|)|\\b${tabela}\\b(?=\\s*\\))`, "gi");
            let stringSubstituta = `(${restricaoTabela}(${tabela}))`;

            stringAlgebraRelacionalReducaoTuplas = stringAlgebraRelacionalReducaoTuplas.replace(regex, stringSubstituta);
        });

        console.log("Heuristica Juncao sem clausula WHERE: ", "\n", stringSemWhere);

        console.log("Heuristica Redução Tuplas: ", "\n", stringAlgebraRelacionalReducaoTuplas);
        console.log("");

        return stringAlgebraRelacionalReducaoTuplas;
    };

    const handleReducaoCampos = (comandoSql, reducaoTuplas) => {
        let stringAlgebraRelacionalReducaoCampos = reducaoTuplas;

        const selectString = comandoSql.match(selectRegex)[1];
        const fromString = comandoSql.match(fromRegex)[1];

        const camposSelect = selectString.split(",");
        console.log("Campos usados no SELECT: ", "\n", camposSelect);

        const camposFromJoin = getCamposFromJoin(fromString);
        console.log("Campos do(s) JOIN(s): ", "\n", camposFromJoin);

        const todosCampos = mapearCampos(juntaArrays(camposSelect, camposFromJoin));
        console.log("Todos os campos mapeados: ", "\n", todosCampos);

        const quantidadeTabelasMapear = Object.keys(todosCampos).length;
        const arrTabelasMapear = Object.keys(todosCampos);
        const arrObjetosMapear = Object.values(todosCampos);
        for (let i = 0; i < quantidadeTabelasMapear; i++) {
            const tabela = arrTabelasMapear[i];
            const expressaoSubstituir = extrairExpressao(reducaoTuplas, tabela);
            console.log("Expressao a substituir: ", "\n", expressaoSubstituir);

            const stringCamposColocar = `π ${arrObjetosMapear[i].join(", ")}`;
            if (expressaoSubstituir === tabela) {
                const stringSubstituta = `(${stringCamposColocar}(${expressaoSubstituir}))`;
                const regex = new RegExp(`\\b${expressaoSubstituir}\\b(?=\\s*\\))|\\b${expressaoSubstituir}\\b(?=\\s*\\|X\\|)`, "gi");

                stringAlgebraRelacionalReducaoCampos = stringAlgebraRelacionalReducaoCampos.replace(regex, stringSubstituta);
            } else {
                const stringSubstituta = `${stringCamposColocar}(${expressaoSubstituir})`;
                const regex = new RegExp(expressaoSubstituir.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"), "gi");

                stringAlgebraRelacionalReducaoCampos = stringAlgebraRelacionalReducaoCampos.replace(regex, stringSubstituta);
            }
        }

        console.log("Heuristica Redução Campos: ", "\n", stringAlgebraRelacionalReducaoCampos);
        console.log("");

        return stringAlgebraRelacionalReducaoCampos;
    };

    const handleTransiplateSqlCommand = () => {
        const juncao = handleHeuristicaJuncao(sqlCommand);
        const reducaoTuplas = handleReducaoTuplas(sqlCommand, juncao);
        const reducaoCampos = handleReducaoCampos(sqlCommand, reducaoTuplas);
        setStringJuncao(juncao);
        setStringReducaoTuplas(reducaoTuplas);
        setStringReducaoCampos(reducaoCampos);

        setStringAlgebraRelacional(reducaoCampos);
        return setSqlCommandParsed(reducaoCampos);
    };

    return (
        <Grid container spacing={2}>
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
                <Button id="button-transpilate-sql" variant="contained" disabled={!isSqlCommandaValid || isValueChanged} onClick={handleTransiplateSqlCommand}>
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
                    multiline
                    rows={5}
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
                    multiline
                    rows={5}
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
                    multiline
                    rows={5}
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
