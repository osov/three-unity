import {Vector2, Vector3, Object3D} from 'three';
import {Entity} from '../entitys/Entity';
import { deepPosition } from '../utils/gameUtils';
import {ParticlesStack} from './ParticlesStack';



export class ParticleItem extends Entity{

	private stack:ParticlesStack;
	private idParticle:number = -1;

	constructor(stack:ParticlesStack)
	{
		super();
		this.stack = stack;
	}

	// частицу незачем добавлять на сцену, т.к. рассчеты идут все равно пулом 
	addToParent(parent:Object3D)
	{
	}

	// удалять соответственно тоже не от куда
	removeFromParent()
	{
		return this;
	}

	onBeforeAdd()
	{
		super.onBeforeAdd();
		this.idParticle = this.stack.getFreeIndex();
		if (this.idParticle == -1)
			return console.warn("Частица не выдана:", this);
		// т.к. сначала задаем позицию, а лишь потом добавляем сущность в обработку EntitySystem -> addEntity 
		// то выходит что при вызове еще не будет задан idParticle, а значит инфа не задастся и поэтому после добавления делаем эти действия.
		this.setPosition(this.position);
		this.setRotationDeg(this.getRotationDeg());
		this.setVisible(this.visible);
	}

	onBeforeRemove()
	{
		super.onBeforeRemove();
		this.setVisible(false);
		this.stack.freeIndex(this.idParticle);
		this.idParticle = -1;
	}
	

	setPosition(pos:Vector2|Vector3)
	{
		super.setPosition(pos);
		this.stack.setIndexPosition(this.idParticle, pos);
	}

	setPositionXY(x:number,y:number)
	{
		super.setPositionXY(x,y);
		this.stack.setIndexPosition(this.idParticle, new Vector2(x,y));
	}


	setVisible(val:boolean)
	{
		super.setVisible(val);
		this.stack.setIndexPosition(this.idParticle, val ? this.position : deepPosition);
	}

	setRotationDeg(angle:number)
	{
		super.setRotationDeg(angle);
		this.stack.setIndexRotation(this.idParticle, angle * Math.PI / 180);
	}

	setRotationRad(angle:number)
	{
		super.setRotationRad(angle);
		this.stack.setIndexRotation(this.idParticle, angle);
	}

	makeInstance()
	{
		var copy = new ParticleItem(this.stack);
		this.makeChildsInstance(copy);
		return copy;
	}


}