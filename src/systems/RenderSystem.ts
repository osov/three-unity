import { Scene, Camera, WebGLRenderer, PerspectiveCamera, OrthographicCamera, Object3D, Vector2, Vector3, AmbientLight } from 'three';
import { EntitysSystem } from './EntitysSystem';
import { Entity } from '../entitys/Entity';
import { BaseSystem, EventBus, Input } from 'ecs-unity';
import { Image, U_Image } from '../entitysUnity/Image';
import { ResourceSystem } from './ResourceSystem';


export interface InitParams {
	isPerspective?: boolean;
	container?: HTMLElement | null;
	fontUrl?: string;
}

export class RenderSystem extends BaseSystem {
	public static instance:RenderSystem;
	public readonly scene: Scene;
	public readonly sceneOrtho: Scene;
	public readonly camera: Camera;
	public readonly cameraOrtho: OrthographicCamera;
	public readonly renderer: WebGLRenderer;
	public readonly resourceSystem: ResourceSystem;
	public readonly entitysSystem: EntitysSystem;
	public readonly settings: InitParams;
	public readonly container: HTMLElement;
	protected light: AmbientLight;

	constructor(settings: InitParams) {
		super();
		RenderSystem.instance = this;
		new Input();

		this.container = settings.container ? settings.container : document.body;
		this.settings = settings;
		const width = window.innerWidth;
		const height = window.innerHeight;
		if (settings.isPerspective) {
			const cam = new PerspectiveCamera(75, width / height, 0.1, 100)
			cam.position.z = 1;
			this.camera = cam;
		}
		else {
			const cam = new OrthographicCamera(0, 0, 0, 0, -10, 10);
			cam.position.z = 1;
			cam.zoom = 1;
			this.camera = cam;
		}
		this.cameraOrtho = new OrthographicCamera(0, 0, 0, 0, 0, 1);
		this.cameraOrtho.position.z = 1;
		this.cameraOrtho.zoom = 1;

		this.scene = new Scene();
		this.sceneOrtho = new Scene();
		this.renderer = new WebGLRenderer();
		this.renderer.setSize(width, height);
		this.renderer.setClearColor(0xffffff, 1);
		this.renderer.autoClear = false;

		this.light = new AmbientLight(0xffffff);
		this.scene.add(this.light);

		this.container.appendChild(this.renderer.domElement);
		this.container.oncontextmenu = function () { return false; }
		this.onResize();

		this.resourceSystem = new ResourceSystem();
		this.entitysSystem = new EntitysSystem();

		
		EventBus.subscribeEvent('onResize', this.onResize.bind(this));
	}

	public setZoom(z: number) {
		if (this.settings.isPerspective)
			return console.warn("Камера не ортографическая");

		(this.camera as OrthographicCamera).zoom = z;
		this.onResize();
	}

	protected async initRender(fontUrl: string) {
		await this.resourceSystem.init(fontUrl);
	}

	public doResize(){
		this.onResize();
	}

	protected onResize() {
		const width = this.container.clientWidth;
		const height = this.container.clientHeight;
		if (this.settings.isPerspective) {
			(this.camera as PerspectiveCamera).aspect = width / height;
			(this.camera as PerspectiveCamera).updateProjectionMatrix();
		}
		else {
			const left = -width / 2;
			const right = width / 2;
			const top = height / 2;
			const bottom = -height / 2;
			(this.camera as OrthographicCamera).top = top;
			(this.camera as OrthographicCamera).right = right;
			(this.camera as OrthographicCamera).left = left;
			(this.camera as OrthographicCamera).bottom = bottom;

			(this.camera as OrthographicCamera).updateProjectionMatrix();
		}

		this.cameraOrtho.left = - width / 2;
		this.cameraOrtho.right = width / 2;
		this.cameraOrtho.top = height / 2;
		this.cameraOrtho.bottom = - height / 2;
		this.cameraOrtho.updateProjectionMatrix();

		this.updateHud(width, height);

		this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
	}

	protected updateHud(width: number, height: number) {
		for (let i = 0; i < this.sceneOrtho.children.length; i++) {
			const m = this.sceneOrtho.children[i];
			if (m instanceof U_Image) {
				let align = m.align;
				let tx = 0;
				let ty = 0;
				if (align.x == -1)
					tx = - width * 0.5;
				if (align.x == 1)
					tx = width * 0.5;
				if (align.y == -1)
					ty = - height * 0.5;
				if (align.y == 1)
					ty = height * 0.5;
				m.setPositionXY(m.screenPositon.x, m.screenPositon.y);
			}

		}
	}

	public addUi(mesh: Object3D) {
		this.sceneOrtho.add(mesh);
		this.onResize();
	}


	// ----------------------------------------------------------------------------------------------------------
	// Methods
	// ----------------------------------------------------------------------------------------------------------
	
	async preloadTextData(path: string, newName: string = '') {
		return this.resourceSystem.preloadTextData(path, newName);
	}

	async loadTextures(path: string, names: string[]) {
		return this.resourceSystem.loadTextures(path, names);
	}

	clearScene() {
		return this.entitysSystem.clearScene();
	}

	setBgColor(color: number) {
		this.renderer.setClearColor(color, 1);
		this.light.color.set(color);
	}

	doFull() {
		this.container.requestFullscreen();
	}


}