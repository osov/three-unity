import { Vector2, Vector3, Event, PointsMaterial, Object3D } from 'three';
import { RenderSystem, InitParams } from './RenderSystem';
import { SelectorHelper } from '../helpers/SelectorHelper';
import { LooperHelper, EventUpdate } from '../helpers/LooperHelper';
import { Entity } from '../entitys/Entity';
import { MasterPool } from '../pool/MasterPool';
import * as TWEEN from '@tweenjs/tween.js';
import { SceneHelper } from '../helpers/SceneHelper';
import { Resources } from 'ecs-unity';
import { ResourceSystem } from './ResourceSystem';
import { pointToScreen, screenToPoint } from '../utils/gameUtils';
import { WrapHelper, WrapInfo } from '../helpers/WrapHelper';


export class GameSystem extends RenderSystem {
	public static instance: GameSystem;
	public selectorHelper: SelectorHelper;
	private looperHelper: LooperHelper;
	public idLocalEntity: number = -1;
	private wrapInfo: WrapInfo;
	public intervalStaticUpdate: number = 100;
	private lastStaticUpdate: number = 0;

	constructor(params: InitParams) {
		super(params);
		GameSystem.instance = this;
	}

	async init() {
		await super.initRender(this.settings.fontUrl!);
		this.looperHelper = new LooperHelper();
		this.selectorHelper = new SelectorHelper();

		this.looperHelper.init();
		this.selectorHelper.init();

		new Resources(ResourceSystem.instance);
		new MasterPool();
		new SceneHelper().init();
		new WrapHelper().init();
		//	WrapHelper.drawDebugBorder(this.scene);
	}

	start() {
		this.looperHelper.addEventListener('update', this.updateEvent.bind(this));
		this.looperHelper.addEventListener('updateTimeout', this.updateEventTimeout.bind(this)); // когда нету фокуса, но мы хотим крутить события
	}

	// ----------------------------------------------------------------------------------------------------------
	// Core
	// ----------------------------------------------------------------------------------------------------------


	addToRaycast(entity: Entity) {
		this.selectorHelper.add(entity)
	}

	clearScene() {
		super.clearScene();
		this.selectorHelper.clear();
	}

	pointToScreen(point: Vector3 | Vector2) {
		return pointToScreen(point, this.camera, this.container);
	}

	screenToPoint(point: Vector3 | Vector2) {
		return screenToPoint(point, this.camera, this.container);
	}

	updateEvent(event: Event) {
		var e = event as EventUpdate;
		this.update(e.deltaTime, e.now);
	}

	// в первую очередь чтобы крутануть сетевые события.
	updateEventTimeout(event: Event) {
		var e = event as EventUpdate;
		this.dispatchEvent({ type: 'onBeforeRender', deltaTime: e.deltaTime, now: e.now });
		this.dispatchEvent({ type: 'onAfterRender', deltaTime: e.deltaTime, now: e.now });
	}


	setIdLocalEntity(id: number) {
		this.idLocalEntity = id;
	}

	// Очередь обработки: network, time system, pool, wrap, render
	update(deltaTime: number, now: number) {
		TWEEN.update();
		this.dispatchEvent({ type: 'onBeforeRender', deltaTime, now });
		this.entitysSystem.update(deltaTime);

		var pos = new Vector3();

		// делаем заранее рассчет позиции локального, иначе если юзер объект будет ниже по списку сущностей,
		// то при переходе границы будет мерцание, т.к. до него переместится объект раньше/позже
		var localEntity = this.entitysSystem.entitys[this.idLocalEntity];
		if (localEntity) {
			localEntity.doUpdate(deltaTime);
			this.dispatchEvent({ type: 'onLocalUserUpdate', entity: localEntity, deltaTime });
		}

		if (this.settings.worldWrap)
			this.wrapInfo = WrapHelper.getWrapInfo(this.camera.position);

		// dynamic
		for (var id in this.entitysSystem.dynamicEntitys) {
			if (Number(id) == this.idLocalEntity)
				continue;

			var entity = this.entitysSystem.dynamicEntitys[id];
			entity.doUpdate(deltaTime);

			if (this.settings.worldWrap && !this.entitysSystem.notWrappedIds.has(Number(id))) {
				pos.copy(entity.getPosition());
				WrapHelper.getWrapPos(this.wrapInfo, pos);
				entity.setPositionXY(pos.x, pos.y);
			}
		}

		var isUpd = false;
		if (localEntity) {
			const minRange = 200;
			const _pos = localEntity.getPosition();
			var dx = this.settings.worldSize!.x * 0.5 - Math.abs(_pos.x);
			var dy = this.settings.worldSize!.y * 0.5 - Math.abs(_pos.y);
			isUpd = dx < minRange || dy < minRange;
		}

		// static
		const _now = Date.now();
		if (isUpd || _now > this.lastStaticUpdate) {
			deltaTime = _now - this.lastStaticUpdate;
			this.lastStaticUpdate = _now + this.intervalStaticUpdate;

			for (var id in this.entitysSystem.staticEntitys) {
				if (Number(id) == this.idLocalEntity)
					continue;

				var entity = this.entitysSystem.staticEntitys[id];
				entity.doUpdate(deltaTime);

				if (this.settings.worldWrap && !this.entitysSystem.notWrappedIds.has(Number(id))) {
					pos.copy(entity.getPosition());
					WrapHelper.getWrapPos(this.wrapInfo, pos);
					entity.setPositionXY(pos.x, pos.y);
				}
			}
		}

		this.renderer.clear();
		this.renderer.render(this.scene, this.camera);
		this.renderer.clearDepth();
		this.renderer.render(this.sceneOrtho, this.cameraOrtho);
		this.dispatchEvent({ type: 'onAfterRender', deltaTime, now });
	}



}
