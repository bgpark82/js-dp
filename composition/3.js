// 의존성이 없는애 부터 만들어야
// list는 task에 의존적이고 task는 혼자 따로 놈으로 만들기 쉽다.
// 은닉화 : 안보여준다
// 캡슐화 : 추상적으로 보여준다.
// 추상적으로 보여주고 내부적으로는 캡슐화
const Task = class {
  static title(a, b) {
    return a.sortTitle(b);
  }
  static date(a, b) {
    return a.sortDate(b);
  }
  constructor(title, date) {
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
      task: this._getResult(),
      children: (!stateGroup
        ? [...list].sort(sort)
        : [
            ...list.filter(v => !v.isComplete()).sort(sort),
            ...list.filter(v => v.isComplete()).sort(sort)
          ]
      ).map(v => v.getResult(sort, stateGroup))
    };
  }
  _getResult() {
    throw "override";
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
  constructor(title, date = Date.now()) {
    super(title);
    this._date = date;
    this._isComplete = false;
  }
  _getResult(sort, stateGroup) {
    return this;
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
  _getResult() {
    return this._title;
  }
  sortTitle() {
    return this;
  }
  sortDate() {
    return this;
  }
  byTitle(stateGroup = true) {
    return this.getResult(Task.title, stateGroup);
  }
  byDate(stateGroup = true) {
    return this.getResult(Task.date, stateGroup);
  }
};

const el = (tag, ...attr) => {
  const el = document.createElement(tag);
  for (let i = 0; i < attr.length; ) {
    const k = attr[i++];
    const v = attr[i++];
    if (typeof el[k] == "function")
      el[k](...TaskItem(Array.isArray(v) ? v : [v]));
    else if (k[0] == "@") el.style[k.substr(1)] = v;
    else el[k] = v;
  }
  return el;
};

// 이거 먼저 짠다.!!!!
const list1 = new TaskList("s75");
const item1 = new TaskItem("3강 교안작성");
list1.add(item1);
const item2 = new TaskItem("코드정리");
item1.add(sub1);
const subsub1 = new TaskItem("subsub1");
sub1.add(subsub1);

list1.getResult(Task.title);

// {item:"s75",
//   children:[
//     {item:taskItem('3강교안작성'),
//       children:[
//         {item:taskItem('subsub1'),
//           children:[]}
//         ]}
// ]
// }

list1.add("지라 클라우즈 접속");
list1.byDate();
const list2 = new TaskList("s75");
list2.add("2강 답안 작성");
list2.add("3강 교안 작성");

const list = list2.byDate();
list[1].task.add("코드 정리");
list[1].task.add("다이어그램 정리");

console.log(list2.byDate()[1].sub);
