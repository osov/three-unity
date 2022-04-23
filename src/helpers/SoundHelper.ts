import { BaseHelper } from "./BaseHelper";
import { AudioListener, Audio } from 'three';
import { ResourceSystem } from "../systems/ResourceSystem";
import { GameObject } from "ecs-unity";

export class SoundHelper extends BaseHelper {

    private static soundListener: AudioListener;
    private static idSound = 0;
    private static soundsUnique: { [k: string]: Audio } = {};
    private static isInit = false;


    public static tryInit() {
        if (this.isInit)
            return;
        this.isInit = true;
        this.soundListener = new AudioListener();
        // GameSystem.instance.scene.add(this.soundListener);
    }

    private static getVolume() {
        return 0.25;
    }

    public static playOne(name: string, volume = -1) {
        var buffer = ResourceSystem.instance.getSoundBuffer(name);
        if (!buffer)
            return console.warn("Звук с именем не найден:", name);
        this.tryInit();
        var sound = new Audio(this.soundListener);
        sound.setBuffer(buffer);
        sound.setVolume(volume == -1 ? this.getVolume() : volume / 100);
        sound.play();
    }

    public static stopById(id: string) {
        if (this.soundsUnique[id]) {
            this.soundsUnique[id].stop();
        }
    }

    public static playById(name: string, id = '', volume = -1, isLoop = false, go: GameObject | null = null) {
        var buffer = ResourceSystem.instance.getSoundBuffer(name);
        if (!buffer)
            return console.warn("Звук с именем не найден:", name);
        this.tryInit();
        if (id != '')
            this.stopById(id);
        if (id == '') {
            id = 'snd-' + this.idSound;
            this.idSound++;
        }
        var sound = new Audio(this.soundListener);
        sound.setVolume(volume == -1 ? this.getVolume() : volume / 100);
        sound.setLoop(isLoop);
        sound.setBuffer(buffer);
        sound.play();
        this.soundsUnique[id] = sound;
        return sound;
    }



}