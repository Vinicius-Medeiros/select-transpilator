export const mapearCampos = array => {
    const result = {};

    array.forEach(item => {
        const [key, subKey] = item.trim().split(".");

        if (!result[key]) {
            result[key] = [];
        }

        result[key].push(subKey);
    });

    return result;
};

export const juntaArrays = (arr1, arr2) => {
    const mergedArray = [...arr1];

    arr2.forEach(item => {
        if (!arr1.includes(item.trim())) {
            mergedArray.push(item.trim());
        }
    });

    return mergedArray;
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
