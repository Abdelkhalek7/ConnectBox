/* eslint-disable @typescript-eslint/no-explicit-any */
import buffer from "buffer";

if (!buffer.SlowBuffer) {
  (buffer as any).SlowBuffer = class {};
  if (!(buffer as any).SlowBuffer.prototype) {
    (buffer as any).SlowBuffer.prototype = {};
  }
}
