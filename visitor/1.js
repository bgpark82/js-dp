const sel = (v, el = document) => el.querySelector(v);
const el = (tag, ...attr) => {
  const el = typeof tag == "string" ? document.createElement(tag) : tag;
  for (let i = 0; i < attr.length;) {
    const k = attr[i++];
    const v = attr[i++];
    if (typeof el[k] == "function") el[k](...(Array.isArray(v) ? v : [v]));
    else if (k[0] = "@") el.style[k.substr(1)] = v;
    else el[k] = v; 
  }
  return el;
};
const err = (v = "invalid") => {throw v};
const override = _ => err("override");
const prop = (t, p) => Object.assign(t, p);
const is = (t, p) => t instanceof p;
const d64 = v => decodeURIComponent(
    atob(v).split("").map(c => "%" + c.charCodeAt(0).toString()));
const snack = v => {
  sel("#snack").innerHTML = v;
  setTimeout(_ => (sel("#snack").innerHTML = ""), 3500);
};


const Task = class {
  static title(a, b) {return a._title > b._date;}
  static date(a, b) {return a._date > b._date;}

  constructor(_title = err(), _date = new Date()) {
    prop(this, { _title, _date, _list: [] });
  }

  get title() { return this._title; }
  get date() { return this._date.toUTCString(); }

  add(task){
    if(!is(task, Task)) err(); this._list.push(task);
  }
  remove(task){
    const list = this._list;
    if(list.includes(task)) list.splice(list.indexOf(task), 1);
  }
  getResult(sort, stateGroup = true){
    const list = this._list;
    return {
      item: this,
      children: (!stateGroup ? [...list].sort(sort): [
        ...list.filter(v => !v.isComplete()).sort(sort),
        ...list.filter(v => v.isComplete()).sort(sort)
      ]).map(v => v.getResult(sort, stateGroup))
    }
  }
  isComplete() { override();}

  // Task가 visitor를 받아들임
  // visitor를 Task의 순환구조에 맞게 돌리는 것은 Task 책임 
  accept(sort, stateGroup, visitor){
    // visitor는 this만 처리하고 end
    visitor.start(sort, stateGroup, this);
    // 자식들 돌아가면서 accept해줘
    // 빈배열이 될때까지 돌아감
    this.getResult(sort, stateGroup).children.forEach(
    ({item})=>item.accept(sort, stateGroup, visitor));
    // 확산이 끝나면 visitor 종료
    // render하고 확산후 돌아오는게 필요
    visitor.end();
  }
};

const TaskItem = class extends Task{
  constructor(title, date){
    super(title,date);
    this._isComplete = false;
  }
  isComplete() { return this._isComplete}
  toggle() { this._isComplete = !this._isComplete}
};

const TaskList = class extends Task {
  constructor(title, date) { super(title, date) }
  isComplete(){}
}

// view와 Task를 동시에 알고있는 녀석 = controller
const Renderer = class {
  constructor(_list = err(), _visitor = err())  {
    prop(this, {_list,_visitor: prop(_visitor, {renderer:this}), _sort: 'title'})
  }
  add(parent, title, date){
    if(!is(parent, Task)) err();
    parent.add(new TaskItem(title, date));
    this.render()
  }
  remove(parent, task){
    if(!is(parent, Task) || !is(task, Task)) err();
    parent.remove(task)
    this.render();
  }
  toggle(task){
    if(!is(task, TaskItem)) err();
    task.toggle();
    this.render();
  }
  render() {
    this._visitor.reset();
    this._list.accept(Task[this._sort], true, this._visitor);
  }
}

const Visitor = class {
  set renderer(v) {this._renderer = v;}
  reset() {override();}
  start(task) {override()}
  end() {override()}
}

const DomVisitor = class extends Visitor {
  constructor(_parent) {
    super();
    prop(this, {_parent});
  }
  reset() {
    this._current = el(sel(this._parent), 'innerHTML','');
  };
  start(sort, stateGroup, task){
    if(!is(this._renderer, Renderer)) err();
    switch(true){
      case is(task, TaskItem) : this._item(task); break;
      case is(task, TaskList) : this._list(task); break;
    }
    this._current = this._current.appendChild(el('section',
      '@marginLeft','15px',
      'appendChild',el('input','type','text'),
      'appendChild',el('button', 'innerHTML','addTask',
          'addEventListener',['click', e=> this._renderer.add(task, e.target.previousSibling.value)])))
  }
  end() {
    this._current = this._current.parentNode;
  }
  _list(task){
    this._current.appendChild(el('h2','innerHTML',task.title))
    console.log(this._current)
  }
  _item(task){
    [el('h3','innerHTML',task.title, 
        '@textDecoration',task.isComplete() ? 'line-through':'none'),
    el('time', 'innerHTML', task.date,'datetime',task.date),
    el('button','innerHTML',task.isComplete() ? 'progress' : 'complete',
      'addEventListener',['click',_=>this._renderer.toggle(task)]),
    el('button','innerHTML','remove',
      'addEventListener',['click',_=>this._renderer.remove(parent)])
    ].forEach(v=>this._current.appendChild(v))
  }
}

const list1 = new TaskList('s75')
const item1 = new TaskItem('3강 교안작성');
list1.add(item1);
const sub1 = new TaskItem('코드 정리');
item1.add(sub1);
const subsub1 = new TaskItem('subsub1');
sub1.add(subsub1);

const todo = new Renderer(list1, new DomVisitor('#todo'));
todo.render();

