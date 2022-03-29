import { Entity } from 'src/main';
import { MeshBasicMaterial, Texture, Vector2 } from 'three';
import { U_RectTransform } from './RectTransform';
import { MasterPool } from '../pool/MasterPool';

export interface ImageSet {
	SetImageIndex(index: number): void;
}

export interface Image {
	set color(val:string);
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
