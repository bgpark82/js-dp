const sel = (v, el = document) => el.querySelector(v);
const el = (tag, ...attr) => {
  const el = document.createElement(tag);
  for (let i = 0; i < attr.length; ) {
    const key = attr[i++];
    const value = attr[i++];
    if (typeof el[key] == "function")
      el[key](...(Array.isArray(value) ? value : [value]));
    else if (key[0] == "@") el.style[key.substr(1)] = value;
    else el[key] = value;
  }
  return el;
};

el(
  "section",
  "appendChild",
  el("input", "type", "text"),
  "appendChild",
  el("button", "innerHTML", "addTask", "addEventListener", [
    "click",
    // e => this.add(item, e.target.previousSibling.value)
    e => console.log(this)
  ])
);

const Task = class {
  static title(a, b) {
    return a.sortTitle(b);
  }
  static date(a, b) {
    return a.sortDate(b);
  }
  constructor(title) {
    if (!title) throw "invalid title";
    else this._title = title;
    this._list = [];
  }
  add(task) {
    if (task instanceof Task) this._list.push(task);
    else throw "invalid";
  }
  remove(task) {
    const list = this._list;
    if (list.includes(task)) list.splice(list.indexOf(task), 1);
  }
  getResult(sort, stateGroup) {
    const list = this._list;
    return {
      item: this,
      children: (!stateGroup
        ? [...list].sort(sort)
        : [
            ...list.filter(task => !task._isComplete()).sort(sort),
            ...list.filter(task => task._isComplete()).sort(sort)
          ]
      ).map(task => {
        return task.getResult(sort, stateGroup);
      })
    };
  }
  isComplete() {
    throw "override";
  }
  sortTitle() {
    throw "override";
  }
  sortDate() {
    throw "override";
  }
  toggle() {
    throw "override";
  }
};

const TaskItem = class extends Task {
  constructor(title, date = new Date()) {
    super(title);
    this._date = date;
    this._isComplete = false;
  }
  isComplete() {
    return this._isComplete;
  }
  sortTitle(task) {
    return this._title > task._title;
  }
  sortDate(task) {
    return this._date > task._date;
  }
  toggle() {
    this.isComplete = !this.isComplete;
  }
};

const TaskList = class extends Task {
  constructor(title) {
    super(title);
  }
  isComplete() {}
  sortTitle() {
    return this;
  }
  sortDate() {
    return this;
  }
};

const DomRenderer = class {
  constructor(list, tag) {
    this._tag = tag;
    this._list = list;
    this._sort = Task.title;
  }
  add(parent, title, date) {
    parent.add(new TaskItem(title, date));
    this.render();
  }
  remove(parent, task) {
    parent.remove(task);
    this.render();
  }
  toggle(task) {
    if (task instanceof TaskItem) {
      task.toggle();
      this.render();
    }
  }
  render() {
    const tag = this._tag;
    tag.innerHTML = "";
    tag.appendChild(
      "title,date"
        .split(",")
        .reduce(
          (nav, c) => (
            nav.appendChild(
              el(
                "button",
                "innerHTML",
                c,
                "@fontWeight",
                this._sort == c ? "bold" : "normal",
                "addEventListener",
                ["click", e => ((this._sort = Task[c]), this.render())]
              )
            ),
            nav
          ),
          el("nav")
        )
    );
    this._render(tag, this._list, this._list.getResult(this._sort), 0);
  }
  _render(base, parent, { item, children }, depth) {
    const temp = [];
    base.style.paddingLeft = depth * 10 + "px";
    if (item instanceof TaskList) {
      // TaskList
      temp.push(el("h2", "innerHTML", item._title));
    } else {
      // TaskItem
      temp.push(
        el(
          "h3",
          "innerHTML",
          item._title,
          "@textDecoration",
          item.isComplete() ? "line-through" : "none"
        ),
        el(
          "time",
          "innerHTML",
          item._date.toString(),
          "datetime",
          item._date.toString()
        ),
        el(
          "button",
          "innerHTML",
          item.isComplete() ? "progress" : "complete",
          "addEventListener",
          ["click", _ => this.toggle(item)]
        ),
        el("button", "innerHTML", "remove", "addEventListener", [
          "click",
          _ => this.remove(parent, item)
        ])
      );
    }
    const sub = el(
      "section",
      "appendChild",
      el("input", "type", "text"),
      "appendChild",
      el("button", "innerHTML", "addTask", "addEventListener", [
        "click",
        e => this.add(item, e.target.previousSibling.value)
        // e => console.log(this)
      ])
    );
    children.forEach(v => [this._render(sub, item, v, depth + 1)]);
    temp.push(sub);
    temp.forEach(v => base.appendChild(v));
  }
};

const list1 = new TaskList("s75");
const item1 = new TaskItem("3강 교안 작성");
list1.add(item1);
const sub1 = new TaskItem("코드 정리");
item1.add(sub1);
const subsub1 = new TaskItem("subsub1");
sub1.add(subsub1);

const test = list1.getResult(Task.title);
console.log(test);

const todo = new DomRenderer(list1, sel("#todo"));
todo.render();
