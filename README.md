# SocketIo Server

General purpose socket.io server coming with lightweight react app to generate and receive events.

## Emmited Events

In the examples, `device_id` is expected to be **FooBar**, `device_nr` to be `0` and a random `time_stamp` (seconds since epoch).

### `new_data`

a `new_data` event always has the following format:

```js
{
  device_id: 'FooBar',
  device_nr: 0,
  time_stamp: 12,
  type: 'key' | 'acceleration' | 'gyro' | 'pointer' | 'notification'
}
```

Optionally, the new_data event can be sent

- to **all connected devices**:
  ```js
  {
    ...,
    broadcast: true
  }
  ```
- to **a specific device**
  ```js
  {
    ...,
    unicast_to: 2 // only send the message to the device number 2
  }
  ```

#### Controller

- `key`
  ```js
  {
      device_id: 'FooBar',
      device_nr: 0,
      time_stamp: 1596731613.793,
      type: 'key',
      key: 'up' | 'right' |'down' |'left' | 'home'
  }
  ```
- `acceleration`
  ```js
  {
      device_id: 'FooBar',
      device_nr: 0,
      time_stamp: 1596731613.793,
      type: 'acceleration',
      x: 0.0,
      y: 0.0,
      z: -9.81,
      interval: 32 /* A number representing the interval of time, in milliseconds, at which data is obtained from the device.*/
  }
  ```
- `gyro`
  ```js
  {
      device_id: 'FooBar',
      device_nr: 0,
      time_stamp: 1596731613.793,
      type: 'gyro',
      alpha: 0.0,   /* between 0 and 360degrees */
      beta: 0.0,    /* between -180 and 180 degrees */
      gamma: 0.0, /* between -90 and 90 degrees */
      absolute: true /* whether or not the device is providing orientation data absolutely */
  }
  ```

#### Color Panel

- `pointer`
  ```js
  {
      device_id: 'FooBar',
      device_nr: 0,
      time_stamp: 1596731613.793,
      type: 'pointer',
      context: 'color',
      x: 0, /* location on click, 0: left, <width>: right */
      y: 0, /* location on click, 0: top, <height>: bottom */
      width: 500,
      height: 700,
      color: 'yellow' /* current color of the panel */
  }
  ```

#### Color Grid

- `pointer`
  ```js
  {
      device_id: 'FooBar',
      device_nr: 0,
      time_stamp: 1596731613.793,
      type: 'pointer',
      context: 'grid',
      row: 0,     /* row index of clicked cell */
      column: 0,  /* column index of clicked cell */
      color: 'teal' /* color of clicked cell */
  }
  ```

### Server

Run within project root

- `yarn install` to install npm packages
- `yarn start` to start the server on port `5000` and websockets on `5001`

### Client app

Run within client folder

- `yarn install` to install npm packages
- `yarn start` to start the client on port `3000`


### Types

Too lazy to setup shared types, so run from the project's root:

**copy from server to client**
```sh
(rm -rf ./client/src/types/ || true) && cp -r ./types/ ./client/src/types/
```

**copy from client to server**
```sh
(rm -rf ./types || true) && cp -r ./client/src/types/ ./types/
```