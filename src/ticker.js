/* eslint-disable func-names */
import requestAnimationFrame from 'raf';


const Ticker = function () {
};

const p = Ticker.prototype = {
  tickFnObject: {},
  id: -1,
  tweenId: 0,
  frame: 0,
  perFrame: Math.round(1000 / 60),
  getTime: Date.now || (() =>
    new Date().getTime()),
  elapsed: 0,
  lastUpdate: 0,
  skipFrameMax: 166,
};
p.add = function (fn) {
  const key = `tweenOne${this.tweenId}`;
  this.tweenId++;
  this.wake(key, fn);
  return key;
};
p.wake = function (key, fn) {
  this.tickFnObject[key] = fn;
  if (this.id === -1) {
    this.id = requestAnimationFrame(this.tick);
  }
};
p.clear = function (key) {
  delete this.tickFnObject[key];
};
p.sleep = function () {
  requestAnimationFrame.cancel(this.id);
  this.id = -1;
  this.frame = 0;
};
const ticker = new Ticker;
p.tick = function (a) {
  ticker.elapsed = ticker.lastUpdate ? ticker.getTime() - ticker.lastUpdate : ticker.perFrame;
  ticker.lastUpdate = ticker.lastUpdate
    ? ticker.lastUpdate + ticker.elapsed : ticker.getTime() + ticker.elapsed;
  const obj = ticker.tickFnObject;
  Object.keys(obj).forEach(key => {
    if (obj[key]) {
      obj[key](a);
    }
  });
  // 如果 object 里没对象了，自动杀掉；
  if (!Object.keys(obj).length) {
    return ticker.sleep();
  }
  if (ticker.elapsed > ticker.skipFrameMax || !ticker.frame) {
    ticker.frame++;
  } else {
    ticker.frame += Math.round(ticker.elapsed / ticker.perFrame);
  }
  ticker.id = requestAnimationFrame(ticker.tick);
};
let timeoutIdNumber = 0;
p.timeout = function (fn, time) {
  if (!(typeof fn === 'function')) {
    return console.warn('Is no function');// eslint-disable-line
  }
  const timeoutID = `timeout${Date.now()}-${timeoutIdNumber}`;
  const startFrame = this.frame;
  this.wake(timeoutID, () => {
    const moment = (this.frame - startFrame) * this.perFrame;
    if (moment >= (time || 0)) {
      this.clear(timeoutID);
      fn();
    }
  });
  timeoutIdNumber++;
  return timeoutID;
};
let intervalIdNumber = 0;
p.interval = function (fn, time) {
  if (!(typeof fn === 'function')) {
    console.warn('Is no function');// eslint-disable-line
    return null;
  }
  const intervalID = `interval${Date.now()}-${intervalIdNumber}`;
  let starFrame = this.frame;
  this.wake(intervalID, () => {
    const moment = (this.frame - starFrame) * this.perFrame;
    if (moment >= (time || 0)) {
      starFrame = this.frame;
      fn();
    }
  });
  intervalIdNumber++;
  return intervalID;
};
export default ticker;
