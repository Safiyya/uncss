

let input = `
________________________________________________
|
|   PurifyCSS - Rejected selectors:  
|   .useless1
|	.useless2
|	.useless3
|
________________________________________________

SOME USELESS INFO HERE
`;

function getCssRules(str){
    if(!str || str===undefined) return []
    let lines = str.split('|');
    let result = []
    for(let i=0; i<lines.length; i++){
        let line = lines[i].replace("|","").trim();
        if(line.includes("PurifyCSS - Rejected selectors:")) continue;
        if(line.startsWith("_")) continue;
        if(line === "") continue;
		result.push(line)
    }
   return result
}


exports.getCss = getCssRules;