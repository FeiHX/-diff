import React from './kkkreact/index.js';
import ReactDOM ,{useState}from './kkkreact/react-dom.js';
// import Component from './kkkreact/Component.js';

// import TransitionPage from "./pages/TransitionPage";
// import LifeCyclePage from "./pages/LifeCyclePage";
// import SuspensePage from "./pages/SuspensePage";
// import UseCallbackPage from "./pages/UseCallbackPage";
// import UseMemoPage from "./pages/UseMemoPage";

function DiffPage() {
    const [count, setCount] = useState(0);
    function Child() {
      if(count % 2) {
        return  React.createElement(
            'ul',
            {},
            React.createElement(
              'li',
              {key:0},
              0
            ),
            React.createElement(
              'li',
              {key:1},
              1
            ),
            React.createElement(
              'li',
              {key:2},
              2
            ),
            React.createElement(
              'li',
              {key:3},
              3
            ),
            React.createElement(
              'li',
              {key:4},
              4
            ),            
          )
      }else {
        return  React.createElement(
          'ul',
          {},
          React.createElement(
            'li',
            {key:0},
            0
          ),
          React.createElement(
            'li',
            {key:2},
            2
          ),
          React.createElement(
            'li',
            {key:3},
            3
          ),
          React.createElement(
            'li',
            {key:4},
            4
          ),            
        )        
      }
    }
    
      // return count % 2
      // ? [0, 1, 2, 3, 4].map((item) => {
      //     return React.createElement(
      //       'li',
      //       {key:item},
      //       item
      //     )
      //   })
      // : [0, 2, 3, 4].map((item) => {
      //   return React.createElement(
      //     'li',
      //     {key:item},
      //     item
      //   )
        // })
    
    return React.createElement(
      'div',
      {className:"border"},
      React.createElement(
        'button',
        {onClick:()=>{setCount(count + 1);}},
        count,
        React.createElement(
          Child,
          {},
          null
        )
      ),
     
        
      
    )
    // (
    //   <div className="border">
    //     <button
    //       onClick={() => {
    //         setCount(count + 1);
    //       }}
    //     >
    //       {count}
    //     </button>
    //     <ul>
    //       {count % 2
    //         ? [0, 1, 2, 3, 4].map((item) => {
    //             return <li key={item}>{item}</li>;
    //           })
    //         : [0, 2, 3, 4].map((item) => {
    //             return <li key={item}>{item}</li>;
    //           })}
    //     </ul>  
    //   </div>
    // );
  }
const jsx = React.createElement(
  DiffPage,
  {},
  null
)
ReactDOM.render(jsx, document.getElementById("root"));

// const root = createRoot(document.getElementById("root"));

// root.render(jsx);
// root.render(<UseMemoPage />);

// console.log("React", React.version); //sy-log
