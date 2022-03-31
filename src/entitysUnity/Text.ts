import { ResourceSystem } from '../systems/ResourceSystem';
import * as TWEEN from '@tweenjs/tween.js';
import { U_RectTransform } from './RectTransform';
import { MeshBasicMaterial } from 'three';
const TroikaText = require('troika-three-text');

export interface Text {
	get text():string;
	set text(value:string);
	set color(val:string);
	DOFade(value: number, sec: number): void;
}

const tmpMaterial = new MeshBasicMaterial();

export class U_Text extends U_RectTransform{

	protected className = 'Text';
	protected isMesh = false;
	private _text = '';
	private readonly mesh:any;
	private curColor:string;

	constructor(text:string, fontSize = 16)
	{
		super(tmpMaterial);
		var mesh = new TroikaText.Text();
		mesh.font = ResourceSystem.instance.getLoadedFont();
		mesh.text =  text;
		mesh.fontSize = fontSize;
		mesh.anchorX = '50%';
		mesh.anchorY = '50%';
		this.add(mesh);
		this.mesh = mesh;
		this.text = text;
		this.setColor('#f0fff0');
	}

	
	public get text(){
		return this._text;
	}

	public set text(value:string){
		this._text = value;
		this.mesh.text = value;
	}

	DOFade(value: number, time: number) {
		var mat = this.mesh.material;
		var prop = {fillOpacity:value};
		new TWEEN.Tween(mat)
			.to(prop, time * 1000)
			.start()
	}

	private hexToVbColor(rrggbb:string) {
		var bbggrr = rrggbb.substring(1);
		return parseInt(bbggrr, 16);
	}

	protected set color(value: string) {
		this.setColor(value);
	}

	protected setColor(color:string, alpha = 1)
	{
		this.curColor = color;
		if (color.length > 7){
			alpha = parseInt(color.substr(7,2), 16)/255;
			color = color.substr(0,7);
		}
		this.mesh.color = this.hexToVbColor(color);
		this.mesh.fillOpacity = alpha;
		this.mesh.sync();
	}

	makeInstance()
	{
		var copy = new U_Text(this.mesh.text,  this.mesh.fontSize);
		copy.setColor(this.curColor);
		this.makeChildsInstance(copy);
		return copy;
	}

	destroy()
	{
		super.destroy();
		this.mesh.dispose();
	}

}