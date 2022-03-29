import { Vector2 } from 'three';
import { BaseMesh } from '../entitys/BaseMesh';
import { ResourceSystem } from '../systems/ResourceSystem';
const TroikaText = require('troika-three-text');

export class Text extends BaseMesh{

	protected className = 'Text';
	protected isMesh = false;
	private _text = '';
	private readonly mesh:any;
	private curColor:string;

	constructor(text:string, fontSize = 16)
	{
		super();
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

	// protected set sizeDelta(val:Vector2){
	// 	this._sizeDelta = val;
	// }

	private hexToVbColor(rrggbb:string) {
		var bbggrr = rrggbb.substring(1);
		return parseInt(bbggrr, 16);
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
		var copy = new Text(this.mesh.text,  this.mesh.fontSize);
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