import React from "react";
import Tree from "react-d3-tree";
import useTranspiladorContext from "../../../../hooks/useTranspiladorContext";
import { parseToTreeStructure } from "../../../../utils/functions";

const ArvoreProjecao = () => {
    const { stringAlgebraRelacional } = useTranspiladorContext();

    const [treeData, setTreeData] = React.useState(null);

    React.useEffect(() => {
        const parsedTree = parseToTreeStructure(stringAlgebraRelacional);
        setTreeData(parsedTree);
    }, [stringAlgebraRelacional]);

    const containerStyles = {
        width: "100%",
        height: '100vh',
        marginTop: '20px'
    };

    return (
        <div style={containerStyles}>
            {treeData && (
                <Tree 
                    style={containerStyles} 
                    data={treeData} 
                    orientation="vertical"
                    separation={{
                        siblings: 7,
                        nonSiblings: 7
                    }} 
                />
            )}
        </div>
    );
};

export default ArvoreProjecao;
