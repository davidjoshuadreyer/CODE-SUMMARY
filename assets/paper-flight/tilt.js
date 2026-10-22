/* Optional device controls. Permission is requested only from the player's tap.
   Orientation samples stay in memory and never leave the device. */
(function(root){
  'use strict';
  const clamp=v=>Math.max(-1,Math.min(1,v));
  const delta=(a,b)=>(a-b+540)%360-180;
  function axes(beta,gamma,angle=0){if(!Number.isFinite(beta)||!Number.isFinite(gamma))return null;const a=angle*Math.PI/180;return {pitch:beta*Math.cos(a)+gamma*Math.sin(a),bank:gamma*Math.cos(a)-beta*Math.sin(a)};}
  function command(value){return Math.abs(value)<3?0:clamp(Math.sign(value)*(Math.abs(value)-3)/22);}
  class FlightTilt {
    constructor(host,onChange=()=>{}){this.host=host;this.onChange=onChange;this.enabled=false;this.pending=false;this.neutral=null;this.latest=null;this.pitch=0;this.bank=0;this.sampleTime=0;this.token=0;this.listener=e=>this.sample(e);this.rotate=()=>{if(this.enabled){this.neutral=null;this.pitch=this.bank=0;this.onChange('Hold steady to recenter after rotating.');}};}
    sample(e){const a=axes(e.beta,e.gamma,this.host.screen?.orientation?.angle??this.host.orientation??0);if(!a)return;this.latest=a;this.sampleTime=Date.now();if(!this.neutral){this.neutral=a;this.onChange('Tilt on · tip sideways to roll; return to neutral to hold bank. Tilt opposite to level.');}}
    async enable(){if(this.pending||this.enabled)return;const type=this.host.DeviceOrientationEvent;if(!type||!this.host.isSecureContext){this.onChange('Tilt is unavailable here. Use the buttons or arrow keys.');return;}this.pending=true;const token=++this.token;
      try{if(typeof type.requestPermission==='function'&&await type.requestPermission()!=='granted'){this.onChange('Motion access was not allowed. Buttons and keys still work.');return;}if(token!==this.token)return;this.enabled=true;this.neutral=null;this.latest=null;this.pitch=this.bank=0;this.host.addEventListener('deviceorientation',this.listener);this.host.addEventListener('orientationchange',this.rotate);this.host.screen?.orientation?.addEventListener('change',this.rotate);this.onChange('Hold comfortably still while tilt connects…');this.timer=setTimeout(()=>{if(this.enabled&&!this.latest)this.disable('No motion sensor detected. Use the buttons or arrow keys.');},4000);
      }catch{this.onChange('Could not enable tilt. Buttons and keys still work.');}finally{this.pending=false;}}
    recenter(){if(!this.enabled)return;this.neutral=null;this.latest=null;this.pitch=this.bank=0;this.onChange('Hold steady to calibrate neutral input. Your bank angle is preserved…');}
    read(dt){if(!this.enabled||!this.latest||!this.neutral||Date.now()-this.sampleTime>1200){this.pitch=this.bank=0;return {pitch:0,bank:0};}const k=1-Math.exp(-Math.max(0,dt)*8);this.pitch+=(command(delta(this.latest.pitch,this.neutral.pitch))-this.pitch)*k;this.bank+=(command(delta(this.latest.bank,this.neutral.bank))-this.bank)*k;return {pitch:this.pitch,bank:this.bank};}
    disable(message='Tilt off · use the buttons or arrow keys.'){++this.token;clearTimeout(this.timer);this.enabled=false;this.pitch=this.bank=0;this.neutral=this.latest=null;this.host.removeEventListener('deviceorientation',this.listener);this.host.removeEventListener('orientationchange',this.rotate);this.host.screen?.orientation?.removeEventListener('change',this.rotate);this.onChange(message);}
  }
  root.FlightTilt=FlightTilt;
  if(typeof module!=='undefined'&&module.exports)module.exports={FlightTilt,axes,command};
})(typeof globalThis!=='undefined'?globalThis:this);
