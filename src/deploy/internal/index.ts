import { type IPlugin } from "../../plugins";
import { default as ContextPlugin } from "./Context";
import { default as LockPlugin } from "./Lock";

const internalPlugins: IPlugin[] = [ContextPlugin, LockPlugin];

export default internalPlugins;
