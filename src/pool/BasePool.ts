import {Entity} from '../entitys/Entity';
import { BasePoolType } from './BasePoolType';

/*
TODO
теоретичеки при put можно удалять от родителя, чтобы он не был в сцене привязан
если будет много объектов, то смысл есть, иначе можно и так оставить.
*/

// не наследуем от BasePoolType потому что в будущем нам нужны свойства типа setRenderOrder, setPosition и т.п.
export class BasePool extends Entity{

	protected pool:BasePoolType<Entity>;

	constructor(src:Entity, startCount = 1)
	{
		super();
		this.pool = new BasePoolType<Entity>(src, startCount);
	}

	get()
	{
		var e = this.pool.get();
		e.setVisible(true);
		return e;
	}

	put(e:Entity, checkFree = true)
	{
	//	e.parent = null;
	//	e.children = [];
		e.setVisible(false);
		return this.pool.put(e, checkFree);
	}

}