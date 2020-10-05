import { GyroMsg } from './../../Shared/SharedTypings';
import { Playground } from './Playground';
import { action, computed, observable } from 'mobx';
import { AccMsg, ClientDataMsg, DataType } from '../../Shared/SharedTypings';
import { ColorGrid, defaultGrid } from './ColorGrid/ColorGrid';
import { ColorPanel, defaultColorPanelMsg } from './ColorPanel';
import { Notification } from './Notification';
import SocketDataStore from '../stores/socket_data_store';
import { InputPrompt } from './InputPrompt';

const MESSAGE_THRESHOLD = 50;
export default class ClientData {
    deviceId: string;
    socket: SocketDataStore;
    rawData = observable.map<string, ClientDataMsg[]>({});

    @computed
    get rawAccData(): AccMsg[] {
        return ((this.rawData.get(DataType.Acceleration) ?? []) as AccMsg[]).sort(
            (a, b) => a.time_stamp - b.time_stamp
        );
    }

    @computed
    get rawGyroData(): GyroMsg[] {
        return ((this.rawData.get(DataType.Gyro) ?? []) as GyroMsg[]).sort(
            (a, b) => a.time_stamp - b.time_stamp
        );
    }
    @computed
    get unchartableRawData(): ClientDataMsg[] {
        const raw: ClientDataMsg[] = [];
        this.rawData.forEach((data, key) => {
            if (key === DataType.Acceleration || key === DataType.Gyro) {
                return;
            }
            raw.push(...data);
        });
        return raw.sort((a, b) => b.time_stamp - a.time_stamp);
    }
    @computed
    get hasRawAcc(): boolean {
        return this.rawData.has(DataType.Acceleration);
    }
    @computed
    get hasRawGyro(): boolean {
        return this.rawData.has(DataType.Gyro);
    }

    @observable
    show: boolean = true;

    private _logOnlyRawMessages: boolean;

    notifications = observable<Notification>([]);
    inputPrompts = observable<InputPrompt>([]);

    @observable.ref
    colorPanel: ColorPanel;

    @observable.ref
    colorGrid: ColorGrid;

    @observable.ref
    playground: Playground;

    constructor(socket: SocketDataStore, clientId: string, logOnlyRawMessages: boolean = false) {
        this.deviceId = clientId;
        this.socket = socket;
        this.colorPanel = new ColorPanel(defaultColorPanelMsg, this.socket);
        this.colorGrid = new ColorGrid(defaultGrid, this.socket);
        this.playground = new Playground(this.socket);
        this._logOnlyRawMessages = logOnlyRawMessages;
    }

    @computed
    get alertingMessages(): (InputPrompt | Notification)[] {
        const all = [...this.inputPrompts, ...this.notifications.filter((n) => n.alert)];
        return all.sort((a, b) => a.timeStamp - b.timeStamp);
    }

    @computed
    get isInputPromptOpen(): boolean {
        return this.alertingMessages[0]?.dataType === DataType.InputPrompt;
    }

    logOnlyRawMessages(on: boolean) {
        if (on) {
            this._logOnlyRawMessages = true;
        } else {
            this.rawData.clear();
            this._logOnlyRawMessages = false;
        }
    }

    @action
    addData(msgs: ClientDataMsg[]) {
        msgs.sort((a, b) => a.time_stamp - b.time_stamp);
        if (this._logOnlyRawMessages) {
            this.addToLog(msgs);
            return;
        }
        msgs.forEach((msg) => {
            if (msg.device_id === this.deviceId || msg.broadcast) {
                this.registerData(msg);
            }
        });
    }

    @action
    addToLog(msgs: ClientDataMsg[]) {
        msgs.forEach((msg) => {
            if (msg.device_id !== this.deviceId && !msg.broadcast) {
                return;
            }
            let data = this.rawData.get(msg.type);
            if (data) {
                if (data.length > MESSAGE_THRESHOLD) {
                    data.shift();
                }
            } else {
                data = observable<ClientDataMsg>([]);
                this.rawData.set(msg.type, data);
            }
            data.push(msg);
        });
    }

    @action
    registerData(data: ClientDataMsg) {
        switch (data.type) {
            case DataType.Notification:
                this.notifications.push(
                    new Notification(data, (notification: Notification) => {
                        this.notifications.remove(notification);
                    })
                );
                break;
            case DataType.InputPrompt:
                this.inputPrompts.push(new InputPrompt(data, this.socket));
                break;
            case DataType.Sprite:
                this.playground.addOrUpdateSprite(data.sprite);
                break;
            case DataType.RemoveSprite:
                this.playground.removeSprite(data.sprite_id);
                break;
            case DataType.ClearPlayground:
                this.playground.clearSprites();
                break;
            case DataType.Sprites:
                this.playground.addOrUpdateSprites(...data.sprites);
                break;
            case DataType.PlaygroundConfig:
                this.playground.updateConfig(data.config);
                break;
            case DataType.Color:
                this.colorPanel = new ColorPanel(data, this.socket);
                break;
            case DataType.Grid:
                this.colorGrid = new ColorGrid(data, this.socket);
                break;
            case DataType.GridUpdate:
                this.colorGrid.update(data);
                break;
        }
    }
}
