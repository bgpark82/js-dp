// 의존성이 없는애 부터 만들어야
// list는 task에 의존적이고 task는 혼자 따로 놈으로 만들기 쉽다.
// 은닉화 : 안보여준다
// 캡슐화 : 추상적으로 보여준다.
// 추상적으로 보여주고 내부적으로는 캡슐화
const sel = (v, el = document) => el.querySelector(v);

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
            ...list.filter(v => !v.isComplete()).sort(sort),
            ...list.filter(v => v.isComplete()).sort(sort)
          ]
      ).map(v => v.getResult(sort, stateGroup))
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
};

const TaskItem = class extends Task {
  constructor(title, date = new Date()) {
    super(title);
    this._date = date;
    this._isComplete = false;
  }

  isComplete() {return this._isComplete;}
  sortTitle(task) {return this._title > task._title;}
  sortDate(task) {return this._date > task._date;}
  toggle() {this._isComplete = !this._isComplete;}
};

const TaskList = class extends Task {
  constructor(title) {super(title);}
  isComplete() {}
  sortTitle() {return this;}
  sortDate() {return this;}
};

const DomRenderer = class {
  constructor(list, parent) {
    this._parent = parent;
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
    const parent = this._parent;
    parent.innerHTML = "";
    parent.appendChild("title,date".split(",")
        .reduce((nav, c) => (
            nav.appendChild(
              el("button",
                "innerHTML",c,
                "@fontWeight",this._sort == c ? "bold" : "normal",
                "addEventListener",["click", e => (this._sort = Task[c],  this.render())])
            ),nav)
        ,el("nav"))
    );
    this._render(parent, this._list, this._list.getResult(this._sort), 0);
  }
  _render(base, parent, { item, children }, depth) {
    const temp = [];
    base.style.paddingLeft = depth * 10 + "px";
    if (item instanceof TaskList) {
      temp.push(el("h2", "innerHTML", item._title));
    } else {
      temp.push(
        el("h3",
          "innerHTML",item._title,
          "@textDecoration",item.isComplete() ? "line-through" : "none"),
        el("time",
          "innerHTML",item._date.toString(),
          "datetime",item._date.toString()),
        el("button",
          "innerHTML",item.isComplete() ? "progress" : "complete",
          "addEventListener",["click", _ => this.toggle(item)]),
        el("button",
          "innerHTML","remove",
          "addEventListener",["click", _ => this.remove(parent, item)]));
    }
    const sub = el("section",
        "appendChild",el("input", "type", "text"),
        "appendChild",el("button", 
            "innerHTML", "addTask", 
            "addEventListener", ["click",e => this.add(item, e.target.previousSibling.value)])
    );
    children.forEach(v => [this._render(sub, item, v, depth + 1)]);
    temp.push(sub);
    temp.forEach(v => base.appendChild(v));
  }
};

const el = (tag, ...attr) => {
  const el = document.createElement(tag);

  for (let i = 0; i < attr.length; ) {
    const k = attr[i++];
    const v = attr[i++];
    if (typeof el[k] == "function") el[k](...(Array.isArray(v) ? v : [v]));
    else if (k[0] == "@") el.style[k.substr(1)] = v;
    else el[k] = v;
  }
  return el;
};

// 이거 먼저 짠다.!!!!
const list1 = new TaskList("s75");
const item1 = new TaskItem("3강 교안작성");
list1.add(item1);
const sub1 = new TaskItem("코드정리");
item1.add(sub1);
const subsub1 = new TaskItem("subsub1");
sub1.add(subsub1);

list1.getResult(Task.title);

const todo = new DomRenderer(list1, sel("#todo"));
todo.render();

// {item:"s75",
//   children:[
//     {item:taskItem('3강교안작성'),
//       children:[
//         {item:taskItem('subsub1'),
//           children:[]}
//         ]}
// ]
// }

// list1.add("지라 클라우즈 접속");
// list1.byDate();
// const list2 = new TaskList("s75");
// list2.add("2강 답안 작성");
// list2.add("3강 교안 작성");

// const list = list2.byDate();
// list[1].task.add("코드 정리");
// list[1].task.add("다이어그램 정리");

// console.log(list2.byDate()[1].sub);
