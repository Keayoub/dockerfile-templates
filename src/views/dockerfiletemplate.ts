import * as vscode from 'vscode';

export class DockerFileTemplate {
	tree:any = {};
	constructor(context: vscode.ExtensionContext, templates: string[]) {
		this.setupFixView(context,templates);
		}

	async setupFixView(context: vscode.ExtensionContext, templates: string[]){
		templates.forEach((template : string) => {
			this.tree[template] = {};
			this.tree[template][`Install ${template}`] = false;
		});
		const view = vscode.window.createTreeView('dockerfiletemplate', { treeDataProvider: this.aNodeWithIdTreeDataProvider(), showCollapseAll: true });
		view.message = "Liste des fix qui peuvent être utilisé :"
		context.subscriptions.push(view);
	}

	aNodeWithIdTreeDataProvider(): vscode.TreeDataProvider<{ key: string }> {
		return {
			getChildren: (element: { key: string }): { key: string }[] => {
				// @ts-ignore
				return this.getChildren(element ? element.key : undefined).map(key => this.getNode(key));
			},
			getTreeItem: (element: { key: string }): vscode.TreeItem => {
				const treeItem = this.getTreeItem(element.key);
				treeItem.id = element.key;
				return treeItem;
			},
			getParent: ({ key }: { key: string }): { key: string } => {
				const parentKey = key;
				return new Key(parentKey);
			}
		};
	}
	
	getChildren(key: string): string[] {
		if (!key) {
			return Object.keys(this.tree);
		}
		const treeElement = this.getTreeElement(key);
		if (treeElement) {
			return Object.keys(treeElement);
		}
		return [];
	}
	
	getTreeItem(key: string): vscode.TreeItem {
		const treeElement = this.getTreeElement(key);
		// An example of how to use codicons in a MarkdownString in a tree item tooltip.
		const tooltip = new vscode.MarkdownString(`$(zap) Tooltip for ${key}`, true);
		return {
			label: /**vscode.TreeItemLabel**/<any>{ label: key },
			tooltip,
			collapsibleState: treeElement && Object.keys(treeElement).length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
		};
	}
	
	getTreeElement(element:any): any {
		return this.tree[element];
	}
	
	 getNode(key: string): { key: string } {
		if (!nodes[key]) {
			nodes[key] = new Key(key);
		}
		return nodes[key];
	}
	

}
const nodes:any = {};
class Key {
	constructor(readonly key: string) { }
}