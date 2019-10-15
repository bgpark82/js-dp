// 의존성이 없는애 부터 만들어야
// list는 task에 의존적이고 task는 혼자 따로 놈으로 만들기 쉽다.
// 은닉화 : 안보여준다
// 캡슐화 : 추상적으로 보여준다.
// 추상적으로 보여주고 내부적으로는 캡슐화
const Task = class {
  constructor(title, date) {
    if (!title) throw "invalid title";
    this._title = title;
    this._date = date;
    this._isComplete = false;
  }
  isComplete() {
    return this._isComplete;
  }
  toggle() {
    this._isComplete = !this._isComplete;
  }
  sortTitle(task) {
    return this._title > task._title;
  }
  sortDate(task) {
    return this._date > task._date;
  }
};

const taskSort = {
  title: (a, b) => a.sortTitle(b),
  date: (a, b) => a.sortDate(b)
};

const TaskList = class {
  constructor(title) {
    if (!title) throw "invalid title";
    this._title = title;
    this._list = [];
  }
  add(title, date = Date.now()) {
    this._list.push(new Task(title, date));
  }
  remove(task) {
    const list = this._list;
    if (list.includes(task)) list.splice(list.indexOf(task), 1);
  }
  byTitle(stateGroup = true) {
    return this._getList("title", stateGroup);
  }
  byDate(stateGroup = true) {
    return this._getList("date", stateGroup);
  }
  _getList(sort, stateGroup) {
    const list = this._list;
    const s = taskSort[sort];
    return !stateGroup
      ? [...list].sort(s)
      : [
          ...list.filter(v => !v.isComplete()).sort(s),
          ...list.filter(v => v.isComplete()).sort(s)
        ];
  }
};

// 이거 먼저 짠다.!!!!
const list1 = new TaskList("비사이드");
list1.add("지라 설치");
list1.add("지라 클라우즈 접속");
list1.byDate();
const list2 = new TaskList("s75");
list2.add("2강 답안 작성");
list2.add("3강 교안 작성");

console.log(list1.byTitle());
console.log(list2.byDate());
