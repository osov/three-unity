import { GameSystem } from '../systems/GameSystem';
import { Vector2, Vector3 } from 'three';
import { BaseHelper } from './BaseHelper';

/*
	рывок камеры при прохождении границы будет если во-первых при deltaStep не учтен deltaTime
	а во-вторых если кружится возле границы взад и вперед то при маленькой cameraSpeed она будет плавно двигаться назад
	соответственно рывок, а значит нужно увеличить ее скорость.
*/

export class CameraHelper extends BaseHelper {

	private static lookingAt: Vector2 = new Vector2();
	public static bgPhase: Vector2 = new Vector2();
	public static bgOffset: Vector2 = new Vector2();

	private static centerCamera(x: number, y: number) {
		var gs = GameSystem.instance;
		gs.camera.position.set(x, y, gs.camera.position.z);
		this.lookingAt.set(x, y)
	}

	public static doCam(cameraTarget: Vector2 | Vector3, deltaTime: number, deltaStep: Vector2 | Vector3) {
		var gs = GameSystem.instance;
		deltaStep.multiplyScalar(deltaTime); // если вдруг шаг движения не нормализован, умножив на дельту

		var dir = new Vector2(cameraTarget.x, cameraTarget.y).sub(this.lookingAt);
		var dst = new Vector2();
		const worldWidth = gs.settings.worldSize!.x;
		const worldHeight = gs.settings.worldSize!.y;
		// ось Х
		if (dir.x > worldWidth * 0.5) {
			dst.x = this.lookingAt.x + worldWidth + deltaStep.x;
			this.bgPhase.x += 1;
		}
		else if (dir.x < -worldWidth * 0.5) {
			dst.x = this.lookingAt.x - worldWidth + deltaStep.x;
			this.bgPhase.x -= 1;
		}
		else
			dst.x = this.lookingAt.x + dir.x * gs.settings.cameraSpeed! * deltaTime;

		// ось Y
		if (dir.y > worldHeight * 0.5) {
			dst.y = this.lookingAt.y + worldHeight + deltaStep.y;
			this.bgPhase.y += 1;
		}
		else if (dir.y < -worldHeight * 0.5) {
			dst.y = this.lookingAt.y - worldHeight + deltaStep.y;
			this.bgPhase.y -= 1;
		}
		else
			dst.y = this.lookingAt.y + dir.y * gs.settings.cameraSpeed! * deltaTime;


		this.centerCamera(dst.x, dst.y);

	}
}