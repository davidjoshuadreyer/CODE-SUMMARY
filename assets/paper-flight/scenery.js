/* Folded-paper set dressing. Coordinates are metres; decorations have no collision.
   draw's (x,y) is the bottom centre and size is approximately the full height. */
(function(root){
  'use strict';
  const TAU=Math.PI*2;
  const kinds=Object.freeze(['lighthouse','pinwheel','pine','sailboat','cloud','lantern','arch','windsock']);
  const placements=Object.freeze([
    {kind:'windsock',east:85,north:24,y:0,size:22},
    {kind:'pine',east:140,north:-48,y:0,size:32},
    {kind:'pinwheel',east:218,north:18,y:0,size:43},
    {kind:'pinwheel',east:247,north:-28,y:0,size:28},
    {kind:'pine',east:285,north:148,y:0,size:39},
    {kind:'pine',east:322,north:195,y:0,size:49},
    {kind:'pine',east:346,north:153,y:0,size:34},
    {kind:'lighthouse',east:466,north:-175,y:0,size:66},
    {kind:'sailboat',east:420,north:-218,y:0,size:32},
    {kind:'sailboat',east:507,north:-211,y:0,size:25},
    {kind:'cloud',east:370,north:55,y:145,size:36},
    {kind:'lantern',east:591,north:196,y:110,size:22},
    {kind:'lantern',east:637,north:243,y:133,size:29},
    {kind:'lantern',east:661,north:183,y:100,size:18},
    {kind:'cloud',east:600,north:248,y:170,size:44},
    {kind:'cloud',east:690,north:130,y:151,size:34},
    {kind:'arch',east:781,north:-263,y:0,size:77},
    {kind:'pine',east:726,north:-222,y:0,size:32},
    {kind:'windsock',east:826,north:-295,y:0,size:27},
    {kind:'cloud',east:862,north:-327,y:182,size:52}
  ].map(Object.freeze));
  function draw(c,kind,x,y,size,t=0,quiet=false,grain=null){
    if(!kinds.includes(kind)||!Number.isFinite(size)||size<=0)return;
    const time=quiet?0:t, sway=Math.sin(time*1.3+x*.002)*.025;
    c.save();c.translate(x,y);c.scale(size,size);
    function poly(points,color){
      c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();
      c.fillStyle=color;c.fill();
      if(grain){c.save();c.globalAlpha*=.13;c.fillStyle=grain;c.fill();c.restore();}
    }
    function line(points,color='#75667a',width=.009){
      c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.strokeStyle=color;c.lineWidth=width;c.lineJoin='round';c.stroke();
    }
    if(kind==='lighthouse'){
      poly([[-.24,0],[.25,0],[.15,-.08],[-.17,-.08]],'#a396a5');
      poly([[-.16,-.04],[.15,-.04],[.10,-.75],[-.09,-.75]],'#f3e7d2');
      poly([[.02,-.04],[.15,-.04],[.10,-.75],[.02,-.75]],'#c7b7ad');
      poly([[-.14,-.26],[.13,-.26],[.12,-.4],[-.12,-.4]],'#b98391');
      poly([[.02,-.26],[.13,-.26],[.12,-.4],[.02,-.4]],'#956d84');
      poly([[-.14,-.76],[.14,-.76],[.14,-.92],[-.14,-.92]],'#d2bc92');
      poly([[-.1,-.79],[.1,-.79],[.1,-.89],[-.1,-.89]],'#f9df9a');
      line([[0,-.79],[0,-.89]],'#9d8186',.015);
      poly([[-.2,-.93],[0,-1.07],[.2,-.93]],'#78667d');
      poly([[0,-1.07],[.2,-.93],[0,-.93]],'#a88a99');
      line([[-.2,-.75],[.2,-.75]],'#77677a',.025);
      poly([[-.035,-.04],[.035,-.04],[.035,-.17],[-.035,-.17]],'#786e80');
      if(!quiet){c.globalAlpha*=.18+.10*Math.sin(time*.7);poly([[-.09,-.88],[-.8,-1.03],[-.8,-.65],[-.09,-.80]],'#ffe8a7');}
    }else if(kind==='pinwheel'){
      c.rotate(sway);poly([[-.018,0],[.018,0],[.012,-.78],[-.012,-.78]],'#aa8d91');
      c.save();c.translate(0,-.79);c.rotate(time*.7);
      ['#e7bc81','#c6a3af','#b2c5ba','#ece0c6'].forEach(color=>{poly([[0,0],[.01,-.32],[.29,-.29],[.16,-.04]],color);poly([[0,0],[.29,-.29],[.16,-.04]],'#fff3df66');line([[0,0],[.29,-.29]],'#86748266',.006);c.rotate(TAU/4);});
      poly([[-.025,-.025],[.025,-.025],[.025,.025],[-.025,.025]],'#8d7381');c.restore();
    }else if(kind==='pine'){
      c.rotate(sway*.6);poly([[-.025,0],[.028,0],[.018,-.48],[-.018,-.48]],'#9b8183');
      for(const [top,base,width] of [[-.68,-.08,.31],[-.85,-.30,.25],[-1,-.52,.19]]){
        poly([[-width,base],[0,top],[width,base]],'#9eafa4');
        poly([[0,top],[width,base],[0,base-.025]],'#768f8b');
        line([[0,top],[0,base-.025]],'#dfe5cb80',.008);
      }
    }else if(kind==='sailboat'){
      c.translate(0,Math.sin(time*1.1)*.015);c.rotate(Math.sin(time*.8)*.025);
      poly([[-.4,-.15],[.38,-.15],[.23,0],[-.25,0]],'#ad8a96');
      poly([[-.4,-.15],[.03,-.08],[.23,0],[-.25,0]],'#d6b5ad');
      line([[0,-.15],[0,-.98]],'#8b7582',.016);
      poly([[-.025,-.95],[-.36,-.23],[-.025,-.23]],'#f3e5ca');
      poly([[.025,-.79],[.34,-.25],[.025,-.25]],'#c1bec6');
      poly([[-.025,-.95],[-.18,-.28],[-.025,-.23]],'#e2ceb3');
      line([[-.50,.035],[-.28,.025],[.35,.025],[.46,.015]],'#b6c6c6',.012);
    }else if(kind==='cloud'){
      c.translate(Math.sin(time*.25)*.025,Math.sin(time*.45)*.015);
      poly([[-.85,-.14],[-.68,-.39],[-.45,-.43],[-.29,-.65],[.03,-.69],[.23,-.46],[.52,-.47],[.82,-.21],[.69,-.06],[-.62,0]],'#f0e9dd');
      poly([[-.85,-.14],[-.29,-.26],[.03,-.69],[.14,-.24],[.82,-.21],[.69,-.06],[-.62,0]],'#d5cdd5');
      line([[-.68,-.39],[-.29,-.26],[.14,-.24],[.52,-.47]],'#fff7e3a0',.011);
    }else if(kind==='lantern'){
      c.translate(Math.sin(time*.65)*.045,Math.sin(time*.8)*.035);c.rotate(sway);
      line([[-.12,-.30],[-.07,-.08],[.07,-.08],[.12,-.30]],'#927a86',.008);
      poly([[-.22,-.82],[-.11,-1],[.11,-1],[.22,-.82],[.20,-.48],[.10,-.28],[-.10,-.28],[-.20,-.48]],'#e7b89f');
      poly([[0,-1],[.11,-1],[.22,-.82],[.20,-.48],[.10,-.28],[0,-.28]],'#c69496');
      poly([[-.08,-1],[0,-1],[.08,-.82],[.07,-.48],[0,-.28],[-.06,-.48],[-.07,-.82]],'#f7d9ac');
      line([[-.20,-.48],[.20,-.48]],'#f6d8bf80');
      poly([[-.09,-.10],[.09,-.10],[.065,0],[-.065,0]],'#9d7d8c');
    }else if(kind==='arch'){
      poly([[-.43,0],[-.37,-.73],[-.22,-.96],[.16,-1],[.37,-.75],[.43,0],[.23,0],[.19,-.65],[.08,-.78],[-.1,-.77],[-.21,-.62],[-.23,0]],'#ad9caf');
      poly([[-.43,0],[-.37,-.73],[-.22,-.96],[-.21,-.62],[-.23,0]],'#c3b4bd');
      poly([[.16,-1],[.37,-.75],[.43,0],[.31,-.07],[.26,-.71]],'#8d809e');
      line([[-.37,-.73],[-.21,-.62]],'#f0e2d7aa');line([[-.22,-.96],[.08,-.78],[.16,-1]],'#f0e2d780');
      poly([[-.5,0],[-.35,-.03],[-.24,0],[-.23,.03],[-.48,.03]],'#c8b9c4');
    }else if(kind==='windsock'){
      poly([[-.014,0],[.014,0],[.014,-1],[-.014,-1]],'#a49396');
      const flutter=Math.sin(time*3)*.018;
      poly([[0,-.96],[.15,-1],[.51,-.90+flutter],[.49,-.78+flutter],[.15,-.82],[0,-.85]],'#dab1a3');
      poly([[.13,-.995],[.23,-.975],[.22,-.81],[.13,-.825]],'#f3e5ce');
      poly([[.34,-.94+flutter],[.42,-.92+flutter],[.41,-.79+flutter],[.33,-.80+flutter]],'#f3e5ce');
      line([[0,-.96],[.15,-.91],[.51,-.84+flutter]],'#9d788855',.007);
    }
    c.restore();
  }
  const api=Object.freeze({draw,placements,kinds});root.FlightScenery=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
