
//////////////////////////////////////////////////////////////////
// ! vnode 虚拟dom对象
// ！node 真实dom对象

import { TEXT } from "./const.js";
import React from './index.js'
import { useEffect,useState } from "react";
function render (vnode, container) {
 
  //vnode --> node
  const node = createNode(vnode);
  //再把node插入container
  console.log('最终插入node', node);
  container.appendChild(node);
  console.log("render-vnode", vnode, container);
}

//创建node
function createNode(vnode) {
  console.log('vvnode',vnode);
  
  // if(vnode == null) return node
  const {type, props} = vnode;
  console.log(typeof type);
  let node = null;
  if(type === TEXT) {
    node = document.createTextNode("");
  }else if(typeof type === 'string') {
    console.log('类组件class7',type,node);
    node = document.createElement(type)
    console.log('类组件class8',node);
  }else if(typeof type === 'function') {
    //判断是函数组件还是类组件
    console.log('typeof type === function');
    node = type.prototype.isReactComponent ? updateClassComponent(vnode) : updateFunctionComponent(vnode);
    return node
  }

  //遍历props.children,转化为真实dom节点,再插入node
  console.log('类组件class9',props.children, node );
   reconclieChildren(props.children, node);
   console.log('类组件class19',props.children, node );
 //更新属性值,如className,nodeValue
 updateNode(node, props);
 console.log('类组件class13',node );
  return node
}
// !源码中的children可以是单个对象或者数组,这里统一处理成了数组,实现的createElement参数中的...children
function reconclieChildren(children, node) {
  for(let i = 0; i < children.length; i++) {
    let child = children[i];
    if(Array.isArray(child)){
      for(let j = 0; j < child.length; j++) {
        render(child[j], node);
      }
    }else {
      console.log('类组件class10',child);
      if(typeof child !== 'object') {
        
        console.log('插入',typeof child,React.createTextNode(child), node);
        render(React.createTextNode(child), node);
      }else {
        console.log('插入',child, node);
        render(child, node);
      }
      // children.map(child => typeof child === 'object' ? child : React.createTextNode(child))
      console.log('类组件class11', node);
      
    }
    
  }
}
//更新属性值,如className,nodeValue
function updateNode(node, nextVal) {
  Object.keys(nextVal)
    .filter(k => k !== 'children')
    .forEach(item => { 
      if(item.slice(0, 2) === 'on') {
        let eventName = item.slice(2).toLowerCase();
        node.addEventListener(eventName, nextVal[item])
      }else {
        console.log(node,nextVal);
        node[item] = nextVal[item]
      }
    })
}
//类组件
function updateClassComponent(vnode) {
 
  console.log('类组件class2');
 const {type, props} = vnode;
 console.log('类组件class5',vnode.type);
 let cmp = new type(props);
 console.log('类组件class6',cmp);
 console.log(cmp.constructor);
 const vvnode = cmp.render();
//  const vvnode = React.createElement(cmp.constructor, cmp.props);
 console.log('类组件class3',vvnode);
//  if(vvnode.props.children) {
//   console.log('jru', vvnode.props.children);
//   // vvnode.props.children.map(child => typeof child === 'object' ? child : React.createTextNode(child))
//   // vvnode.props.children.map(child => child+'1')
//   // Object.defineProperty(props,'')

//   console.log('jru', vvnode.props.children);
// }

 const node = createNode(vvnode);
 console.log('类组件class4',node);
 return node
}
//函数组件
function updateFunctionComponent(vnode) {
  const {type, props} = vnode;
  let vvnode = type(props);
  console.log(vvnode);
  const node = createNode(vvnode);
  console.log('updateFunctionComponent',node);
  return node    
}
function createRoot(container) {
  return {
    render:(jsx)=>{render(jsx,container)}
  }
}
export default {
    render
   
};

