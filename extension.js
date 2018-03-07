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

            var activeEditor = vscode.window.activeTextEditor;

            if (activeEditor.document.languageId !== "css") return;

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
                    let cssContent = vscode.window.activeTextEditor.document.getText();
                    let allRules = cssParser.parse(cssContent).stylesheet.rules;
                    return parser.getDifference(allRules, validRules);
                })
                .then(rules => {
                    let decorations = vscode.window.createTextEditorDecorationType({
                        isWholeLine: true,
                        light: {
                            textDecoration: "line-through"
                        },
                        dark: {
                            textDecoration: "line-through"
                        }
                    })

                    let ranges = rules
                                    .map(r => {
                                        return { startLine: r.position.start.line,endLine: r.position.end.line }
                                    })
                                    .map(pos => new vscode.Range(pos.startLine-1, 0, pos.endLine-1, 0))

                    activeEditor.setDecorations(decorations, ranges);
                })
        })
    }
    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
    watcher.dispose();
}
exports.deactivate = deactivate;
