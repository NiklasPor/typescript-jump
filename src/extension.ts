import * as vscode from "vscode";

const command = vscode.commands.registerCommand;

async function navigate(
  original: string | RegExp,
  target: string
): Promise<boolean> {
  const currentPath = vscode.window.activeTextEditor!.document.fileName;
  const targetPath = currentPath.replace(original, target);

  try {
    const document = await vscode.workspace.openTextDocument(targetPath);
    await vscode.window.showTextDocument(document);

    return true;
  } catch (e) {
    console.log(e);

    return false;
  }
}

async function navigateWithFallback(
  original: string | RegExp,
  ...targets: string[]
): Promise<boolean> {
  return targets.some(async target => await navigate(original, target));
}

export function activate(context: vscode.ExtensionContext) {
  const regex = {
    ngrx: /\.[^\.\/]*\.ts/,
    component: /\.component\.(html|ts|css|scss)/,
    test: /\.(spec|mock)\.ts/
  };

  [
    // Typescript:
    command("extension.jump.test", () => navigate(".ts", ".spec.ts")),
    command("extension.jump.implementation", () => navigate(regex.test, ".ts")),

    //Angular:
    command("extension.jump.logic", () =>
      navigate(regex.component, ".component.ts")
    ),
    command("extension.jump.style", () =>
      navigateWithFallback(regex.component, ".component.scss", ".component.css")
    ),
    command("extension.jump.template", () =>
      navigate(regex.component, ".component.html")
    ),

    // NgRx:
    command("extension.jump.actions", () =>
      navigate(regex.ngrx, ".actions.ts")
    ),
    command("extension.jump.effects", () =>
      navigate(regex.ngrx, ".effects.ts")
    ),
    command("extension.jump.reducer", () =>
      navigate(regex.ngrx, ".reducer.ts")
    ),
    command("extension.jump.selectors", () =>
      navigate(regex.ngrx, ".selectors.ts")
    ),
    command("extension.jump.facade", () => navigate(regex.ngrx, ".facade.ts"))
  ].forEach(disposable => {
    context.subscriptions.push(disposable);
  });
}

export function deactivate() {}
