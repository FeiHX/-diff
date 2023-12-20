// ! vnode 虚拟dom对象
// ！node 真实dom对象


/**
 * fiber架构
 * type:标记类型
 * key:标记当前层级下的唯一性
 * index:记录当前fiber在当前层级下的下标
 * child:第一个子元素 fiber
 * sibling:下一个兄弟元素 fiber
 * return:父fiber
 * node:真实DOM节点 
 * props:属性值
 * base: 上次的节点 fiber
 * effectTag:标记要执行的操作类型(删除、插入、更新)
 */
import { TEXT, PLACEMENT, UPDATE, DELETION } from "./const.js";


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
  // //console.log('最终插入node', node);
  // container.appendChild(node);
  // //console.log("render-vnode", vnode, container);

  //初始值
  //workLoop要启动,nextUnitOfWork不能为null,而它的初始值为null
  wipRoot = {
    node: container,
    props: {
      children: [vnode],
    },
    base: currentRoot,
  };
  //所以将wipRoot正在执行的根fiber赋值给nexUnitOfWork,workLoop启动
  nextUnitOfWork = wipRoot;
  //要删除的fiber节点push进deletions,提交时遍历删除
  deletions = [];
  //console.log('1-57',wipRoot,vnode)
}

//创建node
function createNode(vnode) {
  
  
  
  const {type, props} = vnode;
 
  
  let node = null;
  if(type === TEXT) {
    node = document.createTextNode("");
  }else if(typeof type === 'string') {
    // //console.log('类组件class7',type,node);
    node = document.createElement(type)
    // //console.log('类组件class8',node);
  }
  //走updateHostComponent的都是原生标签了,两种,文本节点\元素节点,
  //而函数组件通过return的vnode转变为原生标签,然后也走updateHostComponent
 //所以这里不需要判断typeof type === 'function'

  // else if(typeof type === 'function') {
  //   //判断是函数组件还是类组件
  //   //console.log('类组件class1',vnode);
  //   node = type.prototype.isReactComponent ? updateClassComponent(vnode) : updateFunctionComponent(vnode);
  //   return node
  // }

  //遍历props.children,转化为真实dom节点,再插入node
  // //console.log('类组件class9',props.children, node );
  //  reconclieChildren(props.children, node);
  //  //console.log('类组件class19',props.children, node );

 //更新属性值,如className,nodeValue
 
 updateNode(node,{}, props);
 //console.log('6-95',node);
  return node
}
// !源码中的children可以是单个对象或者数组,这里统一处理成了数组,实现的createElement参数中的...children
// function reconclieChildren_old(children, node) {
//   for(let i = 0; i < children.length; i++) {
//     let child = children[i];
//     if(Array.isArray(child)){
//       for(let j = 0; j < child.length; j++) {
//         render(child[j], node);
//       }
//     }else {
//       //console.log('类组件class10',child);
//       if(typeof child !== 'object') {
//         //console.log('类组件class12',React.createTextNode(child));
//         //console.log('插入',React.createTextNode(child), node);
//         render(React.createTextNode(child), node);
//       }else {
//         //console.log('插入',child, node);
//         render(child, node);
//       }
      
//     }
    
//   }
// }


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

  Object.keys(nextVal)
    .filter(k => k !== 'children')
    .forEach(item => { 
      //源码的合成事件,用到了事件代理,这里简单粗暴处理下先
      if(item.slice(0, 2) === 'on') {
        let eventName = item.slice(2).toLowerCase();
        node.addEventListener(eventName, nextVal[item])
      }else {

        node[item] = nextVal[item]
      }
      
    })
    //console.log('5-157', node);
}
//类组件
function updateClassComponent(fiber) {
  
  const {type, props} = fiber;
  const cmp = new type(props);

  const vvnode = cmp.render();

  const children = [vvnode]
  reconclieChildren(fiber, children)
}
// function updateClassComponent(vnode) {
 
//   // //console.log('类组件class2');
//  const {type, props} = vnode;
// //  //console.log('类组件class5',vnode.type);

//  let cmp = new type(props);
// //  //console.log('类组件class6',cmp);
// //  //console.log(cmp.constructor);
//  const vvnode = cmp.render();



//  const node = createNode(vvnode);
// //  //console.log('类组件class4',node);
//  return node
// }
//函数组件
function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  wipFiber.hooks = [];
  wipFiber.hookIndex = 0;

  
  const {type, props} = fiber;
  const children = [type(props)];
//console.log('5-195', fiber,children);
  reconclieChildren(fiber, children)   

}


//workInProgressFiber Fiber ->child ->sibling
//children 数组
//源码中初次渲染和更新fiber是分开的,这里简单实现都放在reconclieChildren中

// function reconclieChildren_old2(workInProgressFiber, children) {
//   //构建fiber架构
//   //记录上一个兄弟节点,把当前newFiber设置为上一个兄弟节点的sibling
//   //console.log('reconclieChildren',workInProgressFiber, children);
//   let prevSibling = null;
//   //获取老fiber的第一个子节点child
//   //workInProgressFiber.base 当前执行的fiber的上个老fiber
//   let oldFiber = workInProgressFiber.base && workInProgressFiber.base.child;
//   //console.log('oldFiber',oldFiber,workInProgressFiber);
//   for (let i = 0; i < children.length; i++) {
//     let newFiber = null;
//     let child = children[i];
  
//     //复用的前提是key和type都相同,先不考虑key
//     const sameType = child && oldFiber && child.type === oldFiber.type;
//     //console.log('sameType',sameType);
//     if(sameType) {
//       //类型相同,复用
//       newFiber = {
//         type: child.type,
//         props: child.props,
//         node: oldFiber.node,
//         base: oldFiber,
//         return: workInProgressFiber,
//         effectTag: UPDATE
//       };
//     }
//     if(!sameType  && child) {
//        //创建一个新的fiber
//        newFiber = {
//         type: child.type,
//         props: child.props,
//         node: null,
//         base: null,
//         return: workInProgressFiber,
//         effectTag: PLACEMENT
//       };

//     }
//     if(!sameType  && oldFiber) {
//       //删除节点
//       oldFiber.effectTag = DELETION;
//       deletions.push(oldFiber);
//     }
   
// 	  //链表往后走
//     //oldFiber:a  b  c  d
//     //child   :b  c  d
//     //随着oldFiber = oldFiber.sibling与child = children[i]
//     //新老fiber的比较仅限于同一位置上,这里也只是简单实现,实现源码肯定要考虑fiber只是挪了一下位置的复用情况
//     if(oldFiber) {
//       oldFiber = oldFiber.sibling;
//     }
        
//       //形成一个链表结构
//       if(i === 0) {
//         //父节点的child为children[0]对应的newFiber
//         workInProgressFiber.child = newFiber;
//       }else {
//         //把当前newFiber设置为上一个兄弟节点的sibling
//         prevSibling.sibling = newFiber;
//       }
//       //记录上一个兄弟节点,
//       prevSibling = newFiber;
//     }
//   }

/*
假设一:
  假设oldFiber为A B C D E F
  newChilden为  A B C D E F 
  循环1就是为了这种简单情况而生的,没有节点相对位置的改变,只需要更新一下节点属性
假设二:
  假设oldFiber为A B C D E F
  newChilden为  A C E B G
  刚开始的A是没有相对位置改变,走循环1;之后的相对位置改变了,走循环3
  0       1        2        3          4        5
  A       B        C        D          E        F
  A       C        E        B          G
        last=0   last=2   last=4     last=4 
        old=2    old=4    old=1      base=null
      ->last=2  ->last=4  ->last=4 
        UPDATE   UPDATE   PLACEMENT  PLACEMENT
==========================================================================
  遍历newChildren A       C        E        B          G
  挂载在父节点上的fiber,vnode是
  A               B        C        D          E        F
  A (UPDATE)      B        C        D          E        F
  A (UPDATE)      B        C (UPDATE,index=1)        D          E                        F
  A (UPDATE)      B        C (UPDATE,index=1)        D          E(UPDATE,index=2)        F
  A (UPDATE)      B(PLACEMENT,index=3)        C (UPDATE,index=1)        D                     E(UPDATE,index=2)        F               G(PLACEMENT)
  A (UPDATE)      B(PLACEMENT,index=3)        C (UPDATE,index=1)        D(DELETIONS)          E(UPDATE,index=2)        F(DELETIONS)    G(PLACEMENT)

node : A (UPDATE)        C (UPDATE,index=1)        E (UPDATE,index=2)       B (PLACEMENT,index=3)         G (PLACEMENT,index=4)
*/
function placeChild(newFiber, lastPlacedIndex, newIdx, shouldTrackSideEffects) {
  newFiber.index = newIdx;
  if(!shouldTrackSideEffects) {
    //初次渲染
    // //console.log('276',lastPlacedIndex);
    return lastPlacedIndex;
  }
  //界面更新阶段,但fiber有可能是新增或者更新
  let base = newFiber.base;
  if(base !== null) {
    //复用oldFiber
    let oldIndex = base.index;
    if(oldIndex < lastPlacedIndex) {
      //移动
      newFiber.effectTag =PLACEMENT;
      return lastPlacedIndex
    }else {
      //没有发生变化,直接返回
      return oldIndex
    }
    
  }else{
    //证明是新插入的节点
    newFiber.effectTag =PLACEMENT;
    return lastPlacedIndex;
  }
}
function reconclieChildren(returnFiber, newChildren) {
  //console.log('3-296',returnFiber, newChildren);
  let previousNewFiber = null;

  let oldFiber = returnFiber.base && returnFiber.base.child;
  //console.log('302', 'oldFiber:',oldFiber);
  //记录上次的插入位置
  let lastPlacedIndex = 0;
  //做累加,遍历newChildren数组
  let newIdx = 0;
  //oldFiber的中转,记录下一个oldFiber
  let nextOldFiber = null;

  let shouldTrackSideEffects = true;
  if(!oldFiber) {
    //初次渲染
    shouldTrackSideEffects = false;
  }
//========================================================================
  //1.界面更新阶段  相对位置没有发生变化,执行这个循环
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    
    //判断相对位置,把前几个可能存在的对位的key\type没有发生变化的fiber节点直接复用
    //从第一个相对位置发生变化的节点，跳出这个循环,执行第三个复杂的循环,map中查找
    //console.log('320',oldFiber.index,newIdx,newChildren.length);
    //oldFiber中index大于newChild长度的就遍历不到
    if(oldFiber.index > newIdx) {
      //相对位置发生了变化，跳出循环
      nextOldFiber = oldFiber;
      oldFiber = null;
    }else { //oldFiber.index == newIdx
      //相对位置没有发生变化,老的fiber链表往下走 
      nextOldFiber = oldFiber.sibling;
      //console.log('nextOldFiber:',nextOldFiber);
    }

    let newChild = newChildren[newIdx];
    //if 新老fiber的key和type中，只要有一个变化了,不能复用
    if(!(newChild.key === oldFiber.key && newChild.type === oldFiber.type)) {
      //console.log('330');
      //本来oldFiber为null是进不来这个循环的,但有可能是因为前面oldFiber.index > newIdx
      //oldFiber赋值为null了,
      if(oldFiber === null) {
        oldFiber = nextOldFiber;
      }
      break;//一旦碰到对位fiber的key\type发生变化,退出循环,执行第三个循环,map中查找
    }
    // else  复用 (前几个可能存在的,对位的key\type没有发生变化的fiber节点)
    const newFiber = {
      key: newChild.key,
      type: newChild.type,
      props: newChild.props,
      node: oldFiber.node,
      base: oldFiber,
      return: returnFiber,
      effectTag: UPDATE
    };
    //console.log('界面更新阶段的newFiber:',newFiber);
    if(previousNewFiber === null) {
      returnFiber.child = newFiber;
    }else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
    //往下遍历老的fiber链表
    oldFiber = nextOldFiber;
  }
//==============================
    //删除  如果oldFiber已经遍历到和newChildren长度一致后,之后剩余的oldFiber可以删除了
  if (newIdx === newChildren.length) {
      while(oldFiber) {
        deletions.push({
          ...oldFiber,
          effectTag: DELETION,
        });
        oldFiber = oldFiber.sibling;
      }
  }
//=========================================================
  //2.新增fiber 老链表已经遍历完
  //console.log('363',newChildren);
  if(oldFiber === null) {
    for (; newIdx < newChildren.length; newIdx++) {
      let newChild = newChildren[newIdx];
      const newFiber = {
        key: newChild.key,
        type: newChild.type,
        props: newChild.props,
        node: null,
        base: null,
        return: returnFiber,
        effectTag: PLACEMENT
      };
      //这个plachChild只会走newFiber.index = newIdx
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx, shouldTrackSideEffects);
      console.log('4-389', newChild, newFiber,returnFiber,lastPlacedIndex);
      if(previousNewFiber === null) {
        returnFiber.child = newFiber;
        // //console.log('379', returnFiber.child);
      }else {
        //console.log('384',newFiber);
        previousNewFiber.sibling = newFiber;
      }
      previousNewFiber = newFiber;
    }  
    //初次渲染,oldFiber为null,只会进入这个循环,然后return
    return;
  }
  
  //3.新老链表都有参数值
  //生成map图,方便链表查找,设置和删除
  //经历过第一种循环,已经将可能的前几个较为简单的对位fiber的key/type没有发生变化的复用执行完了
  //跳出循环之后到了这里,是开始出现对位的元素发生了变化的情况,是更为复杂的情况
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
  console.log('408',newIdx,existingChildren);
  //======================================================
  for (; newIdx < newChildren.length; newIdx++) {
    //console.log('393',newChildren);
    let newChild = newChildren[newIdx];
    let newFiber = {
      key: newChild.key,
      type: newChild.type,
      props: newChild.props,
      return: returnFiber,
      // node: null,
      // base: null,
      // effectTag: PLACEMENT
    };

    //判断新增还是复用
    let matchedFiber = existingChildren.get(newChild.key === null ? newIdx : newChild.key)
    if(matchedFiber) {
      //在oldFiber的map中找到了fiber,复用
      //diff,fiber策略:同一层级的fiber节点间,才能判断是否可以复用
      //console.log('415-在oldFiber的map中找到了fiber,复用');
      newFiber = {
        ...newFiber,
        node: matchedFiber.node,
        base: matchedFiber,
        effectTag: UPDATE,
      };
      //找到就要从map上删除该元素,防止重复查找
      console.log('435-newFiber',newFiber);
    shouldTrackSideEffects && existingChildren.delete(newFiber.key === null ? newIdx : newFiber.key)

    }else {
      //在oldFiber的map中没有找到fiber,新增
      newFiber = {
        ...newFiber,
        node: null,
        base: null,
        effectTag: PLACEMENT
      }; 
      console.log('446-created',newFiber);     
    }
    //placeChild给newFiber赋index,并判断这个节点是否需要移动
    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx, shouldTrackSideEffects);
    if(previousNewFiber === null) {
      returnFiber.child = newFiber;
    }else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
    
  }
//===========================================================================
  if(shouldTrackSideEffects) {
    //由于map中被复用过的节点已经从map删除了,所以循环完之后map中剩下的就是多余的,不再使用的节点,加effectTag: DELETION
    existingChildren.forEach(child => 
      deletions.push({
        ...child,
        effectTag: DELETION,
      })
      )
  }
}


function mapRemainingChildren(returnFiber, currentFirstChild) {
  // Add the remaining children to a temporary map so that we can find them by
  // keys quickly. Implicit (null) keys get added to this set with their index
  // instead.
  const existingChildren = new Map();
//console.log('457-mapRemainingChildren');
  let existingChild = currentFirstChild;
  while (existingChild) {
    if (existingChild.key !== null) {
      existingChildren.set(existingChild.key, existingChild);
    } else {
      existingChildren.set(existingChild.index, existingChild);
    }
    existingChild = existingChild.sibling;
  }
  return existingChildren;
}
function updateHostComponent(fiber) {
  
  if(!fiber.node) {
    
    fiber.node = createNode(fiber);
    // //console.log('458',fiber.node);
  }
  //协调子元素
  
  const {children} = fiber.props;
  //console.log('475', fiber ,children);
  reconclieChildren(fiber, children);
  //console.log('fiber===========', fiber);
}

function performUnitOfWork(fiber) {
  //执行当前任务
  // todo 执行
  // //console.log('479', fiber);
  const {type} = fiber;

  if(typeof type === 'function') {
    //class function

    type.prototype.isReactComponent ?  updateClassComponent(fiber) : updateFunctionComponent(fiber)
  }else {
    
    //为什么没看见在updateFunctionComponent有vnode->node的createNode呢？
    //因为通过获取下一个子任务,函数组件return的虚拟DOM,最终都会变成原生标签,走到这一步，
    //然后在updateHostComponent进行fiber.node = createNode(fiber)
    //原生标签
    
    updateHostComponent(fiber);
  }


  //获取下一个子任务(fiber)
  if(fiber.child ) {
    //console.log('5-499',fiber.child);
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
  // //console.log('workLoop');
  //有下一个任务,并且当前帧没有结束
  //实现的是模拟时间,源码用的是过期时间,且与时间单位相关
 
  while(nextUnitOfWork && deadline.timeRemaining() > 1) {
    //执行当前任务
    //获取下一个子任务(fiber)
    //console.log('2-512', nextUnitOfWork);
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
    // //console.log('2-512', nextUnitOfWork);
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
function getHostSibling(fiber) {

  let sibling = fiber.return.child;
  while(sibling) {
    if(fiber.index + 1 === sibling.index && sibling.effectTag === UPDATE) {
      // 这个是用来在某个元素前插入?？？？
      return sibling.node;
    }
    // 一直找sibling的sibling,直到fiber.index + 1 === sibling.index
    sibling = sibling.sibling;
  }
  return null;
}
function insertOrAppend(fiber, parentNode) {
  
  let before = getHostSibling(fiber);
  // //console.log('insertOrAppend',before);
  let node = fiber.node;
  if(before) {
    //例子不会走这里,所以insertBefore暂时还未定义
    parentNode.insertBefore(node, before); 
  }else {
    //本次用的例子只会走这里
    parentNode.appendChild(node);
  }
}
function commitWorker(fiber) {
  
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
    // parentNode.appendChild(fiber.node);
    //console.log('585','insertOrAppend');
    insertOrAppend(fiber, parentNode);
  }else if(fiber.effectTag === UPDATE && fiber.node !== null) {
    //更新props
    //console.log('更新props',fiber,fiber.node, fiber.props);
    updateNode(fiber.node,fiber.base.props, fiber.props)
  }else if(fiber.effectTag === DELETION && fiber.node !== null) {
    //删除节点
    //console.log('shanchujied');
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
    //console.log(wipRoot);
    //启动workLoop
    nextUnitOfWork = wipRoot;
    deletions = []
    //console.log(init);
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
//   //console.log('最终插入node', node);
//   container.appendChild(node);
//   //console.log("render-vnode", vnode, container);
// }

// //创建node
// function createNode(vnode) {
//   //console.log('vvnode',vnode);
  
//   // if(vnode == null) return node
//   const {type, props} = vnode;
//   //console.log(typeof type);
//   let node = null;
//   if(type === TEXT) {
//     node = document.createTextNode("");
//   }else if(typeof type === 'string') {
//     //console.log('类组件class7',type,node);
//     node = document.createElement(type)
//     //console.log('类组件class8',node);
//   }
//   else if(typeof type === 'function') {
//     //判断是函数组件还是类组件
//     //console.log('类组件class1');
//     node = type.prototype.isReactComponent ? updateClassComponent(vnode) : updateFunctionComponent(vnode);
//     return node
//   }

//   //遍历props.children,转化为真实dom节点,再插入node
//   //console.log('类组件class9',props.children, node );
//    reconclieChildren(props.children, node);
//    //console.log('类组件class19',props.children, node );
//  //更新属性值,如className,nodeValue
//  updateNode(node, props);
//  //console.log('类组件class13',node );
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
//       //console.log('类组件class10',child);
//       if(typeof child !== 'object') {
//         //console.log('类组件class12',React.createTextNode(child));
//         //console.log('插入',React.createTextNode(child), node);
//         render(React.createTextNode(child), node);
//       }else {
//         //console.log('插入',child, node);
//         render(child, node);
//       }
//       // children.map(child => typeof child === 'object' ? child : React.createTextNode(child))
//       //console.log('类组件class11', node);
      
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
 
//   //console.log('类组件class2');
//  const {type, props} = vnode;
//  //console.log('类组件class5',vnode.type);
//  let cmp = new type(props);
//  //console.log('类组件class6',cmp);
//  //console.log(cmp.constructor);
//  const vvnode = cmp.render();
// //  const vvnode = React.createElement(cmp.constructor, cmp.props);
//  //console.log('类组件class3',vvnode);
// //  if(vvnode.props.children) {
// //   //console.log('jru', vvnode.props.children);
// //   // vvnode.props.children.map(child => typeof child === 'object' ? child : React.createTextNode(child))
// //   // vvnode.props.children.map(child => child+'1')
// //   // Object.defineProperty(props,'')

// //   //console.log('jru', vvnode.props.children);
// // }

//  const node = createNode(vvnode);
//  //console.log('类组件class4',node);
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

