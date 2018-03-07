const _ = require("lodash")

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

function getDifference(allRules, validRules){
    let comparer = (value, other) => { return value.selectors[0]=== other.selectors[0]}
    return _.differenceWith(allRules, validRules, comparer)            
}


exports.getCss = getCssRules;
exports.getDifference = getDifference;