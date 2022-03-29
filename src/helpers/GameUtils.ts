import { Button, ButtonCallback } from "../entitysUnity/Button";
import * as TWEEN from '@tweenjs/tween.js';
import { SceneHelper } from "./SceneHelper";
import { Vector2, Vector3 } from "three";

export type TweenCallback = (value?: number) => void;

export class GameUtils {
	constructor() {

	}

	public static AddButtonCallback(btnName: string, callback: ButtonCallback) {
		var btn = SceneHelper.getGameObjectByName(btnName);
		if (!btn) {
			return console.warn("Кнопка не найдена:", btnName);
		}
		var ui = (btn as Button);
		ui.addCallback(callback);
	}

	public static DoShare(text: string, id: string) {
		console.log("Поделились:", text, id);
	}

	public static tweenCallback(time: float, delay: float, onStart: TweenCallback, onUpdate?: TweenCallback, onComplete?: TweenCallback, inverse: boolean = false) {
		time *= 1000;
		delay *= 1000;
		let val = { value: inverse ? 1 : 0 };
		const tween = new TWEEN.Tween(val)
			.delay(delay)
			.to({ value: inverse ? 0 : 1 }, time)
			.easing(TWEEN.Easing.Linear.None)
			.onStart(() => {
				if (onStart)
					onStart();
			})
			.onUpdate(() => {
				if (onUpdate)
					onUpdate(val.value);
			})
			.onComplete(() => {
				if (onComplete)
					onComplete();
			})
			.start()
	}

	public static ScreenToRectPos(pos: Vector2 | Vector3, nameMesh: string) {
		return new Vector2(pos.x, pos.y)
	}

	public static getCurDate(format = "dd.MM.yyyy") {
		var date = new Date();
		const map: any = {
			MM: date.getMonth() + 1,
			dd: date.getDate(),
			yy: date.getFullYear().toString().slice(-2),
			yyyy: date.getFullYear()
		}

		return format.replace(/MM|dd|yy|yyy/gi, matched => map[matched]);
	}

	public static SortList<T>(list: T[], field: string, isAsc = true) {
		if (isAsc)
			return list.sort((a: any, b: any) => a[field] - b[field]);
		else
			return list.sort((a: any, b: any) => b[field] - a[field]);
	}
}
