import React, { Component } from 'react';
import SocketData, { timeStamp } from '../SocketData';
import { DataType, PointerContext, ColorPointer, ClientDataMsg } from '../../Shared/SharedTypings';
import { toCssColor } from '../models/Color';

interface Props {
    socket: SocketData;
}

interface ColorState {
    color?: string;
    touched: boolean;
    displayedAt?: number;
}

class ColorPanel extends Component<Props> {
    _isMounted = false;
    state: ColorState = { color: '#aaffff', touched: false, displayedAt: timeStamp() };
    socket: SocketData;

    // Initialize the state
    constructor(props: Props) {
        super(props);
        this.socket = props.socket;
    }

    componentDidUpdate(prevProps: Props, prevState: ColorState) {
        if (this.state.color !== prevState.color) {
            this.setState({ displayedAt: timeStamp() });
        }
    }

    componentDidMount() {
        this._isMounted = true;
        this.socket.onData.push(this.onData);
    }

    componentWillUnmount() {
        this._isMounted = false;
        const callbackFun = this.socket.onData.indexOf((f: any) => f === this.onData);
        if (callbackFun >= 0) {
            this.socket.onData.splice(callbackFun, callbackFun);
            const colors = this.socket.getData(DataType.Color);
            if (colors.length > 0) {
                this.setState({ color: colors[colors.length - 1] });
            }
        }
    }

    onData = (data: ClientDataMsg) => {
        if (this._isMounted && data.type === DataType.Color) {
            this.setState({
                color: toCssColor(data.color),
                displayedAt: undefined,
            });
        }
    };

    onClick = (event: React.PointerEvent<HTMLDivElement>) => {
        const rect = (event.target as HTMLDivElement).getBoundingClientRect();
        this.setState({ touched: undefined });
        this.socket.addData<ColorPointer>({
            type: DataType.Pointer,
            context: PointerContext.Color,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
            width: rect.width,
            height: rect.height,
            color: this.state.color || 'white',
            displayed_at: this.state.displayedAt ?? timeStamp(),
        });
    };

    render() {
        return (
            <div
                id="color-panel"
                style={{
                    background: this.state.color,
                    position: 'relative',
                    userSelect: 'none',
                }}
                onPointerDown={() => this.setState({ touched: true })}
                onPointerUp={this.onClick}
                onPointerCancel={() => this.setState({ touched: undefined })}
                onPointerOut={() => this.setState({ touched: undefined })}
            >
                {this.state.touched && (
                    <div
                        style={{
                            borderRadius: '50%',
                            width: '0.5rem',
                            height: '0.5rem',
                            position: 'absolute',
                            left: '1rem',
                            top: '1rem',
                            background: 'red',
                        }}
                    />
                )}
            </div>
        );
    }
}

export default ColorPanel;
