const sel = (v, el = document) => el.querySelector(v);
const el = (tag, ...attr) => {
  // 일반 노드 들어오는 경우
  const el = typeof tag == "string" ? document.createElement(tag) : tag;
  for (let i = 0; i < attr.length;) {
    const k = attr[i++];
    const v = attr[i++];
    if (typeof el[k] == "function") el[k](...attr(Array.isArray(v) ? v : [v]));
    else if ((k[0] = "@")) el.style[k.substr(1)] = v;
    else el[k] = v; 
  }
  return el;
};
const err = (v = "invalid") => {throw v};
const override = _ => err("override");
const prop = (t, p) => Object.assign(t, p);
const is = (t, p) => t instanceof p;
const d64 = v =>
  decodeURIComponent(
    atob(v)
      .split("")
      .map(c => "%" + c.charCodeAt(0).toString())
  );
const snack = v => {
  sel("#snack").innerHTML = v;
  setTimeout(_ => (sel("#snack").innerHTML = ""), 3500);
};

const Task = class {
  static title(a, b) {
    return a._title > b._date;
  }
  static date(a, b) {
    return a._date > b._date;
  }
  constructor(_title = err(), _date = new Date()) {
    prop(this, { _title, _date, _list: [] });
  }
  get title() {
    return this._title;
  }
  get date() {
    return this._date.toUTFString();
  }
};

const TaskItem = class {};
