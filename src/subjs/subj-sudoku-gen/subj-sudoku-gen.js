import * as math from "mathjs";
import * as algorithm from "./algorithm";
import * as color from "./color";

// 1)
let mat = algorithm.init();
document.getElementById("li-1").appendChild(gen9x9Table(mat, color.first));

// 2)
algorithm.ltrb(mat);
document.getElementById("li-2").appendChild(gen9x9Table(mat, color.second));

// 3)
algorithm.corners(mat);
document.getElementById("li-3").appendChild(gen9x9Table(mat, color.third));

// 4)
algorithm.hide(mat);
document.getElementById("li-4").appendChild(gen9x9Table(mat, color.forth));

/**
 * 
 * @param {math.Matrix} mat 
 */
function gen9x9Table(mat, color) {
    const table = document.createElement("table");
    for (let i = 0; i < 9; i++) {
        const tr = document.createElement("tr");
        for (let j = 0; j < 9; j++) {
            const td = document.createElement("td");
            td.style.border = "1px solid black";
            td.style.width = td.style.height = "30px";
            td.style.textAlign = "center";
            td.style.color = color[i][j];
            let num = mat.get([i, j]);
            if (num > 0)
                td.append(num);
            tr.appendChild(td);
        }
        table.append(tr);
    }
    return table;
}

