import type {Official,Workspace} from "@/lib/persal/server";
export const permissions:Record<string,Workspace[]>={
 "utilities":["executive","management","personnel","finance","ict_bit","innovation","communications"],
 "human-resource-planning":["executive","management","personnel"],
 "personnel-administration":["personnel","executive"],
 "salary-administration":["finance"],
 "supporting-sub-systems":["personnel","management","executive"],
 "management-information":["executive","management","personnel","finance"],
 "back-office":["executive","personnel","ict_bit","innovation","communications"]
};
export function permittedWorkspaces(official:Official,module:string):Workspace[]{
 const eligible=permissions[module]||[];
 return official.workspaces.filter(w=>eligible.includes(w));
}
export function canUseModule(official:Official,module:string){return permittedWorkspaces(official,module).length>0;}
export function caseWorkspace(official:Official,module:string):Workspace|null{
 return permittedWorkspaces(official,module).includes(official.primary)?official.primary:permittedWorkspaces(official,module)[0]||null;
}
export const sensitiveModule=(module:string)=>module==="salary-administration";
