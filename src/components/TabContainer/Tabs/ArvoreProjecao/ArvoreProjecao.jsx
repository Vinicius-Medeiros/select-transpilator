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
        height: "75vh",
        justifyContet: "center",
        alignItems: "center",
    };

    return (
        <div style={containerStyles}>
            {treeData && (
                <Tree
                    style={containerStyles}
                    data={treeData}
                    orientation="vertical"
                    translate={{ x: 899.525, y: 91.8946 }}
                    transitionDuration={500}
                    centeringTransitionDuration={800}
                    zoom={0.75}
                    separation={{
                        siblings: 7,
                        nonSiblings: 7,
                    }}
                />
            )}
        </div>
    );
};

export default ArvoreProjecao;
