import { EventBus } from "ecs-unity";
import { PointerEventData } from "ecs-unity/src/unityTypes/Input";
import { MeshBasicMaterial } from "three";
import { MasterPool } from "../pool/MasterPool";
import { Text, U_Text } from "../entitysUnity/Text";
import { Image, U_Image } from "./Image";

export type ButtonCallback = () => void;

export class Button extends U_Image {
    protected className = 'Button';
    private curText: string;
    private textBlock: U_Text;
    private onClickEvent: ButtonCallback;

    constructor(mat: MeshBasicMaterial, _text: string) {
        super(mat);
        this.material = mat;
        this.curText = _text;

        var text = new U_Text(_text, 30);
        text.GetComponent<Text>()!.color = '#fafafa';
        text.setPositionZ(0.001);
        text.setPositionXY(0, 0.1);
        this.add(text);
        this.textBlock = text;

        EventBus.subscribeEventEntity<PointerEventData>('onPointerDown', this, this.onClick.bind(this));
    }

    private onClick(event: PointerEventData) {
        if (this.onClickEvent !== undefined)
            this.onClickEvent();
    }

    setText(text: string) {
        this.curText = text;
        this.textBlock.text = text;
    }

    setScaleXY(x: number, y: number) {
        super.setScaleXY(x, y);
        this.textBlock.setScaleXY(1 / x, 1 / y);
    }

    addCallback(callback: ButtonCallback) {
        this.onClickEvent = callback;
    }


    makeInstance() {
        var copy = new Button(MasterPool.isCloneMaterial ? this.material.clone() : this.material, this.curText);
        this.makeChildsInstance(copy);
        return copy;
    }
}