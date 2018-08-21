export interface IPropertyListener<T> {
  onPropertyChanged(target: T, property: keyof T, value: any, prevValue: any);
}

interface IObservable<T> {
  addPropertyListener(listener: IPropertyListener<T>): IBindedEvent;

  addPropertyListener(listener: (target: T, propertyName, value, prevValue) => void): IBindedEvent;

  raisePropertyChanged(property: string, value: any, prevValue: any): void;
  raiseCapture(property: string): void;
  
  getObject(): T;

  silent(callback: () => void);
}

export interface IBindedEvent {
  stopListening();
}

type IProxy<T> = {
  [P in keyof T]: T[P];
};

export type IObserved<T = any> = IProxy<T> & IObservable<T>;

export function observe<T>(item: T, fields: string[], opts: { 
  capture?: boolean;
  fieldsReadOnly?: string[];
} = {}): IObserved<T> {
  console.log("Observing [%s] in %o.", fields.join(", "), item);

  const props = fields.reduce((r, prop) => (r[prop] = {
    get: !opts.capture 
    ? () => item[prop]
    : () => { proxy.raiseCapture(prop); return item[prop]; },
    set: (v) => {
      const prev = item[prop];
      if (prev === v) return;
      if (typeof prev == 'number' && typeof v == 'number' && isNaN(prev) && isNaN(v)) return; // fix the NaN != NaN
      item[prop] = v;
      proxy.raisePropertyChanged(prop, v, prev);
    }
  }, r), {});

  if (opts.fieldsReadOnly)
    opts.fieldsReadOnly.reduce((r, prop) => (r[prop] = {
      get: () => item[prop]
    }, r), props);

  const proxy = Object.create(ObserverProxy.prototype, props) as IObserved<T>;
  proxy[init](item);

  // if (__DEV__) {
  // 	$tag(proxy, 'observe', item);
  // 	if (proxy[$observedProps]) { debugger; /* are we observing twice? */ }
  // 	proxy[$observedProps] = props;
  // }
  return proxy;
}


const init = Symbol("init");
const listeners = Symbol("listeners");
const object = Symbol("object");


export class ObserverProxy<T> implements IObservable<T> {
  private _disable: int;

  get $type() {
    const obj = this.getObject() as any;
    if (obj) return obj.$type;
  }

  public addPropertyListener(listener: (target, propertyName, value, prevValue?) => void): IBindedEvent;

  public addPropertyListener(listener: IPropertyListener<T>): IBindedEvent;

  public addPropertyListener(listener: IPropertyListener<T> | ((target, propertyName, value, prevValue?) => void)): IBindedEvent {
    // if (__DEV__) {
    // 	if (!listener) debugger;
    // }
    const be = new BindedEvent<T>(listener, this);
    this[listeners].push(be);
    return be;
  }

  public getObject(): T {
    return this[object];
  }

  public [init](item: T) {
    this[object] = item;
    this[listeners] = [];
  }

  private _captureHandler: (property)=>void;
  public raiseCapture(property) {
    if (this._captureHandler !== undefined)
      this._captureHandler(property);
  }

  public raisePropertyChanged(property, value, prevValue) {
    if (this._disable) return;
    this[listeners].forEach((i: BindedEvent<T>) =>
      i.notify(this, property, value, prevValue)
    );
  }

  public silent(callback: () => void) {
    this._disable = (this._disable || 0) + 1;
    try {
      callback();
    } finally {
      this._disable--;
    }
  }

  public capture(callback: () => void): Array<[string, any]> {
    if (this._captureHandler) throw 'already capturing';
    const captures = [];
    const obj = this.getObject();
    this._captureHandler = (property) => captures.push([property, obj[property]]);
    callback();
    delete this._captureHandler;
    return captures;
  }

  // // TODO: toJson / fromJson ?
  public toJSON() {
    const obj = this.getObject() as any;
    if (typeof obj.toJSON == "function")
      return obj.toJSON();
    return obj;
  }
}


class BindedEvent<T> implements IBindedEvent {
  public _unhooked: boolean;

  constructor(private listener: ((target, propertyName, value, prevValue) => void) | IPropertyListener<T>,
    private proxy: ObserverProxy<T>) {
  }

  public notify(target, property, value, prevValue) {
    if (typeof this.listener == "function")
      this.listener(target, property, value, prevValue);
    else
      (this.listener as any as IPropertyListener<T>).onPropertyChanged(target, property, value, prevValue);
  }

  public stopListening() {
    if (this._unhooked)
      return;
    this._unhooked = true;
    const ix = this.proxy[listeners].indexOf(this);
    if (ix != -1)
      this.proxy[listeners].splice(ix, 1);
  }
}