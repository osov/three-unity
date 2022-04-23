import { GameSystem } from "../systems/GameSystem";
import { Entity } from "../entitys/Entity";
import { BaseHelper } from "./BaseHelper";
import { BaseEntity } from "ecs-unity/src/entitys/BaseEntity";
import { Object3D, Vector3 } from "three";
import { EntitysSystem } from "../systems/EntitysSystem";
import { GameObject } from "ecs-unity";

export class SceneHelper extends BaseHelper {
    public static allMesh: GameObject[] = [];

    public static addToScene(entity: Entity, nameParent: string = '', pos: Vector3 = new Vector3(), angle = 0, isDynamic = true, id = -1) {
        var parent = null;
        if (nameParent != '') {
            if (nameParent == 'sceneOrtho')
                parent = GameSystem.instance.sceneOrtho;
            else
                parent = this.getGameObjectByName(nameParent);
            if (parent == null)
                console.warn("addToScene parent не найден:", nameParent);
        }

        return EntitysSystem.instance.addEntity(entity, pos, angle, isDynamic, parent, id);
    }

    public static addToUIScene(entity: Entity) {
        SceneHelper.addToScene(entity, 'sceneOrtho');
        GameSystem.instance.doResize();
    }

    public static getGameObjectByName(name: string) {
        if (this.allMesh.length == 0)
            this.getAll();
        for (let i = 0; i < this.allMesh.length; i++) {
            const it = this.allMesh[i];
            if (it.name == name) {
                return it;
            }
        }
        return null;
    }

    public static getEntityByName(name: string) {
        var e = this.getGameObjectByName(name);
        if (e == null)
            return null;
        if (!(e instanceof BaseEntity))
            console.warn("Объект не является сущностью:", name);
        return e as Entity;
    }

    public static getAllChildren(go: Object3D, list: GameObject[]) {
        for (let i = 0; i < go.children.length; i++) {
            const ch = go.children[i];
            if (ch instanceof BaseEntity)
                list.push(ch);
            if (ch.children.length > 0)
                this.getAllChildren(ch, list);
        }
    }

    public static getAll() {
        var list: GameObject[] = [];
        for (let s = 0; s < 2; s++) {
            var scene = s == 0 ? GameSystem.instance.scene : GameSystem.instance.sceneOrtho;
            for (let i = 0; i < scene.children.length; i++) {
                var ch = scene.children[i];
                if (ch instanceof BaseEntity)
                    list.push(ch);
                this.getAllChildren(ch, list);
            }
        }
        this.allMesh = list;
        return list;
    }

    public static hideList(list: string[]) {
        for (let i = 0; i < list.length; i++) {
            var go = SceneHelper.getGameObjectByName(list[i]);
            if (go)
                go!.visible = false;
        }
    }

    public static showList(list: string[]) {
        for (let i = 0; i < list.length; i++) {
            var go = SceneHelper.getGameObjectByName(list[i]);
            if (go)
                go!.visible = true;
        }
    }

    public static setParentByName(mesh: Entity, parentName: string = '') {
        var parent = parentName == '' ? GameSystem.instance.scene : SceneHelper.getGameObjectByName(parentName)!;
        if (parent === null)
            return console.error("Не найден родитель:", parentName);
        var wp = new Vector3();
        mesh.getWorldPosition(wp);
        if (mesh.parent !== null) {
            mesh.parent.remove(mesh);
        }
        mesh.parent = parent;
        parent.children.push(mesh);
        parent.updateMatrixWorld();
        var lp = new Vector3();
        lp = parent.worldToLocal(wp);
        mesh.position.copy(lp);
    }
}