const err=(v)=>{throw v};
const override = _ =>{err('override')};
const is = (c,p)=> c instanceof p;
const prop = (p, c)=> Object.assign(p,c);
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


const Subject = class {
    constructor(){
        // subject는 여러가지 object가짐
        this._observers = new Set();
    }
}
const Task = class extends Subject {
    static title(a,b) {return a._title > b._title}
    static date(a,b) {return a._date > b._date}
    constructor(_title,_date=new Date()){
        // task는 하나의 observer를 가짐
        super();
        prop(this, {_title, _date, _list:[], _observer: new TaskObserver(this)})
    };
    get title() {return this._title}
    get date() {return this._date}
    add(task){ 
        if(!is(task,Task)) err();
        this._list.push(task);
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
}
const TaskItem = class extends Task {
    constructor(title, date){
        super(title, date);
        this._isComplete = false;
    }
    isComplete(){
        return this._isComplete;
    }
}
const TaskList = class extends Task {
    constructor(title, date){ super(title, date); }
}


// ------------------------------------------------------------------------


const Observer = class{
    observe() {override()}
}
const Renderer = class extends Observer {
    constructor(_task,_visitor){
        super();
        prop(this,{_task,_visitor:prop(_visitor,{renderer:this}), _sort:'title'})
    }
    render(){
        this._visitor.reset();
        this._visitor.operation(Task[this._sort],true,this._task)
    }
}
const TaskObserver = class extends Observer {
    constructor(_task){
        super();
        prop(this,{_task});
    }
}
// -----------------------------------------------------------------------

const Visitor = class {
    set renderer(v) {this._renderer = v}
    reset(){override()}
    operation(sort, stateGroup, task){
        this._start(sort,stateGroup,task);
        task.getTask(sort,stateGroup).children.forEach(
            ({item}) => this.operation(sort,stateGroup,item)
        );
        this._end();
    }
    _start(){override()};
}
const DomVisitor = class extends Visitor {
    constructor(_parent){
        super();
        prop(this,{_parent})
    }
    reset() {
        this._current=el(sel(this._parent), 'innerHTML','hello')
    }
    _start(sort,stateGroup, task){
        switch(true){
            case is(task, TaskItem) : this._item(task); break;
            case is(task, TaskList) : this._list(task); break;
        }
        this._current = this._current.appendChild(el('section','@marginLeft','15px',
            'appendChild',el('input','type','text'),
            'appendChild',el('button','innerHTML','add','addEventListener',['click',e=> this._renderer.add(task,e.target.previousSibling.value)])))
    }
    _end(){
        this._current = this._current.parentNode;
    }
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



const list1 = new TaskList('Title');
const item1 = new TaskItem('Item1');
list1.add(item1);
const sub1 = new TaskItem('sub1');
item1.add(sub1);
const subsub1 = new TaskItem('subsub1');
sub1.add(subsub1);

console.log(list1);
console.log(item1);
console.log(sub1);
console.log(subsub1);

const todo = new Renderer(list1, new DomVisitor('#todo'));
todo.render();