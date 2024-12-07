import{j as e}from"./ui-DHvs7Rtw.js";import{r}from"./vendor-BqKlwGYI.js";import{G as L,B as l,y as k,I as p,z}from"./index-BZikNEYv.js";import{D as f,i as C,f as N,g as v,h as b,T as F,a as I,b as y,c as d,d as B,e as c}from"./dialog-DEPPmxRr.js";import{L as m}from"./label-CGDRo2T5.js";import{T}from"./textarea-BGYsLcLq.js";import{S as H}from"./square-pen-DI8ReuSK.js";import{T as R}from"./trash-2-CroxI1IH.js";import"./utils-DdJn5tvr.js";const G=[{id:"1",name:"Pour Elle",description:"Parfums pour femmes",productCount:12},{id:"2",name:"Pour Lui",description:"Parfums pour hommes",productCount:8},{id:"3",name:"Unisexe",description:"Parfums mixtes",productCount:5}];function Y(){const[u,w]=r.useState(""),[t,h]=r.useState(G),[a,x]=r.useState({name:"",description:""}),[i,o]=r.useState(null),[D,j]=r.useState(!1),[S,g]=r.useState(!1),A=t.filter(s=>s.name.toLowerCase().includes(u.toLowerCase())),E=()=>{const s={id:(t.length+1).toString(),name:a.name,description:a.description,productCount:0};h([...t,s]),x({name:"",description:""}),j(!1)},P=()=>{i&&(h(t.map(s=>s.id===i.id?i:s)),o(null),g(!1))},O=s=>{h(t.filter(n=>n.id!==s))};return e.jsxs("div",{className:"flex h-screen",children:[e.jsx(L,{}),e.jsxs("div",{className:"flex-1 p-8 overflow-auto",children:[e.jsxs("div",{className:"flex justify-between items-center mb-8",children:[e.jsxs("div",{children:[e.jsx("h1",{className:"text-2xl font-bold",children:"Catégories"}),e.jsx("p",{className:"text-muted-foreground",children:"Gérez les catégories de vos produits"})]}),e.jsxs(f,{open:D,onOpenChange:j,children:[e.jsx(C,{asChild:!0,children:e.jsxs(l,{children:[e.jsx(k,{className:"mr-2 h-4 w-4"}),"Ajouter une catégorie"]})}),e.jsxs(N,{children:[e.jsx(v,{children:e.jsx(b,{children:"Ajouter une catégorie"})}),e.jsxs("div",{className:"space-y-4 py-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(m,{htmlFor:"name",children:"Nom"}),e.jsx(p,{id:"name",value:a.name,onChange:s=>x({...a,name:s.target.value})})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(m,{htmlFor:"description",children:"Description"}),e.jsx(T,{id:"description",value:a.description,onChange:s=>x({...a,description:s.target.value})})]}),e.jsx(l,{className:"w-full",onClick:E,disabled:!a.name||!a.description,children:"Ajouter"})]})]})]})]}),e.jsx("div",{className:"mb-6",children:e.jsxs("div",{className:"relative",children:[e.jsx(z,{className:"absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"}),e.jsx(p,{placeholder:"Rechercher une catégorie...",value:u,onChange:s=>w(s.target.value),className:"pl-10"})]})}),e.jsx("div",{className:"bg-white rounded-lg border",children:e.jsxs(F,{children:[e.jsx(I,{children:e.jsxs(y,{children:[e.jsx(d,{children:"Nom"}),e.jsx(d,{children:"Description"}),e.jsx(d,{children:"Produits"}),e.jsx(d,{className:"text-right",children:"Actions"})]})}),e.jsx(B,{children:A.map(s=>e.jsxs(y,{children:[e.jsx(c,{className:"font-medium",children:s.name}),e.jsx(c,{children:s.description}),e.jsxs(c,{children:[s.productCount," produits"]}),e.jsxs(c,{className:"text-right",children:[e.jsxs(f,{open:S,onOpenChange:g,children:[e.jsx(C,{asChild:!0,children:e.jsx(l,{variant:"ghost",size:"icon",onClick:()=>o(s),children:e.jsx(H,{className:"h-4 w-4"})})}),i&&e.jsxs(N,{children:[e.jsx(v,{children:e.jsx(b,{children:"Modifier la catégorie"})}),e.jsxs("div",{className:"space-y-4 py-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(m,{htmlFor:"edit-name",children:"Nom"}),e.jsx(p,{id:"edit-name",value:i.name,onChange:n=>o({...i,name:n.target.value})})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(m,{htmlFor:"edit-description",children:"Description"}),e.jsx(T,{id:"edit-description",value:i.description,onChange:n=>o({...i,description:n.target.value})})]}),e.jsx(l,{className:"w-full",onClick:P,disabled:!i.name||!i.description,children:"Enregistrer"})]})]})]}),e.jsx(l,{variant:"ghost",size:"icon",className:"text-red-600",onClick:()=>O(s.id),children:e.jsx(R,{className:"h-4 w-4"})})]})]},s.id))})]})})]})]})}export{Y as default};
//# sourceMappingURL=Categories-HipOAkj0.js.map
