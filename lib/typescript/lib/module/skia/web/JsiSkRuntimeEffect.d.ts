export class JsiSkRuntimeEffect extends HostObject {
    sksl: any;
    source(): any;
    makeShader(uniforms: any, localMatrix: any): JsiSkShader;
    makeShaderWithChildren(uniforms: any, children: any, localMatrix: any): JsiSkShader;
    getUniform(index: any): any;
    getUniformCount(): any;
    getUniformFloatCount(): any;
    getUniformName(index: any): any;
}
import { HostObject } from "./Host";
import { JsiSkShader } from "./JsiSkShader";
