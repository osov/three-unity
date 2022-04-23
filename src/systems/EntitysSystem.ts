import { Vector3, Object3D, PointsMaterial } from 'three';
import { BaseSystem } from './BaseSystem';
import { RenderSystem } from './RenderSystem';
import { Entity } from '../entitys/Entity';
import { MasterPool } from '../main';
import { GameSystem } from './GameSystem';

const startLocalId = 65535;

export class EntitysSystem extends BaseSystem {

	public static instance: EntitysSystem;
	public entitys: { [key: number]: Entity } = {};
	public dynamicEntitys: { [key: number]: Entity } = {};
	public staticEntitys: { [key: number]: Entity } = {};
	public notWrappedIds: Set<number> = new Set();
	private lastId: number = startLocalId;
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
		if (isDynamic)
			this.dynamicEntitys[id] = entity;
		else
			this.staticEntitys[id] = entity;
		entity.addToParent(parent === null ? this.renderSystem.scene : parent);
		entity.setPosition(pos);
		entity.setRotationDeg(angleDeg);
		this.addToWrappedList(entity, isDynamic);
		entity.onAfterAdd();
		this.renderSystem.dispatchEvent({ type: 'onAddedEntity', entity: entity });
		return entity;
	}

	private addToWrappedList(entity: Entity, isDynamic: boolean = true) {
		if (!GameSystem.instance.settings.worldWrap)
			return;
		const cx = GameSystem.instance.settings.worldSize!.x * 0.5 - GameSystem.instance.settings.viewDistance!;
		const cy = GameSystem.instance.settings.worldSize!.y * 0.5 - GameSystem.instance.settings.viewDistance!;
		if (!isDynamic) {
			const pos = entity.getPosition();
			if ((pos.x >= -cx && pos.x <= cx) && (pos.y >= -cy && pos.y <= cy))
				return this.notWrappedIds.add(entity.idEntity);
		}
	}

	remove(entity: Entity, isDestroy = false) {
		this.renderSystem.dispatchEvent({ type: 'onBeforeRemoveEntity', entity: entity });
		delete this.entitys[entity.idEntity];
		delete this.dynamicEntitys[entity.idEntity];
		delete this.staticEntitys[entity.idEntity];
		this.notWrappedIds.delete(entity.idEntity);
		entity.onBeforeRemove();
		if (isDestroy) {
			entity.removeFromParent();
			entity.destroy();
		}
		else {
			MasterPool.ReturnEntity(entity);
		}
	}

	removeById(id: number, isDestroy: boolean = false) {
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