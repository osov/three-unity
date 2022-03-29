import {Object3D,  Mesh, MeshBasicMaterial, PlaneBufferGeometry, Raycaster, Intersection, Vector2} from 'three';
import {Entity} from './Entity';

export class BaseMesh extends Entity{

	public geometry:PlaneBufferGeometry;
	public material:MeshBasicMaterial;
	protected isMesh = true;
	protected _sizeDelta:Vector2 = new Vector2(1,1);
	
	copy(source:any, recursive:boolean = true)
	{
		Mesh.prototype.copy.apply(this, [source, recursive]);
		return this;
	}

	raycast(raycaster:Raycaster, intersects:Intersection<Object3D<Event>>[])
	{
		return Mesh.prototype.raycast.apply(this, [raycaster, intersects]);
	}

	protected setColor(color:string, alpha = 1)
	{
		if (color.length > 7){
			alpha = parseInt(color.substr(7,2), 16)/255;
			
			color = color.substr(0,7);
		}
		var mesh = this;
		var mat = mesh.material;
		if (alpha != -1)
		{
			mat.transparent = true;
			mat.opacity = alpha;
		}
		mat.color.set( color );
	}


}
