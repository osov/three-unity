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


export class GameSystem extends RenderSystem {
	public static instance:GameSystem;
	public selectorHelper: SelectorHelper;
	private looperHelper: LooperHelper;

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
	}

	start() {
		this.looperHelper.addEventListener('update', this.updateEvent.bind(this));
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


	update(deltaTime: number, now: number) {
		TWEEN.update();
		this.dispatchEvent({ type: 'onBeforeRender', deltaTime, now });
		this.entitysSystem.update(deltaTime);

		for (var id in this.entitysSystem.entitys) {
			var entity = this.entitysSystem.entitys[id];
			entity.doUpdate(deltaTime);
		}

		this.renderer.clear()
		this.renderer.render(this.scene, this.camera);
		this.renderer.clearDepth();
		this.renderer.render( this.sceneOrtho, this.cameraOrtho);
		this.dispatchEvent({ type: 'onAfterRender', deltaTime, now });
	}



}
