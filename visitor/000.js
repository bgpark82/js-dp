const Task = class {
    constructor(title, _0 = type(title, "string")) {
        this._title = title;
        this._list = [];
    }
    add(task, _0 = type(task, TaskItem)) {
        this._list.push(task);
    }
    getTask(){
        const list = this._list
        return {
            item:this,
            children:list.map(task => task.getTask())
        }
    }
    accept(visitor){
        visitor.start(this);
        this.getTask().children.forEach(({item})=> item.accept(visitor))
        visitor.end();
    }
};

const TaskList = class extends Task {
    constructor(title) {
        super(title);
    }
};

const TaskItem = class extends Task {
    constructor(title) {
        super(title);
    }
};

//----------------------------------------------------------------
const Renderer = class {
    constructor(taskList, visitor, _0 = type(taskList, TaskList), _1 = type(visitor, DomVisitor)) {
        this._taskList = taskList;
        this._visitor = Object.assign(visitor, {renderer:this})
    }
    render(){
        this._visitor.reset();
        this._taskList.accept(this._visitor);
    }
};

//----------------------------------------------------------------
const Visitor = class {
    reset(){override()}
    start(task){override()}
    end(){override()}
}

const DomVisitor = class extends Visitor{
    constructor(parent){
        super();
        this._parent = parent;
    }                  
    reset(){
        this._current = el(sel(this._parent),'innerHTML','')
    }
    start(task){
        switch(true){
            case is(task, TaskList) : this._list(task); break;
            case is(task, TaskItem) : this._item(task); break;
        }
        this._current = this._current.appendChild(el('section','appendChild',el('input'),'appendChild',el('button','innerHTML','addTask')))
    }
    end(){
        this._current = this._current.parentNode;
    }
    _list(task){
        this._current.appendChild(el('h2','innerHTML',task._title))
    }
    _item(task){
        [
            el('h3','innerHTML',task._title),
            el('button','innerHTML','complete'),
            el('button','innerHTML','delete','addEventListener',['click',()=>alert('delete')])
        ].forEach(el => this._current.appendChild(el))
    }
};

const is = (target, type) => target instanceof type;
const type = (target, type) => {
    if (typeof target == "string") {
        if (typeof target != type) throw `invalid type ${target} : ${type}`;
    } else if (!(target instanceof type))
        throw `invalid type ${target} : ${type}`;
    return target;
};
const el = (tag, ...attr) => {
    const el = typeof tag == "string" ? document.createElement(tag) : tag;
    for(let i = 0; i < attr.length;){
        const key = attr[i++];
        const value = attr[i++];
        if(typeof el[key] == "function")
            el[key](...(Array.isArray(value) ? value : [value]));
        else if(key[0] == "@") el.style[key.substr(1)] = value;
        else el[key] = value;
    }
    return el;
};
const sel = (data) => document.querySelector(data);
const override =_=> {throw 'override'}

const list1 = new TaskList("리스트");
const item1 = new TaskItem("아이템");
list1.add(item1);
const itemSub1 = new TaskItem("서브 아이템");
item1.add(itemSub1);
const itemSubSub1 = new TaskItem("서브 서브 아이템");
itemSub1.add(itemSubSub1);

const todo = new Renderer(list1, new DomVisitor("#todo"));
todo.render();