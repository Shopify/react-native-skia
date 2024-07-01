import * as path from "path";

import { Node, Project, SyntaxKind } from "ts-morph";

// Define the path to the WebGPU type declaration file
const tsConfigFilePath = path.resolve(__dirname, "../package/tsconfig.json");
const filePath = path.resolve(
  __dirname,
  "../package/src/renderer/HostComponents.ts",
);
const project = new Project({
  tsConfigFilePath,
});

const sourceFile = project.addSourceFileAtPath(filePath);

const decl = sourceFile.getDescendantsOfKind(SyntaxKind.InterfaceDeclaration).filter(node => node.getName() === "IntrinsicElements")[0];
decl.getProperties().forEach(prop => {
    const nodeType = prop.getName().substring(2);
    console.log(`${nodeType}Props,`);
});
// decl.getProperties().forEach(prop => {
//     const nodeType = prop.getName().substring(2);
//     console.log(`[NodeType.${nodeType}]: ${nodeType}Props;`);
// });
// decl.getProperties().forEach(prop => {
//     const nodeType = prop.getName().substring(2);
//     console.log(`case NodeType.${nodeType}:
//       render${nodeType}(ctx, materializedProps);
//       break;`);
// });

// console.log(sourceFile.getDescendantsOfKind(SyntaxKind.InterfaceDeclaration).map(node => {
//     // node.getName()
//     return node.getText();
// }));
//console.log(sourceFile.getInterface("IntrinsicElements")!.getText());
//console.log(sourceFile.getModule("global")!.getText());