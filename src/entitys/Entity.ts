import { BaseEntity } from 'ecs-unity';
import * as TWEEN from '@tweenjs/tween.js';

export class Entity extends BaseEntity {
	protected className = 'Entity';

	constructor() {
		super();
	}

	protected makeChildsInstance(copy: Entity) {
		for (var i = 0; i < this.children.length; ++i) {
			var child = this.children[i];
			if (child.parent === this) {
				//continue;
			}
			if (!(child instanceof Entity)) {
				continue;
			}
			var childSrc = child as Entity;
			var subCopy = childSrc.makeInstance();
			copy.add(subCopy);
			this.copyProps(childSrc, subCopy);
		}
		this.copyProps(this, copy);
	}

	private copyProps(src: Entity, target: Entity) {
		target.position.copy(src.position);
		target.scale.copy(src.scale);
		target.userData = JSON.parse(JSON.stringify(src.userData)); //Object.assign не пашет видимо из-за глубины объекта

		if (Object.keys(src.components).length > 0) {
			for (var k in src.components) {
				const cmp = src.components[k];
				var c = new (cmp as any).constructor();
				target.addComponent(c);
			}
		}
	}

	doRatateZ(stepGrad: number, timeSec: number) {
		var tmp = { val: 0 };
		new TWEEN.Tween(tmp)
			.to({ val: 1 }, timeSec * 1000)
			.onUpdate(() => {
				this.rotation.z += stepGrad / 180 * Math.PI;
			})
			.start()
	}

	makeInstance() {
		var copy = new Entity();
		this.makeChildsInstance(copy);
		return copy;
	}

}
