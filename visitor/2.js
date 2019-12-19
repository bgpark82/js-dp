const err =(v)=>{throw v}
const override =_=> err("override");
const prop = (p,t) => Object.assign(p,t);
const is = (c,p) => c instanceof p; 
const el = (tag, ...attr)=>{
    const el = (typeof tag == 'string') ? document.createElement(tag) : tag;
    for(let i = 0; i < attr.length;){
        const k = attr[i++];
        const v = attr[i++];
        // addEventListener(...[click, _=> function])
        if(typeof el[k] == 'function') el[k](...(Array.isArray(v) ? v : [v]));
        else if(k[0] === '@') el.style[k.substr(1)] = v;
        else el[k] =v;
    }
    return el;
}
const sel = (tag) => document.querySelector(tag)

const Observer = class {
    observe() {override();}
};

const Subject = class {
    constructor() {
        this._observers = new Set();
    }
    addObserver(o){
        if(!is(o, Observer)) err();
        this._observers.add(o)
    }
    removeObservers(o){
        if(!is(o, Observer)) err();
        this._observers.delete(o);
    }
    notify(){
        this._observers.forEach(o => o.observe())
    }
}

const TaskObserver = class extends Observer {
    constructor(_task){
        super();
        prop(this, {_task});
    }
    observe(){
        this._task.notify();
    }
}


const Task = class extends Subject{
    static title(a,b){ return a._title > b._title}
    static date(a,b){ return a._date > b._date}
    constructor(_title = err(), _date = new Date()) {
        super()
        prop(this, {_title, _date, _list:[], _observer: new TaskObserver(this)})
    }
    get title() {return this._title}
    get date() {return this._date.toUTCString()}

    add(child){
        if(!is(child,Task)) err(); 
        this._list.push(child);
        child.addObserver(this._observer);
        this.notify();
    };
    remove(){
        const list = this._list;
        if(!list.includes(task)) err();
        if(list.includes(task)) list.splice(list.indexOf(task),1);
        task.removeObserver(this._observer);
        this.notify();
    };
    getTask(sort, stateGroup=true){
        const list = this._list;
        return {
            item:this,
            children:(!stateGroup ? [...list].sort(sort) :
                [...list.filter(t=>t.isComplete()).sort(sort),
                ...list.filter(t=>!t.isComplete()).sort(sort)]
            ).map(v => v.getTask(sort, stateGroup))
        }
    };
    accept(sort, stateGroup, painter){
        // _current에 그림 그림 = 현재 task 그리고
        painter.start(sort, stateGroup, this);
        // 자식 task의 accept 호출 
        this.getTask(sort, stateGroup).children.forEach(
            ({item})=>item.accept(sort,stateGroup, painter)
        )
        painter.end();
    };
}

const TaskItem = class extends Task {
    constructor(title, date) {
        super(title, date);
        this._isComplete = false;
    }
    isComplete(){ return this._isComplete };
    toggle(){ 
        this._isComplete = !this._isComplete;
        this.notify();
    };
}

const TaskList = class extends Task {
    // constructor에서 받아서 super로 넘겨줌
    constructor(title, date) { super(title, date); }
}

const Renderer = class extends Observer{
    constructor(_task = err(), _painter = err()){
        // Painter는 Painter 자신에게 renderer 상태 전부를 넣어줌
        super();
        prop(this, {_task,_painter: prop(_painter, {renderer:this}), _sort:'title'})
        _task.addObserver(this);
    }
    observe(){
        this.render();
    }
    add(task, title, date){
        task.add(new TaskItem(title, date))
    }
    remove(parent, task){
        if(!is(parent, Task) || !is(task, Task)) err();
        parent.remove(task);
    }
    toggle(task){
        if(!is(task, TaskItem)) err();
        task.toggle();
    }
    render(){
        this._painter.reset();
        // this._task.accept(Task[this._sort], true,this._painter);
        // visitor가 task를 받아야지
        this._painter.operation(Task[this._sort], true, this._task)
    }
}

// 그림 그리는 애 
const Painter = class {
    set renderer(v){this._renderer = v};
    reset(){override()}
    operation(sort, stateGroup, task){
        this._start(sort,stateGroup, task);
        task.getTask(sort, stateGroup).children.forEach(
            ({item}) => this.operation(sort, stateGroup, item)
        );
        this._end();
    }
    _start(){override()}
    _end(){override()}
}

const DomPainter = class extends Painter {
    constructor(_parent){
        super();
        prop(this,{_parent})
    }
    // _current
    reset(){
        this._current=el(sel(this._parent), 'innerHTML','hello')
    };
    _start(sort, stateGroup, task){
        switch(true){
            // _current.append(list)
            // _current.append(item)
            case is(task, TaskList) : this._list(task); break;
            case is(task, TaskItem) : this._item(task); break;
        }
        // _current.append(input + button)
        this._current = this._current.appendChild(el('section','@marginLeft','15px',
            'appendChild',el('input','type','text'),
            'appendChild',el('button','innerHTML','add','addEventListener',['click',e=> this._renderer.add(task,e.target.previousSibling.value)])))
    };
    _end(){
        this._current = this._current.parentNode;
    };
    
    _list(task){
        this._current.appendChild(el('h2','innerHTML',task.title));
    };
    
    _item(task){
        [el('h3','innerHTML',task.title, '@textDecoration',(task.isComplete() ? 'line-through': 'none')),
        el('item','innerHTML', task.date, 'datetime',task.date),
        el('button','innerHTML',task.isComplete() ?'progress':'complete',
        'addEventListener',['click',_=>this._renderer.toggle(task)]),
        el('button','innerHTML','delete',
        'addEventListener',['click',e=> this._renderer.remove(task)])
    ].forEach(v=>this._current.appendChild(v))
    };
}




const list1 = new TaskList('s75');
const item1 = new TaskItem('review chapter 3');
list1.add(item1);
const sub1 = new TaskItem('prep for the next class');
item1.add(sub1);
const subsub1 = new TaskItem('buying a note');
sub1.add(subsub1);

console.log(list1)
console.log(item1)
console.log(sub1)
console.log(subsub1)

const todo = new Renderer(list1, new DomPainter('#todo'));
todo.render();