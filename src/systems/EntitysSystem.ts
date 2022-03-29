import { Vector3, Object3D, PointsMaterial } from 'three';
import { BaseSystem } from './BaseSystem';
import { RenderSystem } from './RenderSystem';
import { Entity } from '../entitys/Entity';
import { MasterPool } from '../main';


export class EntitysSystem extends BaseSystem {

	public static instance:EntitysSystem;
	public entitys: { [key: number]: Entity } = {};
	private lastId: number = 0;
	private renderSystem: RenderSystem;

	constructor() {
		super();
		EntitysSystem.instance = this;
		this.renderSystem = RenderSystem.instance;
	}

	addEntity(entity: Entity, pos: Vector3 = new Vector3(), angleDeg: number = 0, isDynamic: boolean = false, parent: Object3D | null = null, id: number = -1) {
		if (id == -1)
			id = this.lastId++;
		if (this.entitys[id]) {
			this.warn("Сущность с таким ид существует", id, this.entitys[id]);
			this.remove(this.entitys[id]);
		}
		entity.onBeforeAdd();
		entity.idEntity = id;
		this.entitys[id] = entity;
		entity.addToParent(parent === null ? this.renderSystem.scene : parent);
		entity.setPosition(pos);
		entity.setRotationDeg(angleDeg);
		entity.onAfterAdd();
		this.renderSystem.dispatchEvent({ type: 'onAddedEntity', entity: entity });
		return entity;
	}

	remove(entity: Entity, isDestroy = false) {
		this.renderSystem.dispatchEvent({ type: 'onBeforeRemoveEntity', entity: entity });
		delete this.entitys[entity.idEntity];
		if (isDestroy) {
			entity.onBeforeRemove();
			entity.removeFromParent();
			entity.destroy();
		}
		else {
			MasterPool.ReturnEntity(entity);
		}
	}

	removeById(id: number, isDestroy:boolean = false) {
		var entity = this.entitys[id];
		if (!entity)
			return this.warn("Сущность для удаления не найдена:", id);
		return this.remove(entity, isDestroy);
	}

	getEntityById(id: number) {
		if (this.entitys[id] === undefined)
			return;
		else
			return this.entitys[id];
	}


	clearScene() {
		for (var id in this.entitys) {
			var e = this.entitys[id];
			this.remove(e, true);
		}
		this.entitys = {};
		this.lastId = 0;
	}

	update(deltaTime: number) {
		MasterPool.Update(deltaTime);
	}

}