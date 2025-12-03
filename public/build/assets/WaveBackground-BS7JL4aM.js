import{r as o,j as t}from"./app-D8NnCz2s.js";function d(){const r=o.useMemo(()=>[...Array(300)].map(()=>({left:Math.random()*120-10,width:Math.random()*.3+.1,opacity:Math.random()*.6+.3,duration:Math.random()*1+.5,delay:Math.random()*.2})),[]),e=o.useMemo(()=>[...Array(150)].map(()=>({left:Math.random()*100,size:Math.random()*8+4,opacity:Math.random()*.7+.3,duration:Math.random()*10+5,delay:Math.random()*.2,sway:Math.random()*20-10})),[]);return t.jsxs(t.Fragment,{children:[t.jsxs("div",{className:"weather absolute inset-0 w-full h-full overflow-hidden",children:[r.map((a,n)=>t.jsx("div",{className:"rain-drop absolute bg-blue-200",style:{width:`${a.width}vmin`,height:"2vmin",left:`${a.left}vw`,opacity:a.opacity,animation:`rain-fall-${n} ${a.duration}s linear infinite`,animationDelay:`${a.delay}s`}},`rain-${n}`)),e.map((a,n)=>t.jsx("div",{className:"snowflake absolute rounded-full bg-white",style:{width:`${a.size}px`,height:`${a.size}px`,left:`${a.left}%`,opacity:a.opacity,animation:`snow-fall-${n} ${a.duration}s linear infinite`,animationDelay:`${a.delay}s`}},`snow-${n}`))]}),t.jsx("style",{children:`
        body, .weather {
          margin: 0;
          padding: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: linear-gradient(
            180deg,
            #dbeafe 0%,    
            #93c5fd 40%,   
            #3b82f6 100%   
          );
        }

        ${r.map((a,n)=>`
          @keyframes rain-fall-${n} {
            0% { transform: translateY(0); }
            100% { transform: translateY(100vh); }
          }
        `).join(`
`)}

        ${e.map((a,n)=>`
          @keyframes snow-fall-${n} {
            0% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(50vh) translateX(${Math.random()*20-10}px); }
            100% { transform: translateY(100vh) translateX(${Math.random()*20-10}px); }
          }
        `).join(`
`)}
      `})]})}export{d as R};
