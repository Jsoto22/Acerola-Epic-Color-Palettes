import { Component, Output } from '@angular/core';
import { auditTime, fromEvent, take, takeUntil, tap } from 'rxjs';
import { ToastService } from './ui/toast/toast.service';

//Settings

interface Settings {
  h: {
    base: number
    offset: number
    result: number
  }
  s: {
    base:number
    offset:number
    constant?: boolean
  }
  l: {
    base: number
    offset: number
    constant: boolean
  }
  n: number
  f: number
  mode: HueMode
}

interface HueMode {
  label: 'Monochromatic'|'Analagous'|'Complementary'|'Triadic Complementary'|'Tetradic Complementary'
  value: 'monochromatic'|'analagous'|'complementary'|'triadic'|'tetradic'
  description: string
  offset: 0|0.25|0.33|0.66|0.75
}

//Controls

interface Controls {
  hue: HueControl
  saturation: SaturationControl
  luminance: LuminanceControl
  fixed: FixedControl
  output: OutputControl
}

//Hue Controls

interface HueControl {
  base: HueBaseControl
  offset: HueOffsetControl
}

interface HueBaseControl {
  color: string
  value: number
}

interface HueOffsetControl{
  color: string
  stops: string[]
  value: number
}

//Saturation Controls

interface SaturationControl {
  base: SaturationBaseControl
  offset: SaturationOffsetControl
}

interface SaturationBaseControl {
  color: string
  stops: string[]
  value: number
}

interface SaturationOffsetControl{
  color: string
  stops: string[]
  value: number
}

//Luminance Controls

interface LuminanceControl {
  base: LuminanceBaseControl
  offset: LuminanceOffsetControl
}

interface LuminanceBaseControl {
  color: string
  stops: string[]
  value: number
}

interface LuminanceOffsetControl{
  color: string
  stops: string[]
  value: number
}

//Fixed Controls

interface FixedControl{
  color: string
  stops: string[]
  value: number
}

interface OutputControl{
  base: string
  offset: string
}



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  results: number[][][] = [];

  modes: HueMode[] = [
    {
      label: 'Monochromatic',
      value: 'monochromatic',
      description: 'A monochromatic color scheme is a color palette that consists of variations in shades, tints, and tones of a single color.',
      offset: 0
    },
    {
      label: 'Analagous',
      value: 'analagous',
      description: 'Analogous colors are a group of colors that are located next to each other on the color wheel.',
      offset: 0.25
    },
    {
      label: 'Complementary',
      value: 'complementary',
      description: 'Complementary colors are pairs of colors that, when combined, cancel each other out.',
      offset: 0.33
    },
    {
      label: 'Triadic Complementary',
      value: 'triadic',
      description: 'Triadic colors are a set of three colors that are evenly spaced around the color wheel and are equidistant from each other.',
      offset: 0.66
    },
    {
      label: 'Tetradic Complementary',
      value: 'tetradic',
      description: 'Tetradic colors, also known as a tetradic color scheme or a double complementary color scheme, involve four colors arranged into two complementary pairs.',
      offset: 0.75
    }
  ]

  settings:Settings = {
    h: {
      base: Math.random(),
      offset: Math.random(),
      result: Math.random()
    },
    s: {
      base: Math.random(),
      constant: true,
      offset: Math.random(),
      
    },
    l: {
      base: Math.random(),
      constant: true,
      offset: Math.random()
    },
    n: 8,
    f: Math.random(),
    mode: this.modes[0]
  }

  controls:Controls = {
    hue: {
      base: {
        color: '',
        value: this.settings.h.base * 100
      },
      offset: {
        color: '',
        stops: [],
        value: this.settings.h.offset * 100
      }
    },
    saturation: {
      base: {
        color: '',
        stops: [],
        value: this.settings.s.base * 100
      },
      offset: {
        color: '',
        stops: [],
        value: this.settings.s.offset * 100
      },
    },
    luminance: {
      base: {
        color: '',
        stops: [],
        value: this.settings.l.base * 100
      },
      offset: {
        color: '',
        stops: [],
        value: this.settings.l.offset * 100
      }
    },
    fixed: {
      color: '',
      stops: [],
      value: this.settings.f * 100
    },
    output: {
      base: '',
      offset: ''
    }
  }

  constructor(public toastService: ToastService){
    this.init();
  }

  init():void {
    this.updateBase();
    this.setFixed();
    this.updateOffsets();
    this.generatePalettes();
  }

  showSuccess() {
		this.toastService.show('Copied to Clipboard', { classname: 'bg-success text-light text-weight-600', delay: 30000 });
	}

  setRandom():void {
    this.settings.h = {
      base: Math.random(),
      offset: Math.random(),
      result: Math.random()
    };
    this.settings.s= {
      base: Math.random(),
      constant: true,
      offset: Math.random()
    };
    this.settings.l = {
      base: Math.random(),
      constant: true,
      offset: Math.random()
    };
    this.settings.f = Math.random();
    this.init();
  }

  setHue(e?:any):void {

    let set = (x:number) => {
      this.settings.h.base = x
      this.controls.hue.base.value = x * 100
      this.controls.hue.base.color = this.hslToHex(x,1,.5);
    }

    if(e){
      
      let update = (x:number) => {
        set(x);
        this.setSaturation();
        this.setLuminance();
        this.setFixed();
        this.updateOffsets();
        this.generatePalettes();
      }

      this.trackMouseX(e, update);

      return;
    }

    set(this.settings.h.base);

  }

  setSaturation(e?:any):void {

    let set = (x:number) => {
      let stops: string[] = [];
      this.settings.s.base = x;

      this.getStops(1).forEach(s => {
        stops.push(this.hslToHex(this.settings.h.base,s,this.Lerp(0.3, 0.85, this.settings.l.base/1.5)))
      })

      this.controls.saturation.base.value = x * 100
      this.controls.saturation.base.stops = stops;
      this.controls.saturation.base.color = this.hslToHex(this.settings.h.base,x,this.Lerp(0.3, 0.85, this.settings.l.base/1.5))
    }

    if (e) {

      let update = (x:number) => {
        set(x);
        this.setLuminance();
        this.setFixed();
        this.updateOffsets();
        this.generatePalettes();
      }

      this.trackMouseX(e,update)

      return;

    }

    set(this.settings.s.base);

  }

  setLuminance(e?:any):void {

    let set = (x:number)=>{
      let stops: string[] = [],
      f = (this.settings.mode.value == 'monochromatic')?this.settings.s.base:this.settings.f

      this.settings.l.base = x;
      
      this.getStops(1).forEach(s => {
        stops.push(this.hslToHex(this.settings.h.base,f,s))
      })

      this.controls.luminance.base.value = x * 100
      this.controls.luminance.base.stops = stops;
      this.controls.luminance.base.color = this.hslToHex(this.settings.h.base,f,x/2)
    }

    if(e){

      let update = (x:number) => {
        set(x);
        this.setSaturation();
        this.setFixed();
        this.updateOffsets();
        this.generatePalettes();
      }

      this.trackMouseX(e, update);

      return;
    }

    set(this.settings.l.base);
    
  }

  setHueOffset(e?:any ){

    let set = (x:number)=>{

      let hueOffset = (h:number)=>{
        let offset = (1 * this.Lerp(0.33, 1.0, h));
        let mode = this.settings.mode;
        offset *= mode.offset;
  
        if (mode.value != "monochromatic") offset += (Math.random() * 2 - 1) * 0.01;
    
        return offset
    
      }

      let f = this.Lerp(0.3, 1.0, this.settings.f),
      l = this.Lerp(0.3, 0.85, this.settings.l.offset/2),
      r = this.settings.h.base + hueOffset(1*x),
      stops: string[] = [];

      this.settings.h.offset = x;
      this.settings.h.result =  r;
      
      this.getStops(1,5).forEach(s=>{
        stops.push(this.hslToHex((this.settings.h.base + hueOffset(0)) + (hueOffset(1) * s ),f,l))
      })
      
      this.controls.hue.offset.value = x * 100;
      this.controls.hue.offset.stops = stops;
      this.controls.hue.offset.color = this.hslToHex(r,f,l);

    }


    if(e){
      
      let update = (x:number)=>{
        set(x);
        this.setSaturationOffset();
        this.setLuminanceOffset();
        this.generatePalettes();
      }

      this.trackMouseX(e, update)

      return;

    }

    set(this.settings.h.offset);

  }

  setSaturationOffset(e?:any){    

    let set = (x:number) => {
      let stops: string[] = [];

      this.settings.s.offset = x;

      this.getStops(1).forEach(s => {
        stops.push(this.hslToHex(this.settings.h.result,this.Lerp(.3,1,s*2),this.Lerp(0.3, 1, this.settings.l.offset/2)))
      })

      this.controls.saturation.offset.value = x * 100
      this.controls.saturation.offset.stops = stops;
      this.controls.saturation.offset.color = this.hslToHex(this.settings.h.result,this.Lerp(.3,1,x),this.Lerp(0.3, 0.85, this.settings.l.offset/2))
    }


    if(e) {

      let update = (x:number)=>{
        set(x);
        this.setHueOffset();
        this.setLuminanceOffset();
        this.generatePalettes();
      };

      this.trackMouseX(e,update);

      return;

    }

    set(this.settings.s.offset);
  }

  setLuminanceOffset(e?:any){

    let set = (x:number) => {
      let f = this.Lerp(0.1, 1.0, (this.settings.mode.value == 'monochromatic')?this.settings.s.base:this.settings.f),
      r = this.Lerp(0.3, 0.85, x),
      stops: string[] = []

      this.settings.l.offset = x;
    
      this.getStops(1).forEach(s=>{
        stops.push(this.hslToHex(this.settings.h.result,f,this.Lerp(0.3, 1,s)))
      })
      
      this.controls.luminance.offset.value = x * 100
      this.controls.luminance.offset.stops = stops;
      this.controls.luminance.offset.color = this.hslToHex(this.settings.h.result,f,r)
    }

    if(e) {

      let update = (x:number)=>{
        set(x);
        this.setHueOffset();
        this.setSaturationOffset();
        this.generatePalettes();
      };

      this.trackMouseX(e,update);

      return;

    }

    set(this.settings.l.offset);
  }

  setFixed(e?:any):void{

    let set = (x:number) => {
      let stops: string[] = [];
      this.settings.f = x;
      
      this.getStops(1).forEach(s => {
        stops.push(this.hslToHex(this.settings.h.base,s,this.settings.l.base/2))
      })

      this.controls.fixed.value = x * 100
      this.controls.fixed.stops = stops;
      this.controls.fixed.color = this.hslToHex(this.settings.h.base,x,this.settings.l.base/2)
    }

    if(e) {

      let update = (x:number)=>{
        set(x);
        this.setLuminance();
        this.setHueOffset();
        this.setLuminanceOffset();
        this.generatePalettes();
      };

      this.trackMouseX(e,update);

      return;

    }

    set(this.settings.f);

  }

  // Update Controls and Settings
  updateOutput(){
    this.controls.output.base = this.hslToHex(this.settings.h.base, (this.settings.mode.value == 'monochromatic')?this.settings.s.base:this.settings.f,this.settings.l.base/2)
    this.controls.output.offset = this.hslToHex(this.settings.h.result, this.Lerp(.3,1, this.settings.s.offset), this.Lerp(.35,.85, this.settings.l.offset/2))
  };

  updateBase():void {
    this.setHue();
    this.setSaturation();
    this.setLuminance();
  }
  
  updateOffsets(){
    this.setHueOffset();
    this.setSaturationOffset();
    this.setLuminanceOffset();
  }

  // Convertions
  rgbToHex([r,g,b]:number[]) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
  }

  hslToHex(h: number, s: number, l: number): string{
    return this.rgbToHex(this.hslToRgb(h,s,l))
  }

  hslToRgb(h: number, s: number, l: number) {
    h = h % 1;
    var r, g, b;

    if (s == 0) {
      r = g = b = l; // achromatic
    } else {
      function hue2rgb(p: number, q: number, t: number) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  hsvToRgb(h: number, s: number, v: number) {
    let r =0, g=0, b=0;

    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  oklab_to_linear_srgb(L: number, a: number, b: number) {
    let l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    let m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    let s_ = L - 0.0894841775 * a - 1.2914855480 * b;

    let l = l_ * l_ * l_;
    let m = m_ * m_ * m_;
    let s = s_ * s_ * s_;

    return [
      (+4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
      (-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
      (-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s),
    ];
  }

  oklch_to_oklab(L: any, c: number, h: number) {
    return [(L), (c * Math.cos(h)), (c * Math.sin(h))];
  }



  generateHSL(settings: Settings) {
    let hslColors = []

    let hueBase = settings.h.base;
    let hueContrast = this.Lerp(0.33, 1.0, settings.h.offset);

    let saturationBase = this.Lerp(0.01, 0.5, settings.s.base);
    let saturationContrast = this.Lerp(0.1, 1 - saturationBase, settings.s.offset);
    let saturationFixed = this.Lerp(0.1, 1.0, settings.f);

    let lightnessBase = this.Lerp(0.01, 0.5, settings.l.base);
    let lightnessContrast = this.Lerp(0.1, 1 - lightnessBase, settings.l.base);
    let lightnessFixed = this.Lerp(0.3, 0.85, settings.f)


    let saturationConstant = settings.s.constant;
    let lightnessConstant = !saturationConstant;

    let mode = settings.mode.value

    if (mode == "monochromatic") {
      saturationConstant = false;
      lightnessConstant = false;
    }

    for (let i = 0; i < settings.n; ++i) {
      let linearIterator = (i) / (settings.n - 1);
      let hueOffset = linearIterator * hueContrast;
      if (mode == "monochromatic") hueOffset *= 0.0;
      if (mode == "analagous") hueOffset *= 0.25;
      if (mode == "complementary") hueOffset *= 0.33;
      if (mode == "triadic") hueOffset *= 0.66;
      if (mode == "tetradic") hueOffset *= 0.75;

      if (mode != "monochromatic")
        hueOffset += (Math.random() * 2 - 1) * 0.01;

      let saturation = saturationBase + linearIterator * saturationContrast;
      let lightness = lightnessBase + linearIterator * lightnessContrast;

      if (saturationConstant) saturation = saturationFixed;
      if (lightnessConstant) lightness = lightnessFixed;
      hslColors.push(this.hslToRgb(hueBase + hueOffset, saturation, lightness));
    }

    return hslColors;
  }

  generateHSV(settings: Settings) {
    let hsvColors = []

    let hueBase = settings.h.base;
    let hueContrast = this.Lerp(0.33, 1.0, settings.h.offset);

    let saturationBase = this.Lerp(0.01, 0.5, settings.s.base);
    let saturationContrast = this.Lerp(0.1, 1 - saturationBase, settings.s.offset);
    let saturationFixed = this.Lerp(0.1, 1.0, settings.f);

    let valueBase = this.Lerp(0.01, 0.5, settings.l.base);
    let valueContrast = this.Lerp(0.1, 1 - valueBase, settings.l.offset);
    let valueFixed = this.Lerp(0.3, 1.0, settings.f);

    let saturationConstant = settings.s.constant;
    let valueConstant = !saturationConstant;

    let mode = settings.mode

    if (mode.value == "monochromatic") {
      saturationConstant = false;
      valueConstant = false;
    }

    for (let i = 0; i < settings.n; ++i) {
      let linearIterator = (i) / (settings.n - 1);
      let hueOffset = linearIterator * hueContrast;

      hueOffset *= mode.offset;

      if (mode.value != "monochromatic") hueOffset += (Math.random() * 2 - 1) * 0.01;

      let saturation = saturationBase + linearIterator * saturationContrast;
      let value = valueBase + linearIterator * valueContrast;

      if (saturationConstant) saturation = saturationFixed;
      if (valueConstant) value = valueFixed;

      hsvColors.push(this.hsvToRgb(hueBase + hueOffset, saturation, value));
    }

    return hsvColors;
  }

  generateOKLCH(settings: Settings) {
    let oklchColors = []

    let hueBase = settings.h.base * 2 * Math.PI;
    let hueContrast = this.Lerp(0.33, 1.0, settings.h.offset);

    let chromaBase = this.Lerp(0.01, 0.1, settings.s.base);
    let chromaContrast = this.Lerp(0.075, 0.125 - chromaBase, settings.s.offset);
    let chromaFixed = this.Lerp(0.01, 0.125, settings.f);

    let lightnessBase = this.Lerp(0.3, 0.6, settings.l.base);
    let lightnessContrast = this.Lerp(0.3, 1.0 - lightnessBase, settings.l.offset);
    let lightnessFixed = this.Lerp(0.6, 0.9, settings.f)

    let chromaConstant = settings.s.constant;
    let lightnessConstant = !chromaConstant;

    let mode = settings.mode

    if (mode.value == "monochromatic") {
      chromaConstant = false;
      lightnessConstant = false;
    }

    for (let i = 0; i < settings.n; ++i) {
      let linearIterator = (i) / (settings.n - 1);

      let hueOffset = linearIterator * hueContrast * 2 * Math.PI + (Math.PI / 4);
      hueOffset *= mode.offset;
      if (mode.value == "monochromatic") hueOffset *= 0.0;
      if (mode.value == "analagous") hueOffset *= 0.25;
      if (mode.value == "complementary") hueOffset *= 0.33;
      if (mode.value == "triadic") hueOffset *= 0.66;
      if (mode.value == "tetradic") hueOffset *= 0.75;

      if (mode.value != "monochromatic")
        hueOffset += (Math.random() * 2 - 1) * 0.01;

      let chroma = chromaBase + linearIterator * chromaContrast;
      let lightness = lightnessBase + linearIterator * lightnessContrast;

      if (chromaConstant) chroma = chromaFixed;
      if (lightnessConstant) lightness = lightnessFixed;

      let lab = this.oklch_to_oklab(lightness, chroma, hueBase + hueOffset);
      let rgb = this.oklab_to_linear_srgb(lab[0], lab[1], lab[2]);

      rgb[0] = Math.round(Math.max(0.0, Math.min(rgb[0], 1.0)) * 255);
      rgb[1] = Math.round(Math.max(0.0, Math.min(rgb[1], 1.0)) * 255);
      rgb[2] = Math.round(Math.max(0.0, Math.min(rgb[2], 1.0)) * 255);

      oklchColors.push(rgb);
    }

    return oklchColors;
  }

  generatePalettes() {
    let hsl = this.generateHSL(this.settings);
    let hsv = this.generateHSV(this.settings);
    let lch = this.generateOKLCH(this.settings);

    this.updateOutput();
    this.results = [hsl, hsv, lch];
  }

  
  // Utilities
  Lerp(min: number, max: number, t: number) {
    return min + (max - min) * t;
  }

  randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  toInt(int:string): number {
    return Number(int)
  }

  getStops(base: number, steps:number = 2){

    let stops = []
    steps = (steps > 2)?steps-1:steps;

    for (let i = 0; i < steps; ++i) {
      let step = (1/steps) * i;
      stops.push(base * step)
    }

    return stops

  }

  trackMouseX(e: any, update:(x:number)=>void){
    let w = e.target.offsetWidth;
    let t = e.offsetX/w;
    let mouseRelease = fromEvent(document, 'mouseup').pipe(take(1));

    update(t);

    fromEvent(document, 'mousemove').pipe(takeUntil(mouseRelease)).subscribe((res:any) => {
      res.preventDefault();
      let s = (e.pageX - res.pageX),
      p = w * t,
      o = p - s,
      r = o / w;
      if(r > 1||r < 0) return;
      update(r);
    });
  }
}
