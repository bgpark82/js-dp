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

const Task = class {
    constructor(_title = err(), _date = new Date()) {
        prop(this, {_title, _date, _list:[]})
    }
    get title() {return this._title}
    get date() {return this._date}

    add(task){
        if(!is(task,Task)) err(); this._list.push(task);
    };
    remove(task){};
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

    };
}

const TaskItem = class extends Task {
    constructor(title, date) {
        super(title, date);
        this._isComplete = false;
    }
    isComplete(){};
    toggle(){};
}

const TaskList = class extends Task {
    // constructor에서 받아서 super로 넘겨줌
    constructor(title, date) { super(title, date); }
}

const Renderer = class {
    constructor(_task = err(), _painter = err()){
        // Painter는 Painter 자신에게 renderer 상태 전부를 넣어줌
        prop(this, {_task,_painter: prop(_painter, {renderer:this}), _sort:'title'})
    }
    add(){}
    remove(){}
    toggle(){}
    render(){
        this._painter.reset();
        this._task.accept(Task[this._sort], true,this._painter);
    }
}

// 그림 그리는 애 
const Painter = class {
    set renderer(v){this._renderer = v};
    reset(){override()}
    start(){override()}
    end(){override()}
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
    start(sort, stateGroup, task){
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
    end(){};
    
    _list(task){
        this._current.appendChild(el('h2','innerHTML',task.title));
    };
    
    _item(task){
        [el('h3','innerHTML',task.title, '@textDecoration',(task.isComplete() ? 'line-through': 'none')),
        el('item','innerHTML', task.date, 'datetime',task.date),
        el('button','innerHTML',task.isComplete() ?'progress':'complete',
        'addEventListener',['click',_=>this._renderer.toggle(task)]),
        el('button','innerHTML','delete',
        'addEventListener',['click',_=>this._renderer.remove(task)])
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