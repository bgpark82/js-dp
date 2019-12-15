const Task = class {
  constructor(title) {
    this._title = title;
    this._list = [];
  }

  add(task) {
    this._list.push(task);
  }

  remove(task) {
    if (this._list.includes(task)) this._list.splice(this._list.indexOf(task));
  }
  getResult() {}
};

const TaskItem = class extends Task {
  constructor(title) {
    super(title);
    this._isComplete = false;
  }

  isComplete() {
    return this._isComplete;
  }

  toggle() {
    this._isComplete = !this._isComplete;
  }
};

const TaskList = class extends Task {
  constructor(title) {
    super(title);
  }
};

const DomRenderer = class {
  constructor(task, tag) {
    this._tag = tag;
    this._task = task;
  }

  add(parent, title) {
    parent.add(new TaskItem(title));
    this.render();
  }

  remove(parent, task) {
    parent.remove(task);
    this.render();
  }

  toggle(task) {
    task.toggle();
    this.render();
  }

  render(base, parent, { item, children }, dept) {
    base.style.paddingLeft = dept * 10 + "px";
    const temp = [];
  }
};

el = (tag, ...attr) => {
  const el = document.createElement(tag);
  for (let i = 0; i < attr.length;) {
    const key = attr[i++];
    const value = attr[i++];
    if(typeof el[key]);
  }
};

const list1 = new TaskList("s75");
const item1 = new TaskItem("3강 교안 작성");
list1.add(item1);
const sub1 = new TaskItem("코드정리");
item1.add(sub1);
const subsub1 = new TaskItem("sub1");
sub1.add(subsub1);

list1.getResult();

const todo = new DomRenderer();
todo.render();
