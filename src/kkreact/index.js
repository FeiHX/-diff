import { TEXT } from "./const";

//创建react element
function createElement(type, config, ...children) {
  // const defaultProps = {
  //   color: 'pink',
  // }
  // if(!config.hasOwnProperty('color')) {
  //   console.log(1111111111);
  //   config = {...config, ...defaultProps}
  // }
  // console.log(config);
  if(config) {
    delete config._source
    delete config._self
  }
  const props = {
    ...config,
    //此处jsx中有两种节点,元素节点和文本节点
    children: children.map(child => typeof child === 'object' ? child : createTextNode(child))
  };
  console.log('createElement',props.children)
  return {
    type,
    props,
  };
}; 
//把文本节点的样式改造成与元素节点的样式一致,方便遍历
function createTextNode(text) {
  return {
    type: TEXT,
    props: {
      children: [],
      nodeValue: text,
    }
  }
}
export default {
    createElement,
    createTextNode
};
