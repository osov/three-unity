import { MasterPool } from '../pool/MasterPool';
import { Mesh, MeshBasicMaterial, Object3D, PlaneBufferGeometry, Vector2, Vector3 } from 'three';
import { Screen } from 'ecs-unity';
import * as TWEEN from '@tweenjs/tween.js';
import { BaseMesh } from '../entitys/BaseMesh';
import { Entity } from '../entitys/Entity';

export interface RectTransform {
	get sizeDelta(): Vector2;
	set sizeDelta(val: Vector2);

	get anchoredPosition(): Vector2;
	set anchoredPosition(val: Vector2);
	DOAnchorPos(pos: Vector2, time: number): void;
	DOScale(scale: Vector3, time: number): void;
}


export class U_RectTransform extends BaseMesh {
	public align: Vector2 = new Vector2(0, 0);
	protected screenPositon: Vector2 = new Vector2();
	protected className = 'RectTransform';

	constructor(material: MeshBasicMaterial) {
		super();
		this.material = material;
		this.geometry = new PlaneBufferGeometry(1, 1);
		Mesh.prototype.updateMorphTargets.apply(this);
	}

	protected get sizeDelta() {
		return this._sizeDelta;
	}

	protected set sizeDelta(val: Vector2) {
		this.geometry.scale(1 / this._sizeDelta.x, 1 / this._sizeDelta.y, 1);
		this._sizeDelta = val;
		this.geometry.scale(val.x, val.y, 1);
		(this.geometry as THREE.BufferGeometry).attributes.position.needsUpdate = true;
	}

	protected get anchoredPosition() {
		return new Vector2(this.screenPositon.x, this.screenPositon.y);
	}

	protected set anchoredPosition(value: Vector2) {
		this.setPositionXY(value.x, value.y)
	}

	protected DOAnchorPos(pos: Vector2, time: number) {
		var srcPos = new Vector2(this.anchoredPosition.x, this.anchoredPosition.y);
		new TWEEN.Tween(srcPos)
			.to(pos, time * 1000)
			.onUpdate((np) => {
				this.anchoredPosition = np;
			})
			.start()
	}

	protected DOScale(scale: Vector3, time: number) {
		new TWEEN.Tween(this.scale)
			.to(scale, time * 1000)
			.start()
	}

	setAlign(x: number, y: number) {
		this.align.set(x, y);
		this.setPositionXY(this.screenPositon.x, this.screenPositon.y);
	}

	protected getPosScreen() {
		let align = this.align;
		let tx = 0;
		let ty = 0;
		var w = Screen.width;
		var h = Screen.height;
		if (this.parent != null && this.parent instanceof U_RectTransform) {
			var parent = this.parent as U_RectTransform;
			var size = parent.sizeDelta;
			w = size.x;
			h = size.y;
		}
		var curSize = this.sizeDelta;
		if (align.x == -1) {
			tx = - w * 0.5;
			tx += curSize.x * 0.5;
		}
		if (align.x == 1) {
			tx = w * 0.5;
			tx -= curSize.x * 0.5;
		}
		if (align.y == -1) {
			ty = - h * 0.5;
			ty += curSize.y * 0.5;
		}
		if (align.y == 1) {
			ty = h * 0.5;
			ty -= curSize.y * 0.5;
		}


		return new Vector2(tx, ty);
	}

	setPositionXY(x: number, y: number) {
		var ps = this.getPosScreen();
		this.position.set(ps.x + x, ps.y + y, this.position.z);
		this.screenPositon.set(x, y);
	}

	protected makeChildsInstance(copy: Entity) {
		super.makeChildsInstance(copy);
		(copy as any).sizeDelta = this._sizeDelta;
		(copy as any).align.copy(this.align);
	}

	makeInstance() {
		var copy = new U_RectTransform(MasterPool.isCloneMaterial ? this.material.clone() : this.material);
		this.makeChildsInstance(copy);
		return copy;
	}

	add(...object: Object3D[]) {
		var ret = super.add(...object);
		this.setAlign(this.align.x, this.align.y);
		this.setPositionXY(this.screenPositon.x, this.screenPositon.y);
		return ret;
	}

}
