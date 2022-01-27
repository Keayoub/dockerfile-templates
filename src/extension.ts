import * as vscode from 'vscode';
import * as fs from 'fs';
import { normalize } from "path";
import { DockerFileTemplate } from './views/dockerfiletemplate';

export function getTemplates(templatePath: fs.PathLike): Array<Array<string>> {
	const files = fs.readdirSync(templatePath);
	const templates: Array<string> = [];
	files.filter(e => e.includes(".dockerignore") ? false : true).forEach(file => {
		templates.push(file.substr(0,file.length - 11)); // to remove ".dockerfile"
	});
	return [templates, files];
}

export function createDockerFile(templatePath: String, workspaceFolder: String): Boolean {
	try {
		const data = fs.readFileSync(normalize(`${__dirname}/${templatePath}`));
	  fs.writeFileSync(`${workspaceFolder}/Dockerfile`, data);
	} catch (error:any) {
		throw new Error(error);
	}
	return true;
}

export function createIgnoreDockerFile(templatePath: String, workspaceFolder: String): Boolean {
	try {
		const data = fs.readFileSync(normalize(`${__dirname}/${templatePath}`));
		fs.writeFileSync(`${workspaceFolder}/.dockerignore`, data);
	} catch (error:any) {
		throw new Error(error);
	}
	return true;
}

interface TemplateFile {
	name:string;
	path:string;
	ignoreFilePath?:string;
}
export interface Template {
	name:string;
	installs:TemplateFile[]
}

export function activate(context: vscode.ExtensionContext) {
	const templates:Template[] = require("../templates.json")
	new DockerFileTemplate(context,templates);
	registerCommands(context,templates);

}

function findInstallObjFromName(name:string,templates:Template[]):TemplateFile | undefined {
	for (let templateIndex = 0; templateIndex < templates.length; templateIndex++) {
		const template = templates[templateIndex];
		if(name.includes(template.name)){
			for (let index = 0; index < template.installs.length; index++) {
				const install = template.installs[index];
				if(install.name === name){
					return install;
				}
			}
			throw new Error(`Can't find ${name} inside ${template.name}`);
		}
	}
	throw new Error("Can't find "+name);
}

function registerCommands(context:vscode.ExtensionContext, templates:Template[]){
	let disposable = vscode.commands.registerCommand('dockerfiletemplate.generatedockerfile', () => {
		const { workspace: { workspaceFolders } } = vscode;
		const workspaceFolder = workspaceFolders ? workspaceFolders[0].uri.fsPath : null;
		if(workspaceFolder){
			const templatesNames:string[] = []
			templates.forEach(template => {
				template.installs.forEach(install => {
					templatesNames.push(install.name)
				});
			});
			vscode.window.showQuickPick(templatesNames).then(option => {
				if (!option) {return;}
				const templateFile = findInstallObjFromName(option,templates)
				if(templateFile){
					createDockerFile(templateFile.path, workspaceFolder);
					if (templateFile.ignoreFilePath) {
						vscode.window.showInformationMessage("A .dockerignore file exist for this template , do you want to use it ?", "yes", "no").then(response => {		
						if (response === "yes") {createIgnoreDockerFile(templateFile.ignoreFilePath as string, workspaceFolder);}
						});
					}
				}
			});
		}
		else {
			vscode.window.showInformationMessage("workspaceFolder not found");
		}
	});
	context.subscriptions.push(disposable);
}


export function deactivate() { }
