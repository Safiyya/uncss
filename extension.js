// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const purifycss = require("purify-css");
const cssParser = require('css')
const path = require("path");
const parser = require("./parser")
const _ = require("lodash")

let watcher;

function getFileNameWithoutExtension(path) {

    let parts = path.split('.');
    parts.pop();
    if (parts.length > 1) {
        if (parts[parts.length - 1] === 'spec') {
            parts.pop();
        }
    }
    return parts.join('.');
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {


    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "uncss" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.highlight', function () {
        trigger();
    });

    function trigger() {
        // The code you place here will be executed every time your command is executed
        let EXCLUSION = '{**/node_modules/**,**/coverage/**}';
        let LIMIT = 100;

        watcher = vscode.workspace.createFileSystemWatcher('{**/app/**/*.css,**/app/**/*.html,**/app/**/*.ts}');

        watcher.onDidChange(uri => {
            var currentFile = vscode.workspace.asRelativePath(uri.path);
            let currentFolder = path.dirname(uri.path);
            let fileNameWithoutExtension = getFileNameWithoutExtension(currentFile);
            vscode.workspace.findFiles(`${fileNameWithoutExtension}.*`, EXCLUSION, LIMIT)
                .then(uris => {
                let content = uris.filter(uri => [".html", ".ts", ".js"].includes(path.extname(uri.path)))
                let style = uris.filter(uri => [".css", ".scss", ".sass"].includes(path.extname(uri.path)))
                return { content: content.map(u => u.path), css: style.map(u => u.path) }

                })
                .then(({ content, css }) => {
                    let validRules = purifycss(content, css)
                    return cssParser.parse(validRules).stylesheet.rules;
                })
                .then(validRules => {
                    if (vscode.window.activeTextEditor.document.languageId === "css") {
                        let css = vscode.window.activeTextEditor.document.getText();
                        let allRules = cssParser.parse(css).stylesheet.rules;

                        return   parser.getDifference(allRules, validRules);
                    }
                })
        })
    }

    function extractCssRules(str) {
        console.log(str)
    }
    // function updateDecorations() {

    //     if (!activeEditor || !activeEditor.document) {
    //         return;
    //     }

    //     var text = activeEditor.document.getText();
    //     var mathes = {}, match;
    //     while (match = pattern.exec(text)) {
    //         var startPos = activeEditor.document.positionAt(match.index);
    //         var endPos = activeEditor.document.positionAt(match.index + match[0].length);
    //         var decoration = {
    //             range: new vscode.Range(startPos, endPos)
    //         };

    //         var matchedValue = match[0];
    //         if (!isCaseSensitive) {
    //             matchedValue = matchedValue.toUpperCase();
    //         }

    //         if (mathes[matchedValue]) {
    //             mathes[matchedValue].push(decoration);
    //         } else {
    //             mathes[matchedValue] = [decoration];
    //         }

    //         if (keywordsPattern.trim() && !decorationTypes[matchedValue]) {
    //             decorationTypes[matchedValue] = window.createTextEditorDecorationType(styleForRegExp);
    //         }
    //     }

    //     Object.keys(decorationTypes).forEach((v) => {
    //         if (!isCaseSensitive) {
    //             v = v.toUpperCase();
    //         }
    //         var rangeOption = settings.get('isEnable') && mathes[v] ? mathes[v] : [];
    //         var decorationType = decorationTypes[v];
    //         activeEditor.setDecorations(decorationType, rangeOption);
    //     })
    // }

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
    watcher.dispose();
}
exports.deactivate = deactivate;
