'use strict';
import "isomorphic-fetch";
import {
    window as vswindow,
    commands,
    ExtensionContext,
    Range,
    QuickPickItem,
    Selection,
} from "vscode";
import { Observable } from "rxjs/Observable";
import { pipe } from "rxjs/Rx";
import { from } from "rxjs/observable/from";
import { filter, map, mergeMap } from "rxjs/operators";
import { Translator, TranslatorResult } from "./translator-vsc";

export function activate(context: ExtensionContext) {
    const disposable = commands.registerCommand('extension.translateForMultipleLangs', () => {

        const translator = new Translator();
        const editor = vswindow.activeTextEditor;
        if (!editor) {
            vswindow.showInformationMessage('Open a file first to manipulate text selections');
            return;
        }
        const selections = editor.selections;
        const range = new Range(selections[0].start, selections[selections.length - 1].end);
        const text = editor.document.getText(range) || ""
        
        const optionsT = translator.get(text)
        
        vswindow.showQuickPick(optionsT.map(e => e.quickPickItem), {
            
            matchOnDescription: true,
            placeHolder: "Select the word or sentence you want to change"

        }).then((item: QuickPickItem) => {
            translator.translate(text, optionsT.find(e => e.quickPickItem.label == item.label).lang).subscribe((vs: TranslatorResult) => {
                item && editor.edit(edit => edit.replace(range, vs.translatedText));
            })
        });
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}