import { MasterPool } from '../pool/MasterPool';
import { Mesh, MeshBasicMaterial, PlaneBufferGeometry, Vector2, Vector3 } from 'three';
import { Screen } from 'ecs-unity';
import * as TWEEN from '@tweenjs/tween.js';
import { BaseMesh } from '../entitys/BaseMesh';
import { Entity } from '../entitys/Entity';

export interface RectTransform{
	get sizeDelta():Vector2;
	set sizeDelta(val:Vector2);

	get anchoredPosition():Vector2;
	set anchoredPosition(val:Vector2);
	DOAnchorPos(pos: Vector2, time: number): void;
	DOScale(scale:Vector3, time:number):void;
}


export class U_RectTransform extends BaseMesh {
	public align: Vector2 = new Vector2(0, 0);
    public screenPositon: Vector2 = new Vector2();
	protected className = 'RectTransform';

	constructor(material: MeshBasicMaterial) {
		super();
		this.material = material;
		this.geometry = new PlaneBufferGeometry(1, 1);
		Mesh.prototype.updateMorphTargets.apply(this);
	}

	protected get sizeDelta(){
		return this._sizeDelta; 
	}

	protected set sizeDelta(val:Vector2){
		this.geometry.scale(1/this._sizeDelta.x, 1/this._sizeDelta.y, 1);
		this._sizeDelta = val;
		this.geometry.scale(val.x, val.y,1);
		(this.geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true;
	}

	protected get anchoredPosition(){
		return new Vector2(this.position.x, this.position.y);
	}

	protected set anchoredPosition(value:Vector2){
		this.setPositionXY(value.x, value.y)
	}

	protected DOAnchorPos(pos: Vector2, time: number) {
		new TWEEN.Tween(this.position)
			.to(pos, time * 1000)
			.start()
	}

	protected DOScale(scale:Vector3, time:number){
		new TWEEN.Tween(this.scale)
			.to(scale, time * 1000)
			.start()
	}

	setAlign(x: number, y: number) {
        this.align.set(x, y);
    }

    protected getPosScreen(){
         let align = this.align;
         let tx = 0;
         let ty = 0;
         if (align.x == -1)
             tx = - Screen.width * 0.5;
         if (align.x == 1)
             tx = Screen.width * 0.5;
         if (align.y == -1)
             ty = - Screen.height * 0.5;
         if (align.y == 1)
             ty = Screen.height * 0.5;
         return new Vector2(tx, ty);
    }

	setPositionXY(x: number, y: number)
    {
        var ps = this.getPosScreen();
        this.position.set(ps.x + x, ps.y + y, this.position.z);
        this.screenPositon.set(x,y);
    }
	
	protected makeChildsInstance(copy:Entity)
	{
		super.makeChildsInstance(copy);
        (copy as any).sizeDelta = this._sizeDelta;
        (copy as any).align.copy(this.align);
	}

	makeInstance() {
		var copy = new U_RectTransform(MasterPool.isCloneMaterial ? this.material.clone() : this.material);
		this.makeChildsInstance(copy);
		return copy;
	}

}
