// ! vnode 虚拟dom对象
// ！node 真实dom对象


/**
 * fiber架构
 * type:标记类型
 * key:标记当前层级下的唯一性
 * child:第一个子元素 fiber
 * sibling:下一个兄弟元素 fiber
 * return:父fiber
 * node:真实DOM节点 
 * props:属性值
 * base: 上次的节点 fiber
 * effectTag:标记要执行的操作类型(删除、插入、更新)
 */
import { TEXT, PLACEMENT, UPDATE, DELETION } from "./const.js";
import React from './index.js'

//下一个单元任务 fiber
let nextUnitOfWork = null;
//wprk in progress fiber root(正在运行的根fiber)
let wipRoot = null;

//当前的根节点
let currentRoot = null;

//wprk in progress fiber (正在运行的fiber)
let wipFiber = null;


let deletions = null;

function render (vnode, container) {
 
  // //vnode --> node
  // const node = createNode(vnode);
  // //再把node插入container
  // console.log('最终插入node', node);
  // container.appendChild(node);
  // console.log("render-vnode", vnode, container);
console.log('可能的',[vnode]);
  //初始值
  //workLoop要启动,nextUnitOfWork不能为null,而它的初始值为null
  wipRoot = {
    node: container,
    props: {
      children: [vnode],
    }
  };
  //所以将wipRoot正在执行的根fiber赋值给nexUnitOfWork,workLoop启动
  nextUnitOfWork = wipRoot;
  //要删除的fiber节点push进deletions,提交时遍历删除
  deletions = [];
}

//创建node
function createNode(vnode) {
  console.log('vvnode',vnode);
  
  
  const {type, props} = vnode;
 
  console.log(typeof type);
  let node = null;
  if(type === TEXT) {
    node = document.createTextNode("");
  }else if(typeof type === 'string') {
    // console.log('类组件class7',type,node);
    node = document.createElement(type)
    // console.log('类组件class8',node);
  }
  //走updateHostComponent的都是原生标签了,两种,文本节点\元素节点,
  //而函数组件通过return的vnode转变为原生标签,然后也走updateHostComponent
 //所以这里不需要判断typeof type === 'function'

  // else if(typeof type === 'function') {
  //   //判断是函数组件还是类组件
  //   console.log('类组件class1',vnode);
  //   node = type.prototype.isReactComponent ? updateClassComponent(vnode) : updateFunctionComponent(vnode);
  //   return node
  // }

  //遍历props.children,转化为真实dom节点,再插入node
  // console.log('类组件class9',props.children, node );
  //  reconclieChildren(props.children, node);
  //  console.log('类组件class19',props.children, node );

 //更新属性值,如className,nodeValue
 
 updateNode(node,{}, props);
 
  return node
}
// !源码中的children可以是单个对象或者数组,这里统一处理成了数组,实现的createElement参数中的...children
function reconclieChildren_old(children, node) {
  for(let i = 0; i < children.length; i++) {
    let child = children[i];
    if(Array.isArray(child)){
      for(let j = 0; j < child.length; j++) {
        render(child[j], node);
      }
    }else {
      console.log('类组件class10',child);
      if(typeof child !== 'object') {
        console.log('类组件class12',React.createTextNode(child));
        console.log('插入',React.createTextNode(child), node);
        render(React.createTextNode(child), node);
      }else {
        console.log('插入',child, node);
        render(child, node);
      }
      
    }
    
  }
}
//更新属性值,如className,nodeValue
function updateNode(node,prevVal, nextVal) {
  //如果preVal,nextVal里有相同的属性值,不用额外操作
  //如果preVal有,nextVal没有,需要遍历preVal执行删除操作
  //如果preVal没有,nextVal里有,不用额外操作
  Object.keys(prevVal)
    .filter(k => k !== 'children')
    .forEach(item => { 
      //源码的合成事件,用到了事件代理,这里简单粗暴处理下先
      if(item.slice(0, 2) === 'on') {
        let eventName = item.slice(2).toLowerCase();
        node.removeEventListener(eventName, prevVal[item])
      }else {
        if(!(item in nextVal)) {
          node[item] = ''
        }

      }
      
    })


  console.log(nextVal);
  Object.keys(nextVal)
    .filter(k => k !== 'children')
    .forEach(item => { 
      //源码的合成事件,用到了事件代理,这里简单粗暴处理下先
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
function updateClassComponent(fiber) {
  
  const {type, props} = fiber;
  const cmp = new type(props);

  const vvnode = cmp.render();
  console.log(vvnode);
  const children = [vvnode]
  reconclieChildren(fiber, children)
}
// function updateClassComponent(vnode) {
 
//   // console.log('类组件class2');
//  const {type, props} = vnode;
// //  console.log('类组件class5',vnode.type);

//  let cmp = new type(props);
// //  console.log('类组件class6',cmp);
// //  console.log(cmp.constructor);
//  const vvnode = cmp.render();



//  const node = createNode(vvnode);
// //  console.log('类组件class4',node);
//  return node
// }
//函数组件
function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  wipFiber.hooks = [];
  wipFiber.hookIndex = 0;

  console.log('updateFunctionComponent',fiber);
  const {type, props} = fiber;
  const children = [type(props)];
  console.log('updateFunctionComponent',children);
  reconclieChildren(fiber, children)   
  console.log(fiber);
}


//workInProgressFiber Fiber ->child ->sibling
//children 数组
//源码中初次渲染和更新fiber是分开的,这里简单实现都放在reconclieChildren中
function reconclieChildren(workInProgressFiber, children) {
  //构建fiber架构
  //记录上一个兄弟节点,把当前newFiber设置为上一个兄弟节点的sibling
  console.log('reconclieChildren',workInProgressFiber, children);
  let prevSibling = null;
  //获取老fiber的第一个子节点child
  //workInProgressFiber.base 当前执行的fiber的上个老fiber
  let oldFiber = workInProgressFiber.base && workInProgressFiber.base.child;
  console.log('oldFiber',oldFiber,workInProgressFiber);
  for (let i = 0; i < children.length; i++) {
    let newFiber = null;
    let child = children[i];
  
    //复用的前提是key和type都相同,先不考虑key
    const sameType = child && oldFiber && child.type === oldFiber.type;
    console.log('sameType',sameType);
    if(sameType) {
      //类型相同,复用
      newFiber = {
        type: child.type,
        props: child.props,
        node: oldFiber.node,
        base: oldFiber,
        return: workInProgressFiber,
        effectTag: UPDATE
      };
    }
    if(!sameType  && child) {
       //创建一个新的fiber
       newFiber = {
        type: child.type,
        props: child.props,
        node: null,
        base: null,
        return: workInProgressFiber,
        effectTag: PLACEMENT
      };

    }
    if(!sameType  && oldFiber) {
      //删除节点
      oldFiber.effectTag = DELETION;
      deletions.push(oldFiber);
    }
   
	  //链表往后走
    //oldFiber:a  b  c  d
    //child   :b  c  d
    //随着oldFiber = oldFiber.sibling与child = children[i]
    //新老fiber的比较仅限于同一位置上,这里也只是简单实现,实现源码肯定要考虑fiber只是挪了一下位置的复用情况
    if(oldFiber) {
      oldFiber = oldFiber.sibling;
    }
        
      //形成一个链表结构
      if(i === 0) {
        //父节点的child为children[0]对应的newFiber
        workInProgressFiber.child = newFiber;
      }else {
        //把当前newFiber设置为上一个兄弟节点的sibling
        prevSibling.sibling = newFiber;
      }
      //记录上一个兄弟节点,
      prevSibling = newFiber;
    }
  }



function updateHostComponent(fiber) {
  console.log('updateHostComponent',fiber,fiber.node);
  if(!fiber.node) {
    console.log('bbb');
    fiber.node = createNode(fiber);
  }
  //协调子元素
  
  const {children} = fiber.props;
  console.log(fiber,children);
  reconclieChildren(fiber, children);
  console.log('fiber', fiber);
}

function performUnitOfWork(fiber) {
  //执行当前任务
  // todo 执行
  const {type} = fiber;
  console.log('performUnitOfWork',type,fiber);
  if(typeof type === 'function') {
    //class function
    console.log('performUnitOfWork',fiber);
    type.prototype.isReactComponent ?  updateClassComponent(fiber) : updateFunctionComponent(fiber)
  }else {
    //为什么没看见在updateFunctionComponent有vnode->node的createNode呢？
    //因为通过获取下一个子任务,函数组件return的虚拟DOM,最终都会变成原生标签,走到这一步，
    //然后在updateHostComponent进行fiber.node = createNode(fiber)
    //原生标签
    console.log(fiber);
    updateHostComponent(fiber);
  }


  //获取下一个子任务(fiber)
  if(fiber.child ) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while(nextFiber) {
    //找兄弟
    if(nextFiber.sibling) {
      return nextFiber.sibling;
    }
    //没有兄弟,往祖先上找,如父节点的兄弟,直至nextFiber为undefined
    nextFiber = nextFiber.return;
  }
}

function workLoop(deadline) {
  // console.log('workLoop');
  //有下一个任务,并且当前帧没有结束
  //实现的是模拟时间,源码用的是过期时间,且与时间单位相关
 
  while(nextUnitOfWork && deadline.timeRemaining() > 1) {
    //执行当前任务
    //获取下一个子任务(fiber)
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }
  if(!nextUnitOfWork && wipRoot) {
    //提交
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

// 提交
function commitRoot() {
  //要删除的fiber节点push进deletions,提交时遍历删除
  deletions.forEach(item=>commitWorker(item))
  commitWorker(wipRoot.child);
  //在遍历完fiber架构之后,在将wipRoot置为null前,将wipRoot保存到currentRoot,
  //供给useState,初始化nextUnitOfWork来启动woorLoop，以更新fiber节点
  currentRoot = wipRoot;
  //等同将nextUnitOfWork置为null,workLoop停止
  wipRoot = null;

}


function commitWorker(fiber) {
  console.log('commitWorker');
  if(!fiber) {
    return;
  }
  //找到parentNode
  //找到最近的有node节点的祖先fiber
  let parentNodeFiber = fiber.return;
  while(!parentNodeFiber.node) {
    parentNodeFiber = parentNodeFiber.return;
  }


  const parentNode = parentNodeFiber.node;
  if(fiber.effectTag === PLACEMENT && fiber.node !== null) {
    //新增插入
    parentNode.appendChild(fiber.node);
  }else if(fiber.effectTag === UPDATE && fiber.node !== null) {
    //更新props
    console.log('更新props',fiber,fiber.node, fiber.props);
    updateNode(fiber.node,fiber.base.props, fiber.props)
  }else if(fiber.effectTag === DELETION && fiber.node !== null) {
    //删除节点
    commitDeletions(fiber, parentNode)
  }

  commitWorker(fiber.child);
  commitWorker(fiber.sibling);
}
//这个parentNode是有node节点的,参考上面的while循环
function commitDeletions(fiber, parentNode) {
  if(fiber.node) {
    parentNode.removeChild(fiber.node);
  }else {
    //因为有些fiber没有node节点,如Consumer
    commitDeletions(fiber.child, parentNode)
  }
}
//初次渲染(用init)  还是更新(在init基础上更新)
export function useState(init) {
  console.log('omg');
  //判断有没有老的hook
  const oldHook = wipFiber.base && wipFiber.base.hooks[wipFiber.hookIndex];
  //初次渲染(用init)  还是更新(在init基础上更新)
  const hook = oldHook ? {state: oldHook.state, queue: oldHook.queue} : {state: init, queue: []}
  //更新hook.state
  //模拟一下批量更新 
  hook.queue.forEach(action => (hook.state = action));

  const setState = (action) => {
    //每次执行setState,接受新的action,存到数组里,等下进行批量更新,执行遍历
    hook.queue.push(action);
    wipRoot = {
      node: currentRoot.node,
      props: currentRoot.props,
      base: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = []
    console.log(init);
  }

  wipFiber.hooks.push(hook);
  wipFiber.hookIndex++;
  return [hook.state, setState]
}

export default {
    render
};

////////////////////////////////////////////////////////////////////
// ! vnode 虚拟dom对象
// ！node 真实dom对象

// import { TEXT } from "./const.js";
// import React from './index.js'
// import { useEffect,useState } from "react";
// function render (vnode, container) {
 
//   //vnode --> node
//   const node = createNode(vnode);
//   //再把node插入container
//   console.log('最终插入node', node);
//   container.appendChild(node);
//   console.log("render-vnode", vnode, container);
// }

// //创建node
// function createNode(vnode) {
//   console.log('vvnode',vnode);
  
//   // if(vnode == null) return node
//   const {type, props} = vnode;
//   console.log(typeof type);
//   let node = null;
//   if(type === TEXT) {
//     node = document.createTextNode("");
//   }else if(typeof type === 'string') {
//     console.log('类组件class7',type,node);
//     node = document.createElement(type)
//     console.log('类组件class8',node);
//   }
//   else if(typeof type === 'function') {
//     //判断是函数组件还是类组件
//     console.log('类组件class1');
//     node = type.prototype.isReactComponent ? updateClassComponent(vnode) : updateFunctionComponent(vnode);
//     return node
//   }

//   //遍历props.children,转化为真实dom节点,再插入node
//   console.log('类组件class9',props.children, node );
//    reconclieChildren(props.children, node);
//    console.log('类组件class19',props.children, node );
//  //更新属性值,如className,nodeValue
//  updateNode(node, props);
//  console.log('类组件class13',node );
//   return node
// }
// // !源码中的children可以是单个对象或者数组,这里统一处理成了数组,实现的createElement参数中的...children
// function reconclieChildren(children, node) {
//   for(let i = 0; i < children.length; i++) {
//     let child = children[i];
//     if(Array.isArray(child)){
//       for(let j = 0; j < child.length; j++) {
//         render(child[j], node);
//       }
//     }else {
//       console.log('类组件class10',child);
//       if(typeof child !== 'object') {
//         console.log('类组件class12',React.createTextNode(child));
//         console.log('插入',React.createTextNode(child), node);
//         render(React.createTextNode(child), node);
//       }else {
//         console.log('插入',child, node);
//         render(child, node);
//       }
//       // children.map(child => typeof child === 'object' ? child : React.createTextNode(child))
//       console.log('类组件class11', node);
      
//     }
    
//   }
// }
// //更新属性值,如className,nodeValue
// function updateNode(node, nextVal) {
//   Object.keys(nextVal)
//     .filter(k => k !== 'children')
//     .forEach(item => { 
//       node[item] = nextVal[item]
//     })
// }
// //类组件
// function updateClassComponent(vnode) {
 
//   console.log('类组件class2');
//  const {type, props} = vnode;
//  console.log('类组件class5',vnode.type);
//  let cmp = new type(props);
//  console.log('类组件class6',cmp);
//  console.log(cmp.constructor);
//  const vvnode = cmp.render();
// //  const vvnode = React.createElement(cmp.constructor, cmp.props);
//  console.log('类组件class3',vvnode);
// //  if(vvnode.props.children) {
// //   console.log('jru', vvnode.props.children);
// //   // vvnode.props.children.map(child => typeof child === 'object' ? child : React.createTextNode(child))
// //   // vvnode.props.children.map(child => child+'1')
// //   // Object.defineProperty(props,'')

// //   console.log('jru', vvnode.props.children);
// // }

//  const node = createNode(vvnode);
//  console.log('类组件class4',node);
//  return node
// }
// //函数组件
// function updateFunctionComponent(vnode) {
//   const {type, props} = vnode;
//   let vvnode = type(props);
//   const node = createNode(vvnode);
//   return node    
// }
// function createRoot(container) {
//   return {
//     render:(jsx)=>{render(jsx,container)}
//   }
// }
// export default {
//     createRoot
   
// };

