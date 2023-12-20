import React from './kkkreact/index.js';
import ReactDOM ,{useState}from './kkkreact/react-dom.js';
import Component from './kkkreact/Component.js';


// import React, {Component, useState} from 'react';
// import ReactDOM from 'react-dom';
import './index.css';



class ClassComponent extends Component {
  constructor(count){
    this.count= count;
  }
  
  render() {
    return React.createElement(
      'div',
      {className:'class'},
      '类组件-',React.createElement(
        'button',
        {onClick:()=>{console.log('class');;}},
        
      ),
      
    )
    
  }
}

function FunctionComponent(props) {
  const [count,setCount] = useState(0)
  
  return  React.createElement(
    'div',
    {className:'function'},
    '函数组件-',props.name,React.createElement(
      'button',
      {onClick:()=>{setCount(count+1);}},
      count
    ),count%2 ? React.createElement('button',{},'click') 
    : React.createElement('span',{},'omg') 
    
  )

//   <div className='border'>函数组件-{props.name}
//   <button onClick={()=>{console.log(1);}}>{1}</button>
// </div>
 

  
}
/////////////===============
// const jsx1 = (
//   <div className='box'>
//     <p className='content'>源码</p>
//     <ClassComponent name='class'></ClassComponent>
//     <FunctionComponent name='function'></FunctionComponent>
//   </div>
// )
const jsx =
 React.createElement(
  'div', 
  {className:'box border'}, 
  React.createElement(
    'p',//元素节点 children是一个对象
    {className:'content'},
    '源码' //文本节点  children是一个字符串
    ),
  React.createElement(
    'a',//元素节点 children是一个对象
    {href:'https://www.baidu.com'},
    'BAIDU' //文本节点  children是一个字符串
   ),
   React.createElement(
    FunctionComponent,
    {name:'function'},
    null
  )
//   React.createElement(
//     ClassComponent,
//     {name:'class'},
//     null
//   ),

  )

  // const jsx2 = React.createElement(
  //   document.createDocumentFragment(),
  //   {name:'fragment'},
  //   React.createElement(
  //     'div',
  //     {className:'child1'},
  //     'fragment1'
  //   ),
  //   React.createElement(
  //     'div',
  //     {className:'child2'},
  //     'fragment2'
  //   ),
  //   )


ReactDOM.render(jsx, document.getElementById("root"))
//////////////===================================./////////////
// import React from './kreact/index.js';
// import ReactDOM from './kreact/react-dom.js';
// // import ReactDOM from 'react-dom';
// import './index.css';
// import Component from './kreact/Component.js';





// class ClassComponent extends Component {
//   render() {
//     return <div className='border'>class-{this.props.name}</div>
    
//   }
// }

// function FunctionComponent(props) {
//   return (
//     <div className='border'>函数组件-{props.name}</div>
//   )
// }

// const App = () => {
//   return (
//     React.createElement(
//       'div', 
//       {className:'box'}, 
//       React.createElement(
//         'p',//元素节点 children是一个对象
//         {className:'content'},
//         '源码' //文本节点  children是一个字符串
//         ),
//       React.createElement(
//         'a',//元素节点 children是一个对象
//         {href:'https://www.baidu.com'},
//         'REACT' //文本节点  children是一个字符串
//        ),
//       React.createElement(
//         ClassComponent,
//         {name:'class11'},
//         null
//       ),
//       React.createElement(
//         FunctionComponent,
//         {name:'function11'},
//         null
//       )
//       )
//   )
// }
// const root = ReactDOM.createRoot(document.getElementById('root'));

// root.render(
  
//   App()
  
// );


//文本节点
//html元素节点
//类组件
//函数组件


