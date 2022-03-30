import { Entity } from 'src/main';
import { MeshBasicMaterial, Texture, Vector2 } from 'three';
import { U_RectTransform } from './RectTransform';
import { MasterPool } from '../pool/MasterPool';
import * as TWEEN from '@tweenjs/tween.js';

export interface ImageSet {
	SetImageIndex(index: number): void;
}

export interface Image {
	set color(val: string);
	DOFade(value: number, sec: number): void;
}

export class U_Image extends U_RectTransform {
	protected className = 'Image';
	protected imgList: Texture[] = [];

	constructor(material: MeshBasicMaterial) {
		super(material);
	}

	protected set color(value: string) {
		this.setColor(value);
	}

	DOFade(value: number, time: number) {
		var mat = this.material;
		var prop = {opacity:value};
		new TWEEN.Tween(mat)
			.to(prop, time * 1000)
			.start()
	}

	addImageList(map: Texture) {
		this.imgList.push(map);
	}

	protected SetImageIndex(index: number) {
		var it: Texture;
		if (index < 0 || index + 1 > this.imgList.length)
			it = this.imgList[0];
		else
			it = this.imgList[index];
		this.material.map = it;
	}


	protected makeChildsInstance(copy: Entity) {
		super.makeChildsInstance(copy);
		(copy as any).imgList = this.imgList;
	}

	makeInstance() {
		var copy = new U_Image(MasterPool.isCloneMaterial ? this.material.clone() : this.material);
		this.makeChildsInstance(copy);
		return copy;
	}

}
