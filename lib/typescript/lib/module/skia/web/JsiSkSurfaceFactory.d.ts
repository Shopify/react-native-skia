export class JsiSkSurfaceFactory extends Host {
    Make(width: any, height: any): JsiSkSurface;
    MakeOffscreen(width: any, height: any): JsiSkSurface | null;
}
import { Host } from "./Host";
import { JsiSkSurface } from "./JsiSkSurface";
